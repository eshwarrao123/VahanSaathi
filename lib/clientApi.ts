import { UserRole, VehicleCase, RoadmapStep } from '@/types';
import { QuestionAnswers } from '@/lib/services/journey';

const STORAGE_KEY = 'vahan_saathi_journey_id';

export function getStoredJourneyId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
}

export function setStoredJourneyId(journeyId: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, journeyId);
  localStorage.setItem(STORAGE_KEY, journeyId);
}

export function clearStoredJourneyId(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

export async function createJourneyApi(initialRole?: UserRole) {
  const sessionId = getOrCreateSessionId();
  const res = await fetch('/api/journeys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, initialRole }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to create journey session');
  }

  setStoredJourneyId(json.data.id);
  return json.data;
}

export async function getJourneyApi(journeyId: string) {
  const res = await fetch(`/api/journeys/${journeyId}`);
  if (res.status === 404) {
    clearStoredJourneyId();
    return null;
  }
  const json = await res.json();

  if (!res.ok || !json.success) {
    return null;
  }

  return json.data;
}

export async function updateJourneyApi(
  journeyId: string,
  payload: {
    currentScreen?: string;
    userRole?: UserRole;
    situationText?: string;
    answers?: QuestionAnswers;
  }
) {
  const res = await fetch(`/api/journeys/${journeyId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to update journey state');
  }

  return json.data;
}

export async function generateCaseApi(journeyId: string) {
  const res = await fetch(`/api/journeys/${journeyId}/case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (res.status === 404) {
    clearStoredJourneyId();
    const freshJourney = await createJourneyApi();
    return generateCaseApi(freshJourney.id);
  }

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to generate roadmap case');
  }

  return json.data;
}

export async function submitMockCaseApi(caseId: string) {
  const res = await fetch(`/api/cases/${caseId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || 'Failed to process mock submission');
  }

  return json.data;
}

/* --- AI MOMENTS API CLIENT METHODS --- */

export async function interpretSituationApi(text: string, userRole?: UserRole) {
  const res = await fetch('/api/ai/interpret', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, userRole }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "We couldn't interpret your situation with AI.");
  }

  return json.data;
}

export async function explainRoadmapApi(vehicleCase: VehicleCase, roadmapSteps: RoadmapStep[]) {
  const res = await fetch('/api/ai/explain-roadmap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ vehicleCase, roadmapSteps }),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "We couldn't generate an AI summary.");
  }

  return json.data;
}

const clientStepCache = new Map<string, unknown>();

export async function explainStepApi(params: {
  stepTitle: string;
  stepDescription: string;
  legalBasis: string;
  userRole: UserRole;
  officialRtoAction: string;
  caseId?: string;
  stepId?: string;
}) {
  const cacheKey = `${params.caseId || ''}_${params.stepId || params.stepTitle}_${params.userRole}`;
  if (clientStepCache.has(cacheKey)) {
    return clientStepCache.get(cacheKey);
  }

  const res = await fetch('/api/ai/explain-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "We couldn't generate contextual AI help.");
  }

  clientStepCache.set(cacheKey, json.data);
  return json.data;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  let sid = sessionStorage.getItem('vahan_saathi_session_id');
  if (!sid) {
    sid = `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    sessionStorage.setItem('vahan_saathi_session_id', sid);
  }
  return sid;
}
