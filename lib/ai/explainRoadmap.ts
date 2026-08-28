import { getOpenAIClient } from './client';
import { VehicleCase, RoadmapStep } from '@/types';
import { ExplainRoadmapSchema } from './schemas';
import { AI_MODEL, AI_TOKENS, AI_TEMPERATURE } from './config';
import { logAiCall } from './observability';

export interface ExplainRoadmapResult {
  summary: string;
  keyTakeaway: string;
  isFallback: boolean;
}

const SYSTEM_PROMPT = `
You are VahanSaathi's process explanation assistant.
Your task is to provide a brief, reassuring, plain-language summary of a verified vehicle transfer roadmap.

CRITICAL CONSTRAINTS - READ CAREFULLY:
1. ONLY explain the supplied verified information provided in the context.
2. DO NOT introduce new requirements, forms, fees, deadlines, or legal claims beyond what is provided.
3. DO NOT add extra steps or suggest additional documents not in the verified roadmap.
4. DO NOT invent processing times, penalties, or regulations not explicitly stated.
5. Keep the tone helpful, clear, and reassuring.
6. Base your explanation ONLY on the verified steps and legal basis provided.
7. If a legal basis is provided, reference it. If not, do not invent one.

Return JSON ONLY matching this exact schema:
{
  "summary": "2-3 plain-language sentences summarizing the verified journey steps",
  "keyTakeaway": "Single-sentence priority guidance based on the provided steps"
}
`.trim();

/**
 * Generates a human-language explanation for a verified roadmap using OpenAI.
 * ONLY explains the supplied verified information. Never invents additional requirements.
 * Uses Zod to validate AI output before returning.
 */
export async function explainRoadmapAi(
  vehicleCase: VehicleCase,
  roadmapSteps: RoadmapStep[]
): Promise<ExplainRoadmapResult> {
  const startTime = Date.now();
  const client = getOpenAIClient();

  const fallbackSummary = `Your transfer roadmap contains ${roadmapSteps.length} verified statutory steps for transferring your vehicle${vehicleCase.originState && vehicleCase.destinationState ? ` from ${vehicleCase.originState} to ${vehicleCase.destinationState}` : ''}. Follow the responsibilities assigned to each step.`;
  const fallbackTakeaway = `Start with Step 1: ${roadmapSteps[0]?.title || 'Verify initial documentation'}.`;

  if (!client || !roadmapSteps || roadmapSteps.length === 0) {
    logAiCall({ moment: 'explain-roadmap', model: 'FALLBACK', latencyMs: 0, inputChars: 0, outputChars: 0, isFallback: true, success: true });
    return { summary: fallbackSummary, keyTakeaway: fallbackTakeaway, isFallback: true };
  }

  // Build a lean prompt — only include step titles + legal basis, no full descriptions
  const stepsSummary = roadmapSteps
    .map(
      (s) =>
        `Step ${s.stepNumber}: ${s.title} (${s.responsibility})${s.legalBasis ? ` [${s.legalBasis}]` : ''}`
    )
    .join('\n');

  const promptText = `
Role: ${vehicleCase.role}. Transfer: ${vehicleCase.originState || 'Unknown'} → ${vehicleCase.destinationState || 'Unknown'}.
Verified Steps:
${stepsSummary}

Explain ONLY these verified steps. Do not add requirements beyond what is listed above.
`.trim();

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: promptText },
      ],
      response_format: { type: 'json_object' },
      temperature: AI_TEMPERATURE.explain,
      max_tokens: AI_TOKENS.explainRoadmap,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    const latencyMs = Date.now() - startTime;

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error('AI returned non-JSON content');
    }

    const validated = ExplainRoadmapSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`AI schema validation failed: ${validated.error.message}`);
    }

    logAiCall({ moment: 'explain-roadmap', model: AI_MODEL, latencyMs, inputChars: promptText.length, outputChars: rawContent.length, isFallback: false, success: true });

    return {
      summary: validated.data.summary,
      keyTakeaway: validated.data.keyTakeaway,
      isFallback: false,
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : String(error);
    logAiCall({ moment: 'explain-roadmap', model: AI_MODEL, latencyMs, inputChars: promptText.length, outputChars: 0, isFallback: true, success: false, error: errMsg });

    return { summary: fallbackSummary, keyTakeaway: fallbackTakeaway, isFallback: true };
  }
}
