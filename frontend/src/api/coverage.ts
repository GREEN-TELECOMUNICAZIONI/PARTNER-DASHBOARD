import { apiClient } from './client';
import type { City, Street, Civic, CoverageHeader, CoverageService } from '../types/api';

export const coverageApi = {
  // Get cities by query
  getCities: async (query: string): Promise<City[]> => {
    const response = await apiClient.get('/coverage/cities', {
      params: { query },
    });
    // Backend returns {success: true, data: [...]}
    return response.data?.data || [];
  },

  // Get streets by query and cityId
  getStreets: async (query: string, cityId: string): Promise<Street[]> => {
    const response = await apiClient.get('/coverage/streets', {
      params: { query, cityId },
    });
    // Backend returns {success: true, data: [...]}
    return response.data?.data || [];
  },

  // Get civics by addressId
  getCivics: async (addressId: string): Promise<Civic[]> => {
    const response = await apiClient.get('/coverage/civics', {
      params: { addressId },
    });
    // Backend returns {success: true, data: [...]}
    return response.data?.data || [];
  },

  // Get coverage headers
  getHeaders: async (
    city: string,
    province: string,
    address: string,
    number: string,
    street?: string
  ): Promise<CoverageHeader[]> => {
    const response = await apiClient.get('/coverage/headers', {
      params: { city, province, address, number, street },
    });
    // Backend returns {success: true, data: [...]}
    return response.data?.data || [];
  },

  // Get coverage services
  getServices: async (
    headersId: number[],
    cityEgon: string,
    addressEgon: string,
    mainEgon: string,
    streetNumber: string
  ): Promise<CoverageService[]> => {
    const response = await apiClient.get('/coverage/services', {
      params: {
        headersId, // Axios serializes arrays correctly
        cityEgon,
        addressEgon,
        mainEgon,
        streetNumber,
      },
    });
    // Backend returns {success: true, data: [...]}
    return response.data?.data || [];
  },

  // Geocode address to get coordinates
  geocode: async (address: string, city: string, province: string): Promise<[number, number] | null> => {
    try {
      const response = await apiClient.get('/coverage/geocode', {
        params: { address, city, province },
      });
      return response.data?.coordinates || null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  },
};
