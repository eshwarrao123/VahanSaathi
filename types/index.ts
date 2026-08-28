/**
 * VahanSaathi Domain Types — Stage 6.1 AI Integrity Audit
 * Core data models for vehicle transfer case evaluations, deterministic rules,
 * and personalized roadmap generation based on MVA 1988 & CMVR 1989.
 * 
 * CRITICAL: Vehicle information fields are nullable to prevent AI hallucination.
 */

export type UserRole = 'buyer' | 'seller';
export type TransactionType = 'sale' | 'transfer';
export type StepStatus = 'pending' | 'in_progress' | 'action_required' | 'completed';
export type DocumentStatus = 'required' | 'optional' | 'uploaded' | 'verified';

export interface VehicleCase {
  id: string;
  title: string;
  role: UserRole;
  transaction: TransactionType;
  registrationNumber: string | null; // NULLABLE: Citizen may not provide
  originState: string | null;                // NULLABLE: May be unknown before questions
  destinationState: string | null;           // NULLABLE: May be unknown before questions
  activeLoan: boolean;                // Whether hypothecation exists (Sec 51 MVA 1988)
  hasRC: boolean;                     // Original RC available (Sec 41 MVA 1988)
  saleCompleted: boolean;             // Whether physical sale/delivery is completed
  isLongTermRelocation?: boolean;     // Kept in destination state >12 months (Sec 47 MVA 1988)
  sellerName: string | null;          // NULLABLE: May be synthetic or unknown
  buyerName: string | null;           // NULLABLE: May be synthetic or unknown
  vehicleModel: string | null;        // NULLABLE: Citizen may not provide
  createdAt: string;
}

export interface Document {
  id: string;
  code: string;               // e.g. "FORM_28", "FORM_29", "FORM_30", "FORM_35", "FORM_27", "FORM_26"
  title: string;
  description: string;
  status: DocumentStatus;
  isMandatory: boolean;
  issuedBy?: string;           // RTO, Bank, Insurance Co., etc.
  legalBasis?: string;         // MVA 1988 / CMVR 1989 reference
  downloadUrl?: string;
}

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  responsibility: 'seller' | 'buyer' | 'joint';
  status: StepStatus;
  requiredDocuments: Document[];
  officialRtoAction: string;  // Official RTO procedural action
  legalBasis: string;         // Statutory basis e.g. "Section 50 MVA 1988 & CMVR Rule 55"
  isConditional?: boolean;     // Indicates if step depends on specific facts (e.g. >12 mo stay)
  conditionalReason?: string;  // Citizen-facing explanation of condition
  notes?: string[];
  estimatedDays?: number;
}

export interface StatusEvent {
  id: string;
  caseId: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'info' | 'action_required' | 'milestone';
  stepId?: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  legalBasis: string;
  condition: (vCase: VehicleCase) => boolean;
  applySteps: (vCase: VehicleCase) => RoadmapStep[];
}

export interface Journey {
  case: VehicleCase;
  isInterstate: boolean;
  hasHypothecation: boolean;
  needsDuplicateRc: boolean;
  isLongTermRelocation: boolean;
  roadmap: RoadmapStep[];
  allRequiredDocuments: Document[];
  statusEvents: StatusEvent[];
  legalDisclaimer: string;
}
