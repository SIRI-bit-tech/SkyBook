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
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  private getCredentials() {
    const apiKey = process.env.AMADEUS_API_KEY || '';
    const apiSecret = process.env.AMADEUS_API_SECRET || '';
    const baseUrl = process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';

    if (!apiKey || !apiSecret) {
      console.warn('Amadeus API credentials not configured. Using database fallback.');
    }

    return { apiKey, apiSecret, baseUrl };
  }

  async authenticate(): Promise<string> {
    try {
      // Return cached token if still valid (with 5 min buffer)
      if (this.accessToken && this.tokenExpiry && this.tokenExpiry > Date.now() + 300000) {
        return this.accessToken;
      }

      const { apiKey, apiSecret, baseUrl } = this.getCredentials();

      const response = await axios.post(
        `${baseUrl}/v1/security/oauth2/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: apiKey,
          client_secret: apiSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

      if (!this.accessToken) {
        throw new Error('Failed to retrieve access token');
      }

      return this.accessToken;
    } catch (error: any) {
      console.error('Amadeus authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Amadeus API: ' + (error.response?.data?.error_description || error.message));
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
      const { baseUrl } = this.getCredentials();

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
        `${baseUrl}/v2/shopping/flight-offers`,
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
      const { baseUrl } = this.getCredentials();

      const params: any = {
        origin: departureCode,
        maxPrice: maxPrice || 5000,
      };

      const response = await axios.get(
        `${baseUrl}/v1/shopping/flight-destinations`,
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
      const { baseUrl } = this.getCredentials();

      const response = await axios.get(
        `${baseUrl}/v1/reference-data/locations`,
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
      const { baseUrl } = this.getCredentials();

      const response = await axios.get(
        `${baseUrl}/v1/reference-data/airlines`,
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
