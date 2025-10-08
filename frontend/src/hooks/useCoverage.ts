import { useQuery } from '@tanstack/react-query';
import { coverageApi } from '../api/coverage';

export const useCities = (query: string) => {
  return useQuery({
    queryKey: ['cities', query],
    queryFn: () => coverageApi.getCities(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStreets = (query: string, cityId: string) => {
  return useQuery({
    queryKey: ['streets', query, cityId],
    queryFn: () => coverageApi.getStreets(query, cityId),
    enabled: query.length >= 2 && !!cityId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCivics = (addressId: string) => {
  return useQuery({
    queryKey: ['civics', addressId],
    queryFn: () => coverageApi.getCivics(addressId),
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useHeaders = (
  city: string,
  province: string,
  address: string,
  number: string,
  street?: string
) => {
  return useQuery({
    queryKey: ['headers', city, province, address, number, street],
    queryFn: () => coverageApi.getHeaders(city, province, address, number, street),
    enabled: !!city && !!province && !!address && !!number,
    staleTime: 5 * 60 * 1000,
  });
};

export const useServices = (
  headersId: number[],
  cityEgon: string,
  addressEgon: string,
  mainEgon: string,
  streetNumber: string
) => {
  // Strict validation: only enable when ALL parameters are valid
  const enabled =
    headersId.length > 0 &&
    !!cityEgon &&
    !!addressEgon &&
    !!mainEgon &&
    !!streetNumber;

  return useQuery({
    queryKey: ['services', headersId, cityEgon, addressEgon, mainEgon, streetNumber],
    queryFn: () => coverageApi.getServices(headersId, cityEgon, addressEgon, mainEgon, streetNumber),
    enabled,
    staleTime: 5 * 60 * 1000,
    // Prevent automatic refetching
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
