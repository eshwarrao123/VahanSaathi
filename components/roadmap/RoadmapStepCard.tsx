import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { RoadmapStep } from '@/types';

interface RoadmapStepCardProps {
  step: RoadmapStep;
  isFirst: boolean;
  animationDelay: number;
  onClick: () => void;
}

export function RoadmapStepCard({
  step,
  isFirst,
  animationDelay,
  onClick,
}: RoadmapStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
    >
      <button
        onClick={onClick}
        className="w-full text-left p-5 border-2 border-slate-200 rounded-lg bg-white hover:border-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-900 text-white text-lg font-bold flex items-center justify-center">
            {step.stepNumber}
          </div>
          <div className="flex-1 space-y-2">
            <div className="font-semibold text-slate-900 text-base leading-snug">
              {step.title}
            </div>

            {step.legalBasis && (
              <div className="text-xs text-slate-500 font-medium">
                Legal Basis: {step.legalBasis}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Badge
                status={
                  step.responsibility === 'seller'
                    ? 'action_required'
                    : step.responsibility === 'buyer'
                    ? 'info'
                    : 'pending'
                }
              >
                {step.responsibility.toUpperCase()}
              </Badge>
              {step.isConditional && (
                <Badge status="disclaimer">CONDITIONAL</Badge>
              )}
              {isFirst && <Badge status="action_required">NEXT STEP</Badge>}
            </div>

            {step.isConditional && step.conditionalReason && (
              <div className="mt-2 text-xs text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                {step.conditionalReason}
              </div>
            )}
          </div>
        </div>
      </button>
    </motion.div>
  );
}
