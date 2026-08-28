import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface SubmissionScreenProps {
  onSimulate: () => void;
  onBack: () => void;
}

export function SubmissionScreen({ onSimulate, onBack }: SubmissionScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Continue to government step</h2>
        <Alert type="disclaimer">
          This hackathon prototype simulates the government submission. This is not a real VAHAN
          submission.
        </Alert>
      </div>

      <Card className="space-y-4 border-slate-300">
        <p className="text-sm text-slate-600">
          In a production system, this would connect to the official Parivahan/VAHAN portal.
        </p>
        <p className="text-sm text-slate-600">
          For this demo, we&apos;ll simulate the submission locally.
        </p>
      </Card>

      <Button variant="primary" fullWidth onClick={onSimulate}>
        Simulate submission
      </Button>

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back to roadmap
      </Button>
    </motion.div>
  );
}
