import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface LandingScreenProps {
  onStartTransfer: () => void;
}

export function LandingScreen({ onStartTransfer }: LandingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-tight">
          Bought or sold a vehicle and don&apos;t know what to do next?
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
          Tell us what happened. We&apos;ll build your personal transfer roadmap.
        </p>
      </div>

      <Card className="space-y-5 border-slate-300">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={onStartTransfer}
        >
          Start my transfer
        </Button>
        
        <Button
          variant="secondary"
          fullWidth
          size="md"
          onClick={onStartTransfer}
        >
          I&apos;m just checking
        </Button>
      </Card>

      <div className="pt-6 space-y-3 text-center text-sm text-slate-600">
        <div className="font-medium text-slate-700">How it works</div>
        <div className="flex items-center justify-center gap-3 text-xs">
          <span>Tell us what happened</span>
          <span className="text-slate-400">→</span>
          <span>Get your steps</span>
          <span className="text-slate-400">→</span>
          <span>Know who&apos;s responsible</span>
        </div>
      </div>
    </motion.div>
  );
}
