# Documentazione Integrazione TWT - Verifica Copertura

Questa documentazione descrive in modo completo come replicare l'integrazione con le API TWT per la verifica della copertura dei servizi di connettività.

---

## Indice

1. [Panoramica dell'Architettura](#1-panoramica-dellarchitettura)
2. [Configurazione delle Variabili d'Ambiente](#2-configurazione-delle-variabili-dambiente)
3. [Struttura Backend - File e Moduli](#3-struttura-backend---file-e-moduli)
4. [Interfacce TypeScript (API Response Types)](#4-interfacce-typescript-api-response-types)
5. [Service TWT - API Endpoints](#5-service-twt---api-endpoints)
6. [Data Transfer Objects (DTOs)](#6-data-transfer-objects-dtos)
7. [REST API Endpoints del Controller](#7-rest-api-endpoints-del-controller)
8. [Logica di Filtro nel Controller](#8-logica-di-filtro-nel-controller)
9. [Struttura Frontend](#9-struttura-frontend)
10. [Flusso Completo della Richiesta](#10-flusso-completo-della-richiesta)
11. [Gestione Errori](#11-gestione-errori)
12. [Ottimizzazioni Implementate](#12-ottimizzazioni-implementate)
13. [Checklist per Replicazione](#13-checklist-per-replicazione)

---

## 1. Panoramica dell'Architettura

L'integrazione TWT segue un'architettura a tre livelli:

```
Frontend (React + React Query)
       │
       │ (Axios HTTP Client)
       ▼
Backend (NestJS) ─── Coverage Controller → TWT Service
       │
       │ (HttpService - Axios)
       ▼
TWT API xDSL (https://reseller.twt.it/api/xdsl)
```

**Base URL API TWT**: `https://reseller.twt.it/api/xdsl`

**Autenticazione**: Basic Authentication (username:password encoded in base64)

**Stack Tecnologico**:
- **Backend**: NestJS con HttpModule e ConfigModule
- **Frontend**: React + TanStack React Query + Axios
- **API Esterna**: TWT xDSL REST API

---

## 2. Configurazione delle Variabili d'Ambiente

Creare il file `.env` nel backend con le seguenti variabili:

```bash
# ===========================================
# SERVER CONFIGURATION
# ===========================================
NODE_ENV=development
PORT=3000

# ===========================================
# CORS CONFIGURATION
# ===========================================
CORS_ORIGIN=http://localhost:5173

# ===========================================
# TWT API CONFIGURATION
# ===========================================
TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
TWT_API_USERNAME=your_username_here
TWT_API_PASSWORD=your_password_here

# ===========================================
# PROVIDER FILTER
# ===========================================
# Filtra servizi per provider (comma-separated IDs)
# Provider IDs disponibili:
#   10 = TIM
#   20 = Fastweb
#   30 = Altri operatori
#   160 = FWA EW
#
# Esempi:
#   TWT_PROVIDER_FILTER=10          # Solo TIM
#   TWT_PROVIDER_FILTER=10,20       # TIM e Fastweb
#   TWT_PROVIDER_FILTER=            # Tutti i provider (no filter)
TWT_PROVIDER_FILTER=10

# ===========================================
# TECHNOLOGY FILTER
# ===========================================
# Filtra servizi per tecnologia in ServiceName (comma-separated)
# Valori disponibili: FTTC, FTTH, ETH (case-insensitive)
#
# Esempi:
#   TWT_TECHNOLOGY_FILTER=FTTC,FTTH  # Solo FTTC e FTTH
#   TWT_TECHNOLOGY_FILTER=FTTH       # Solo FTTH
#   TWT_TECHNOLOGY_FILTER=           # Tutte le tecnologie
TWT_TECHNOLOGY_FILTER=FTTC,FTTH

# ===========================================
# SERVICE VARIANTS FILTER
# ===========================================
# Include SOLO queste varianti di servizio (comma-separated keywords in ServiceName)
# Varianti disponibili: Lite, VULA, EVDSL, Asimmetrica, Simmetrica, Dedicata
# Se impostato, SOLO servizi con almeno una di queste keyword saranno mostrati
# Case-sensitive matching
#
# Esempi:
#   TWT_INCLUDE_VARIANTS=EVDSL           # Solo "FTTCab EVDSL"
#   TWT_INCLUDE_VARIANTS=EVDSL,VULA      # Solo servizi con EVDSL o VULA
#   TWT_INCLUDE_VARIANTS=                # Tutte le varianti (default)
TWT_INCLUDE_VARIANTS=

# Escludi varianti di servizio (comma-separated keywords in ServiceName)
# NOTA: EXCLUDE ha priorita' su INCLUDE
# Se un servizio passa INCLUDE ma e' in EXCLUDE, viene escluso
#
# Esempi:
#   TWT_EXCLUDE_VARIANTS=Lite            # Escludi "FTTH Lite", "FTTCab Lite"
#   TWT_EXCLUDE_VARIANTS=Lite,VULA       # Escludi Lite e VULA
#   TWT_EXCLUDE_VARIANTS=                # Nessuna esclusione
TWT_EXCLUDE_VARIANTS=Lite

# ===========================================
# PROFILE FILTERS
# ===========================================
# Escludi profili con specifici valori di priority (comma-separated)
# Valori comuni: 9999 = profili deprecati/inattivi
#
# Esempi:
#   EXCLUDE_PROFILES_WITH_PRIORITY=9999       # Escludi deprecati
#   EXCLUDE_PROFILES_WITH_PRIORITY=9999,8888  # Escludi multipli
#   EXCLUDE_PROFILES_WITH_PRIORITY=           # Includi tutti
EXCLUDE_PROFILES_WITH_PRIORITY=9999

# Filtra profili per prefisso descrizione (comma-separated prefixes)
# Solo profili la cui descrizione inizia con uno di questi prefissi
# Prefissi comuni: TWT_TI (TIM), TWT_FW (Fastweb), Abbuono
#
# Esempi:
#   PROFILE_DESCRIPTION_PREFIX=TWT_TI           # Solo profili TIM
#   PROFILE_DESCRIPTION_PREFIX=TWT_TI,TWT_FW    # TIM e Fastweb
#   PROFILE_DESCRIPTION_PREFIX=                 # Tutti i profili
PROFILE_DESCRIPTION_PREFIX=TWT_TI

# Escludi profili per keyword nella descrizione (comma-separated)
# Case-sensitive matching
#
# Esempi:
#   EXCLUDE_PROFILES_BY_KEYWORD=Lite           # Escludi con "Lite"
#   EXCLUDE_PROFILES_BY_KEYWORD=Lite,Abbuono   # Escludi multipli
#   EXCLUDE_PROFILES_BY_KEYWORD=               # Nessuna esclusione
EXCLUDE_PROFILES_BY_KEYWORD=

# ===========================================
# UI CONFIGURATION
# ===========================================
# Colonne visibili nella tabella profili (comma-separated)
# Disponibili: description, speed, provider, monthlyCost, activationCost
#
# Esempi:
#   PROFILE_TABLE_COLUMNS=description                    # Solo descrizione
#   PROFILE_TABLE_COLUMNS=description,speed,monthlyCost  # Multipli
#   PROFILE_TABLE_COLUMNS=all                            # Tutte (default)
PROFILE_TABLE_COLUMNS=description

# ===========================================
# PRICING
# ===========================================
# Markup prezzo retail sui profili (in EUR)
# Viene aggiunto al Canone di ogni profilo
#
# Esempi:
#   RETAIL_PRICE_MARKUP=5.00   # Aggiungi 5 EUR al canone
#   RETAIL_PRICE_MARKUP=0      # Prezzi wholesale (default)
RETAIL_PRICE_MARKUP=0
```

---

## 3. Struttura Backend - File e Moduli

### 3.1 Struttura delle Directory

```
backend/src/modules/
├── twt/
│   ├── twt.module.ts                      # Modulo TWT
│   ├── twt.service.ts                     # Service con logica API TWT
│   ├── interfaces/
│   │   ├── index.ts                       # Re-export interfacce
│   │   └── twt-api-response.interface.ts  # Interfacce risposte API
│   └── dto/
│       ├── index.ts                       # Re-export DTOs
│       ├── city-query.dto.ts              # DTO query citta'
│       ├── street-query.dto.ts            # DTO query strade
│       ├── civic-query.dto.ts             # DTO query civici
│       ├── headers-query.dto.ts           # DTO query headers
│       └── coverage-query.dto.ts          # DTO query copertura
└── coverage/
    ├── coverage.module.ts                 # Modulo Coverage
    └── coverage.controller.ts             # Controller REST endpoints
```

### 3.2 Modulo TWT (`twt.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TwtService } from './twt.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 30000,      // 30 secondi timeout
      maxRedirects: 5,
    }),
    ConfigModule,
  ],
  providers: [TwtService],
  exports: [TwtService],   // Esporta per altri moduli
})
export class TwtModule {}
```

### 3.3 Modulo Coverage (`coverage.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TwtModule } from '../twt/twt.module';
import { CoverageController } from './coverage.controller';

@Module({
  imports: [TwtModule, ConfigModule],
  controllers: [CoverageController],
})
export class CoverageModule {}
```

---

## 4. Interfacce TypeScript (API Response Types)

### File: `twt-api-response.interface.ts`

```typescript
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
 * Risultato ricerca citta'
 */
export interface CityResult {
  IdCity: number;
  Name: string;
  Province: string;
  ProvinceAbbreviation: string;
  ZipCode: string;
  ZipCodeFormatted: string;
  PhonePrefix: string;
  CodiceEgon: number;      // IMPORTANTE: necessario per API successive
  SetupRange: number;
  Region: string;
}

/**
 * Risultato ricerca indirizzi/strade
 */
export interface StreetResult {
  IdAddress: number;
  Street: string;           // "VIA", "PIAZZA", "VIALE", etc.
  Name: string;             // Nome della via (es: "GARIBALDI")
  CodiceEgon: number;       // Codice Egon indirizzo
}

/**
 * Risultato ricerca civici
 */
export interface CivicResult {
  IdStreetNumber: number;
  AddressId: number;
  Number: string;           // Numero civico (es: "12", "12A")
}

/**
 * Header ID (necessario per GetCoverageServices)
 */
export interface HeaderResult {
  IdHeader: number;         // Header ID da usare nelle chiamate successive
  CodiceEgon: number;       // MainEgon univoco
}

/**
 * Provider di un servizio
 */
export interface ServiceProvider {
  Id: number;               // 10=TIM, 20=Fastweb, 30=Altri, 160=FWA EW
  Alarm: string;
  Notes: string;
  SpeedLimit: number;       // Velocita' massima disponibile
  CoverageDetails: any[];
  HasMultipleConnection: boolean;
}

/**
 * Report di disponibilita' singolo servizio
 */
export interface AvailabilityReport {
  HeaderId: number;
  ServiceId: number;
  CoverageId: number;
  MaxSpeed: string;
  MaxSpeedAvailableForNga?: number;
  Distance: number;          // Distanza dalla centrale (metri)
  ServiceDescription: string;
  ServiceName: string;       // Es: "FTTCab EVDSL", "FTTH Simmetrica"
  StatusCoverage: boolean;   // Servizio disponibile?
  BsRsTipoServizio: string;  // Parametro per GetListino
  BsRsTipoProdotto: number;  // Parametro per GetListino
  ServiceTypeId: number;
  MaxSpeedValue: number;
  ProviderId: number;        // Provider principale
  Providers: ServiceProvider[];
  Alarm: boolean;
  SpeedUp: number;           // Upload in Mbps
  SpeedDown: number;         // Download in Mbps
  SpeedComplete: string;
  ConnectionType: string;
  ConnectionTypeId: number;
  ConnectionElementName: string;
  ConnectionElementDetail: string;
  ConnectionClli?: string;
  Planned?: any;
  Selectable: boolean;       // Filtro interno TWT
}

/**
 * Body della risposta GetCoverageServices
 */
export interface CoverageServicesBody {
  AnyNotAvailableProvider: boolean;
  FastwebNotAvailable: boolean;
  NotAvailableProviders: any[];
  AvailabilityReports: AvailabilityReport[];
}

/**
 * Opzione/Profilo di velocita' dal listino
 */
export interface ListinoOption {
  IDCharge: number;
  IDProdotto: number;
  IDOpzione: number;
  Attivazione: number;       // Costo attivazione (EUR)
  Canone: number;            // Canone mensile (EUR)
  Variazione: number;
  Migrazione: number;
  Ricarica: number;
  Cessazione: number;
  IDRicorrenza: number;
  Priorita: number;          // 9999 = profilo deprecato/inattivo
  Descrizione: string;       // Es: "TWT_TI FTTCab 100 Mb/10 Mb"
  Tipologia: number;
  TipoProdotto: number;
  Solare: boolean;
  Quantita: number;
  Valore: number;
  TipologiaAcquisto: number;
  OrderBillingCode: number;
  IdFornitore: number;       // Provider ID
  Mcrdown?: string;          // Min velocita' download (Kbps)
  Mcrup?: string;            // Min velocita' upload (Kbps)
  Pcrup?: number;            // Peak velocita' upload (Kbps)
  Pcrdown?: number;          // Peak velocita' download (Kbps)
}

/**
 * Prodotto nel listino
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
  Opzioni: ListinoOption[];   // Array di profili velocita'
  IsHdsl?: boolean;
}

/**
 * Body della risposta GetListino
 */
export interface ListinoBody {
  idLivello: number;
  idCharge: number;
  Products: ListinoProduct[];
}

/**
 * Filtro provider per GetListino
 */
export interface ListinoProviderFilter {
  IdFornitore: number;
  SpeedLimit: number;
}
```

### File: `interfaces/index.ts`

```typescript
export * from './twt-api-response.interface';
```

---

## 5. Service TWT - API Endpoints

### File: `twt.service.ts`

```typescript
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import {
  TwtApiResponse,
  CityResult,
  StreetResult,
  CivicResult,
  HeaderResult,
  CoverageServicesBody,
} from './interfaces';

/**
 * Service per l'integrazione con le API TWT xDSL
 * Base URL: https://reseller.twt.it/api/xdsl/
 */
@Injectable()
export class TwtService {
  private readonly logger = new Logger(TwtService.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('TWT_API_BASE_URL') ||
      'https://reseller.twt.it/api/xdsl';
    this.username = this.configService.get<string>('TWT_API_USERNAME') || '';
    this.password = this.configService.get<string>('TWT_API_PASSWORD') || '';

    this.logger.log(`TWT Service initialized with base URL: ${this.baseUrl}`);
  }

  /**
   * Costruisce gli headers di autenticazione per le chiamate API
   * Utilizza Basic Authentication con username e password
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.username && this.password) {
      // Genera Basic Auth token: base64(username:password)
      const credentials = Buffer.from(
        `${this.username}:${this.password}`,
      ).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }

    return headers;
  }

  /**
   * Gestisce gli errori delle chiamate HTTP
   */
  private handleError(error: AxiosError, context: string): never {
    this.logger.error(`Error in ${context}:`, error.message);

    if (error.response) {
      this.logger.error(`Response status: ${error.response.status}`);
      this.logger.error(`Response data:`, error.response.data);

      throw new HttpException(
        {
          message: `TWT API Error: ${error.message}`,
          details: error.response.data,
          status: error.response.status,
        },
        error.response.status,
      );
    }

    throw new HttpException(
      {
        message: `TWT API Error: ${error.message}`,
        context,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  /**
   * GET /Toponomastica/GetCities
   * Restituisce l'elenco delle citta' che soddisfano la query
   * @param query Nome del Comune o parte del nome (minimo 2 caratteri)
   */
  async getCities(query: string): Promise<TwtApiResponse<CityResult[]>> {
    try {
      this.logger.debug(`Getting cities with query: ${query}`);

      const url = `${this.baseUrl}/Toponomastica/GetCities`;
      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<CityResult[]>>(url, {
          params: { query },
          headers: this.getAuthHeaders(),
        }),
      );

      this.logger.debug(`Found ${response.data.Body?.length || 0} cities`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getCities');
    }
  }

  /**
   * GET /Toponomastica/GetAddressesByCity
   * Restituisce l'elenco degli indirizzi per la citta' specificata
   * @param query Indirizzo comprensivo della particella (minimo 2 caratteri)
   * @param cityId Codice Egon del Comune
   */
  async getStreets(
    query: string,
    cityId: number,
  ): Promise<TwtApiResponse<StreetResult[]>> {
    try {
      this.logger.debug(`Getting streets with query: ${query}, cityId: ${cityId}`);

      const url = `${this.baseUrl}/Toponomastica/GetAddressesByCity`;
      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<StreetResult[]>>(url, {
          params: { query, cityId },
          headers: this.getAuthHeaders(),
        }),
      );

      this.logger.debug(`Found ${response.data.Body?.length || 0} streets`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getStreets');
    }
  }

  /**
   * GET /Toponomastica/GetStreetNumberByAddress
   * Restituisce l'elenco dei civici per l'indirizzo specificato
   * @param addressId Codice Egon della Via
   * @param query Numero civico (opzionale)
   */
  async getCivics(
    addressId: number,
    query?: string,
  ): Promise<TwtApiResponse<CivicResult[]>> {
    try {
      this.logger.debug(`Getting civics for addressId: ${addressId}`);

      const url = `${this.baseUrl}/Toponomastica/GetStreetNumberByAddress`;
      const params: any = {
        addressId,
        query: query || '',  // API richiede query param (anche se vuoto)
      };

      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<CivicResult[]>>(url, {
          params,
          headers: this.getAuthHeaders(),
        }),
      );

      this.logger.debug(`Found ${response.data.Body?.length || 0} civics`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getCivics');
    }
  }

  /**
   * GET /Toponomastica/GetHeaders
   * Restituisce gli header ID per l'indirizzo specificato
   * Necessari per ottenere la copertura dei servizi
   */
  async getHeaders(
    city: string,
    province: string,
    address: string,
    number: string,
    street?: string,
  ): Promise<TwtApiResponse<HeaderResult[]>> {
    try {
      this.logger.debug(
        `Getting headers for: ${street || ''} ${address} ${number}, ${city} (${province})`,
      );

      const url = `${this.baseUrl}/Toponomastica/GetHeaders`;
      const params: any = {
        city,
        province,
        address,
        number,
      };

      if (street) {
        params.street = street;
      }

      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<HeaderResult[]>>(url, {
          params,
          headers: this.getAuthHeaders(),
        }),
      );

      this.logger.debug(`Found ${response.data.Body?.length || 0} headers`);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getHeaders');
    }
  }

  /**
   * GET /Toponomastica/GetCoverageServices
   * Restituisce i servizi di connettivita' disponibili per l'indirizzo
   */
  async getCoverageServices(
    headersId: number[],
    cityEgon: string,
    addressEgon: string,
    mainEgon: string,
    streetNumber: string,
  ): Promise<TwtApiResponse<CoverageServicesBody>> {
    try {
      this.logger.debug(
        `Getting coverage services for address: ${addressEgon}, headers: ${headersId.join(',')}`,
      );

      const url = `${this.baseUrl}/Toponomastica/GetCoverageServices`;
      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<CoverageServicesBody>>(url, {
          params: {
            HeadersId: headersId,
            CityEgon: cityEgon,
            AddressEgon: addressEgon,
            MainEgon: mainEgon,
            StreetNumber: streetNumber,
          },
          headers: this.getAuthHeaders(),
        }),
      );

      if (response.data.Success && response.data.Body) {
        this.logger.debug(
          `Received ${response.data.Body.AvailabilityReports?.length || 0} services`,
        );
      }

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getCoverageServices');
    }
  }

  /**
   * GET /XdslBilling/GetListino
   * Restituisce l'elenco dei profili attivabili per una determinata tipologia di circuito
   * @param providers Array di fornitori con IdFornitore e SpeedLimit
   * @param tipoProdotto Tipologia del prodotto (da BsRsTipoProdotto)
   * @param tipoServizio Tipologia del servizio (da BsRsTipoServizio)
   */
  async getListino(
    providers: { IdFornitore: number; SpeedLimit: number }[],
    tipoProdotto: number,
    tipoServizio: string,
  ): Promise<TwtApiResponse<any>> {
    try {
      this.logger.debug(
        `Getting listino for tipoProdotto: ${tipoProdotto}, tipoServizio: ${tipoServizio}`,
      );

      const url = `${this.baseUrl}/XdslBilling/GetListino`;

      // Costruiamo i parametri per l'array fornitori
      const params: any = {
        levelIds: 1,  // Obbligatorio come da documentazione TWT
        tipoProdotto,
        tipoServizio,
      };

      // Aggiungiamo i fornitori come array di oggetti
      providers.forEach((provider, index) => {
        params[`fornitori[${index}][IdFornitore]`] = provider.IdFornitore;
        params[`fornitori[${index}][SpeedLimit]`] = provider.SpeedLimit;
      });

      const response = await firstValueFrom(
        this.httpService.get<TwtApiResponse<any>>(url, {
          params,
          headers: this.getAuthHeaders(),
        }),
      );

      this.logger.debug(
        `Received ${response.data.Body?.Products?.length || 0} products`,
      );

      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError, 'getListino');
    }
  }

  /**
   * Verifica lo stato di salute dell'API TWT
   */
  async healthCheck(): Promise<{
    status: string;
    baseUrl: string;
    authenticated: boolean;
  }> {
    try {
      await this.getCities('Mi');

      return {
        status: 'healthy',
        baseUrl: this.baseUrl,
        authenticated: !!(this.username && this.password),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        baseUrl: this.baseUrl,
        authenticated: !!(this.username && this.password),
      };
    }
  }
}
```

---

## 6. Data Transfer Objects (DTOs)

### `city-query.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CityQueryDto {
  @ApiProperty({
    description: 'Nome del Comune o parte del nome (minimo 2 caratteri)',
    example: 'Mil',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'La query deve contenere almeno 2 caratteri' })
  query: string;
}
```

### `street-query.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class StreetQueryDto {
  @ApiProperty({
    description: 'Indirizzo comprensivo della particella (minimo 2 caratteri)',
    example: 'VIA VESPRI',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  query: string;

  @ApiProperty({
    description: 'Codice Egon del Comune',
    example: 38000002491,
  })
  @IsInt()
  @Type(() => Number)
  cityId: number;
}
```

### `civic-query.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CivicQueryDto {
  @ApiPropertyOptional({
    description: 'Numero civico da cercare',
    example: '12',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({
    description: 'Codice Egon della Via',
    example: 38000053701,
  })
  @IsInt()
  @Type(() => Number)
  addressId: number;
}
```

### `headers-query.dto.ts`

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class HeadersQueryDto {
  @ApiProperty({
    description: 'Nome del Comune',
    example: 'MILANO',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Nome della Provincia',
    example: 'MILANO',
  })
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiPropertyOptional({
    description: 'Particella toponomastica (es. VIA, VIALE, PIAZZA)',
    example: 'VIA',
  })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({
    description: 'Indirizzo esclusi particella e numero civico',
    example: 'VESPRI SICILIANI',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({
    description: 'Numero civico',
    example: '12',
  })
  @IsString()
  @IsNotEmpty()
  number: string;
}
```

### `coverage-query.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CoverageQueryDto {
  @ApiProperty({
    description: 'Array di Header IDs ottenuti da GetHeaders',
    example: [17209508],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  headersId: number[];

  @ApiProperty({
    description: 'Codice Egon del Comune',
    example: '38000002491',
  })
  @IsString()
  @IsNotEmpty()
  cityEgon: string;

  @ApiProperty({
    description: "Codice Egon dell'indirizzo",
    example: '38000053701',
  })
  @IsString()
  @IsNotEmpty()
  addressEgon: string;

  @ApiProperty({
    description: 'Codice Egon univoco (MainEgon)',
    example: '380100004477903',
  })
  @IsString()
  @IsNotEmpty()
  mainEgon: string;

  @ApiProperty({
    description: 'Numero civico',
    example: '33',
  })
  @IsString()
  @IsNotEmpty()
  streetNumber: string;
}
```

### `dto/index.ts`

```typescript
export * from './city-query.dto';
export * from './street-query.dto';
export * from './civic-query.dto';
export * from './headers-query.dto';
export * from './coverage-query.dto';
```

---

## 7. REST API Endpoints del Controller

### Base URL: `http://localhost:3000/api/coverage`

### 7.1 GET /api/coverage/cities

**Descrizione**: Cerca citta' per nome o parte del nome

**Query Parameters**:
- `query` (string, minimo 2 caratteri): Nome citta'

**Esempio**:
```
GET /api/coverage/cities?query=Milano
```

**Risposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "38000002491",
      "name": "MILANO",
      "province": "MILANO",
      "egonCode": "38000002491"
    }
  ],
  "errors": []
}
```

### 7.2 GET /api/coverage/streets

**Descrizione**: Cerca strade/indirizzi per citta'

**Query Parameters**:
- `query` (string, minimo 2 caratteri): Via
- `cityId` (number): Codice Egon citta'

**Esempio**:
```
GET /api/coverage/streets?query=VESPRI&cityId=38000002491
```

**Risposta**:
```json
{
  "success": true,
  "data": [
    {
      "id": "38000053701",
      "name": "VIA VESPRI SICILIANI",
      "street": "VIA",
      "address": "VESPRI SICILIANI",
      "egonCode": "38000053701",
      "cityId": "38000002491"
    }
  ],
  "errors": []
}
```

### 7.3 GET /api/coverage/civics

**Descrizione**: Cerca civici per indirizzo

**Query Parameters**:
- `addressId` (number): Codice Egon indirizzo
- `query` (string, opzionale): Numero civico da cercare

**Esempio**:
```
GET /api/coverage/civics?addressId=38000053701
```

**Risposta**:
```json
{
  "success": true,
  "data": [
    { "civic": "12", "addressId": "38000053701" },
    { "civic": "12A", "addressId": "38000053701" },
    { "civic": "14", "addressId": "38000053701" }
  ],
  "errors": []
}
```

### 7.4 GET /api/coverage/headers

**Descrizione**: Ottiene gli header ID necessari per verificare la copertura

**Query Parameters**:
- `city` (string): Nome citta'
- `province` (string): Nome provincia
- `address` (string): Indirizzo (senza particella e civico)
- `number` (string): Numero civico
- `street` (string, opzionale): Particella (VIA, PIAZZA, etc.)

**Esempio**:
```
GET /api/coverage/headers?city=MILANO&province=MILANO&address=VESPRI+SICILIANI&number=12&street=VIA
```

**Risposta**:
```json
{
  "success": true,
  "data": [
    {
      "headerId": "17209508",
      "egonCode": "380100004477903"
    }
  ],
  "errors": []
}
```

### 7.5 GET /api/coverage/services (ENDPOINT PRINCIPALE)

**Descrizione**: Verifica la copertura dei servizi per un indirizzo

**Query Parameters**:
- `headersId` (array di numeri): Header ID
- `cityEgon` (string): Codice Egon citta'
- `addressEgon` (string): Codice Egon indirizzo
- `mainEgon` (string): MainEgon univoco
- `streetNumber` (string): Numero civico

**Esempio**:
```
GET /api/coverage/services?headersId=17209508&cityEgon=38000002491&addressEgon=38000053701&mainEgon=380100004477903&streetNumber=12
```

**Risposta**:
```json
{
  "success": true,
  "data": [
    {
      "serviceId": "12345",
      "name": "FTTCab EVDSL",
      "description": "Fibra fino al cabinet con velocita' enhanced",
      "downloadSpeed": 200,
      "uploadSpeed": 20,
      "technology": "FTTC",
      "available": true,
      "maxSpeed": "200 Mbps",
      "connectionElement": "CAB_MI_001",
      "connectionElementDetail": "Centrale Nord",
      "distance": 250,
      "providers": [
        {
          "id": 10,
          "name": "TIM",
          "alarm": "",
          "notes": "",
          "speedLimit": 250,
          "hasMultipleConnection": false,
          "coverageDetails": []
        }
      ],
      "profiles": [
        {
          "id": "5001",
          "productId": "P5001",
          "description": "TWT_TI FTTCab 200 Mb/20 Mb",
          "downloadSpeed": 200,
          "uploadSpeed": 20,
          "providerId": 10,
          "providerName": "TIM",
          "activationCost": 50.00,
          "monthlyCost": 29.99,
          "priority": 1
        }
      ],
      "serviceTypeId": 1,
      "coverageId": 12345,
      "bsRsTipoServizio": "FTTC",
      "bsRsTipoProdotto": 1,
      "alarm": false,
      "selectable": true,
      "planned": null
    }
  ],
  "errors": []
}
```

### 7.6 GET /api/coverage/geocode

**Descrizione**: Geocode un indirizzo per ottenere le coordinate

**Query Parameters**:
- `address` (string): Indirizzo
- `city` (string): Citta'
- `province` (string): Provincia

**Risposta**:
```json
{
  "coordinates": [45.4642, 9.1900]
}
```

### 7.7 GET /api/coverage/config

**Descrizione**: Restituisce la configurazione dell'interfaccia utente

**Risposta**:
```json
{
  "profileTable": {
    "visibleColumns": ["description", "speed", "provider", "monthlyCost", "activationCost"]
  }
}
```

### 7.8 GET /api/coverage/health

**Descrizione**: Verifica lo stato di salute dell'integrazione TWT

**Risposta**:
```json
{
  "status": "healthy",
  "baseUrl": "https://reseller.twt.it/api/xdsl",
  "authenticated": true
}
```

---

## 8. Logica di Filtro nel Controller

### 8.1 Filtro Servizi (Prima di GetListino)

I seguenti filtri vengono applicati a ogni `AvailabilityReport`:

```typescript
// 1. Verifica disponibilita' e selezionabilita'
if (!service.StatusCoverage || !service.Selectable) return false;

// 2. Filtro provider (TWT_PROVIDER_FILTER)
if (providerFilter.length > 0) {
  const hasMatchingProvider = service.Providers?.some(provider =>
    providerFilter.includes(provider.Id)
  );
  if (!hasMatchingProvider) return false;
}

// 3. Filtro tecnologia (TWT_TECHNOLOGY_FILTER)
if (technologyFilter.length > 0) {
  const hasTechnology = technologyFilter.some(tech =>
    serviceName.toUpperCase().includes(tech)
  );
  if (!hasTechnology) return false;
}

// 4. Include SOLO varianti specificate (TWT_INCLUDE_VARIANTS)
if (includeVariants.length > 0) {
  const hasIncludedVariant = includeVariants.some(variant =>
    serviceName.includes(variant)
  );
  if (!hasIncludedVariant) return false;
}

// 5. Escludi varianti (TWT_EXCLUDE_VARIANTS) - ha priorita' su INCLUDE
if (excludeVariants.length > 0) {
  const hasExcludedVariant = excludeVariants.some(variant =>
    serviceName.includes(variant)
  );
  if (hasExcludedVariant) return false;
}
```

### 8.2 Caching GetListino

Per evitare chiamate duplicate all'API GetListino:

```typescript
const listinoCache: Map<string, any[]> = new Map();

// Chiave cache basata su parametri GetListino
const cacheKey = `${BsRsTipoProdotto}_${BsRsTipoServizio}_${providers}`;

if (listinoCache.has(cacheKey)) {
  profiles = listinoCache.get(cacheKey) || [];
} else {
  // Chiama GetListino e salva in cache
  const listinoResponse = await this.twtService.getListino(...);
  // ... processa risposta
  listinoCache.set(cacheKey, profiles);
}
```

### 8.3 Filtro Profili (Dopo GetListino)

```typescript
// 1. Escludi per priorita' (EXCLUDE_PROFILES_WITH_PRIORITY)
if (excludeProfilePriorities.includes(option.Priorita)) return;

// 2. Filtro per prefisso descrizione (PROFILE_DESCRIPTION_PREFIX)
if (profileDescriptionPrefixes.length > 0) {
  const matchesPrefix = profileDescriptionPrefixes.some(prefix =>
    option.Descrizione?.startsWith(prefix)
  );
  if (!matchesPrefix) return;
}

// 3. Escludi per keyword (EXCLUDE_PROFILES_BY_KEYWORD)
if (excludeProfileKeywords.length > 0) {
  const containsExcludedKeyword = excludeProfileKeywords.some(keyword =>
    option.Descrizione?.includes(keyword)
  );
  if (containsExcludedKeyword) return;
}

// 4. Filtro velocita' per EVDSL/FTTCab
// EVDSL: mostra SOLO profili >= 200 Mbps
// FTTCab normale: mostra SOLO profili < 200 Mbps
if (isEVDSL) {
  return profileSpeed >= 200;
} else if (isFTTCab) {
  return profileSpeed < 200;
}

// 5. Deduplicazione FTTCab: 1 profilo per velocita'
// Preferisce profili con priority < 9999
```

### 8.4 Conversione Velocita' e Markup Prezzo

```typescript
// Conversione da Kbps a Mbps
downloadSpeed: option.Pcrdown ? Math.round(option.Pcrdown / 1024) : 0,
uploadSpeed: option.Pcrup ? Math.round(option.Pcrup / 1024) : 0,

// Markup prezzo retail
monthlyCost: Number(option.Canone) + retailPriceMarkup,
```

---

## 9. Struttura Frontend

### 9.1 Struttura Directory

```
frontend/src/
├── api/
│   ├── client.ts             # Axios instance configurato
│   └── coverage.ts           # API client functions
├── types/
│   └── api.ts                # TypeScript interfaces
├── hooks/
│   ├── useCoverage.ts        # React Query hooks
│   └── useDebounce.ts        # Debounce hook
└── components/coverage/
    ├── AddressAutocomplete.tsx    # Componente ricerca indirizzo
    ├── CoverageResults.tsx        # Componente risultati standard
    └── WidgetCoverageResults.tsx  # Componente widget ottimizzato
```

### 9.2 API Client (`frontend/src/api/coverage.ts`)

```typescript
import { apiClient } from './client';
import type { City, Street, Civic, CoverageHeader, CoverageService } from '../types/api';

export const coverageApi = {
  // Get cities by query
  getCities: async (query: string): Promise<City[]> => {
    const response = await apiClient.get('/coverage/cities', {
      params: { query },
    });
    return response.data?.data || [];
  },

  // Get streets by query and cityId
  getStreets: async (query: string, cityId: string): Promise<Street[]> => {
    const response = await apiClient.get('/coverage/streets', {
      params: { query, cityId },
    });
    return response.data?.data || [];
  },

  // Get civics by addressId
  getCivics: async (addressId: string): Promise<Civic[]> => {
    const response = await apiClient.get('/coverage/civics', {
      params: { addressId },
    });
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
    return response.data?.data || [];
  },

  // Get coverage services (PRINCIPALE)
  getServices: async (
    headersId: number[],
    cityEgon: string,
    addressEgon: string,
    mainEgon: string,
    streetNumber: string
  ): Promise<CoverageService[]> => {
    const response = await apiClient.get('/coverage/services', {
      params: {
        headersId,
        cityEgon,
        addressEgon,
        mainEgon,
        streetNumber,
      },
    });
    return response.data?.data || [];
  },

  // Geocode address to get coordinates
  geocode: async (
    address: string,
    city: string,
    province: string
  ): Promise<[number, number] | null> => {
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

  // Get UI configuration
  getConfig: async (): Promise<{ profileTable: { visibleColumns: string[] } }> => {
    const response = await apiClient.get('/coverage/config');
    return response.data || {
      profileTable: {
        visibleColumns: ['description', 'speed', 'provider', 'monthlyCost', 'activationCost']
      }
    };
  },
};
```

### 9.3 TypeScript Interfaces (`frontend/src/types/api.ts`)

```typescript
export interface City {
  id: string;
  name: string;
  province: string;
  egonCode: string;
}

export interface Street {
  id: string;
  name: string;       // "VIA ROMA" (concatenato)
  street: string;     // "VIA", "CORSO", etc.
  address: string;    // "ROMA", "GARIBALDI", etc.
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
  profiles?: SpeedProfile[];
}

export interface SelectedAddress {
  cityId: string;
  cityName: string;
  province: string;
  cityEgon: string;
  streetId: string;
  streetName: string;
  street: string;
  address: string;
  addressEgon: string;
  civic: string;
  addressId: string;
  mainEgon: string;
  headersId: string[];
  coordinates?: [number, number];
}
```

### 9.4 React Query Hooks (`frontend/src/hooks/useCoverage.ts`)

```typescript
import { useQuery } from '@tanstack/react-query';
import { coverageApi } from '../api/coverage';

export const useCities = (query: string) => {
  return useQuery({
    queryKey: ['cities', query],
    queryFn: () => coverageApi.getCities(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minuti
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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useConfig = () => {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => coverageApi.getConfig(),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
```

---

## 10. Flusso Completo della Richiesta

### Diagramma del Flusso

```
STEP 1: Utente digita citta' in AddressAutocomplete
  |-- Frontend: setCityQuery("Mil")
  |-- Debounce 400ms
  |-- useCities hook attivato (query.length >= 2)
  '-- HTTP GET /coverage/cities?query=Mil

STEP 2: Backend riceve GET /coverage/cities
  |-- CoverageController.getCities() con CityQueryDto
  |-- Chiama twtService.getCities("Mil")
  |-- TwtService effettua Basic Auth
  '-- HTTP GET https://reseller.twt.it/api/xdsl/Toponomastica/GetCities?query=Mil

STEP 3: TWT API risponde con array CityResult
  |-- Contenente CodiceEgon (necessario per prossimi step)
  |-- Controller trasforma risposta nel formato frontend
  '-- Risposta: { success: true, data: [...], errors: [] }

STEP 4: Frontend riceve citta', utente seleziona "MILANO"
  |-- setSelectedCity(milanoObject)
  |-- Frontend passa cityId al useStreets hook
  '-- HTTP GET /coverage/streets?query=&cityId=38000002491

STEP 5: Utente digita via "VES"
  |-- setStreetQuery("VES")
  |-- Debounce 400ms
  |-- useStreets hook attivato
  '-- HTTP GET /coverage/streets?query=VES&cityId=38000002491

STEP 6: Backend riceve richiesta vie
  |-- twtService.getStreets("VES", 38000002491)
  |-- TWT API GetAddressesByCity
  '-- Ritorna via con AddressId e CodiceEgon

STEP 7: Utente seleziona "VIA VESPRI SICILIANI"
  |-- setSelectedStreet(viaObject)
  |-- useCivics hook attivato
  '-- HTTP GET /coverage/civics?addressId=38000053701

STEP 8: Backend ottiene civici
  |-- twtService.getCivics(38000053701)
  |-- TWT API GetStreetNumberByAddress
  '-- Array di civici disponibili

STEP 9: Utente seleziona civico "12"
  |-- setSelectedCivic(civicObject)
  |-- onAddressSelected() callback trigger
  |-- Frontend crea SelectedAddress object
  '-- Parent component riceve indirizzo selezionato

STEP 10: Parent component chiama getHeaders
  |-- HTTP GET /coverage/headers?city=MILANO&province=MILANO&address=VESPRI&number=12&street=VIA
  '-- Backend -> TWT GetHeaders API

STEP 11: Backend riceve risposta headers
  |-- Estrae IdHeader e CodiceEgon (MainEgon)
  |-- Ritorna al frontend
  |-- Frontend aggiorna SelectedAddress.mainEgon e .headersId
  '-- Tutti i parametri pronti per GetCoverageServices

STEP 12: Frontend chiama getCoverageServices
  |-- HTTP GET /coverage/services?headersId=17209508&cityEgon=38000002491&...
  '-- Backend -> TWT GetCoverageServices API

STEP 13: Backend riceve risposta copertura servizi
  |-- Applica filtri provider/tecnologia/varianti
  |-- Per ogni servizio dopo filtri:
  |   |-- Estrae BsRsTipoProdotto e BsRsTipoServizio
  |   |-- Chiama getListino per ottenere profili
  |   |-- Filtra profili per priorita'/keyword/velocita'
  |   '-- Aggiunge profili a servizio
  |-- Cache profili per stessi parametri
  '-- Ritorna array servizi con profili al frontend

STEP 14: Frontend riceve servizi con profili
  |-- CoverageResults component visualizza servizi
  |-- Ogni servizio mostra:
  |   |-- Nome, tecnologia, velocita'
  |   |-- Accordion con profili disponibili
  |   '-- Per ogni profilo: descrizione, velocita', provider, costi
  '-- User seleziona profilo desiderato
```

---

## 11. Gestione Errori

### Errori Comuni dalle API TWT

```typescript
// Errore 401: Credenziali non valide
if (error.response?.status === 401) {
  // Controllare TWT_API_USERNAME e TWT_API_PASSWORD
}

// Errore 400: Parametri non validi
if (error.response?.status === 400) {
  // Controllare formato parametri (query minimo 2 caratteri, etc.)
}

// Errore 404: Indirizzo non trovato
if (error.response?.status === 404) {
  // Nessun header trovato per questo indirizzo
}

// Errore 500: Errore server TWT
if (error.response?.status === 500) {
  // Retry dopo delay
}

// Timeout (30 secondi)
if (error.code === 'ECONNABORTED') {
  // Verificare connettivita' e TWT_API_BASE_URL
}
```

### Gestione Errori nel Controller

```typescript
try {
  const response = await this.twtService.getCoverageServices(...);
  return {
    success: response.Success,
    data: servicesWithProfiles,
    errors: response.Errors || [],
  };
} catch (error) {
  this.logger.error('Error fetching coverage:', error);
  throw new HttpException(
    {
      message: 'Errore nel recupero della copertura',
      details: error.message,
    },
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
```

### Gestione Errori nel Frontend

```typescript
const { data, isLoading, isError, error } = useServices(
  headersId,
  cityEgon,
  addressEgon,
  mainEgon,
  streetNumber
);

if (isError) {
  console.error('Errore verifica copertura:', error);
  // Mostra messaggio utente
}
```

---

## 12. Ottimizzazioni Implementate

### 12.1 Caching React Query

- **staleTime 5 minuti**: Dati cached per 5 minuti prima di refetch
- **Infinity per config**: Configurazione UI raramente cambia
- **Disabilitazione refetch automatico**: Per servizi copertura

### 12.2 Debounce Input

- **400ms debounce**: Prima di eseguire ricerche autocomplete
- Riduce chiamate API durante la digitazione

### 12.3 Caching GetListino Backend

- **Map in memoria**: Evita chiamate duplicate con stessi parametri
- Chiave cache: `${BsRsTipoProdotto}_${BsRsTipoServizio}_${providers}`

### 12.4 Validazione Strict

- Tutti i parametri validati prima di chiamare GetServices
- DTOs con decoratori class-validator

### 12.5 Conversione Unita'

- Velocita' convertita da Kbps a Mbps nel controller
- Prezzi con markup retail calcolato server-side

### 12.6 Deduplicazione Profili FTTCab

- 1 profilo per velocita'
- Preferenza per profili con priority < 9999

### 12.7 Filtri Multi-livello

- Provider, tecnologia, varianti lato servizio
- Priority, prefisso, keyword lato profili

---

## 13. Checklist per Replicazione

### Backend

- [ ] Installare dipendenze: `@nestjs/axios`, `@nestjs/config`, `class-validator`, `class-transformer`, `@nestjs/swagger`
- [ ] Creare file `.env` con tutte le variabili TWT
- [ ] Creare cartella `modules/twt/` con:
  - [ ] `twt.module.ts`
  - [ ] `twt.service.ts`
  - [ ] `interfaces/twt-api-response.interface.ts`
  - [ ] `interfaces/index.ts`
  - [ ] `dto/city-query.dto.ts`
  - [ ] `dto/street-query.dto.ts`
  - [ ] `dto/civic-query.dto.ts`
  - [ ] `dto/headers-query.dto.ts`
  - [ ] `dto/coverage-query.dto.ts`
  - [ ] `dto/index.ts`
- [ ] Creare cartella `modules/coverage/` con:
  - [ ] `coverage.module.ts`
  - [ ] `coverage.controller.ts`
- [ ] Importare `CoverageModule` in `AppModule`
- [ ] Configurare CORS per frontend

### Frontend

- [ ] Installare dipendenze: `axios`, `@tanstack/react-query`
- [ ] Creare `api/client.ts` con Axios instance
- [ ] Creare `api/coverage.ts` con API functions
- [ ] Creare `types/api.ts` con TypeScript interfaces
- [ ] Creare `hooks/useCoverage.ts` con React Query hooks
- [ ] Creare `hooks/useDebounce.ts` per debounce input
- [ ] Creare componenti UI per ricerca indirizzo e visualizzazione risultati

### Testing

- [ ] Testare flusso completo: citta' -> strade -> civici -> copertura
- [ ] Verificare filtri (provider, tecnologia, varianti, profili)
- [ ] Testare gestione errori (401, 400, 404, timeout)
- [ ] Verificare performance (caching, debounce)
- [ ] Testare con diversi indirizzi e configurazioni filtri

### Configurazione Filtri Consigliata

Per mostrare solo servizi TIM con FTTC/FTTH escludendo varianti Lite:

```bash
TWT_PROVIDER_FILTER=10
TWT_TECHNOLOGY_FILTER=FTTC,FTTH
TWT_EXCLUDE_VARIANTS=Lite
EXCLUDE_PROFILES_WITH_PRIORITY=9999
PROFILE_DESCRIPTION_PREFIX=TWT_TI
```

---

## Note Finali

Questa documentazione riflette l'implementazione completa dell'integrazione TWT per la verifica copertura nel progetto Partner Dashboard. Per qualsiasi chiarimento o aggiornamento, fare riferimento ai file sorgente nella directory del progetto.

**File di riferimento principali**:
- Backend: `/backend/src/modules/twt/` e `/backend/src/modules/coverage/`
- Frontend: `/frontend/src/api/`, `/frontend/src/hooks/`, `/frontend/src/types/`
- Configurazione: `/backend/.env.example`
