import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Journey } from '@/types';
import { RoadmapStepCard } from '@/components/roadmap/RoadmapStepCard';

interface AiSummary {
  summary: string;
  keyTakeaway: string;
  isFallback: boolean;
}

interface RoadmapScreenProps {
  journey: Journey;
  aiSummary?: AiSummary | null;
  isLoadingAiSummary?: boolean;
  onViewStep: (stepId: string) => void;
  onViewResponsibilities: () => void;
  onViewDocuments: () => void;
  onViewStatus: () => void;
  onViewSubmission?: () => void;
}

export function RoadmapScreen({
  journey,
  aiSummary,
  isLoadingAiSummary = false,
  onViewStep,
  onViewResponsibilities,
  onViewDocuments,
  onViewStatus,
  onViewSubmission,
}: RoadmapScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Your personalized transfer roadmap</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Evaluated deterministically against Motor Vehicles Act 1988 and CMVR 1989 standards for your specific situation.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge status="info">
          ROLE: {journey.case.role.toUpperCase()}
        </Badge>
        <span className="text-slate-600 font-medium">
          {journey.case.originState} → {journey.case.destinationState}
        </span>
        {journey.isInterstate && (
          <Badge status="disclaimer">INTERSTATE TRANSITION</Badge>
        )}
      </div>

      {/* AI Moment 2: Plain-Language AI Summary Card */}
      {isLoadingAiSummary && (
        <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2 animate-pulse">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Generating plain-language summary...</span>
          </div>
          <div className="h-3 bg-slate-700 rounded w-5/6" />
          <div className="h-3 bg-slate-700 rounded w-2/3" />
        </div>
      )}

      {aiSummary && !isLoadingAiSummary && (
        <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2.5 shadow-sm border border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
            <span>Your plan</span>
            {aiSummary.isFallback && (
              <span className="text-[10px] text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Based on your situation
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-100">{aiSummary.summary}</p>
          <div className="p-2.5 bg-slate-800/80 rounded border border-slate-700/60 text-xs text-slate-200">
            <span className="font-semibold text-white block mb-0.5">What&apos;s next:</span>
            {aiSummary.keyTakeaway}
          </div>
          <p className="text-[10px] text-slate-400 italic">
            This explanation is based on the verified rules used by this prototype. Final requirements may depend on applicable state/RTO process.
          </p>
        </div>
      )}

      {/* Uncertainty & RTO Discretion Notice */}
      <Alert type="info">
        <span className="font-semibold text-slate-900">Process Note:</span> Some specific fee amounts, local police verification requirements, and appointment slots depend on local state RTO procedures ({journey.case.destinationState} Parivahan). Always check official RTO channels.
      </Alert>

      {/* Evaluated Steps */}
      <div className="space-y-4">
        {journey.roadmap.map((step, idx) => (
          <RoadmapStepCard
            key={step.id}
            step={step}
            isFirst={idx === 0}
            animationDelay={idx * 0.1}
            onClick={() => onViewStep(step.id)}
          />
        ))}
      </div>

      {/* Statutory Disclaimer Footer */}
      {journey.legalDisclaimer && (
        <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-600 leading-relaxed border border-slate-200">
          {journey.legalDisclaimer}
        </div>
      )}

      <div className="pt-4 space-y-3">
        <Button variant="primary" fullWidth onClick={onViewSubmission}>
          Proceed to mock submission
        </Button>

        <Button variant="secondary" fullWidth onClick={onViewResponsibilities}>
          See who does what
        </Button>

        <Button variant="secondary" fullWidth onClick={onViewDocuments}>
          View document checklist
        </Button>

        <Button variant="secondary" fullWidth onClick={onViewStatus}>
          Track progress
        </Button>
      </div>
    </motion.div>
  );
}
