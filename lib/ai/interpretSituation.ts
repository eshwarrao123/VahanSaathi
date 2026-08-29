import { getOpenAIClient, checkAndHandleQuotaError } from './client';
import { interpretSituationText as fallbackInterpreter } from '@/lib/utils/interpretation';
import { UserRole } from '@/types';
import { InterpretSchema } from './schemas';
import { AI_MODEL, AI_TOKENS, AI_TEMPERATURE, AI_INPUT_MAX_CHARS } from './config';
import { logAiCall } from './observability';

export interface InterpretedSituationResult {
  transaction: 'sale' | 'relocation';
  role: UserRole;
  originState: string | null;
  destinationState: string | null;
  vehicleModel: string | null;
  registrationNumber: string | null;
  confidence: number;
  isFallback: boolean;
  rawUnderstanding: string;
}

const SYSTEM_PROMPT = `
You are VahanSaathi's natural-language vehicle transfer situation interpreter.
Your job is to extract facts ONLY from the citizen's free-text input.

CRITICAL RULES - READ CAREFULLY:
1. You are a FACT EXTRACTOR, not an assistant that fills in missing details.
2. Extract ONLY information EXPLICITLY STATED by the user.
3. NEVER guess, infer, or complete vehicle information.
4. NEVER invent a vehicle make, model, or year.
5. NEVER invent registration numbers, chassis numbers, or owner names.
6. NEVER infer a state from a city unless the user explicitly provides it.
7. If a field is not mentioned, return null for that field.
8. The absence of information is valid and expected.
9. DO NOT determine legal requirements or statutory forms.
10. Normalize state names to 2-letter codes ONLY if explicitly mentioned (e.g., "Telangana" -> "TG", "Karnataka" -> "KA", "Maharashtra" -> "MH").

Return JSON ONLY matching this exact schema:
{
  "transaction": "sale" | "relocation",
  "role": "seller" | "buyer",
  "originState": string | null,
  "destinationState": string | null,
  "vehicleModel": string | null,
  "registrationNumber": string | null,
  "summary": string
}

Examples:
Input: "I sold my Telangana car to someone in Karnataka."
Output: {"transaction":"sale","role":"seller","originState":"TG","destinationState":"KA","vehicleModel":null,"registrationNumber":null,"summary":"Seller transferring vehicle from Telangana to Karnataka."}

Input: "I bought a 2021 Maruti Swift from Telangana and brought it to Karnataka."
Output: {"transaction":"sale","role":"buyer","originState":"TG","destinationState":"KA","vehicleModel":"2021 Maruti Swift","registrationNumber":null,"summary":"Buyer acquired a 2021 Maruti Swift from Telangana to Karnataka."}

Input: "I sold my vehicle."
Output: {"transaction":"sale","role":"seller","originState":null,"destinationState":null,"vehicleModel":null,"registrationNumber":null,"summary":"Seller completing a vehicle sale."}
`.trim();

/**
 * Interprets a citizen's natural-language situation text using OpenAI.
 * - Server-side Zod validation on all AI output
 * - Never fabricates missing information
 * - Falls back gracefully if AI is unavailable or output is invalid
 */
export async function interpretSituationAi(
  text: string,
  userRole?: UserRole
): Promise<InterpretedSituationResult> {
  const startTime = Date.now();
  const safeText = text.substring(0, AI_INPUT_MAX_CHARS);
  const client = getOpenAIClient();

  // Primary Fallback: If OpenAI key is not configured
  if (!client || !safeText || safeText.trim().length < 3) {
    const fallback = fallbackInterpreter(safeText);
    const latencyMs = Date.now() - startTime;
    logAiCall({ moment: 'interpret', model: 'FALLBACK', latencyMs, inputChars: safeText.length, outputChars: 0, isFallback: true, success: true });
    return {
      transaction: 'sale',
      role: userRole || fallback.role || 'seller',
      originState: fallback.originState,
      destinationState: fallback.destinationState,
      vehicleModel: fallback.vehicleModel,
      registrationNumber: fallback.registrationNumber,
      confidence: 0.8,
      isFallback: true,
      rawUnderstanding: buildRawUnderstanding(fallback.originState, fallback.destinationState, fallback.role, fallback.vehicleModel),
    };
  }

  try {
    const response = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Citizen prompt: "${safeText}". ${userRole ? `Selected Role: ${userRole}.` : ''}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: AI_TEMPERATURE.interpret,
      max_tokens: AI_TOKENS.interpret,
    });

    const rawContent = response.choices[0]?.message?.content || '{}';
    const latencyMs = Date.now() - startTime;

    // Parse and Zod-validate before trusting
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      throw new Error('AI returned non-JSON content');
    }

    const validated = InterpretSchema.safeParse(parsed);
    if (!validated.success) {
      throw new Error(`AI schema validation failed: ${validated.error.message}`);
    }

    const data = validated.data;
    logAiCall({ moment: 'interpret', model: AI_MODEL, latencyMs, inputChars: safeText.length, outputChars: rawContent.length, isFallback: false, success: true });

    // Use fallback for states only if AI returned null AND fallback found something
    const fallbackDefaults = fallbackInterpreter(safeText);
    const originState = data.originState || fallbackDefaults.originState || null;
    const destinationState = data.destinationState || fallbackDefaults.destinationState || null;

    const validatedRole: UserRole =
      data.role === 'buyer' || data.role === 'seller'
        ? data.role
        : userRole || fallbackDefaults.role || 'seller';

    // CRITICAL: NEVER use fallback vehicle data if AI returned null
    const vehicleModel = data.vehicleModel || null;
    const registrationNumber = data.registrationNumber || null;

    return {
      transaction: data.transaction === 'relocation' ? 'relocation' : 'sale',
      role: validatedRole,
      originState,
      destinationState,
      vehicleModel,
      registrationNumber,
      confidence: 0.95,
      isFallback: false,
      rawUnderstanding:
        data.summary ||
        buildRawUnderstanding(originState, destinationState, validatedRole, vehicleModel),
    };
  } catch (error) {
    checkAndHandleQuotaError(error);
    const latencyMs = Date.now() - startTime;
    const errMsg = error instanceof Error ? error.message : String(error);
    logAiCall({ moment: 'interpret', model: AI_MODEL, latencyMs, inputChars: safeText.length, outputChars: 0, isFallback: true, success: false, error: errMsg });

    const fallback = fallbackInterpreter(safeText);
    return {
      transaction: 'sale',
      role: userRole || fallback.role || 'seller',
      originState: fallback.originState,
      destinationState: fallback.destinationState,
      vehicleModel: fallback.vehicleModel,
      registrationNumber: fallback.registrationNumber,
      confidence: 0.7,
      isFallback: true,
      rawUnderstanding: buildRawUnderstanding(fallback.originState, fallback.destinationState, fallback.role, fallback.vehicleModel),
    };
  }
}

function buildRawUnderstanding(
  originState: string | null,
  destinationState: string | null,
  role: UserRole,
  vehicleModel: string | null
): string {
  const parts: string[] = [];
  parts.push(`${role === 'seller' ? 'Seller' : 'Buyer'} completing vehicle transfer`);
  if (vehicleModel) parts.push(`for ${vehicleModel}`);
  if (originState && destinationState) {
    parts.push(`from ${originState} to ${destinationState}`);
  } else if (originState) {
    parts.push(`from ${originState}`);
  } else if (destinationState) {
    parts.push(`to ${destinationState}`);
  }
  return parts.join(' ') + '.';
}
