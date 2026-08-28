import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Journey } from '@/types';

interface DocumentsScreenProps {
  journey: Journey;
  onDemoCheck: () => void;
  onBack: () => void;
}

export function DocumentsScreen({ journey, onDemoCheck, onBack }: DocumentsScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-slate-900">Your required documents</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Statutory document checklist based on Motor Vehicles Act 1988 and CMVR 1989 rules.
        </p>
      </div>

      <div className="space-y-3">
        {journey.allRequiredDocuments.map((doc) => (
          <Card key={doc.id} className="p-4 space-y-2 border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-semibold text-slate-900 text-sm leading-snug">{doc.title}</div>
                <div className="text-xs text-slate-600 mt-1 leading-relaxed">{doc.description}</div>
              </div>
              <Badge status={doc.isMandatory ? 'action_required' : 'info'}>
                {doc.isMandatory ? 'MANDATORY' : 'CONDITIONAL'}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1 border-t border-slate-100">
              {doc.issuedBy && <span>Issued by: {doc.issuedBy}</span>}
              {doc.legalBasis && <span className="font-mono text-[11px] text-slate-500">{doc.legalBasis}</span>}
            </div>
          </Card>
        ))}
      </div>

      <Button variant="secondary" fullWidth onClick={onDemoCheck}>
        Try demo document check
      </Button>

      <Button variant="secondary" fullWidth onClick={onBack}>
        Back to roadmap
      </Button>
    </motion.div>
  );
}
