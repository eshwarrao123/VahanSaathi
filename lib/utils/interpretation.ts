import { UserRole } from '@/types';

/**
 * Deterministic fallback interpreter for natural language situation text.
 * CRITICAL RULE: NEVER fabricate information. Only extract explicitly stated facts.
 */
export function interpretSituationText(text: string = ''): {
  originState: string | null;
  destinationState: string | null;
  vehicleModel: string | null;
  registrationNumber: string | null;
  role: UserRole;
} {
  const lowerText = text.toLowerCase();

  // Extract role
  const isSeller = lowerText.includes('sold') || lowerText.includes('seller') || lowerText.includes('selling');
  const isBuyer = lowerText.includes('bought') || lowerText.includes('buyer') || lowerText.includes('buying') || lowerText.includes('purchased');

  // Extract states (only if explicitly mentioned)
  const hasKarnataka = lowerText.includes('karnataka') || lowerText.includes(' ka ') || lowerText.includes('ka,') || lowerText.includes('ka.');
  const hasTelangana = lowerText.includes('telangana') || lowerText.includes(' tg ') || lowerText.includes(' ts ') || lowerText.includes('hyderabad');
  const hasMaharashtra = lowerText.includes('maharashtra') || lowerText.includes(' mh ') || lowerText.includes('mumbai') || lowerText.includes('pune');

  // Extract vehicle information (only if explicitly stated)
  let vehicleModel: string | null = null;
  
  // Check for common vehicle patterns
  const vehiclePatterns = [
    /(\d{4})\s+(maruti|hyundai|tata|mahindra|honda|toyota|ford|volkswagen|skoda|kia|mg|nissan|renault)\s+(\w+)/i,
    /(maruti|hyundai|tata|mahindra|honda|toyota|ford|volkswagen|skoda|kia|mg|nissan|renault)\s+(\w+)/i,
  ];

  for (const pattern of vehiclePatterns) {
    const match = text.match(pattern);
    if (match) {
      vehicleModel = match[0].trim();
      break;
    }
  }

  // Determine origin and destination states
  let originState: string | null = null;
  let destinationState: string | null = null;

  // For seller: origin is where they mention "from" or "my X car"
  // For buyer: origin is mentioned state, destination might be implied or stated
  if (isSeller) {
    // Seller context: "I sold my Telangana car to someone in Karnataka"
    if (hasTelangana && hasKarnataka) {
      originState = 'TG';
      destinationState = 'KA';
    } else if (hasTelangana) {
      originState = 'TG';
      // Don't assume destination
    } else if (hasKarnataka) {
      originState = 'KA';
      // Don't assume destination
    } else if (hasMaharashtra) {
      originState = 'MH';
    }
  } else {
    // Buyer context
    if (hasTelangana && hasKarnataka) {
      originState = 'TG';
      destinationState = 'KA';
    } else if (hasTelangana) {
      originState = 'TG';
    } else if (hasKarnataka) {
      originState = 'KA';
    } else if (hasMaharashtra) {
      originState = 'MH';
    }
  }

  return {
    role: isSeller ? 'seller' : (isBuyer ? 'buyer' : 'seller'),
    originState,
    destinationState,
    vehicleModel,
    registrationNumber: null, // Never fabricate registration numbers
  };
}
