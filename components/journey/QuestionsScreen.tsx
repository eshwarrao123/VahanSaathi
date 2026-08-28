import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Question {
  id: string;
  question: string;
  description: string;
  options: Array<{ label: string; value: boolean }>;
}

interface QuestionsScreenProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (value: boolean) => void;
  onBack?: () => void;
}

export function QuestionsScreen({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onBack,
}: QuestionsScreenProps) {
  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-500">
          Question {questionIndex + 1} of {totalQuestions}
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">
          {question.question}
        </h2>
        <p className="text-sm text-slate-600">
          {question.description}
        </p>
      </div>

      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => onAnswer(option.value)}
            className="w-full p-5 text-left border-2 border-slate-200 rounded-lg bg-white hover:border-slate-900 hover:bg-slate-50 transition-all min-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <div className="text-base font-semibold text-slate-900">
              {option.label}
            </div>
          </button>
        ))}
      </div>

      {onBack && questionIndex > 0 && (
        <Button variant="secondary" fullWidth onClick={onBack}>
          Previous question
        </Button>
      )}
    </motion.div>
  );
}
