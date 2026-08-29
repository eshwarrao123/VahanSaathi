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
  const isCurrent = isFirst && step.status === 'action_required';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay }}
    >
      <button
        onClick={onClick}
        className={`w-full text-left p-5 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
          isCurrent
            ? 'border-2 border-slate-900 bg-slate-50 shadow-md hover:shadow-lg'
            : step.status === 'completed'
            ? 'border-2 border-emerald-200 bg-emerald-50/30 hover:border-emerald-400'
            : 'border-2 border-slate-200 bg-white hover:border-slate-900'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`flex-shrink-0 w-10 h-10 rounded-full text-lg font-bold flex items-center justify-center ${
            isCurrent
              ? 'bg-slate-900 text-white ring-4 ring-slate-900/20'
              : step.status === 'completed'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-300 text-slate-600'
          }`}>
            {step.status === 'completed' ? '✓' : step.stepNumber}
          </div>
          <div className="flex-1 space-y-2">
            <div className={`text-base leading-snug ${
              isCurrent ? 'font-bold text-slate-900' : 'font-semibold text-slate-900'
            }`}>
              {step.title}
            </div>

            {step.legalBasis && (
              <div className="text-xs text-slate-500 font-medium">
                Legal basis: {step.legalBasis}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {isCurrent && (
                <Badge status="action_required">CURRENT STEP</Badge>
              )}
              {step.status === 'completed' && (
                <Badge status="info">COMPLETED</Badge>
              )}
              {step.status === 'pending' && !isCurrent && (
                <Badge status="pending">WAITING</Badge>
              )}
              <Badge
                status={
                  step.responsibility === 'seller'
                    ? 'action_required'
                    : step.responsibility === 'buyer'
                    ? 'info'
                    : 'pending'
                }
              >
                {step.responsibility === 'seller' ? 'YOU' : 
                 step.responsibility === 'buyer' ? 'BUYER' : 
                 'GOVERNMENT'}
              </Badge>
              {step.isConditional && (
                <Badge status="disclaimer">ONLY IF APPLICABLE</Badge>
              )}
            </div>

            {isCurrent && (
              <div className="mt-2 text-xs font-medium text-slate-700 bg-white p-2 rounded border border-slate-200">
                👉 Start here — this is your next action
              </div>
            )}

            {step.isConditional && step.conditionalReason && !isCurrent && (
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
