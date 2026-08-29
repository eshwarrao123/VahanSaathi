import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

let isQuotaExhausted = false;
let quotaExhaustedReason = '';

/**
 * Marks OpenAI API quota as exhausted for the current server process session.
 * Prevents further network requests to OpenAI and immediately returns deterministic fallbacks.
 */
export function markQuotaExhausted(reason: string) {
  isQuotaExhausted = true;
  quotaExhaustedReason = reason;
}

export function isQuotaBlocked(): boolean {
  return isQuotaExhausted;
}

export function getQuotaReason(): string {
  return quotaExhaustedReason;
}

export function resetQuotaGuard() {
  isQuotaExhausted = false;
  quotaExhaustedReason = '';
}

/**
 * Inspects an error object. If it is an OpenAI 429 / credit / quota error,
 * marks the session quota guard as exhausted so subsequent calls fail fast (0ms).
 */
export function checkAndHandleQuotaError(error: unknown): boolean {
  if (!error) return false;

  const msg = error instanceof Error ? error.message : String(error);
  const status = (error as { status?: number })?.status;
  const code = (error as { code?: string })?.code;

  const isQuota =
    status === 429 ||
    code === 'insufficient_quota' ||
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('credits') ||
    msg.includes('exceeded');

  if (isQuota) {
    markQuotaExhausted(msg);
    return true;
  }

  return false;
}

/**
 * Returns an active OpenAI client instance if OPENAI_API_KEY is configured
 * AND quota is not exhausted for this session.
 * Configured with maxRetries: 0 for fast failure without 3-4s delay.
 */
export function getOpenAIClient(): OpenAI | null {
  if (isQuotaExhausted) {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'your-openai-api-key-here' || apiKey === 'demo-openai-key') {
    return null;
  }

  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: apiKey,
      maxRetries: 0, // Fail fast on 429/quota error without retries or exponential backoff delay
    });
  }

  return openaiInstance;
}
