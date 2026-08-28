/**
 * VahanSaathi AI Configuration
 * All model/token/temperature settings in one place.
 * Override via environment variables for cost control.
 */

// Default to gpt-4o-mini — cheapest capable model, configurable via env
export const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Per-moment token budgets (keep small to control cost)
export const AI_TOKENS = {
  interpret: parseInt(process.env.AI_TOKENS_INTERPRET || '250', 10),
  explainRoadmap: parseInt(process.env.AI_TOKENS_EXPLAIN_ROADMAP || '300', 10),
  explainStep: parseInt(process.env.AI_TOKENS_EXPLAIN_STEP || '250', 10),
} as const;

// Temperature: 0.0 for extraction, 0.2 for explanation
export const AI_TEMPERATURE = {
  interpret: 0.0,
  explain: 0.2,
} as const;

// Maximum input text length sent to AI (prevents large prompt injection)
export const AI_INPUT_MAX_CHARS = 500;
