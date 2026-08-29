import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RoadmapStep, UserRole } from '@/types';

interface AiStepHelp {
  explanation: string;
  practicalTip: string;
  isFallback: boolean;
}

interface StepDetailScreenProps {
  step: RoadmapStep;
  userRole?: UserRole;
  onAskWhy?: (step: RoadmapStep) => Promise<AiStepHelp | void>;
  onBack: () => void;
}

export function StepDetailScreen({ step, onAskWhy, onBack }: StepDetailScreenProps) {
  const [aiHelp, setAiHelp] = useState<AiStepHelp | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [errorAi, setErrorAi] = useState<string | null>(null);

  const handleFetchWhy = async () => {
    if (!onAskWhy) return;
    setIsLoadingAi(true);
    setErrorAi(null);
    try {
      const result = await onAskWhy(step);
      if (result) {
        setAiHelp(result);
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorAi("Couldn't retrieve AI explanation. Showing verified statutory legal basis.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-lg font-bold flex items-center justify-center flex-shrink-0">
          {step.stepNumber}
        </div>
        <h2 className="text-xl font-semibold text-slate-900 leading-snug">
          {step.title}
        </h2>
      </div>

      <Card className="space-y-4 border-slate-300">
        {step.legalBasis && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-xs font-semibold text-slate-700 block">Statutory Basis:</span>
            <span className="text-xs text-slate-600">{step.legalBasis}</span>
          </div>
        )}

        {step.isConditional && step.conditionalReason && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
            <span className="text-xs font-semibold text-amber-900 block">Conditional Requirement:</span>
            <p className="text-xs text-amber-800 leading-relaxed">{step.conditionalReason}</p>
          </div>
        )}

        {/* AI Moment 3: Why Do I Need This Step? */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          {!aiHelp && !isLoadingAi && (
            <button
              onClick={handleFetchWhy}
              className="w-full py-2.5 px-3 bg-slate-900 text-white hover:bg-slate-800 transition-colors text-xs font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Why do I need this step?</span>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded uppercase font-mono">Ask AI</span>
            </button>
          )}

          {isLoadingAi && (
            <div className="p-3.5 bg-slate-900 text-white rounded-lg text-xs space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Explaining requirement in plain language...</span>
              </div>
              <div className="h-2.5 bg-slate-700 rounded w-4/5" />
            </div>
          )}

          {errorAi && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded text-xs">
              {errorAi}
            </div>
          )}

          {aiHelp && (
            <div className="p-4 bg-slate-900 text-white rounded-lg space-y-2.5 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                <span>Why this matters</span>
                {aiHelp.isFallback && (
                  <span className="text-amber-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    Based on your situation
                  </span>
                )}
              </div>
              <p className="text-xs leading-relaxed text-slate-100">{aiHelp.explanation}</p>
              {aiHelp.practicalTip && (
                <div className="p-2 bg-slate-800 rounded border border-slate-700 text-xs text-slate-200">
                  <span className="font-semibold text-white block mb-0.5">Action tip:</span>
                  {aiHelp.practicalTip}
                </div>
              )}
              <p className="text-[10px] text-slate-400 italic pt-0.5">
                This explanation is based on the verified rules used by this prototype. Final requirements depend on state RTO procedures.
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">
            {step.responsibility === 'seller' || step.responsibility === 'buyer' ? 'What you need to do' : 'What to do'}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {step.description}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Who handles this</h3>
          <div className="flex items-center gap-2">
            <Badge status={step.responsibility === 'seller' || step.responsibility === 'buyer' ? 'action_required' : 'pending'}>
              {step.responsibility.toUpperCase()}
            </Badge>
            <span className="text-xs text-slate-500">
              {step.responsibility === 'seller' ? '(What you need to do)' : 
               step.responsibility === 'buyer' ? '(What the buyer needs to do)' : 
               '(What happens on their side)'}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">What the RTO does</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {step.officialRtoAction}
          </p>
        </div>

        {step.estimatedDays && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Estimated Duration</h3>
            <p className="text-sm text-slate-600">
              Approximately {step.estimatedDays} working days (varies by RTO workload)
            </p>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Required documents</h3>
          <div className="space-y-3">
            {step.requiredDocuments.map((doc) => (
              <div key={doc.id} className="p-3 bg-white border border-slate-200 rounded-lg text-sm space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">
                      {doc.title.split('—')[0].trim()}
                    </div>
                    {doc.title.includes('—') && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        Official form: {doc.title.split('—')[1].trim()}
                      </div>
                    )}
                  </div>
                  {doc.isMandatory ? (
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono flex-shrink-0">Required</span>
                  ) : (
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded font-mono flex-shrink-0">If applicable</span>
                  )}
                </div>
                <div className="pt-1">
                  <div className="text-xs font-medium text-slate-700 mb-0.5">Why this matters:</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                </div>
                {doc.legalBasis && (
                  <div className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
                    Legal basis: {doc.legalBasis}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {step.notes && step.notes.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1">Important Practical Notes</h3>
            <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
              {step.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back to roadmap
      </Button>
    </motion.div>
  );
}
