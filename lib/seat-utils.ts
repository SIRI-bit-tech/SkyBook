import { Flight } from '@/types/global';

export interface SeatInfo {
  seat: string;
  status: 'available' | 'selected' | 'reserved';
  category: 'first' | 'business' | 'economy';
  price?: number;
}

export function getSeatCategory(seat: string, flight: Flight): 'first' | 'business' | 'economy' {
  const row = parseInt(seat);
  
  // Typical airline seating configuration
  if (row <= 2) return 'first';
  if (row <= 6) return 'business';
  return 'economy';
}

export function getSeatPrice(seat: string, flight: Flight): number {
  const category = getSeatCategory(seat, flight);
  
  switch (category) {
    case 'first':
      return flight.price.firstClass;
    case 'business':
      return flight.price.business;
    default:
      return flight.price.economy;
  }
}

export function generateSeatMap(rows: number, columns: string[]): string[] {
  const seats: string[] = [];
  
  for (let row = 1; row <= rows; row++) {
    for (const col of columns) {
      seats.push(`${row}${col}`);
    }
  }
  
  return seats;
}

export function getAvailableSeats(flight: Flight): string[] {
  const allSeats = generateSeatMap(flight.seatMap.rows, flight.seatMap.columns);
  return allSeats.filter(seat => !flight.seatMap.reserved.includes(seat));
}

export function validateSeatSelection(
  selectedSeats: string[], 
  flight: Flight, 
  passengerCount: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for duplicate seat selections
  const uniqueSeats = new Set(selectedSeats);
  if (selectedSeats.length !== uniqueSeats.size) {
    const duplicates = selectedSeats.filter((seat, index) => 
      selectedSeats.indexOf(seat) !== index
    );
    errors.push(`Duplicate seat selections detected: ${[...new Set(duplicates)].join(', ')}`);
  }
  
  // Check if correct number of seats selected
  if (selectedSeats.length !== passengerCount) {
    errors.push(`Please select exactly ${passengerCount} seat${passengerCount !== 1 ? 's' : ''}`);
  }
  
  // Check if all seats are available
  const unavailableSeats = selectedSeats.filter(seat => 
    flight.seatMap.reserved.includes(seat)
  );
  
  if (unavailableSeats.length > 0) {
    errors.push(`Seats ${unavailableSeats.join(', ')} are no longer available`);
  }
  
  // Check if seats exist on the aircraft
  const allSeats = generateSeatMap(flight.seatMap.rows, flight.seatMap.columns);
  const invalidSeats = selectedSeats.filter(seat => !allSeats.includes(seat));
  
  if (invalidSeats.length > 0) {
    errors.push(`Invalid seats: ${invalidSeats.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateSeatUpgradeCost(
  selectedSeats: string[], 
  flight: Flight, 
  targetCategory: 'first' | 'business' | 'economy'
): number {
  let totalUpgradeCost = 0;
  
  for (const seat of selectedSeats) {
    const currentCategory = getSeatCategory(seat, flight);
    const currentPrice = getSeatPrice(seat, flight);
    
    let targetPrice: number;
    switch (targetCategory) {
      case 'first':
        targetPrice = flight.price.firstClass;
        break;
      case 'business':
        targetPrice = flight.price.business;
        break;
      default:
        targetPrice = flight.price.economy;
    }
    
    if (targetPrice > currentPrice) {
      totalUpgradeCost += targetPrice - currentPrice;
    }
  }
  
  return totalUpgradeCost;
}

export function getSeatRecommendations(
  flight: Flight, 
  passengerCount: number, 
  preferences?: {
    category?: 'first' | 'business' | 'economy';
    together?: boolean;
    window?: boolean;
    aisle?: boolean;
  }
): string[] {
  const availableSeats = getAvailableSeats(flight);
  const recommendations: string[] = [];
  
  // Filter by category if specified
  let candidateSeats = availableSeats;
  if (preferences?.category) {
    candidateSeats = availableSeats.filter(seat => 
      getSeatCategory(seat, flight) === preferences.category
    );
  }
  
  // Filter by position preference
  if (preferences?.window) {
    candidateSeats = candidateSeats.filter(seat => 
      seat.endsWith('A') || seat.endsWith('F')
    );
  } else if (preferences?.aisle) {
    candidateSeats = candidateSeats.filter(seat => 
      seat.endsWith('C') || seat.endsWith('D')
    );
  }
  
  // If passengers want to sit together
  if (preferences?.together && passengerCount > 1) {
    // Try to find adjacent seats in the same row
    const seatsByRow: { [row: number]: string[] } = {};
    
    candidateSeats.forEach(seat => {
      const row = parseInt(seat);
      if (!seatsByRow[row]) seatsByRow[row] = [];
      seatsByRow[row].push(seat);
    });
    
    // Find rows with enough adjacent seats
    for (const row in seatsByRow) {
      const rowSeats = seatsByRow[row].sort();
      if (rowSeats.length >= passengerCount) {
        // Check for consecutive seats
        for (let i = 0; i <= rowSeats.length - passengerCount; i++) {
          const consecutiveSeats = rowSeats.slice(i, i + passengerCount);
          const areConsecutive = consecutiveSeats.every((seat, index) => {
            if (index === 0) return true;
            const prevCol = consecutiveSeats[index - 1].slice(-1);
            const currentCol = seat.slice(-1);
            return flight.seatMap.columns.indexOf(currentCol) === 
                   flight.seatMap.columns.indexOf(prevCol) + 1;
          });
          
          if (areConsecutive) {
            return consecutiveSeats;
          }
        }
      }
    }
  }
  
  // Fallback: just return the first available seats
  return candidateSeats.slice(0, passengerCount);
}