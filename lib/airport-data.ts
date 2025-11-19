export const airportDatabase = {
  'JFK': { name: 'John F. Kennedy International', city: 'New York', country: 'USA', code: 'JFK' },
  'LAX': { name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', code: 'LAX' },
  'ORD': { name: 'Chicago O\'Hare International', city: 'Chicago', country: 'USA', code: 'ORD' },
  'DFW': { name: 'Dallas/Fort Worth International', city: 'Dallas', country: 'USA', code: 'DFW' },
  'DEN': { name: 'Denver International', city: 'Denver', country: 'USA', code: 'DEN' },
  'SFO': { name: 'San Francisco International', city: 'San Francisco', country: 'USA', code: 'SFO' },
  'SEA': { name: 'Seattle-Tacoma International', city: 'Seattle', country: 'USA', code: 'SEA' },
  'MIA': { name: 'Miami International', city: 'Miami', country: 'USA', code: 'MIA' },
  'LHR': { name: 'London Heathrow', city: 'London', country: 'UK', code: 'LHR' },
  'CDG': { name: 'Paris Charles de Gaulle', city: 'Paris', country: 'France', code: 'CDG' },
  'FCO': { name: 'Rome Fiumicino', city: 'Rome', country: 'Italy', code: 'FCO' },
  'DXB': { name: 'Dubai International', city: 'Dubai', country: 'UAE', code: 'DXB' },
  'NRT': { name: 'Tokyo Narita', city: 'Tokyo', country: 'Japan', code: 'NRT' },
  'SYD': { name: 'Sydney International', city: 'Sydney', country: 'Australia', code: 'SYD' },
  'SIN': { name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', code: 'SIN' },
  'HND': { name: 'Tokyo Haneda', city: 'Tokyo', country: 'Japan', code: 'HND' },
  'ICN': { name: 'Seoul Incheon', city: 'Seoul', country: 'South Korea', code: 'ICN' },
  'PEK': { name: 'Beijing Capital', city: 'Beijing', country: 'China', code: 'PEK' },
  'HKG': { name: 'Hong Kong International', city: 'Hong Kong', country: 'Hong Kong', code: 'HKG' },
  'BKK': { name: 'Bangkok Suvarnabhumi', city: 'Bangkok', country: 'Thailand', code: 'BKK' },
};

export const airlineDatabase = [
  { code: 'AA', name: 'American Airlines', logo: '/airlines/american.png' },
  { code: 'DL', name: 'Delta Air Lines', logo: '/airlines/delta.png' },
  { code: 'UA', name: 'United Airlines', logo: '/airlines/united.png' },
  { code: 'SW', name: 'Southwest Airlines', logo: '/airlines/southwest.png' },
  { code: 'BA', name: 'British Airways', logo: '/airlines/britishairways.png' },
  { code: 'LH', name: 'Lufthansa', logo: '/airlines/lufthansa.png' },
  { code: 'AF', name: 'Air France', logo: '/airlines/airfrance.png' },
  { code: 'KL', name: 'KLM Royal Dutch Airlines', logo: '/airlines/klm.png' },
  { code: 'EK', name: 'Emirates', logo: '/airlines/emirates.png' },
  { code: 'QF', name: 'Qantas Airways', logo: '/airlines/qantas.png' },
  { code: 'SQ', name: 'Singapore Airlines', logo: '/airlines/singaporeairlines.png' },
  { code: 'CA', name: 'Air China', logo: '/airlines/airchina.png' },
  { code: 'JL', name: 'Japan Airlines', logo: '/airlines/jal.png' },
  { code: 'NH', name: 'All Nippon Airways', logo: '/airlines/ana.png' },
  { code: 'KE', name: 'Korean Air', logo: '/airlines/koreanair.png' },
  { code: 'TG', name: 'Thai Airways', logo: '/airlines/thaiairways.png' },
  { code: 'MH', name: 'Malaysia Airlines', logo: '/airlines/malaysiaairlines.png' },
  { code: 'CI', name: 'China Airlines', logo: '/airlines/chinaairlines.png' },
  { code: 'CX', name: 'Cathay Pacific', logo: '/airlines/cathaypacific.png' },
  { code: 'VN', name: 'Vietnam Airlines', logo: '/airlines/vietnamairlines.png' },
];

export function searchAirports(query: string) {
  const lowerQuery = query.toLowerCase();
  return Object.values(airportDatabase).filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery)
  );
}

export function getAirportByCode(code: string) {
  return airportDatabase[code.toUpperCase() as keyof typeof airportDatabase] || null;
}

export function getAirlineByCode(code: string) {
  return airlineDatabase.find((airline) => airline.code === code.toUpperCase()) || null;
}

export function getAllAirlines() {
  return airlineDatabase;
}
