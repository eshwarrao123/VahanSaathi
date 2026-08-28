/**
 * VahanSaathi AI Response Schemas (Zod)
 * All AI outputs must pass these schemas before entering application state.
 * This prevents hallucinated or malformed data from propagating.
 */

import { z } from 'zod';

// ── Moment 1: Situation Interpretation ─────────────────────────────────────

export const InterpretSchema = z.object({
  transaction: z.enum(['sale', 'relocation']),
  role: z.enum(['seller', 'buyer']),
  originState: z.string().max(5).nullable(),
  destinationState: z.string().max(5).nullable(),
  vehicleModel: z.string().max(60).nullable(),
  registrationNumber: z.string().max(20).nullable(),
  summary: z.string().max(200).optional(),
});

export type InterpretAiOutput = z.infer<typeof InterpretSchema>;

// ── Moment 2: Roadmap Explanation ──────────────────────────────────────────

export const ExplainRoadmapSchema = z.object({
  summary: z.string().min(10).max(500),
  keyTakeaway: z.string().min(5).max(200),
});

export type ExplainRoadmapAiOutput = z.infer<typeof ExplainRoadmapSchema>;

// ── Moment 3: Step Explanation ─────────────────────────────────────────────

export const ExplainStepSchema = z.object({
  explanation: z.string().min(10).max(500),
  practicalTip: z.string().min(5).max(200),
});

export type ExplainStepAiOutput = z.infer<typeof ExplainStepSchema>;
