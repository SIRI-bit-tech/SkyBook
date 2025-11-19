import axios from 'axios';

interface AmadeusFlightData {
  id: string;
  type: string;
  source: 'GDS';
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: {
    duration: string;
    segments: {
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      stops?: {
        iataCode: string;
        duration: string;
      }[];
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }[];
  }[];
  price: {
    currency: string;
    total: string;
    base: string;
    fee: string;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        weight: number;
        weightUnit: string;
      };
    }[];
  }[];
}

class AmadeusClient {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.amadeus.com/v2';
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.apiKey = process.env.AMADEUS_API_KEY || '';
    this.apiSecret = process.env.AMADEUS_API_SECRET || '';
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Amadeus API credentials not configured. Using database fallback.');
    }
  }

  async authenticate(): Promise<string> {
    try {
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now()) {
        return this.accessToken;
      }

      const response = await axios.post(
        `${this.baseUrl}/auth/oauth2/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.apiSecret,
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;
      
      if (!this.accessToken) {
        throw new Error('Failed to retrieve access token');
      }
      
      return this.accessToken;
    } catch (error) {
      console.error('Amadeus authentication failed:', error);
      throw new Error('Failed to authenticate with Amadeus API');
    }
  }

  async searchFlights(
    departureCode: string,
    arrivalCode: string,
    departureDate: string,
    adults: number = 1,
    children: number = 0,
    infants: number = 0,
    returnDate?: string
  ): Promise<AmadeusFlightData[]> {
    try {
      const token = await this.authenticate();

      const params: any = {
        originLocationCode: departureCode,
        destinationLocationCode: arrivalCode,
        departureDate,
        adults: Math.max(1, adults),
        nonStop: false,
        max: 50,
      };

      if (children > 0) params.children = children;
      if (infants > 0) params.infants = infants;
      if (returnDate) params.returnDate = returnDate;

      const response = await axios.get(
        `${this.baseUrl}/shopping/flight-offers`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/vnd.amadeus+json',
          },
          params,
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Amadeus flight search error:', error);
      throw error;
    }
  }

  async getFlightInspiration(
    departureCode: string,
    maxPrice?: number
  ): Promise<any[]> {
    try {
      const token = await this.authenticate();

      const params: any = {
        origin: departureCode,
        maxPrice: maxPrice || 5000,
      };

      const response = await axios.get(
        `${this.baseUrl}/shopping/flight-inspiration`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/vnd.amadeus+json',
          },
          params,
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Amadeus inspiration search error:', error);
      return [];
    }
  }

  async getAirportData(
    keyword: string
  ): Promise<any[]> {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${this.baseUrl}/reference-data/locations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/vnd.amadeus+json',
          },
          params: {
            keyword,
            subType: 'AIRPORT,CITY',
            max: 10,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Amadeus airport search error:', error);
      return [];
    }
  }

  async getAirlineData(
    airlineCode: string
  ): Promise<any> {
    try {
      const token = await this.authenticate();

      const response = await axios.get(
        `${this.baseUrl}/reference-data/airlines`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/vnd.amadeus+json',
          },
          params: {
            airlineCodes: airlineCode,
          },
        }
      );

      return response.data.data?.[0] || null;
    } catch (error) {
      console.error('Amadeus airline data error:', error);
      return null;
    }
  }
}

export const amadeusClient = new AmadeusClient();
