import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

interface RoleScreenProps {
  onSelectRole: (role: UserRole) => void;
  onBack: () => void;
}

export function RoleScreen({ onSelectRole, onBack }: RoleScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">What happened?</h2>
        <p className="text-sm text-slate-600">
          You don&apos;t need to know the government service name.
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onSelectRole('seller')}
          className="w-full p-5 text-left border-2 border-slate-200 rounded-lg bg-white hover:border-slate-900 hover:bg-slate-50 transition-all min-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <div className="text-lg font-semibold text-slate-900">I sold a vehicle</div>
          <div className="text-sm text-slate-600 mt-1">
            You&apos;re the previous owner transferring ownership
          </div>
        </button>

        <button
          onClick={() => onSelectRole('buyer')}
          className="w-full p-5 text-left border-2 border-slate-200 rounded-lg bg-white hover:border-slate-900 hover:bg-slate-50 transition-all min-touch focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
        >
          <div className="text-lg font-semibold text-slate-900">I bought a vehicle</div>
          <div className="text-sm text-slate-600 mt-1">
            You&apos;re the new owner receiving the vehicle
          </div>
        </button>
      </div>

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back
      </Button>
    </motion.div>
  );
}
