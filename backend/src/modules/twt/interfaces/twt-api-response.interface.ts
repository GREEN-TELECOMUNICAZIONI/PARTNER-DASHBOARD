/**
 * Interfaccia base per le risposte API TWT
 * Tutte le risposte seguono questa struttura
 */
export interface TwtApiResponse<T> {
  Errors: string[];
  Success: boolean;
  Body: T;
  ResponseMS?: number;
  CustomData?: any;
  Exception?: string | null;
}

/**
 * Interfaccia per i risultati di città
 */
export interface CityResult {
  IdCity: number;
  Name: string;
  Province: string;
  ProvinceAbbreviation: string;
  ZipCode: string;
  ZipCodeFormatted: string;
  PhonePrefix: string;
  CodiceEgon: number;
  SetupRange: number;
  Region: string;
}

/**
 * Interfaccia per i risultati di indirizzi/strade
 */
export interface StreetResult {
  IdAddress: number;
  Street: string; // "VIA", "PIAZZA", etc.
  Name: string; // Nome della via
  CodiceEgon: number;
}

/**
 * Interfaccia per i risultati di civici
 */
export interface CivicResult {
  IdStreetNumber: number;
  AddressId: number;
  Number: string;
}

/**
 * Interfaccia per gli header ID
 */
export interface HeaderResult {
  IdHeader: number;
  CodiceEgon: number;
}

/**
 * Interfaccia per il provider di servizi
 */
export interface ServiceProvider {
  Id: number; // 10 = TIM, 20 = Fastweb, etc.
  Alarm: string;
  Notes: string;
  SpeedLimit: number;
  CoverageDetails: any[];
  HasMultipleConnection: boolean;
}

/**
 * Interfaccia per il report di disponibilità del servizio
 */
export interface AvailabilityReport {
  HeaderId: number;
  ServiceId: number;
  CoverageId: number;
  MaxSpeed: string;
  Distance: number;
  ServiceDescription: string;
  ServiceName: string;
  StatusCoverage: boolean;
  BsRsTipoServizio: string;
  BsRsTipoProdotto: number;
  ServiceTypeId: number;
  MaxSpeedValue: number;
  ProviderId: number;
  Providers: ServiceProvider[];
  Alarm: boolean;
  SpeedUp: number;
  SpeedDown: number;
  SpeedComplete: string;
  ConnectionType: string;
  ConnectionTypeId: number;
  ConnectionElementName: string;
  ConnectionElementDetail: string;
  Selectable: boolean;
}

/**
 * Interfaccia per il body della risposta di copertura servizi
 */
export interface CoverageServicesBody {
  AnyNotAvailableProvider: boolean;
  FastwebNotAvailable: boolean;
  NotAvailableProviders: any[];
  AvailabilityReports: AvailabilityReport[];
}
