import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Journey } from '@/types';

interface ResponsibilitiesScreenProps {
  journey: Journey;
  onBack: () => void;
}

export function ResponsibilitiesScreen({ journey, onBack }: ResponsibilitiesScreenProps) {
  const sellerSteps = journey.roadmap.filter((s) => s.responsibility === 'seller');
  const buyerSteps = journey.roadmap.filter((s) => s.responsibility === 'buyer');
  const jointSteps = journey.roadmap.filter((s) => s.responsibility === 'joint');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Who needs to act?</h2>
      </div>

      {sellerSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge status="action_required">SELLER</Badge>
            <span className="text-sm text-slate-600">{sellerSteps.length} actions</span>
          </div>
          <div className="space-y-2">
            {sellerSteps.map((step) => (
              <Card key={step.id} className="p-4 border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{step.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {buyerSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge status="info">BUYER</Badge>
            <span className="text-sm text-slate-600">{buyerSteps.length} actions</span>
          </div>
          <div className="space-y-2">
            {buyerSteps.map((step) => (
              <Card key={step.id} className="p-4 border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{step.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {jointSteps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge status="pending">BOTH PARTIES</Badge>
            <span className="text-sm text-slate-600">{jointSteps.length} actions</span>
          </div>
          <div className="space-y-2">
            {jointSteps.map((step) => (
              <Card key={step.id} className="p-4 border-slate-200">
                <div className="text-sm font-semibold text-slate-900">{step.title}</div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back to roadmap
      </Button>
    </motion.div>
  );
}
