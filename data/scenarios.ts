import { VehicleCase } from '@/types';
import { evaluateRules } from '@/rules/engine';

/**
 * Synthetic Demo Scenarios — Stage 4.75 Rules Audit
 * Used for hackathon demonstrations and deterministic evaluation tests.
 * All registration numbers, names, and IDs are strictly synthetic.
 */

export const SCENARIO_A_SAME_STATE: VehicleCase = {
  id: 'case-demo-001',
  title: 'Scenario A: Local Transfer within Telangana',
  role: 'seller',
  transaction: 'sale',
  registrationNumber: 'TS-09-XX-0001', // Synthetic
  originState: 'TG',
  destinationState: 'TG',
  activeLoan: false,
  hasRC: true,
  saleCompleted: true,
  isLongTermRelocation: false,
  sellerName: 'Ramesh Kumar (Synthetic)',
  buyerName: 'Sita Verma (Synthetic)',
  vehicleModel: '2021 Maruti Swift VXi',
  createdAt: '2026-08-28T10:00:00Z',
};

export const SCENARIO_B_HERO_INTERSTATE: VehicleCase = {
  id: 'case-demo-002',
  title: 'Scenario B: Hero Scenario — Telangana to Karnataka Transfer (>12 Months Relocation)',
  role: 'seller',
  transaction: 'sale',
  registrationNumber: 'TS-09-XX-9999', // Synthetic Hero Vehicle
  originState: 'TG',
  destinationState: 'KA',
  activeLoan: false,
  hasRC: true,
  saleCompleted: true,
  isLongTermRelocation: true, // Permanent relocation trigger for Sec 47 Form 27
  sellerName: 'Aarav Sharma (Synthetic Seller in TG)',
  buyerName: 'Priya Nair (Synthetic Buyer in KA)',
  vehicleModel: '2022 Hyundai Creta SX',
  createdAt: '2026-08-28T10:30:00Z',
};

export const SCENARIO_C_INTERSTATE_LOAN: VehicleCase = {
  id: 'case-demo-003',
  title: 'Scenario C: Interstate Transfer with Active Loan Hypothecation',
  role: 'buyer',
  transaction: 'sale',
  registrationNumber: 'TS-07-XX-5555', // Synthetic
  originState: 'TG',
  destinationState: 'KA',
  activeLoan: true, // Active loan trigger for Sec 51 Form 35
  hasRC: true,
  saleCompleted: true,
  isLongTermRelocation: true,
  sellerName: 'Vikram Reddy (Synthetic Seller)',
  buyerName: 'Ananya Rao (Synthetic Buyer)',
  vehicleModel: '2023 Tata Nexon EV',
  createdAt: '2026-08-28T11:00:00Z',
};

export const SYNTHETIC_SCENARIOS = [
  SCENARIO_A_SAME_STATE,
  SCENARIO_B_HERO_INTERSTATE,
  SCENARIO_C_INTERSTATE_LOAN,
];

/**
 * Pre-evaluated Journeys for Scenarios A, B, C
 */
export const DEMO_JOURNEYS = SYNTHETIC_SCENARIOS.map((sc) => evaluateRules(sc));
