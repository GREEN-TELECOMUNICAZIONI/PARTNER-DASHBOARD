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
  MaxSpeedAvailableForNga?: number;
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
  ConnectionClli?: string;
  Planned?: any;
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

/**
 * Interfaccia per un'opzione/profilo di velocità
 */
export interface ListinoOption {
  IDCharge: number;
  IDProdotto: number;
  IDOpzione: number;
  Attivazione: number;
  Canone: number;
  Variazione: number;
  Migrazione: number;
  Ricarica: number;
  Cessazione: number;
  IDRicorrenza: number;
  Priorita: number;
  Descrizione: string;
  Tipologia: number;
  TipoProdotto: number;
  Solare: boolean;
  Quantita: number;
  Valore: number;
  TipologiaAcquisto: number;
  OrderBillingCode: number;
  IdFornitore: number;
  Mcrdown?: string;
  Mcrup?: string;
  Pcrup?: number;
  Pcrdown?: number;
}

/**
 * Interfaccia per un prodotto nel listino
 */
export interface ListinoProduct {
  IDCharge: number;
  IDProdotto: number;
  Tipo: string;
  Attivazione: number;
  Canone: number;
  Variazione: number;
  Setup: number;
  Migrazione: number;
  Ricarica: number;
  Cessazione: number;
  Priorita: number;
  IDRicorrenza: number;
  Descrizione: string;
  KitDiConsegna: boolean;
  Solare: boolean;
  Quantita: number;
  TipoProdotto: number;
  TipoServizio: string;
  IdFornitore: number;
  BandaDedicata: boolean;
  Opzioni: ListinoOption[];
  IsHdsl?: boolean;
}

/**
 * Interfaccia per il body della risposta GetListino
 */
export interface ListinoBody {
  idLivello: number;
  idCharge: number;
  Products: ListinoProduct[];
}

/**
 * Interfaccia per il filtro fornitore di GetListino
 */
export interface ListinoProviderFilter {
  IdFornitore: number;
  SpeedLimit: number;
}
