import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Journey } from '@/types';

interface StatusScreenProps {
  caseId: string;
  journey?: Journey | null;
  onBackToRoadmap: () => void;
  onStartOver: () => void;
  onSimulateSubmission?: () => void;
}

export function StatusScreen({ caseId, journey, onBackToRoadmap, onStartOver, onSimulateSubmission }: StatusScreenProps) {
  const isSubmitted = journey?.case?.id && journey.statusEvents?.some(e => e.title.includes('Submission'));

  const getRouteDisplay = () => {
    if (journey?.case?.originState && journey?.case?.destinationState) {
      return `${journey.case.originState} → ${journey.case.destinationState}`;
    }
    return 'your interstate case';
  };

  const statusItems = [
    { label: 'Your situation understood', detail: 'Details analyzed and confirmed', completed: true },
    { label: 'Transfer plan created', detail: `Verified against Motor Vehicles Act requirements`, completed: true },
    { label: 'Document checklist ready', detail: `${journey?.allRequiredDocuments.length || 0} required documents identified`, completed: true },
    { label: 'Mock government submission', detail: isSubmitted ? 'Demo submission completed' : 'Ready when you are', active: !isSubmitted, completed: !!isSubmitted },
    { label: 'RTO processing', detail: isSubmitted ? 'Awaiting RTO action' : 'Not started', completed: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Where you are</h2>
        {caseId && (
          <div className="text-sm text-slate-600">
            Case reference: <span className="font-mono font-semibold text-slate-900">{caseId}</span>
          </div>
        )}
        <p className="text-sm text-slate-600">
          Your transfer roadmap for {getRouteDisplay()}
        </p>
      </div>

      {/* Activity Timeline */}
      {journey?.statusEvents && journey.statusEvents.length > 0 && (
        <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Activity timeline
          </div>
          <div className="space-y-2.5">
            {journey.statusEvents.map((evt) => (
              <div key={evt.id} className="text-xs space-y-0.5 border-l-2 border-slate-900 pl-3 py-0.5">
                <div className="font-semibold text-slate-900">{evt.title}</div>
                <div className="text-slate-600">{evt.description}</div>
                <div className="text-[10px] text-slate-400 font-mono pt-0.5">
                  {new Date(evt.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestone List */}
      <div className="space-y-4">
        {statusItems.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                item.completed
                  ? 'bg-emerald-600'
                  : item.active
                  ? 'bg-amber-500'
                  : 'bg-slate-300'
              }`}
            >
              <span
                className={`text-xs ${
                  item.completed
                    ? 'text-white'
                    : item.active
                    ? 'text-white font-bold'
                    : 'text-slate-500'
                }`}
              >
                {item.completed ? '✓' : item.active ? '●' : '○'}
              </span>
            </div>
            <div className="flex-1">
              <div
                className={`text-sm ${
                  item.completed || item.active
                    ? 'font-semibold text-slate-900'
                    : 'font-medium text-slate-500'
                }`}
              >
                {item.label}
              </div>
              <div
                className={`text-xs ${
                  item.completed || item.active ? 'text-slate-600' : 'text-slate-400'
                }`}
              >
                {item.detail}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isSubmitted && onSimulateSubmission && (
        <Button variant="primary" fullWidth onClick={onSimulateSubmission}>
          Simulate government submission
        </Button>
      )}

      <Button variant="secondary" fullWidth onClick={onBackToRoadmap}>
        Back to roadmap
      </Button>

      <Button variant="secondary" fullWidth onClick={onStartOver}>
        Start over
      </Button>
    </motion.div>
  );
}
