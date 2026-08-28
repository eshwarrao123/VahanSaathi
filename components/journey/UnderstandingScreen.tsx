import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { UserRole } from '@/types';

interface InterpretedCase {
  role: UserRole;
  vehicleModel: string | null;
  originState: string | null;
  destinationState: string | null;
  rawUnderstanding?: string;
  isFallback?: boolean;
}

interface UnderstandingScreenProps {
  interpretedCase: InterpretedCase;
  onConfirm: () => void;
  onEdit: () => void;
}

export function UnderstandingScreen({
  interpretedCase,
  onConfirm,
  onEdit,
}: UnderstandingScreenProps) {
  const isInterstate = interpretedCase.originState && interpretedCase.destinationState && 
    interpretedCase.originState !== interpretedCase.destinationState;

  const getStateName = (code: string | null) => {
    if (!code) return 'Not specified';
    if (code === 'TG' || code === 'Telangana') return 'Telangana';
    if (code === 'KA' || code === 'Karnataka') return 'Karnataka';
    if (code === 'MH' || code === 'Maharashtra') return 'Maharashtra';
    return code;
  };

  const hasIncompleteInfo = !interpretedCase.originState || !interpretedCase.destinationState;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Here&apos;s what we understood</h2>
        <p className="text-sm text-slate-600">
          Please confirm these extracted details before generating your verified statutory plan.
        </p>
      </div>

      {interpretedCase.isFallback && (
        <Alert type="info">
          Used standard rule-based parsing. You can edit any details below if needed.
        </Alert>
      )}

      {hasIncompleteInfo && (
        <Alert type="disclaimer">
          Some information is missing. We&apos;ll ask you a few questions to complete your case.
        </Alert>
      )}

      {interpretedCase.rawUnderstanding && !interpretedCase.isFallback && (
        <div className="p-3 bg-slate-900 text-white rounded-lg text-xs leading-relaxed space-y-1">
          <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 block">
            AI Interpretation Summary
          </span>
          <p>{interpretedCase.rawUnderstanding}</p>
        </div>
      )}

      <Card className="space-y-4 border-slate-300">
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Your Role</div>
            <div className="text-base font-semibold text-slate-900 capitalize">
              {interpretedCase.role}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">Vehicle</div>
            <div className={`text-base font-semibold ${interpretedCase.vehicleModel ? 'text-slate-900' : 'text-slate-500 italic'}`}>
              {interpretedCase.vehicleModel || 'Not specified'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">From (Origin)</div>
              <div className={`text-base font-semibold ${interpretedCase.originState ? 'text-slate-900' : 'text-slate-500 italic'}`}>
                {getStateName(interpretedCase.originState)}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">To (Destination)</div>
              <div className={`text-base font-semibold ${interpretedCase.destinationState ? 'text-slate-900' : 'text-slate-500 italic'}`}>
                {getStateName(interpretedCase.destinationState)}
              </div>
            </div>
          </div>

          {interpretedCase.originState && interpretedCase.destinationState && (
            <div>
              <div className="text-xs font-medium text-slate-500 mb-1">Transfer Type</div>
              <Badge status={isInterstate ? 'action_required' : 'info'}>
                {isInterstate ? 'Interstate Transfer' : 'Same-State Transfer'}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="primary" fullWidth size="lg" onClick={onConfirm}>
          {hasIncompleteInfo ? 'Continue to questions' : 'Yes, build my plan'}
        </Button>

        <Button variant="secondary" fullWidth onClick={onEdit}>
          Change something
        </Button>
      </div>
    </motion.div>
  );
}
