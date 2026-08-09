/**
 * Persona Prompt Template
 * 
 * Responsibility:
 * Stores prompt engineering templates defining the AI Persona style and guidelines.
 */

const getDefaultPersona = () => ({
  name: 'AI Infrastructure Analyst',
  tone: 'professional',
  style: 'analytical',
});

module.exports = { getDefaultPersona };
