import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface DocumentCheckScreenProps {
  onBack: () => void;
}

export function DocumentCheckScreen({ onBack }: DocumentCheckScreenProps) {
  const handleCheck = () => {
    alert(
      'Demo check completed:\n\n✓ Registration information detected\n✓ Owner information detected\n⚠ Example issue: destination information incomplete\n\nThis is synthetic demonstration only.'
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Demo document check</h2>
        <Alert type="disclaimer">
          This is a prototype demonstration using synthetic data only. Not real identity
          verification.
        </Alert>
      </div>

      <Card className="space-y-4 border-slate-300">
        <div className="text-sm font-semibold text-slate-700">Synthetic RC — DEMO ONLY</div>
        <div className="p-4 bg-slate-100 rounded border border-slate-200 text-xs text-slate-600 font-mono">
          Registration: TS-09-XX-9999 (Synthetic)
          <br />
          Owner: Demo User (Synthetic)
          <br />
          Model: 2022 Hyundai Creta
        </div>
      </Card>

      <Button variant="primary" fullWidth onClick={handleCheck}>
        Check sample document
      </Button>

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back to documents
      </Button>
    </motion.div>
  );
}
