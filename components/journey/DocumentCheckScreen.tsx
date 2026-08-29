import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface DocumentCheckScreenProps {
  onBack: () => void;
}

export function DocumentCheckScreen({ onBack }: DocumentCheckScreenProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheck = () => {
    setIsChecked(true);
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
        <div className="p-4 bg-slate-100 rounded border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
          <div>Registration: TS-09-XX-9999 (Synthetic)</div>
          <div>Owner: Demo User (Synthetic)</div>
          <div>Model: 2022 Hyundai Creta</div>
        </div>
      </Card>

      {!isChecked ? (
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={handleCheck}>
            Check sample document
          </Button>

          <Button variant="secondary" fullWidth onClick={onBack}>
            Back to documents
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="space-y-3 border-emerald-300 bg-emerald-50/50">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Document check complete
            </h3>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <span className="text-emerald-600">✓</span>
                <span>Registration information detected</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <span className="text-emerald-600">✓</span>
                <span>Owner information detected</span>
              </div>
              <div className="flex items-start gap-2 text-amber-800 font-medium bg-amber-50 p-2 rounded border border-amber-200">
                <span className="text-amber-600">⚠</span>
                <span>Example issue: destination information incomplete</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/80">
              Synthetic demonstration only. No government database was contacted.
            </p>
          </Card>

          <Button variant="primary" fullWidth onClick={onBack}>
            Done
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
