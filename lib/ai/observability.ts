/**
 * VahanSaathi AI Observability Logger
 * Lightweight telemetry for understanding AI usage and cost behavior.
 * Never logs sensitive user content in production.
 */

export type AiMoment = 'interpret' | 'explain-roadmap' | 'explain-step';

export interface AiCallRecord {
  moment: AiMoment;
  model: string;
  latencyMs: number;
  inputChars: number;
  outputChars: number;
  isFallback: boolean;
  success: boolean;
  error?: string;
}

/**
 * Log an AI call result for observability.
 * In development: logs to console.
 * In production: could be extended to a metrics service.
 */
export function logAiCall(record: AiCallRecord): void {
  const status = record.success ? 'OK' : 'FAIL';
  const source = record.isFallback ? 'FALLBACK' : record.model;

  if (process.env.NODE_ENV === 'production') {
    // Production: minimal log, no user content
    console.log(
      `[VahanSaathi/AI] ${record.moment} ${status} ${source} ` +
        `${record.latencyMs}ms in=${record.inputChars}ch out=${record.outputChars}ch`
    );
  } else {
    // Development: richer log
    console.log(
      `[AI Observability] moment=${record.moment} status=${status} source=${source} ` +
        `latency=${record.latencyMs}ms inputChars=${record.inputChars} outputChars=${record.outputChars}` +
        (record.error ? ` error=${record.error}` : '')
    );
  }
}
