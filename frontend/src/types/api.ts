// API Response Types

export interface City {
  id: string;
  name: string;
  province: string;
  egonCode: string;
}

export interface Street {
  id: string;
  name: string; // "VIA ROMA" (concatenato)
  street: string; // "VIA", "CORSO", etc.
  address: string; // "ROMA", "GARIBALDI", etc.
  egonCode: string;
  cityId: string;
}

export interface Civic {
  civic: string;
  addressId: string;
}

export interface CoverageHeader {
  headerId: string;
  egonCode: string;
}

export interface SpeedProfile {
  id: string;
  productId: string;
  description: string;
  downloadSpeed: number;
  uploadSpeed: number;
  providerId: number;
  providerName: string;
  activationCost: number;
  monthlyCost: number;
  priority: number;
}

export interface CoverageService {
  serviceId: string;
  name: string;
  description: string;
  downloadSpeed: number;
  uploadSpeed: number;
  technology: string;
  available: boolean;
  maxSpeed: string;
  connectionElement: string;
  profiles?: SpeedProfile[]; // Array di profili di velocità disponibili
}

export interface AutocompleteOption {
  label: string;
  value: string;
  data?: any;
}

export interface SelectedAddress {
  cityId: string;
  cityName: string;
  province: string; // Necessario per API headers
  cityEgon: string; // Codice Egon città
  streetId: string;
  streetName: string; // Nome completo "VIA ROMA"
  street: string; // Particella "VIA"
  address: string; // Nome via "ROMA"
  addressEgon: string; // Codice Egon indirizzo
  civic: string;
  addressId: string;
  mainEgon: string; // Codice Egon univoco (da headers)
  headersId: string[]; // Array di header IDs
  coordinates?: [number, number];
}
