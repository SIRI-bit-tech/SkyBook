import axios from 'axios';

interface SkyscannerPrice {
  minPrice: number;
  currency: string;
  quoteDateTime: string;
  outboundLeg?: {
    carrierIds: number[];
    originLocationId: number;
    destinationLocationId: number;
    departureDate: string;
  };
  inboundLeg?: {
    carrierIds: number[];
    originLocationId: number;
    destinationLocationId: number;
    departureDate: string;
  };
}

class SkyscannerClient {
  private apiKey: string;
  private baseUrl = 'https://api.skypicker.com';

  constructor() {
    this.apiKey = process.env.SKYSCANNER_API_KEY || '';
  }

  async searchPrices(
    departureCode: string,
    arrivalCode: string,
    departureDate: string,
    returnDate?: string,
    adults: number = 1,
    children: number = 0
  ): Promise<SkyscannerPrice[]> {
    try {
      const params: any = {
        fly_from: departureCode,
        fly_to: arrivalCode,
        date_from: departureDate,
        date_to: departureDate,
        adults,
        limit: 50,
        sort: 'price',
        asc: 1,
      };

      if (children > 0) params.children = children;
      if (returnDate) {
        params.return_from = returnDate;
        params.return_to = returnDate;
      }

      const response = await axios.get(
        `${this.baseUrl}/api/v2.1/flights`,
        { params }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Skyscanner price search error:', error);
      return [];
    }
  }

  async getPriceHistory(
    departureCode: string,
    arrivalCode: string,
    departureDate: string
  ): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2.1/prices/history`,
        {
          params: {
            fly_from: departureCode,
            fly_to: arrivalCode,
            date_from: departureDate,
            limit: 30,
          },
        }
      );

      return response.data.data || [];
    } catch (error) {
      console.error('Price history error:', error);
      return [];
    }
  }

  async autosuggestion(query: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/v2.1/locations`,
        {
          params: {
            term: query,
            locale: 'en-US',
            limit: 10,
          },
        }
      );

      return response.data.locations || [];
    } catch (error) {
      console.error('Autosuggestion error:', error);
      return [];
    }
  }
}

export const skyscannerClient = new SkyscannerClient();
