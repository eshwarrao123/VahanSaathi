import { VehicleCase, RoadmapStep, Document, Journey, Rule } from '@/types';

/**
 * Statutory Document Catalog — MVA 1988 & CMVR 1989
 * All document titles include clear, citizen-facing plain language explanations.
 */
export const STATUTORY_DOCUMENTS: Record<string, Document> = {
  FORM_28: {
    id: 'doc-f28',
    code: 'FORM_28',
    title: 'Form 28 — Application for No Objection Certificate (NOC)',
    description: 'Formal application certifying no pending tax arrears, criminal cases, or legal encumbrances against the vehicle at original RTO.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Origin RTO',
    legalBasis: 'Section 48, Motor Vehicles Act 1988 & Rule 58, CMVR 1989',
  },
  FORM_29: {
    id: 'doc-f29',
    code: 'FORM_29',
    title: 'Form 29 — Notice of Transfer of Ownership',
    description: 'Official notice executed by the seller informing the RTO that ownership of the vehicle is being transferred.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Seller Execution',
    legalBasis: 'Section 50, Motor Vehicles Act 1988 & Rule 55, CMVR 1989',
  },
  FORM_30: {
    id: 'doc-f30',
    code: 'FORM_30',
    title: 'Form 30 — Application for Intimation & Transfer of Ownership',
    description: 'Joint application signed by buyer and seller to officially update the new owner details on the Registration Certificate.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Joint Buyer & Seller Execution',
    legalBasis: 'Section 50, Motor Vehicles Act 1988 & Rule 57, CMVR 1989',
  },
  FORM_35: {
    id: 'doc-f35',
    code: 'FORM_35',
    title: 'Form 35 — Notice of Termination of Hypothecation Agreement',
    description: 'Endorsement signed by financing bank confirming loan payoff and removal of hypothecation from vehicle record.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Financier / Bank',
    legalBasis: 'Section 51, Motor Vehicles Act 1988 & Rule 61, CMVR 1989',
  },
  FORM_27: {
    id: 'doc-f27',
    code: 'FORM_27',
    title: 'Form 27 — Application for Assignment of New Registration Mark',
    description: 'Application submitted to destination state RTO for assignment of a new state registration mark (required if kept >12 months).',
    status: 'required',
    isMandatory: false, // Conditional on >12 months stay
    issuedBy: 'Destination RTO',
    legalBasis: 'Section 47, Motor Vehicles Act 1988 & Rule 54, CMVR 1989',
  },
  FORM_26: {
    id: 'doc-f26',
    code: 'FORM_26',
    title: 'Form 26 — Application for Duplicate Registration Certificate',
    description: 'Application for duplicate RC smart card submitted when original RC is lost or damaged.',
    status: 'required',
    isMandatory: false, // Conditional on missing RC
    issuedBy: 'Origin RTO',
    legalBasis: 'Section 41(14), Motor Vehicles Act 1988 & Rule 53, CMVR 1989',
  },
  BANK_NOC: {
    id: 'doc-bank-noc',
    code: 'BANK_NOC',
    title: 'Bank Loan Clearance NOC',
    description: 'No Objection Certificate issued by financing bank permitting vehicle ownership transfer or interstate movement.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Financier / Bank',
    legalBasis: 'Section 51, Motor Vehicles Act 1988',
  },
  ORIGINAL_RC: {
    id: 'doc-rc',
    code: 'ORIGINAL_RC',
    title: 'Original Registration Certificate (RC)',
    description: 'Original vehicle RC smartcard or paper booklet issued by registering authority.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Origin RTO',
    legalBasis: 'Section 41, Motor Vehicles Act 1988',
  },
  VALID_PUC: {
    id: 'doc-puc',
    code: 'VALID_PUC',
    title: 'Pollution Under Control (PUC) Certificate',
    description: 'Active vehicle emissions clearance certificate from authorized testing station.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Authorized PUC Station',
    legalBasis: 'Rule 115, CMVR 1989',
  },
  VALID_INSURANCE: {
    id: 'doc-ins',
    code: 'VALID_INSURANCE',
    title: 'Active Motor Insurance Policy',
    description: 'Valid third-party or comprehensive motor insurance policy.',
    status: 'required',
    isMandatory: true,
    issuedBy: 'Insurance Provider',
    legalBasis: 'Section 146, Motor Vehicles Act 1988',
  },
};

/**
 * Deterministic Statutory Rules Registry
 */

export const loanClearanceRule: Rule = {
  id: 'rule-active-loan',
  name: 'Hypothecation Termination (Active Loan Clearance)',
  description: 'Applies under Section 51 MVA 1988 when vehicle has an active bank loan/hypothecation.',
  legalBasis: 'Section 51, Motor Vehicles Act 1988 & Rule 61, CMVR 1989',
  condition: (vCase: VehicleCase) => vCase.activeLoan === true,
  applySteps: (): RoadmapStep[] => [
    {
      id: 'step-loan-clearance',
      stepNumber: 1,
      title: 'Obtain Bank Loan Clearance NOC & Form 35',
      description: 'Seller/Owner must obtain a Bank No Objection Certificate and signed Form 35 (Notice of Termination of Hypothecation) after repaying the outstanding loan balance.',
      responsibility: 'seller',
      status: 'action_required',
      requiredDocuments: [STATUTORY_DOCUMENTS.BANK_NOC, STATUTORY_DOCUMENTS.FORM_35],
      officialRtoAction: 'Apply for Hypothecation Cancellation entry in RTO registration records.',
      legalBasis: 'Section 51, Motor Vehicles Act 1988 & CMVR Rule 61',
      isConditional: true,
      conditionalReason: 'Required because the vehicle currently has an active bank loan / hypothecation record.',
      notes: [
        'Bank NOC validity is typically 90 days from date of issuance.',
        'Ensure the Bank NOC explicitly permits interstate NOC issuance if moving across state lines.',
      ],
      estimatedDays: 7,
    },
  ],
};

export const duplicateRcRule: Rule = {
  id: 'rule-missing-rc',
  name: 'Duplicate Registration Certificate Application',
  description: 'Applies under Section 41(14) MVA 1988 when original RC is lost or unavailable.',
  legalBasis: 'Section 41(14), Motor Vehicles Act 1988 & Rule 53, CMVR 1989',
  condition: (vCase: VehicleCase) => vCase.hasRC === false,
  applySteps: (vCase: VehicleCase): RoadmapStep[] => [
    {
      id: 'step-duplicate-rc',
      stepNumber: 1,
      title: `Apply for Duplicate RC (Form 26) at ${vCase.originState} RTO`,
      description: 'Owner must file a police missing report (FIR / Police intimation) and submit Form 26 to obtain a duplicate RC smart card before NOC or transfer processing.',
      responsibility: 'seller',
      status: 'action_required',
      requiredDocuments: [STATUTORY_DOCUMENTS.FORM_26, STATUTORY_DOCUMENTS.VALID_INSURANCE, STATUTORY_DOCUMENTS.VALID_PUC],
      officialRtoAction: `Issuance of Duplicate Certificate of Registration at ${vCase.originState} RTO.`,
      legalBasis: 'Section 41(14), Motor Vehicles Act 1988 & CMVR Rule 53',
      isConditional: true,
      conditionalReason: 'Required because original Registration Certificate (RC) is lost or unavailable.',
      notes: ['Police clearance / FIR certificate copy must accompany Form 26.'],
      estimatedDays: 10,
    },
  ],
};

export const interstateNocRule: Rule = {
  id: 'rule-interstate-noc',
  name: 'Interstate No Objection Certificate (Form 28)',
  description: 'Applies under Section 48 MVA 1988 whenever vehicle transfers jurisdiction across state boundaries.',
  legalBasis: 'Section 48, Motor Vehicles Act 1988 & Rule 58, CMVR 1989',
  condition: (vCase: VehicleCase) => vCase.originState !== vCase.destinationState,
  applySteps: (vCase: VehicleCase): RoadmapStep[] => [
    {
      id: 'step-obtain-noc',
      stepNumber: 1,
      title: `Apply for Interstate NOC (Form 28 — No Objection Certificate) at ${vCase.originState} RTO`,
      description: `Seller applies for Form 28 NOC from the ${vCase.originState} RTO where vehicle is currently registered, confirming no pending dues or criminal cases.`,
      responsibility: 'seller',
      status: 'pending',
      requiredDocuments: [
        STATUTORY_DOCUMENTS.FORM_28,
        STATUTORY_DOCUMENTS.ORIGINAL_RC,
        STATUTORY_DOCUMENTS.VALID_INSURANCE,
        STATUTORY_DOCUMENTS.VALID_PUC,
      ],
      officialRtoAction: `Verification of police crime branch clearance and issuance of Form 28 NOC by ${vCase.originState} RTO.`,
      legalBasis: 'Section 48, Motor Vehicles Act 1988 & CMVR Rule 58',
      isConditional: true,
      conditionalReason: `Required because the vehicle is moving across state lines from ${vCase.originState} to ${vCase.destinationState}.`,
      notes: [
        `Form 28 specifies the target destination RTO (${vCase.destinationState}).`,
        'Under Section 48(3) MVA 1988: If origin RTO does not grant or refuse NOC within 30 days of application, submission receipt with citizen declaration serves as deemed NOC evidence.',
      ],
      estimatedDays: 14,
    },
  ],
};

export const sameStateTransferRule: Rule = {
  id: 'rule-same-state-transfer',
  name: 'Same-State Ownership Transfer',
  description: 'Applies under Section 50(1)(a) MVA 1988 for vehicle transfer within the same state.',
  legalBasis: 'Section 50(1)(a), Motor Vehicles Act 1988 & Rules 55 & 57, CMVR 1989',
  condition: (vCase: VehicleCase) => vCase.originState === vCase.destinationState,
  applySteps: (vCase: VehicleCase): RoadmapStep[] => [
    {
      id: 'step-same-state-transfer',
      stepNumber: 1,
      title: `Submit Transfer of Ownership (Form 29 & Form 30) at ${vCase.originState} RTO`,
      description: 'Submit Notice of Transfer (Form 29) executed by seller and Application for Transfer (Form 30) executed jointly by buyer and seller at local RTO.',
      responsibility: 'joint',
      status: 'action_required',
      requiredDocuments: [
        STATUTORY_DOCUMENTS.FORM_29,
        STATUTORY_DOCUMENTS.FORM_30,
        STATUTORY_DOCUMENTS.ORIGINAL_RC,
        STATUTORY_DOCUMENTS.VALID_INSURANCE,
        STATUTORY_DOCUMENTS.VALID_PUC,
      ],
      officialRtoAction: `Record ownership transfer in RTO portal and endorse buyer name on RC smartcard.`,
      legalBasis: 'Section 50(1)(a), Motor Vehicles Act 1988 & CMVR Rules 55 & 57',
      isConditional: false,
      notes: ['Must be submitted within 14 days of transfer transaction to avoid statutory penalty.'],
      estimatedDays: 10,
    },
  ],
};

export const interstateOwnershipTransferRule: Rule = {
  id: 'rule-interstate-transfer',
  name: 'Interstate Ownership Transfer (Section 50 MVA 1988)',
  description: 'Applies under Section 50(1)(b) MVA 1988 for transfer of ownership to a buyer in another state.',
  legalBasis: 'Section 50(1)(b), Motor Vehicles Act 1988 & Rules 55 & 57, CMVR 1989',
  condition: (vCase: VehicleCase) => vCase.originState !== vCase.destinationState,
  applySteps: (vCase: VehicleCase): RoadmapStep[] => [
    {
      id: 'step-interstate-transfer',
      stepNumber: 2,
      title: `Submit Notice & Application for Transfer of Ownership (Form 29 & Form 30) at ${vCase.destinationState} RTO`,
      description: `Buyer and seller submit Notice of Transfer (Form 29) and Application for Transfer of Ownership (Form 30) accompanied by Form 28 NOC at the ${vCase.destinationState} RTO.`,
      responsibility: 'joint',
      status: 'pending',
      requiredDocuments: [
        STATUTORY_DOCUMENTS.FORM_29,
        STATUTORY_DOCUMENTS.FORM_30,
        STATUTORY_DOCUMENTS.FORM_28,
        STATUTORY_DOCUMENTS.ORIGINAL_RC,
        STATUTORY_DOCUMENTS.VALID_INSURANCE,
      ],
      officialRtoAction: `Update ownership record at ${vCase.destinationState} RTO under Section 50(1)(b) MVA 1988.`,
      legalBasis: 'Section 50(1)(b), Motor Vehicles Act 1988 & CMVR Rules 55 & 57',
      isConditional: false,
      notes: [
        'Form 29 (Notice of Transfer) informs original RTO.',
        'Form 30 (Application for Transfer) applies for ownership transfer at destination RTO within 30 days.',
      ],
      estimatedDays: 14,
    },
  ],
};

export const newRegistrationMarkRule: Rule = {
  id: 'rule-new-registration-mark',
  name: 'Assignment of New Registration Mark (Section 47 MVA 1988)',
  description: 'Applies conditionally under Section 47 MVA 1988 when a vehicle is kept in another state for >12 months.',
  legalBasis: 'Section 47, Motor Vehicles Act 1988 & Rule 54, CMVR 1989',
  condition: (vCase: VehicleCase) =>
    vCase.originState !== vCase.destinationState && vCase.isLongTermRelocation !== false,
  applySteps: (vCase: VehicleCase): RoadmapStep[] => [
    {
      id: 'step-new-registration-mark',
      stepNumber: 3,
      title: `Apply for Assignment of New Registration Mark (Form 27 & Road Tax) at ${vCase.destinationState} RTO`,
      description: `Apply for assignment of a new state registration mark (e.g. ${vCase.destinationState} series) and pay pro-rata state road tax at ${vCase.destinationState} RTO.`,
      responsibility: 'buyer',
      status: 'pending',
      requiredDocuments: [
        STATUTORY_DOCUMENTS.FORM_27,
        STATUTORY_DOCUMENTS.FORM_28,
        STATUTORY_DOCUMENTS.ORIGINAL_RC,
        STATUTORY_DOCUMENTS.VALID_INSURANCE,
      ],
      officialRtoAction: `Assignment of new state registration mark and issuance of new Smart Card RC under ${vCase.destinationState} series.`,
      legalBasis: 'Section 47, Motor Vehicles Act 1988 & CMVR Rule 54',
      isConditional: true,
      conditionalReason: `Required under Section 47 MVA 1988 because the vehicle is relocating permanently / for longer than 12 months to ${vCase.destinationState}.`,
      notes: [
        `Assignment of a new registration mark (Form 27) is legally mandatory only if the vehicle remains in ${vCase.destinationState} for more than 12 months.`,
        'Pro-rata road tax refund can subsequently be claimed from origin state RTO after destination registration mark assignment.',
      ],
      estimatedDays: 21,
    },
  ],
};

export const RULES_REGISTRY: Rule[] = [
  loanClearanceRule,
  duplicateRcRule,
  interstateNocRule,
  sameStateTransferRule,
  interstateOwnershipTransferRule,
  newRegistrationMarkRule,
];

/**
 * Deterministic Rules Evaluator
 * Evaluates VehicleCase inputs against statutory rules registry and returns unambiguous journey roadmap.
 */
export function evaluateRules(vCase: VehicleCase): Journey {
  const isInterstate = vCase.originState !== vCase.destinationState;
  const hasHypothecation = vCase.activeLoan;
  const needsDuplicateRc = vCase.hasRC === false;
  const isLongTermRelocation = vCase.isLongTermRelocation !== false;

  let collectedSteps: RoadmapStep[] = [];

  // 1. Missing RC Rule
  if (needsDuplicateRc) {
    collectedSteps = collectedSteps.concat(duplicateRcRule.applySteps(vCase));
  }

  // 2. Active Loan Rule
  if (hasHypothecation) {
    collectedSteps = collectedSteps.concat(loanClearanceRule.applySteps(vCase));
  }

  // 3. Interstate vs Same-State Transfer Rules
  if (isInterstate) {
    collectedSteps = collectedSteps.concat(interstateNocRule.applySteps(vCase));
    collectedSteps = collectedSteps.concat(interstateOwnershipTransferRule.applySteps(vCase));

    if (isLongTermRelocation) {
      collectedSteps = collectedSteps.concat(newRegistrationMarkRule.applySteps(vCase));
    }
  } else {
    collectedSteps = collectedSteps.concat(sameStateTransferRule.applySteps(vCase));
  }

  // Normalize step numbers
  const roadmap: RoadmapStep[] = collectedSteps.map((step, idx) => ({
    ...step,
    stepNumber: idx + 1,
  }));

  // Aggregate required documents
  const documentMap = new Map<string, Document>();
  roadmap.forEach((step) => {
    step.requiredDocuments.forEach((doc) => {
      documentMap.set(doc.code, doc);
    });
  });
  const allRequiredDocuments = Array.from(documentMap.values());

  const legalDisclaimer = isInterstate
    ? `Note: Ownership transfer is governed by Section 50 of the Motor Vehicles Act 1988. Interstate NOC is issued under Section 48. Assignment of a new state registration mark (Form 27) applies under Section 47 if the vehicle will remain in ${vCase.destinationState} for longer than 12 months.`
    : `Note: Ownership transfer within the same state is governed by Section 50(1)(a) of the Motor Vehicles Act 1988 and CMVR Rules 55 & 57.`;

  return {
    case: vCase,
    isInterstate,
    hasHypothecation,
    needsDuplicateRc,
    isLongTermRelocation,
    roadmap,
    allRequiredDocuments,
    statusEvents: [
      {
        id: 'evt-init',
        caseId: vCase.id,
        timestamp: vCase.createdAt,
        title: 'Transfer Case Created',
        description: `Case evaluated for ${vCase.vehicleModel} (${vCase.registrationNumber}) from ${vCase.originState} to ${vCase.destinationState}.`,
        type: 'info',
      },
    ],
    legalDisclaimer,
  };
}
