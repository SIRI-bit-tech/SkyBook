import axios, { AxiosInstance } from 'axios';
import type { DuffelOffer, DuffelOfferRequest, DuffelOrder, DuffelPlace } from '@/types/global';

/**
 * Duffel API Client
 * 
 * Provides flight search, pricing, and booking capabilities
 * Documentation: https://duffel.com/docs/api
 */
class DuffelClient {
  private client?: AxiosInstance;
  private apiToken?: string;
  private baseUrl: string;
  private initialized: boolean = false;

  constructor() {
    this.baseUrl = 'https://api.duffel.com';
  }

  /**
   * Lazy initialization - only throws when methods are actually called
   * This prevents module crashes at import time
   */
  private ensureInitialized(): void {
    if (this.initialized) {
      return;
    }

    this.apiToken = process.env.DUFFEL_API_TOKEN;

    if (!this.apiToken) {
      throw new Error('DUFFEL_API_TOKEN is not configured in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Duffel-Version': 'v2',
      },
      timeout: 30000,
    });

    this.initialized = true;
  }

  /**
   * Search for flights
   * Creates an offer request and returns available flight offers
   */
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    adults: number = 1,
    children: number = 0,
    infants: number = 0,
    returnDate?: string,
    cabinClass?: 'economy' | 'premium_economy' | 'business' | 'first',
    maxConnections?: number
  ): Promise<DuffelOffer[]> {
    this.ensureInitialized();
    
    try {
      // Build passengers array
      const passengers = [];
      
      for (let i = 0; i < adults; i++) {
        passengers.push({ type: 'adult' as const });
      }
      
      for (let i = 0; i < children; i++) {
        passengers.push({ type: 'child' as const, age: 10 });
      }
      
      for (let i = 0; i < infants; i++) {
        passengers.push({ type: 'infant_without_seat' as const, age: 1 });
      }

      // Build slices (flight segments)
      const slices = [
        {
          origin,
          destination,
          departure_date: departureDate,
        },
      ];

      if (returnDate) {
        slices.push({
          origin: destination,
          destination: origin,
          departure_date: returnDate,
        });
      }

      // Create offer request
      const requestBody: Partial<DuffelOfferRequest> = {
        slices,
        passengers,
        cabin_class: cabinClass || 'economy',
      };

      if (maxConnections !== undefined) {
        requestBody.max_connections = maxConnections;
      }

      const response = await this.client!.post('/air/offer_requests', {
        data: requestBody,
      });

      const offerRequestId = response.data.data.id;

      // Get offers from the request with pagination
      const offers: DuffelOffer[] = [];
      let cursor: string | undefined = undefined;
      
      do {
        const url: string = cursor 
          ? `/air/offers?offer_request_id=${offerRequestId}&limit=200&after=${cursor}`
          : `/air/offers?offer_request_id=${offerRequestId}&limit=200`;
        
        const offersResponse: any = await this.client!.get(url);
        
        const pageOffers = offersResponse.data.data || [];
        offers.push(...pageOffers);
        
        // Check if there are more pages
        cursor = offersResponse.data.meta?.after;
      } while (cursor);

      return offers;
    } catch (error: any) {
      console.error('Duffel flight search error:', error.response?.data || error.message);
      throw new Error(`Failed to search flights: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Get a specific offer by ID
   */
  async getOffer(offerId: string): Promise<DuffelOffer | null> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.get(`/air/offers/${offerId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Duffel get offer error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Create an order (book a flight)
   */
  async createOrder(
    selectedOffers: string[],
    passengers: Array<{
      id?: string;
      given_name: string;
      family_name: string;
      born_on: string;
      email?: string;
      phone_number?: string;
      title?: string;
      gender?: 'M' | 'F';
    }>,
    payments: Array<{
      type: 'balance';
      amount: string;
      currency: string;
    }>
  ): Promise<DuffelOrder> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.post('/air/orders', {
        data: {
          selected_offers: selectedOffers,
          passengers,
          payments,
          type: 'instant',
        },
      });

      return response.data.data;
    } catch (error: any) {
      console.error('Duffel create order error:', error.response?.data || error.message);
      throw new Error(`Failed to create order: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  /**
   * Get an order by ID
   */
  async getOrder(orderId: string): Promise<DuffelOrder | null> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.get(`/air/orders/${orderId}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Duffel get order error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    this.ensureInitialized();
    
    try {
      await this.client!.post(`/air/orders/${orderId}/cancellations`, {
        data: {},
      });
      return true;
    } catch (error: any) {
      console.error('Duffel cancel order error:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Search for airports/places
   */
  async searchPlaces(query: string): Promise<DuffelPlace[]> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.get('/places/suggestions', {
        params: {
          query,
        },
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Duffel search places error:', error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Get airline information
   */
  async getAirline(iataCode: string): Promise<any> {
    this.ensureInitialized();
    
    try {
      const response = await this.client!.get(`/air/airlines/${iataCode}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Duffel get airline error:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * List all airlines
   */
  async listAirlines(): Promise<any[]> {
    this.ensureInitialized();
    
    try {
      const airlines: any[] = [];
      let cursor: string | undefined = undefined;
      
      do {
        const url: string = cursor 
          ? `/air/airlines?limit=200&after=${cursor}`
          : `/air/airlines?limit=200`;
        
        const response: any = await this.client!.get(url);
        
        const pageAirlines = response.data.data || [];
        airlines.push(...pageAirlines);
        
        // Check if there are more pages
        cursor = response.data.meta?.after;
      } while (cursor);
      
      return airlines;
    } catch (error: any) {
      console.error('Duffel list airlines error:', error.response?.data || error.message);
      return [];
    }
  }
}

export const duffelClient = new DuffelClient();
