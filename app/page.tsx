'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Alert } from '@/components/ui/alert';
import { VehicleCase, Journey, RoadmapStep, UserRole } from '@/types';
import {
  getStoredJourneyId,
  createJourneyApi,
  getJourneyApi,
  updateJourneyApi,
  generateCaseApi,
  submitMockCaseApi,
  clearStoredJourneyId,
  interpretSituationApi,
  explainRoadmapApi,
  explainStepApi,
} from '@/lib/clientApi';
import type { QuestionAnswers } from '@/lib/services/journey';
import { interpretSituationText } from '@/lib/utils/interpretation';

// Journey screen components
import { LandingScreen } from '@/components/journey/LandingScreen';
import { RoleScreen } from '@/components/journey/RoleScreen';
import { SituationScreen } from '@/components/journey/SituationScreen';
import { UnderstandingScreen } from '@/components/journey/UnderstandingScreen';
import { QuestionsScreen } from '@/components/journey/QuestionsScreen';
import { CaseSummaryScreen } from '@/components/journey/CaseSummaryScreen';
import { RoadmapScreen } from '@/components/journey/RoadmapScreen';
import { StepDetailScreen } from '@/components/journey/StepDetailScreen';
import { ResponsibilitiesScreen } from '@/components/journey/ResponsibilitiesScreen';
import { DocumentsScreen } from '@/components/journey/DocumentsScreen';
import { DocumentCheckScreen } from '@/components/journey/DocumentCheckScreen';
import { SubmissionScreen } from '@/components/journey/SubmissionScreen';
import { StatusScreen } from '@/components/journey/StatusScreen';

// Screen flow type
type ScreenType =
  | 'landing'
  | 'choose-role'
  | 'describe'
  | 'confirm-understanding'
  | 'guided-questions'
  | 'case-summary'
  | 'roadmap'
  | 'step-detail'
  | 'responsibilities'
  | 'documents'
  | 'document-check'
  | 'mock-submission'
  | 'status';

// Guided question configuration
const GUIDED_QUESTIONS = [
  {
    id: 'sale-completed',
    question: 'Has the sale already happened?',
    description: 'Have you physically handed over the vehicle and executed delivery?',
    options: [
      { label: 'Yes, sale is complete', value: true },
      { label: 'Not yet, planning ahead', value: false },
    ],
    key: 'saleCompleted' as keyof QuestionAnswers,
  },
  {
    id: 'active-loan',
    question: 'Does the vehicle have an active loan / hypothecation?',
    description: 'Under Section 51 MVA 1988, loan payoff and Form 35 are required before transfer.',
    options: [
      { label: 'Yes, active bank loan', value: true },
      { label: 'No loan, owned outright', value: false },
    ],
    key: 'activeLoan' as keyof QuestionAnswers,
  },
  {
    id: 'has-rc',
    question: 'Do you have the original Registration Certificate (RC)?',
    description: 'If lost, a duplicate RC (Form 26) must be obtained under Section 41(14) MVA 1988.',
    options: [
      { label: 'Yes, original RC is available', value: true },
      { label: 'No, RC is lost or damaged', value: false },
    ],
    key: 'hasRC' as keyof QuestionAnswers,
  },
  {
    id: 'long-term-relocation',
    question: 'Will the vehicle remain in the destination state for over 12 months?',
    description: 'Under Section 47 MVA 1988, a new state registration mark (Form 27) is required only for stays exceeding 12 months.',
    options: [
      { label: 'Yes, long-term relocation (>12 months)', value: true },
      { label: 'No, temporary / short-term stay (<12 months)', value: false },
    ],
    key: 'isLongTermRelocation' as keyof QuestionAnswers,
  },
];

export default function Home() {
  const [journeyId, setJourneyId] = useState<string | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [situationText, setSituationText] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswers>({});
  const [journey, setJourney] = useState<Journey | null>(null);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [caseId, setCaseId] = useState<string>('');

  // UX State: Loading & Recoverable Error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // AI Moment States
  const [isInterpretingAi, setIsInterpretingAi] = useState(false);
  const [interpretedAiResult, setInterpretedAiResult] = useState<{
    role: UserRole;
    vehicleModel: string | null;
    originState: string | null;
    destinationState: string | null;
    rawUnderstanding?: string;
    isFallback?: boolean;
  } | null>(null);

  const [aiRoadmapSummary, setAiRoadmapSummary] = useState<{
    summary: string;
    keyTakeaway: string;
    isFallback: boolean;
  } | null>(null);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);

  // Restore persistent journey from database on initial page after load / refresh
  useEffect(() => {
    async function restoreSession() {
      const storedId = getStoredJourneyId();
      if (storedId) {
        setIsLoading(true);
        try {
          const data = await getJourneyApi(storedId);
          if (data) {
            setJourneyId(data.id);
            setCurrentScreen((data.currentScreen as ScreenType) || 'landing');
            setUserRole(data.userRole);
            setSituationText(data.situationText || '');
            setAnswers(data.answers || {});
            setJourney(data.journey);
            if (data.journey?.case?.id) {
              setCaseId(data.caseId || data.journey.case.id);
            }
          }
        } catch (err) {
          console.warn('Session recovery error:', err);
        } finally {
          setIsLoading(false);
        }
      }
      setIsInitialized(true);
    }
    restoreSession();
  }, []);

  // Helper to persist screen updates
  const syncScreenState = async (screen: ScreenType, payload: Record<string, unknown> = {}) => {
    setCurrentScreen(screen);
    setErrorMsg(null);
    if (journeyId) {
      try {
        await updateJourneyApi(journeyId, { currentScreen: screen, ...payload });
      } catch (err: unknown) {
        console.warn('Failed to sync screen state:', err);
      }
    }
  };

  // Build temporary case representation for summary preview
  const buildCurrentCase = (): VehicleCase => {
    const fallbackInterpreted = interpretSituationText(situationText);
    return {
      id: journey?.case?.id || 'case-preview',
      title: 'Your Vehicle Transfer Guidance Plan',
      role: userRole || interpretedAiResult?.role || fallbackInterpreted.role || 'seller',
      transaction: 'sale',
      registrationNumber: journey?.case?.registrationNumber || fallbackInterpreted.registrationNumber,
      originState: journey?.case?.originState || interpretedAiResult?.originState || fallbackInterpreted.originState,
      destinationState: journey?.case?.destinationState || interpretedAiResult?.destinationState || fallbackInterpreted.destinationState,
      activeLoan: answers.activeLoan || false,
      hasRC: answers.hasRC !== false,
      saleCompleted: answers.saleCompleted !== false,
      isLongTermRelocation: answers.isLongTermRelocation !== false,
      sellerName: 'Synthetic Seller',
      buyerName: 'Synthetic Buyer',
      vehicleModel: journey?.case?.vehicleModel || interpretedAiResult?.vehicleModel || fallbackInterpreted.vehicleModel,
      createdAt: journey?.case?.createdAt || new Date().toISOString(),
    };
  };

  // Handlers
  const handleStartTransfer = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const newJourney = await createJourneyApi();
      setJourneyId(newJourney.id);
      setCurrentScreen('choose-role');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("We couldn't initialize your journey just now. Your information is safe. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = async (role: UserRole) => {
    setUserRole(role);
    await syncScreenState('describe', { userRole: role });
  };

  // AI Moment 1: Natural-Language Situation Understanding
  const handleBuildPlan = async () => {
    if (!situationText.trim()) return;

    setIsInterpretingAi(true);
    setErrorMsg(null);
    try {
      const result = await interpretSituationApi(situationText, userRole || undefined);
      setInterpretedAiResult({
        role: result.role,
        vehicleModel: result.vehicleModel,
        originState: result.originState,
        destinationState: result.destinationState,
        rawUnderstanding: result.rawUnderstanding,
        isFallback: result.isFallback,
      });
      setUserRole(result.role);
      await syncScreenState('confirm-understanding', { situationText, userRole: result.role });
    } catch (err: unknown) {
      console.warn('AI Interpretation error, falling back to guided parser:', err);
      const fallback = interpretSituationText(situationText);
      setInterpretedAiResult({
        role: userRole || fallback.role || 'seller',
        vehicleModel: fallback.vehicleModel,
        originState: fallback.originState,
        destinationState: fallback.destinationState,
        isFallback: true,
      });
      await syncScreenState('confirm-understanding', { situationText });
    } finally {
      setIsInterpretingAi(false);
    }
  };

  const handleUseQuestions = async () => {
    setCurrentQuestionIndex(0);
    await syncScreenState('guided-questions');
  };

  const handleConfirmUnderstanding = async () => {
    setCurrentQuestionIndex(0);
    await syncScreenState('guided-questions');
  };

  const handleAnswer = async (value: boolean) => {
    const currentQuestion = GUIDED_QUESTIONS[currentQuestionIndex];
    const updatedAnswers = { ...answers, [currentQuestion.key]: value };
    setAnswers(updatedAnswers);

    if (currentQuestionIndex < GUIDED_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      if (journeyId) {
        updateJourneyApi(journeyId, { answers: updatedAnswers }).catch(() => { });
      }
    } else {
      setIsLoading(true);
      try {
        if (journeyId) {
          await updateJourneyApi(journeyId, {
            currentScreen: 'case-summary',
            answers: updatedAnswers,
          });
        }
        setCurrentScreen('case-summary');
      } catch (err: unknown) {
        console.error(err);
        setErrorMsg("We couldn't save that answer. Please click again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleShowRoadmap = async () => {
    if (!journeyId) {
      const newJ = await createJourneyApi(userRole || undefined);
      setJourneyId(newJ.id);
    }
    const currentJId = journeyId || getStoredJourneyId();
    if (!currentJId) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const updatedData = await generateCaseApi(currentJId);
      setJourney(updatedData.journey);
      setCaseId(updatedData.caseId || updatedData.journey?.case?.id || '');
      setCurrentScreen('roadmap');

      // AI Moment 2: Fetch plain-language roadmap explanation once
      if (updatedData.journey?.case && updatedData.journey?.roadmap) {
        setIsLoadingAiSummary(true);
        explainRoadmapApi(updatedData.journey.case, updatedData.journey.roadmap)
          .then((summaryData) => setAiRoadmapSummary(summaryData))
          .catch(() => setAiRoadmapSummary(null))
          .finally(() => setIsLoadingAiSummary(false));
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("We couldn't evaluate your case just now. Your input is saved. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewStep = (stepId: string) => {
    const step = journey?.roadmap.find((s) => s.id === stepId);
    if (step) {
      setSelectedStep(step);
      setCurrentScreen('step-detail');
    }
  };

  // AI Moment 3: Contextual "Why do I need this step?"
  const handleAskWhy = async (step: RoadmapStep) => {
    return explainStepApi({
      stepTitle: step.title,
      stepDescription: step.description,
      legalBasis: step.legalBasis,
      userRole: userRole || 'seller',
      officialRtoAction: step.officialRtoAction,
      caseId: journey?.case?.id || caseId,
      stepId: step.id,
    });
  };

  const handleSimulateSubmission = async () => {
    const targetCaseId = journey?.case?.id || caseId;
    if (!targetCaseId) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await submitMockCaseApi(targetCaseId);
      if (journeyId) {
        const reloaded = await getJourneyApi(journeyId);
        if (reloaded) setJourney(reloaded.journey);
      }
      setCurrentScreen('status');
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg("We couldn't complete the mock submission request. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    clearStoredJourneyId();
    setJourneyId(null);
    setCurrentScreen('landing');
    setUserRole(null);
    setSituationText('');
    setAnswers({});
    setJourney(null);
    setCurrentQuestionIndex(0);
    setSelectedStep(null);
    setCaseId('');
    setErrorMsg(null);
    setInterpretedAiResult(null);
    setAiRoadmapSummary(null);
  };

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Restoring your VahanSaathi journey...</p>
        </div>
      </main>
    );
  }

  const getInterpretedDisplayCase = () => {
    const fallback = interpretSituationText(situationText);
    return {
      role: interpretedAiResult?.role || userRole || fallback.role || 'seller',
      vehicleModel: interpretedAiResult?.vehicleModel || fallback.vehicleModel,
      originState: interpretedAiResult?.originState || fallback.originState,
      destinationState: interpretedAiResult?.destinationState || fallback.destinationState,
      rawUnderstanding: interpretedAiResult?.rawUnderstanding,
      isFallback: interpretedAiResult?.isFallback,
    };
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 px-4 py-8 sm:py-12">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header & Disclaimer */}
        <header className="space-y-4">
          <Alert type="disclaimer" className="text-center sm:text-left">
            <span className="font-semibold">Independent hackathon prototype</span> — not an
            official government service.
          </Alert>

          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">VahanSaathi</h1>
            <p className="text-sm text-slate-600 mt-1">
              Tell us what happened. We&apos;ll tell you what to do next.
            </p>
          </div>
        </header>

        {/* Global Recoverable Error Banner */}
        {errorMsg && (
          <Alert type="disclaimer" className="bg-rose-50 border-rose-300 text-rose-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium">{errorMsg}</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs underline font-semibold text-rose-900 flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          </Alert>
        )}

        {/* Global Loading Overlay Indicator */}
        {isLoading && (
          <div className="p-3 bg-slate-900 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing persistent request...</span>
          </div>
        )}

        {/* Screen Content */}
        <AnimatePresence mode="wait">
          {currentScreen === 'landing' && (
            <LandingScreen key="landing" onStartTransfer={handleStartTransfer} />
          )}

          {currentScreen === 'choose-role' && (
            <RoleScreen
              key="choose-role"
              onSelectRole={handleSelectRole}
              onBack={() => setCurrentScreen('landing')}
            />
          )}

          {currentScreen === 'describe' && (
            <SituationScreen
              key="describe"
              situationText={situationText}
              onTextChange={setSituationText}
              onBuildPlan={handleBuildPlan}
              onUseQuestions={handleUseQuestions}
              onBack={() => setCurrentScreen('choose-role')}
              isInterpreting={isInterpretingAi}
            />
          )}

          {currentScreen === 'confirm-understanding' && (
            <UnderstandingScreen
              key="confirm"
              interpretedCase={getInterpretedDisplayCase()}
              onConfirm={handleConfirmUnderstanding}
              onEdit={() => setCurrentScreen('describe')}
            />
          )}

          {currentScreen === 'guided-questions' && (
            <QuestionsScreen
              key="questions"
              question={GUIDED_QUESTIONS[currentQuestionIndex]}
              questionIndex={currentQuestionIndex}
              totalQuestions={GUIDED_QUESTIONS.length}
              onAnswer={handleAnswer}
              onBack={
                currentQuestionIndex > 0
                  ? () => setCurrentQuestionIndex(currentQuestionIndex - 1)
                  : undefined
              }
            />
          )}

          {currentScreen === 'case-summary' && (
            <CaseSummaryScreen
              key="summary"
              vehicleCase={buildCurrentCase()}
              onShowRoadmap={handleShowRoadmap}
              onEditAnswers={() => {
                setCurrentQuestionIndex(0);
                setCurrentScreen('guided-questions');
              }}
            />
          )}

          {currentScreen === 'roadmap' && journey && (
            <RoadmapScreen
              key="roadmap"
              journey={journey}
              aiSummary={aiRoadmapSummary}
              isLoadingAiSummary={isLoadingAiSummary}
              onViewStep={handleViewStep}
              onViewResponsibilities={() => setCurrentScreen('responsibilities')}
              onViewDocuments={() => setCurrentScreen('documents')}
              onViewStatus={() => setCurrentScreen('status')}
              onViewSubmission={() => setCurrentScreen('mock-submission')}
            />
          )}

          {currentScreen === 'step-detail' && selectedStep && (
            <StepDetailScreen
              key="step-detail"
              step={selectedStep}
              userRole={userRole || 'seller'}
              onAskWhy={handleAskWhy}
              onBack={() => setCurrentScreen('roadmap')}
            />
          )}

          {currentScreen === 'responsibilities' && journey && (
            <ResponsibilitiesScreen
              key="responsibilities"
              journey={journey}
              onBack={() => setCurrentScreen('roadmap')}
            />
          )}

          {currentScreen === 'documents' && journey && (
            <DocumentsScreen
              key="documents"
              journey={journey}
              onDemoCheck={() => setCurrentScreen('document-check')}
              onBack={() => setCurrentScreen('roadmap')}
            />
          )}

          {currentScreen === 'document-check' && (
            <DocumentCheckScreen
              key="doc-check"
              onBack={() => setCurrentScreen('documents')}
            />
          )}

          {currentScreen === 'mock-submission' && (
            <SubmissionScreen
              key="submission"
              onSimulate={handleSimulateSubmission}
              onBack={() => setCurrentScreen('roadmap')}
            />
          )}

          {currentScreen === 'status' && (
            <StatusScreen
              key="status"
              caseId={caseId || journey?.case?.id || 'VS-DEMO-1042'}
              journey={journey}
              onBackToRoadmap={() => setCurrentScreen('roadmap')}
              onStartOver={handleStartOver}
              onSimulateSubmission={() => setCurrentScreen('mock-submission')}
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>
            VahanSaathi is an independent citizen guidance layer around Parivahan/VAHAN
            experiences.
          </p>
        </footer>
      </div>
    </main>
  );
}
