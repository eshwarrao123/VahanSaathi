import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VehicleCase } from '@/types';

interface CaseSummaryScreenProps {
  vehicleCase: VehicleCase;
  onShowRoadmap: () => void;
  onEditAnswers: () => void;
}

export function CaseSummaryScreen({
  vehicleCase,
  onShowRoadmap,
  onEditAnswers,
}: CaseSummaryScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Your situation summary</h2>
        <p className="text-sm text-slate-600">
          These answers are evaluated against statutory rules to build your personalized roadmap.
        </p>
      </div>

      <Card className="space-y-4 border-slate-300">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Role</div>
            <div className="text-base font-semibold text-slate-900 capitalize">
              {vehicleCase.role}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Transfer Route</div>
            <div className="text-base font-semibold text-slate-900">
              {vehicleCase.originState || 'Unknown'} → {vehicleCase.destinationState || 'Unknown'} ({vehicleCase.originState && vehicleCase.destinationState && vehicleCase.originState !== vehicleCase.destinationState ? 'Interstate' : 'State Transfer'})
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Sale Completed</div>
            <div className="text-base font-semibold text-slate-900">
              {vehicleCase.saleCompleted ? 'Yes' : 'Not yet'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Active Loan / Hypothecation</div>
            <div className="text-base font-semibold text-slate-900">
              {vehicleCase.activeLoan ? 'Yes (Form 35 required)' : 'No loan'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Original RC Available</div>
            <div className="text-base font-semibold text-slate-900">
              {vehicleCase.hasRC ? 'Yes' : 'No (Form 26 duplicate RC required)'}
            </div>
          </div>

          {vehicleCase.originState !== vehicleCase.destinationState && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Relocation Duration</div>
              <div className="text-base font-semibold text-slate-900">
                {vehicleCase.isLongTermRelocation
                  ? 'Long-term relocation (>12 months — Form 27 applicable)'
                  : 'Short-term stay (<12 months — Form 27 not required)'}
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={onShowRoadmap}>
          Show my roadmap
        </Button>

        <Button variant="secondary" fullWidth onClick={onEditAnswers}>
          Edit answers
        </Button>
      </div>
    </motion.div>
  );
}
