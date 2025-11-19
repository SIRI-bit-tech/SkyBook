import axios from 'axios';

export interface FlightStatus {
  flightNumber: string;
  airline: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  status: 'scheduled' | 'departed' | 'in_air' | 'landed' | 'delayed' | 'cancelled';
  delayMinutes?: number;
  currentAltitude?: number;
  currentSpeed?: number;
  position?: {
    latitude: number;
    longitude: number;
  };
  aircraft?: string;
  gate?: string;
  lastUpdate: string;
}

class FlightTrackingClient {
  private apiKey: string;
  private baseUrl = 'https://api.flightradar24.com/common/v1';

  constructor() {
    this.apiKey = process.env.FLIGHTRADAR24_API_KEY || '';
  }

  async getFlightStatus(
    flightNumber: string,
    departureDate: string
  ): Promise<FlightStatus | null> {
    try {
      // Flightradar24 API implementation
      const response = await axios.get(
        `https://api.flightradar24.com/common/v1/flight/list.json`,
        {
          params: {
            query: flightNumber,
            limit: 1,
          },
          headers: {
            'User-Agent': 'SkyBook/1.0',
          },
        }
      );

      if (response.data?.aircraft?.length > 0) {
        const aircraft = response.data.aircraft[0];
        return this.parseFlightData(aircraft, flightNumber);
      }

      return null;
    } catch (error) {
      console.error('Flight tracking error:', error);
      return null;
    }
  }

  async trackFlightRealtime(
    flightNumber: string
  ): Promise<FlightStatus | null> {
    try {
      // Real-time tracking endpoint
      const response = await axios.get(
        `https://api.flightradar24.com/zones/fcgi/feed.json`,
        {
          params: {
            fml: flightNumber,
            gr: '0.01',
            limit: 1,
          },
          timeout: 5000,
        }
      );

      const flights = Object.values(response.data || {});
      if (flights.length > 0) {
        const flightData = flights[0] as any;
        return this.parseRealtimeFlightData(flightData, flightNumber);
      }

      return null;
    } catch (error) {
      console.error('Real-time tracking error:', error);
      return null;
    }
  }

  private parseFlightData(aircraft: any, flightNumber: string): FlightStatus {
    return {
      flightNumber,
      airline: aircraft.airline?.name || 'Unknown',
      departureAirport: aircraft.airport_iata_departure || '',
      arrivalAirport: aircraft.airport_iata_arrival || '',
      departureTime: new Date(aircraft.time_details?.scheduled_departure * 1000).toISOString(),
      arrivalTime: new Date(aircraft.time_details?.scheduled_arrival * 1000).toISOString(),
      status: this.mapStatus(aircraft.status),
      delayMinutes: aircraft.time_details?.delay_minutes || 0,
      currentAltitude: aircraft.altitude || 0,
      currentSpeed: aircraft.speed?.kmh || 0,
      position: aircraft.lat && aircraft.lng ? {
        latitude: aircraft.lat,
        longitude: aircraft.lng,
      } : undefined,
      aircraft: aircraft.aircraft?.model?.text || '',
      gate: aircraft.gate || undefined,
      lastUpdate: new Date().toISOString(),
    };
  }

  private parseRealtimeFlightData(flightData: any[], flightNumber: string): FlightStatus {
    return {
      flightNumber,
      airline: flightData[1]?.split(' ')[0] || 'Unknown',
      departureAirport: flightData[11] || '',
      arrivalAirport: flightData[12] || '',
      departureTime: new Date(flightData[10] * 1000).toISOString(),
      arrivalTime: new Date(flightData[13] * 1000).toISOString(),
      status: this.mapLiveStatus(flightData[14]),
      currentAltitude: flightData[7] || 0,
      currentSpeed: flightData[5] || 0,
      position: flightData[1] && flightData[2] ? {
        latitude: flightData[1],
        longitude: flightData[2],
      } : undefined,
      lastUpdate: new Date().toISOString(),
    };
  }

  private mapStatus(
    status: string
  ): 'scheduled' | 'departed' | 'in_air' | 'landed' | 'delayed' | 'cancelled' {
    const statusMap: Record<string, any> = {
      'scheduled': 'scheduled',
      'departed': 'departed',
      'en_route': 'in_air',
      'landed': 'landed',
      'delayed': 'delayed',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || 'scheduled';
  }

  private mapLiveStatus(
    status: number
  ): 'scheduled' | 'departed' | 'in_air' | 'landed' | 'delayed' | 'cancelled' {
    const statusMap: Record<number, any> = {
      0: 'scheduled',
      1: 'departed',
      2: 'in_air',
      3: 'landed',
      4: 'delayed',
      5: 'cancelled',
    };
    return statusMap[status] || 'scheduled';
  }
}

export const flightTrackingClient = new FlightTrackingClient();
