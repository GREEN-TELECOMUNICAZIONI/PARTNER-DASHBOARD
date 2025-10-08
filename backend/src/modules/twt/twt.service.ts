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
  private readonly timProviderId = 10; // Provider ID TIM da filtrare

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
    if (this.username) {
      this.logger.log(`Using Basic Auth with username: ${this.username}`);
    }
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
   * Restituisce l'elenco delle città che soddisfano la query
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
   * GET /Toponomastica/GetAddressesByCity (alias GetStreets)
   * Restituisce l'elenco degli indirizzi per la città specificata
   * @param query Indirizzo comprensivo della particella (minimo 2 caratteri)
   * @param cityId Codice Egon del Comune
   */
  async getStreets(
    query: string,
    cityId: number,
  ): Promise<TwtApiResponse<StreetResult[]>> {
    try {
      this.logger.debug(
        `Getting streets with query: ${query}, cityId: ${cityId}`,
      );

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
   * GET /Toponomastica/GetStreetNumberByAddress (alias GetCivics)
   * Restituisce l'elenco dei civici per l'indirizzo specificato
   * @param addressId Codice Egon della Via
   * @param query Numero civico (opzionale)
   */
  async getCivics(
    addressId: number,
    query?: string,
  ): Promise<TwtApiResponse<CivicResult[]>> {
    try {
      this.logger.debug(
        `Getting civics for addressId: ${addressId}, query: ${query || 'all'}`,
      );

      const url = `${this.baseUrl}/Toponomastica/GetStreetNumberByAddress`;
      const params: any = {
        addressId,
        query: query || '' // API requires query param (even if empty)
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
   * Restituisce i servizi di connettività disponibili per l'indirizzo
   * FILTRATO per Provider TIM (ID = 10)
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

      // Log numero servizi ricevuti
      if (response.data.Success && response.data.Body) {
        this.logger.debug(
          `Received ${response.data.Body.AvailabilityReports?.length || 0} services from TWT API`,
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
   * @param tipoProdotto Tipologia del prodotto (da BsRsTipoProdotto di GetCoverageServices)
   * @param tipoServizio Tipologia del servizio (da BsRsTipoServizio di GetCoverageServices)
   */
  async getListino(
    providers: { IdFornitore: number; SpeedLimit: number }[],
    tipoProdotto: number,
    tipoServizio: string,
  ): Promise<TwtApiResponse<any>> {
    try {
      this.logger.debug(
        `Getting listino for tipoProdotto: ${tipoProdotto}, tipoServizio: ${tipoServizio}, providers: ${JSON.stringify(providers)}`,
      );

      const url = `${this.baseUrl}/XdslBilling/GetListino`;

      // Costruiamo i parametri per l'array fornitori
      const params: any = {
        levelIds: 1, // Obbligatorio come da documentazione
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
        `Received ${response.data.Body?.Products?.length || 0} products from GetListino`,
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
      // Prova una semplice chiamata per verificare la connettività
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
