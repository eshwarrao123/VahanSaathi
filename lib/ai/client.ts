import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

/**
 * Returns an active OpenAI client instance if OPENAI_API_KEY is configured.
 * Returns null if the API key is missing or set to a placeholder/demo key,
 * triggering safe deterministic fallbacks.
 */
export function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'demo-openai-key') {
    return null;
  }

  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: apiKey,
    });
  }

  return openaiInstance;
}
