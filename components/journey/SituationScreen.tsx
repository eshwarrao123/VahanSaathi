import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface SituationScreenProps {
  situationText: string;
  onTextChange: (text: string) => void;
  onBuildPlan: () => void;
  onUseQuestions: () => void;
  onBack: () => void;
  isInterpreting?: boolean;
}

export function SituationScreen({
  situationText,
  onTextChange,
  onBuildPlan,
  onUseQuestions,
  onBack,
  isInterpreting = false,
}: SituationScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Tell us what happened</h2>
        <p className="text-sm text-slate-600">
          Use your own words. We&apos;ll turn it into structured transfer steps.
        </p>
      </div>

      <div>
        <textarea
          value={situationText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="e.g. I sold my Telangana car to someone in Karnataka."
          className="w-full min-h-[120px] p-4 border border-slate-300 rounded-lg text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 resize-none"
          autoFocus
          aria-label="Describe your situation"
        />
      </div>

      <div className="space-y-3">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={onBuildPlan}
          disabled={!situationText.trim() || isInterpreting}
        >
          {isInterpreting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Understanding your situation...
            </span>
          ) : (
            'Build my plan'
          )}
        </Button>

        <Button
          variant="secondary"
          fullWidth
          onClick={onUseQuestions}
          disabled={isInterpreting}
        >
          Answer a few questions instead
        </Button>
      </div>

      <Button variant="secondary" fullWidth onClick={onBack} disabled={isInterpreting}>
        Back
      </Button>
    </motion.div>
  );
}
