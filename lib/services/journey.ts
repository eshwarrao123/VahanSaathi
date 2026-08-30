import { prisma } from '@/lib/db';
import { evaluateRules } from '@/rules/engine';
import { VehicleCase, Journey as JourneyDomain, RoadmapStep, Document, StatusEvent, UserRole } from '@/types';
import { interpretSituationText } from '@/lib/utils/interpretation';

export interface QuestionAnswers {
  saleCompleted?: boolean;
  activeLoan?: boolean;
  hasRC?: boolean;
  isLongTermRelocation?: boolean;
}

/**
 * Ensures a User record exists for the given browser session ID.
 */
export async function getOrCreateUser(sessionId: string) {
  let user = await prisma.user.findUnique({
    where: { sessionId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: { sessionId },
    });
  }

  return user;
}

/**
 * Creates a new Journey for a given session.
 */
export async function createJourney(sessionId: string, initialRole?: UserRole) {
  const user = await getOrCreateUser(sessionId);

  const journey = await prisma.journey.create({
    data: {
      userId: user.id,
      currentScreen: 'choose-role',
      userRole: initialRole || null,
      answersJson: JSON.stringify({}),
    },
    include: {
      case: {
        include: {
          roadmapSteps: true,
          documents: true,
          statusEvents: true,
        },
      },
    },
  });

  return formatJourneyDTO(journey);
}

/**
 * Updates an ongoing journey state (screen, answers, role, situation text).
 */
export async function updateJourney(
  journeyId: string,
  data: {
    currentScreen?: string;
    userRole?: UserRole;
    situationText?: string;
    answers?: QuestionAnswers;
  }
) {
  const existing = await prisma.journey.findUnique({
    where: { id: journeyId },
  });

  if (!existing) {
    throw new Error(`Journey not found: ${journeyId}`);
  }

  let mergedAnswers = {};
  try {
    mergedAnswers = JSON.parse(existing.answersJson || '{}');
  } catch {
    mergedAnswers = {};
  }

  if (data.answers) {
    mergedAnswers = { ...mergedAnswers, ...data.answers };
  }

  const updated = await prisma.journey.update({
    where: { id: journeyId },
    data: {
      ...(data.currentScreen && { currentScreen: data.currentScreen }),
      ...(data.userRole && { userRole: data.userRole }),
      ...(data.situationText !== undefined && { situationText: data.situationText }),
      answersJson: JSON.stringify(mergedAnswers),
    },
    include: {
      case: {
        include: {
          roadmapSteps: true,
          documents: true,
          statusEvents: true,
        },
      },
    },
  });

  return formatJourneyDTO(updated);
}

/**
 * Retrieves a Journey with its full case, roadmap, documents, and status events.
 */
export async function getJourney(journeyId: string) {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      case: {
        include: {
          roadmapSteps: {
            orderBy: { stepNumber: 'asc' },
          },
          documents: true,
          statusEvents: {
            orderBy: { timestamp: 'asc' },
          },
        },
      },
    },
  });

  if (!journey) return null;
  return formatJourneyDTO(journey);
}


/**
 * Generates and persists a Case, evaluated RoadmapSteps, Documents, and StatusEvents.
 */
export async function createCaseFromJourney(journeyId: string) {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
  });

  if (!journey) {
    throw new Error(`Journey not found: ${journeyId}`);
  }

  let answers: QuestionAnswers = {};
  try {
    answers = JSON.parse(journey.answersJson || '{}');
  } catch {
    answers = {};
  }

  const interpreted = interpretSituationText(journey.situationText || '');

  const vehicleCaseInput: VehicleCase = {
    id: `case-${Date.now()}`,
    title: 'Your Vehicle Transfer Guidance Plan',
    role: (journey.userRole as UserRole) || interpreted.role || 'seller',
    transaction: 'sale',
    registrationNumber: interpreted.registrationNumber,
    originState: interpreted.originState || 'TG',
    destinationState: interpreted.destinationState || 'KA',
    activeLoan: answers.activeLoan || false,
    hasRC: answers.hasRC !== false,
    saleCompleted: answers.saleCompleted !== false,
    isLongTermRelocation: answers.isLongTermRelocation !== false,
    sellerName: 'Synthetic Seller',
    buyerName: 'Synthetic Buyer',
    vehicleModel: interpreted.vehicleModel,
    createdAt: new Date().toISOString(),
  };

  // Run deterministic rules evaluation
  const evaluatedJourney = evaluateRules(vehicleCaseInput);

  const caseNumber = `VS-DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

  // Delete old case if re-evaluating
  await prisma.case.deleteMany({
    where: { journeyId: journey.id },
  });

  // Create persisted case with nested roadmap, documents, and status events
  await prisma.case.create({
    data: {
      journey: {
        connect: { id: journey.id },
      },
      caseNumber,
      title: vehicleCaseInput.title,
      role: vehicleCaseInput.role,
      transaction: vehicleCaseInput.transaction,
      registrationNumber: vehicleCaseInput.registrationNumber,
      originState: vehicleCaseInput.originState || 'TG',
      destinationState: vehicleCaseInput.destinationState || 'KA',
      activeLoan: vehicleCaseInput.activeLoan,
      hasRC: vehicleCaseInput.hasRC,
      saleCompleted: vehicleCaseInput.saleCompleted,
      isLongTermRelocation: vehicleCaseInput.isLongTermRelocation !== false,
      status: 'EVALUATED',
      sellerName: vehicleCaseInput.sellerName,
      buyerName: vehicleCaseInput.buyerName,
      vehicleModel: vehicleCaseInput.vehicleModel,
      roadmapSteps: {
        create: evaluatedJourney.roadmap.map((step) => ({
          stepNumber: step.stepNumber,
          title: step.title,
          description: step.description,
          responsibility: step.responsibility,
          status: step.status,
          officialRtoAction: step.officialRtoAction,
          legalBasis: step.legalBasis,
          isConditional: step.isConditional || false,
          conditionalReason: step.conditionalReason || null,
          notesJson: JSON.stringify(step.notes || []),
          estimatedDays: step.estimatedDays || null,
        })),
      },
      documents: {
        create: evaluatedJourney.allRequiredDocuments.map((doc) => ({
          code: doc.code,
          title: doc.title,
          description: doc.description,
          status: doc.status === 'required' ? 'NOT_READY' : doc.status.toUpperCase(),
          isMandatory: doc.isMandatory,
          issuedBy: doc.issuedBy || null,
          legalBasis: doc.legalBasis || null,
          isSynthetic: true,
        })),
      },
      statusEvents: {
        create: [
          {
            title: 'Transfer Case Created & Evaluated',
            description: `Statutory roadmap generated for ${vehicleCaseInput.vehicleModel} (${vehicleCaseInput.registrationNumber}) from ${vehicleCaseInput.originState} to ${vehicleCaseInput.destinationState}.`,
            type: 'info',
            actor: 'SYSTEM',
          },
        ],
      },
    },
    include: {
      roadmapSteps: {
        orderBy: { stepNumber: 'asc' },
      },
      documents: true,
      statusEvents: {
        orderBy: { timestamp: 'asc' },
      },
    },
  });

  await prisma.journey.update({
    where: { id: journeyId },
    data: { currentScreen: 'roadmap' },
  });

  return getJourney(journeyId);
}

/**
 * Simulates a mock government submission for a case.
 */
export async function submitMockCaseAction(caseId: string) {
  const dbCase = await prisma.case.findUnique({
    where: { id: caseId },
    include: { statusEvents: true },
  });

  if (!dbCase) {
    throw new Error(`Case not found: ${caseId}`);
  }

  // Update status & append persistent StatusEvent
  const updated = await prisma.case.update({
    where: { id: caseId },
    data: {
      status: 'SUBMITTED',
      statusEvents: {
        create: [
          {
            title: 'Demo Submission Simulated',
            description: `Simulated submission notice generated for ${dbCase.originState} -> ${dbCase.destinationState} transfer. Case moved to processing status.`,
            type: 'milestone',
            actor: 'CITIZEN',
          },
          {
            title: 'Waiting for Buyer Action / RTO Verification',
            description: 'Destination RTO intimation pending simulated buyer document verification.',
            type: 'action_required',
            actor: 'MOCK_VAHAN',
          },
        ],
      },
    },
    include: {
      roadmapSteps: { orderBy: { stepNumber: 'asc' } },
      documents: true,
      statusEvents: { orderBy: { timestamp: 'asc' } },
    },
  });

  return updated;
}

/**
 * Seeds synthetic scenarios into DB for testing.
 */
export async function seedSyntheticData() {
  const demoSessionId = 'synthetic-demo-session-999';

  const user = await getOrCreateUser(demoSessionId);

  // Scenario B Hero Case
  let journeyB = await prisma.journey.findFirst({
    where: { userId: user.id, userRole: 'seller' },
  });

  if (!journeyB) {
    journeyB = await prisma.journey.create({
      data: {
        userId: user.id,
        currentScreen: 'roadmap',
        userRole: 'seller',
        situationText: 'I sold my Telangana registered car to a buyer in Karnataka.',
        answersJson: JSON.stringify({
          saleCompleted: true,
          activeLoan: false,
          hasRC: true,
          isLongTermRelocation: true,
        }),
      },
    });
    await createCaseFromJourney(journeyB.id);
  }

  return { message: 'Synthetic scenarios seeded successfully' };
}

/**
 * Formats DB models into domain Journey DTO.
 */
// Minimal typing for Prisma DB row shapes — avoids `any` while staying compatible
type DbStep = { id: string; stepNumber: number; title: string; description: string; responsibility: string; status: string; notesJson: string; officialRtoAction: string; legalBasis: string; isConditional: boolean; conditionalReason: string | null; estimatedDays: number | null };
type DbDoc = { id: string; code: string; title: string; description: string; status: string; isMandatory: boolean; issuedBy: string | null; legalBasis: string | null };
type DbStatusEvent = { id: string; caseId: string; timestamp: Date; title: string; description: string; type: string };
type DbCase = { id: string; title: string; role: string; transaction: string; registrationNumber: string | null; originState: string; destinationState: string; activeLoan: boolean; hasRC: boolean; saleCompleted: boolean; isLongTermRelocation: boolean; sellerName: string | null; buyerName: string | null; vehicleModel: string | null; createdAt: Date; caseNumber: string; roadmapSteps: DbStep[]; documents: DbDoc[]; statusEvents: DbStatusEvent[] };
type DbJourney = { id: string; currentScreen: string; userRole: string | null; situationText: string | null; answersJson: string | null; case: DbCase | null };

function formatJourneyDTO(dbJourney: DbJourney): {
  id: string;
  currentScreen: string;
  userRole: UserRole | null;
  situationText: string;
  answers: QuestionAnswers;
  journey: JourneyDomain | null;
  caseId: string;
} {
  let answers: QuestionAnswers = {};
  try {
    answers = JSON.parse(dbJourney.answersJson || '{}');
  } catch {
    answers = {};
  }

  if (!dbJourney.case) {
    return {
      id: dbJourney.id,
      currentScreen: dbJourney.currentScreen || 'landing',
      userRole: (dbJourney.userRole as UserRole) || null,
      situationText: dbJourney.situationText || '',
      answers,
      journey: null,
      caseId: '',
    };
  }

  const dbCase = dbJourney.case;

  const vehicleCase: VehicleCase = {
    id: dbCase.id,
    title: dbCase.title,
    role: dbCase.role as UserRole,
    transaction: dbCase.transaction as 'sale' | 'transfer',
    registrationNumber: dbCase.registrationNumber,
    originState: dbCase.originState,
    destinationState: dbCase.destinationState,
    activeLoan: dbCase.activeLoan,
    hasRC: dbCase.hasRC,
    saleCompleted: dbCase.saleCompleted,
    isLongTermRelocation: dbCase.isLongTermRelocation,
    sellerName: dbCase.sellerName,
    buyerName: dbCase.buyerName,
    vehicleModel: dbCase.vehicleModel,
    createdAt: dbCase.createdAt.toISOString(),
  };

  const roadmap: RoadmapStep[] = (dbCase.roadmapSteps || []).map((step: DbStep) => {
    let notes: string[] = [];
    try {
      notes = JSON.parse(step.notesJson || '[]');
    } catch {
      notes = [];
    }

    return {
      id: step.id,
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description,
      responsibility: step.responsibility as 'seller' | 'buyer' | 'joint',
      status: step.status as 'pending' | 'in_progress' | 'action_required' | 'completed',
      requiredDocuments: [], // Attached via allRequiredDocuments below
      officialRtoAction: step.officialRtoAction,
      legalBasis: step.legalBasis,
      isConditional: step.isConditional,
      conditionalReason: step.conditionalReason || undefined,
      notes,
      estimatedDays: step.estimatedDays || undefined,
    };
  });

  const allRequiredDocuments: Document[] = (dbCase.documents || []).map((doc: DbDoc) => ({
    id: doc.id,
    code: doc.code,
    title: doc.title,
    description: doc.description,
    status: doc.status.toLowerCase() as 'required' | 'optional' | 'uploaded' | 'verified',
    isMandatory: doc.isMandatory,
    issuedBy: doc.issuedBy || undefined,
    legalBasis: doc.legalBasis || undefined,
  }));

  const statusEvents: StatusEvent[] = (dbCase.statusEvents || []).map((evt: DbStatusEvent) => ({
    id: evt.id,
    caseId: evt.caseId,
    timestamp: evt.timestamp.toISOString(),
    title: evt.title,
    description: evt.description,
    type: evt.type as 'info' | 'action_required' | 'milestone',
  }));

  // Re-evaluate legal disclaimer text
  const evaluated = evaluateRules(vehicleCase);

  const domainJourney: JourneyDomain = {
    case: vehicleCase,
    isInterstate: vehicleCase.originState !== vehicleCase.destinationState,
    hasHypothecation: vehicleCase.activeLoan,
    needsDuplicateRc: vehicleCase.hasRC === false,
    isLongTermRelocation: vehicleCase.isLongTermRelocation !== false,
    roadmap,
    allRequiredDocuments,
    statusEvents,
    legalDisclaimer: evaluated.legalDisclaimer,
  };

  return {
    id: dbJourney.id,
    currentScreen: dbJourney.currentScreen || 'landing',
    userRole: (dbJourney.userRole as UserRole) || null,
    situationText: dbJourney.situationText || '',
    answers,
    journey: domainJourney,
    caseId: dbCase.caseNumber || dbCase.id,
  };
}
