const PersonaConfig = require('../models/PersonaConfig');
const { generateContent } = require('../config/ai');
const { buildPreviewPrompt, getDefaultPersona } = require('../prompts/persona.prompt');

const get = async (req, res, next) => {
  try {
    let persona = await PersonaConfig.findOne({ isActive: true });
    if (!persona) {
      persona = await PersonaConfig.create(getDefaultPersona());
    }
    res.json({ success: true, data: persona });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const persona = await PersonaConfig.findOneAndUpdate(
      { isActive: true },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: persona });
  } catch (error) {
    next(error);
  }
};

const preview = async (req, res, next) => {
  try {
    let persona = await PersonaConfig.findOne({ isActive: true });
    if (!persona) persona = getDefaultPersona();

    const prompt = buildPreviewPrompt(persona, req.body.topic);
    const response = await generateContent(prompt, { temperature: 0.8 });

    let result;
    try {
      const cleanText = response.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanText);
    } catch {
      result = { content: response.text, hashtags: [] };
    }

    res.json({ success: true, data: { ...result, model: response.model } });
  } catch (error) {
    next(error);
  }
};

module.exports = { get, update, preview };
