/**
 * Airline Logo Utilities
 * Get airline logos from various sources
 */

/**
 * Get airline logo URL from IATA code
 * Uses multiple fallback sources
 */
export function getAirlineLogo(iataCode: string, size: 'small' | 'medium' | 'large' = 'medium'): string {
  if (!iataCode) return '/placeholder-airline.svg';
  
  const code = iataCode.toUpperCase();
  
  // Use airline logo API (free service)
  const sizeMap = {
    small: '50',
    medium: '100',
    large: '200'
  };
  
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

/**
 * Get airline name from IATA code
 */
export function getAirlineName(code: string): string {
  const airlines: Record<string, string> = {
    'AA': 'American Airlines',
    'DL': 'Delta Air Lines',
    'UA': 'United Airlines',
    'WN': 'Southwest Airlines',
    'B6': 'JetBlue Airways',
    'AS': 'Alaska Airlines',
    'NK': 'Spirit Airlines',
    'F9': 'Frontier Airlines',
    'G4': 'Allegiant Air',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AF': 'Air France',
    'KL': 'KLM',
    'IB': 'Iberia',
    'AZ': 'ITA Airways',
    'LX': 'Swiss International',
    'OS': 'Austrian Airlines',
    'SN': 'Brussels Airlines',
    'TP': 'TAP Air Portugal',
    'EI': 'Aer Lingus',
    'SK': 'SAS Scandinavian',
    'AY': 'Finnair',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'EY': 'Etihad Airways',
    'SV': 'Saudia',
    'MS': 'EgyptAir',
    'TK': 'Turkish Airlines',
    'SQ': 'Singapore Airlines',
    'TG': 'Thai Airways',
    'MH': 'Malaysia Airlines',
    'CX': 'Cathay Pacific',
    'NH': 'ANA',
    'JL': 'Japan Airlines',
    'KE': 'Korean Air',
    'OZ': 'Asiana Airlines',
    'CA': 'Air China',
    'MU': 'China Eastern',
    'CZ': 'China Southern',
    'AI': 'Air India',
    'QF': 'Qantas',
    'NZ': 'Air New Zealand',
    'VA': 'Virgin Australia',
    'AC': 'Air Canada',
    'AM': 'Aeroméxico',
    'AR': 'Aerolíneas Argentinas',
    'LA': 'LATAM Airlines',
    'AV': 'Avianca',
    'CM': 'Copa Airlines',
    'ET': 'Ethiopian Airlines',
    'KQ': 'Kenya Airways',
    'SA': 'South African Airways',
  };

  return airlines[code] || code;
}

/**
 * Get airline color scheme
 */
export function getAirlineColors(code: string): { primary: string; secondary: string } {
  const colors: Record<string, { primary: string; secondary: string }> = {
    'AA': { primary: '#0078D2', secondary: '#C8102E' },
    'DL': { primary: '#003A70', secondary: '#C8102E' },
    'UA': { primary: '#0033A0', secondary: '#FFFFFF' },
    'BA': { primary: '#075AAA', secondary: '#EF3340' },
    'EK': { primary: '#D71921', secondary: '#FFD700' },
    'QR': { primary: '#5C0632', secondary: '#FFFFFF' },
    'SQ': { primary: '#003087', secondary: '#FFB81C' },
    'LH': { primary: '#05164D', secondary: '#F9B000' },
    'AF': { primary: '#002157', secondary: '#ED1C24' },
    'KL': { primary: '#00A1DE', secondary: '#FFFFFF' },
  };

  return colors[code] || { primary: '#64748b', secondary: '#94a3b8' };
}
