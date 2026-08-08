/**
 * services/agent.service.js
 *
 * Autonomous Agent Pipeline — implements Breeth Persistent Memory Workflow.
 *
 * Pipeline order:
 *   Step 1: Topic Discovery (live RSS feeds)
 *   Step 2: Breeth Memory SEARCH — retrieve previous decisions for each topic
 *   Step 3: Editorial Evaluation (multi-dimensional scoring + Breeth context)
 *   Step 4: Reject below-threshold topics → Breeth WRITE rejection memory
 *   Step 5: Select ONE best topic
 *   Step 6: Breeth Memory SEARCH — retrieve full context for post generation
 *   Step 7: Generate Post (persona voice + Breeth memory context)
 *   Step 8: Generate Rationale
 *   Step 9: Save Post to MongoDB (primary database)
 *   Step 10: Breeth Memory WRITE — published episode
 *   Step 11: Store EditorialDecision audit in MongoDB
 */

const breethService = require('./breeth.service');
const breethMemory = require('./breeth-memory.service');
const { saveAndPublishPost } = require('./publisher.service');
const memoryService = require('./memory.service');
const Topic = require('../models/Topic');
const EditorialDecision = require('../models/EditorialDecision');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const runAgentCycle = async () => {
  const cycleId = `cycle-${Date.now()}`;
  logger.info('===========================================================');
  logger.info(`[Agent] 🚀 Autonomous Cycle ID: ${cycleId}`);
  logger.info('===========================================================');

  try {
    // ─── Step 1: Topic Discovery ─────────────────────────────────────────
    logger.info('[Agent Step 1/10] 🔍 Discovering topics from live feeds...');
    const rawTopics = await breethService.discoverTopics();

    const topicDocs = [];
    const discoveredSummary = [];

    for (const t of rawTopics) {
      let doc = await Topic.findOne({ sourceUrl: t.sourceUrl });
      if (!doc) {
        doc = await Topic.create({
          title: t.title,
          description: t.description,
          source: t.source,
          sourceUrl: t.sourceUrl,
          status: 'discovered',
        });
      }
      topicDocs.push(doc);
      discoveredSummary.push({ title: t.title, sourceUrl: t.sourceUrl });
    }

    logger.info(`[Agent Step 1] Discovered ${topicDocs.length} topics`);

    // ─── Step 2: Breeth SEARCH — context per topic ───────────────────────
    logger.info('[Agent Step 2/10] 🧠 Searching Breeth Memory for each topic...');
    const breethContextMap = {};

    for (const doc of topicDocs) {
      const facts = await breethMemory.retrieveRecentContext(doc.title);
      breethContextMap[doc.title] = facts;
      if (facts.length > 0) {
        logger.info(`[Agent Step 2] Breeth returned ${facts.length} relevant memories for: "${doc.title}"`);
      }
    }

    // ─── Step 3: Editorial Evaluation (with Breeth memory context) ───────
    logger.info('[Agent Step 3/10] ⚖️ Evaluating topics with Breeth memory context...');

    // Build a map keyed by sourceUrl for evaluateTopics
    const breethMemoriesMap = {};
    for (const doc of topicDocs) {
      breethMemoriesMap[doc.sourceUrl] = breethContextMap[doc.title] || [];
      breethMemoriesMap[doc.title] = breethContextMap[doc.title] || [];
    }

    const evaluationResults = await breethService.evaluateTopics(topicDocs, breethMemoriesMap);

    let selectedDoc = null;
    let selectedBreakdown = null;
    let highestScore = -1;
    const rejectedLog = [];

    // ─── Step 4: Reject & write to Breeth ────────────────────────────────
    for (const evalItem of evaluationResults) {
      const doc = evalItem.topic;
      doc.relevanceScore = evalItem.score;

      const isDuplicate = await memoryService.isTopicDuplicate(doc.title);

      if (isDuplicate) {
        doc.status = 'rejected';
        await doc.save();

        const reason = 'Duplicate or highly similar to previously published topic (detected via MongoDB memory)';
        logger.info(`[Agent Step 4] Rejecting duplicate: "${doc.title}"`);

        // Breeth WRITE — rejection decision
        await breethMemory.rememberRejectedTopic({
          topic: doc.title,
          reason,
          score: evalItem.score,
          ...evalItem.scoreBreakdown,
        });

        rejectedLog.push({ topicTitle: doc.title, reason, finalScore: evalItem.score });
        continue;
      }

      // Check if Breeth memories indicate this topic was already covered
      const topicBreethFacts = breethContextMap[doc.title] || [];
      const alreadyCoveredInBreeth = topicBreethFacts.some(fact =>
        fact.toLowerCase().includes('decision: published') &&
        fact.toLowerCase().includes(doc.title.toLowerCase().substring(0, 20))
      );

      if (alreadyCoveredInBreeth) {
        doc.status = 'rejected';
        await doc.save();

        const reason = 'Breeth memory indicates this topic was previously published by SignalForge AI';
        logger.info(`[Agent Step 4] Rejecting topic already in Breeth memory: "${doc.title}"`);

        await breethMemory.rememberRejectedTopic({
          topic: doc.title,
          reason,
          score: evalItem.score,
          ...evalItem.scoreBreakdown,
        });

        rejectedLog.push({ topicTitle: doc.title, reason, finalScore: evalItem.score });
        continue;
      }

      if (!evalItem.accepted) {
        doc.status = 'rejected';
        await doc.save();

        const reason = evalItem.reasoning || `Score ${evalItem.score} below threshold ${require('../config/env').relevanceThreshold}`;
        logger.info(`[Agent Step 4] Rejecting below threshold: "${doc.title}" (Score: ${evalItem.score})`);

        // Breeth WRITE — rejection with full breakdown
        await breethMemory.rememberRejectedTopic({
          topic: doc.title,
          reason,
          score: evalItem.score,
          technicalRelevance: evalItem.scoreBreakdown?.technicalRelevance,
          aiEcosystemImpact: evalItem.scoreBreakdown?.aiEcosystemImpact,
          novelty: evalItem.scoreBreakdown?.novelty,
          educationalValue: evalItem.scoreBreakdown?.educationalValue,
          communityInterest: evalItem.scoreBreakdown?.communityInterest,
          duplicateRisk: evalItem.scoreBreakdown?.duplicateRisk,
        });

        rejectedLog.push({ topicTitle: doc.title, reason, finalScore: evalItem.score });
      } else {
        doc.status = 'evaluated';
        await doc.save();
        if (evalItem.score > highestScore) {
          highestScore = evalItem.score;
          selectedDoc = doc;
          selectedBreakdown = evalItem.scoreBreakdown;
        }
      }
    }

    if (!selectedDoc) {
      await EditorialDecision.create({
        cycleId,
        discoveredCount: topicDocs.length,
        discoveredTopics: discoveredSummary,
        rejectedTopics: rejectedLog,
        selectedTopic: null,
        finalScore: 0,
        publishingTimestamp: new Date(),
      });
      logger.info('[Agent Step 4] No topics passed editorial evaluation this cycle.');
      return { status: 'completed', published: false, reason: 'No topics passed editorial threshold', decisionLogCycleId: cycleId };
    }

    selectedDoc.status = 'accepted';
    await selectedDoc.save();
    logger.info(`[Agent Step 4] Selected: "${selectedDoc.title}" (Score: ${highestScore})`);

    // ─── Step 5 (implicit): Selected topic is selectedDoc ────────────────

    // ─── Step 6: Breeth SEARCH — full context for selected topic ─────────
    logger.info('[Agent Step 6/10] 🧠 Retrieving rich Breeth context for content generation...');
    const selectedBreethFacts = await breethMemory.retrieveRecentContext(selectedDoc.title);
    logger.info(`[Agent Step 6] Using ${selectedBreethFacts.length} Breeth memory facts for post generation`);

    // ─── Step 7: Generate Post ────────────────────────────────────────────
    logger.info('[Agent Step 7/10] ✍️ Generating post with Breeth memory context...');
    const postText = await breethService.generatePost(
      selectedDoc,
      { name: 'SignalForge AI', voice: 'AI Infrastructure Analyst' },
      selectedBreethFacts
    );

    // ─── Step 8: Generate Rationale ──────────────────────────────────────
    logger.info('[Agent Step 8/10] 💡 Generating editorial rationale...');
    const rationale = await breethService.generateRationale(selectedDoc, postText);

    // ─── Step 9: Save to MongoDB ──────────────────────────────────────────
    logger.info('[Agent Step 9/10] 💾 Saving post to MongoDB...');
    const savedPost = await saveAndPublishPost({
      topic: selectedDoc,
      text: postText,
      rationale,
      sources: [{ title: selectedDoc.source, url: selectedDoc.sourceUrl }],
    });

    // ─── Step 10: Breeth WRITE — published episode ────────────────────────
    logger.info('[Agent Step 10/10] 🧠 Writing published episode to Breeth Memory...');
    const breethWriteResult = await breethMemory.rememberPublishedPost({
      topic: selectedDoc.title,
      score: highestScore,
      rationale,
      postText,
      sources: [{ title: selectedDoc.source, url: selectedDoc.sourceUrl }],
      timestamp: savedPost.createdAt ? new Date(savedPost.createdAt).toISOString() : new Date().toISOString(),
    });

    const breethWriteOk = breethWriteResult?.ok === true;
    logger.info(`[Agent Step 10] Breeth write: ${breethWriteOk ? '✅ confirmed' : '⚠️ failed or key incomplete'}`);

    // ─── Store MongoDB audit ──────────────────────────────────────────────
    await EditorialDecision.create({
      cycleId,
      discoveredCount: topicDocs.length,
      discoveredTopics: discoveredSummary,
      rejectedTopics: rejectedLog,
      selectedTopic: {
        title: selectedDoc.title,
        sourceUrl: selectedDoc.sourceUrl,
        finalScore: highestScore,
        scoreBreakdown: selectedBreakdown,
      },
      finalScore: highestScore,
      publishingTimestamp: new Date(),
    });

    await ActivityLog.create({
      type: 'pipeline',
      stage: 'agent_cycle',
      message: `Published post ID: ${savedPost._id} | Breeth write: ${breethWriteOk ? 'confirmed' : 'skipped'}`,
      metadata: { postId: savedPost._id, title: selectedDoc.title, score: highestScore, breethWriteOk },
    });

    logger.info('===========================================================');
    logger.info(`[Agent] ✅ Cycle complete. Post ID: ${savedPost._id}`);
    logger.info('===========================================================');

    return {
      status: 'completed',
      published: true,
      post: savedPost,
      breethMemoryWritten: breethWriteOk,
      breethMemoriesUsed: selectedBreethFacts.length,
      decisionLogCycleId: cycleId,
    };
  } catch (error) {
    logger.error(`[Agent] ❌ Pipeline error: ${error.message}`);
    try {
      await ActivityLog.create({ type: 'error', stage: 'agent_cycle', message: `Pipeline error: ${error.message}` });
    } catch (_) {}
    throw error;
  }
};

module.exports = { runAgentCycle };
