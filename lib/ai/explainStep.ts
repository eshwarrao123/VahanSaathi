import { getOpenAIClient } from './client';
import { UserRole } from '@/types';
import { ExplainStepSchema } from './schemas';
import { AI_MODEL, AI_TOKENS, AI_TEMPERATURE } from './config';
import { logAiCall } from './observability';

export interface ExplainStepResult {
  explanation: string;
  practicalTip: string;
  isFallback: boolean;
}

// Server-side cache for step explanations to prevent duplicate OpenAI API calls
const serverStepCache = new Map<string, ExplainStepResult>();

const SYSTEM_PROMPT = `
You are VahanSaathi's citizen guidance legal explanation assistant.
Your job is to answer the citizen's question: "Why do I need to complete this step?" in plain, reassuring language.

CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Explain the statutory requirement in 2 to 4 simple, conversational sentences.
2. Avoid legal jargon. If jargon (like "Form 28", "NOC", or "Hypothecation") is necessary, explain what it means immediately in plain English.
3. DO NOT invent fees, legal penalties, deadlines, or forms not provided in the prompt context.
4. DO NOT add extra requirements or suggest additional documents beyond what is stated.
5. DO NOT invent processing times or costs unless explicitly provided.
6. Base your explanation ONLY on the supplied step context and legal basis.
7. If no legal basis is provided, do not invent statutory references.
8. Keep the explanation grounded in the specific step provided.

Return JSON ONLY matching this schema:
{
  "explanation": "2-4 plain sentences explaining why this step is required by law and what it accomplishes for the citizen, based ONLY on the provided context",
  "practicalTip": "1 action-oriented tip for smoothly completing this step, based on the provided information"
}
`.trim();

/**
 * Generates a contextual "Why do I need this?" explanation for a specific step using OpenAI.
 * ONLY explains the supplied verified information. Never invents additional legal requirements.
 * Uses Zod to validate AI output and caches responses to avoid duplicate API calls.
 */
export async function explainStepAi(params: {
  stepTitle: string;
  stepDescription: string;
  legalBasis?: string;
  userRole: UserRole;
  officialRtoAction: string;
}): Promise<ExplainStepResult> {
  const { stepTitle, stepDescription, legalBasis, userRole, officialRtoAction } = params;

  const cacheKey = `${stepTitle}_${userRole}_${legalBasis || ''}`;
  if (serverStepCache.has(cacheKey)) {
    const cached = serverStepCache.get(cacheKey)!;
    logAiCall({ moment: 'explain-step', model: 'CACHE_HIT', latencyMs: 0, inputChars: 0, outputChars: 0, isFallback: cached.isFallback, success: true });
    return cached;
  }

  const startTime = Date.now();
  const client = getOpenAIClient();

  const fallbackExplanation = legalBasis
    ? `${legalBasis}: ${stepDescription}`
    : stepDescription;
  const fallbackTip = `Ensure all relevant details match your vehicle registration documents before ${officialRtoAction || 'visiting the RTO'}.`;

  if (!client || !stepTitle) {
    logAiCall({ moment: 'explain-step', model: 'FALLBACK', latencyMs: 0, inputChars: 0, outputChars: 0, isFallback: true, success: true });
    const fallbackResult = { explanation: fallbackExplanation, practicalTip: fallbackTip, isFallback: true };
    serverStepCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  const promptText = `
Step Title: ${stepTitle}
Step Description: ${stepDescription}
${legalBasis ? `Statutory Legal Basis: ${legalBasis}` : 'Statutory Legal Basis: Not explicitly provided'}
Citizen Role: ${userRole}
Official RTO Action: ${officialRtoAction}

Explain ONLY this step based on the information provided above. Do not add requirements beyond what is stated.
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
      max_tokens: AI_TOKENS.explainStep,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    const latencyMs = Date.now() - startTime;

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error('AI returned non-JSON content');
    }

    const validated = ExplainStepSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`AI schema validation failed: ${validated.error.message}`);
    }

    logAiCall({ moment: 'explain-step', model: AI_MODEL, latencyMs, inputChars: promptText.length, outputChars: rawContent.length, isFallback: false, success: true });

    const result = {
      explanation: validated.data.explanation,
      practicalTip: validated.data.practicalTip,
      isFallback: false,
    };

    serverStepCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : String(error);
    logAiCall({ moment: 'explain-step', model: AI_MODEL, latencyMs, inputChars: promptText.length, outputChars: 0, isFallback: true, success: false, error: errMsg });

    const fallbackResult = { explanation: fallbackExplanation, practicalTip: fallbackTip, isFallback: true };
    serverStepCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }
}
