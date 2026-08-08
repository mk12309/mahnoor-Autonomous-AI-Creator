/**
 * Application-wide constants
 */

const TOPIC_STATUS = {
  DISCOVERED: 'discovered',
  EVALUATED: 'evaluated',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  USED: 'used',
};

const POST_STATUS = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
};

const PIPELINE_STAGES = {
  IDLE: 'idle',
  DISCOVERING: 'discovering',
  EVALUATING: 'evaluating',
  GENERATING: 'generating',
  REVIEWING: 'reviewing',
  PUBLISHING: 'publishing',
  COMPLETED: 'completed',
  ERROR: 'error',
};

const LOG_TYPES = {
  DISCOVERY: 'discovery',
  EVALUATION: 'evaluation',
  GENERATION: 'generation',
  PUBLISH: 'publish',
  PIPELINE: 'pipeline',
  ERROR: 'error',
  SYSTEM: 'system',
};

const PERSONA_TONES = ['professional', 'thought-leader', 'technical', 'casual', 'provocative'];
const PERSONA_STYLES = ['analytical', 'conversational', 'storytelling', 'data-driven', 'opinion'];
const POST_LENGTHS = ['short', 'medium', 'long'];

module.exports = {
  TOPIC_STATUS,
  POST_STATUS,
  PIPELINE_STAGES,
  LOG_TYPES,
  PERSONA_TONES,
  PERSONA_STYLES,
  POST_LENGTHS,
};
