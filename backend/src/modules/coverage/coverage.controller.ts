import { Controller, Get, Query, ValidationPipe, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { TwtService } from '../twt/twt.service';
import {
  CityQueryDto,
  StreetQueryDto,
  CivicQueryDto,
  HeadersQueryDto,
  CoverageQueryDto,
} from '../twt/dto';

/**
 * Controller per la gestione delle verifiche di copertura
 * Espone endpoints REST per la verifica della disponibilità dei servizi TWT
 */
@ApiTags('Coverage')
@Controller('api/coverage')
export class CoverageController {
  private readonly logger = new Logger(CoverageController.name);
  private readonly providerFilter: number[];

  constructor(
    private readonly twtService: TwtService,
    private readonly configService: ConfigService,
  ) {
    // Parse provider filter from environment variable
    const filterString = this.configService.get<string>('TWT_PROVIDER_FILTER', '');
    this.providerFilter = filterString
      ? filterString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      : [];

    if (this.providerFilter.length > 0) {
      this.logger.log(`Provider filter active: ${this.providerFilter.join(', ')}`);
    } else {
      this.logger.log('No provider filter - showing all providers');
    }
  }

  /**
   * GET /api/coverage/cities
   * Cerca città per nome o parte del nome
   */
  @Get('cities')
  @ApiOperation({
    summary: 'Cerca città',
    description:
      'Restituisce le città che corrispondono alla query (minimo 2 caratteri)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista delle città trovate',
  })
  @ApiResponse({
    status: 400,
    description: 'Query non valida (minimo 2 caratteri richiesti)',
  })
  async getCities(@Query(ValidationPipe) queryDto: CityQueryDto) {
    this.logger.log(`Searching cities with query: ${queryDto.query}`);
    const response = await this.twtService.getCities(queryDto.query);

    // Trasforma la risposta TWT nel formato atteso dal frontend
    return {
      success: response.Success,
      data: response.Body?.map((city) => ({
        id: city.IdCity.toString(),
        name: city.Name,
        province: city.Province,
        egonCode: city.CodiceEgon.toString(), // Necessario per GetCoverageServices
      })) || [],
      errors: response.Errors || [],
    };
  }

  /**
   * GET /api/coverage/streets
   * Cerca strade/indirizzi per città
   */
  @Get('streets')
  @ApiOperation({
    summary: 'Cerca strade per città',
    description:
      'Restituisce gli indirizzi che corrispondono alla query nella città specificata',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista degli indirizzi trovati',
  })
  @ApiResponse({
    status: 400,
    description: 'Parametri non validi',
  })
  async getStreets(@Query(ValidationPipe) queryDto: StreetQueryDto) {
    this.logger.log(
      `Searching streets with query: ${queryDto.query}, cityId: ${queryDto.cityId}`,
    );
    const response = await this.twtService.getStreets(queryDto.query, queryDto.cityId);

    // Trasforma la risposta TWT nel formato atteso dal frontend
    return {
      success: response.Success,
      data: response.Body?.map((street) => ({
        id: street.IdAddress.toString(),
        name: `${street.Street} ${street.Name}`, // es: "VIA GARIBALDI"
        street: street.Street, // "VIA", "CORSO", etc.
        address: street.Name, // "GARIBALDI", "ROMA", etc.
        egonCode: street.CodiceEgon.toString(), // Necessario per GetCoverageServices
        cityId: queryDto.cityId.toString(),
      })) || [],
      errors: response.Errors || [],
    };
  }

  /**
   * GET /api/coverage/civics
   * Cerca civici per indirizzo
   */
  @Get('civics')
  @ApiOperation({
    summary: 'Cerca civici per indirizzo',
    description: "Restituisce i civici disponibili per l'indirizzo specificato",
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dei civici trovati',
  })
  @ApiResponse({
    status: 400,
    description: 'Parametri non validi',
  })
  async getCivics(@Query(ValidationPipe) queryDto: CivicQueryDto) {
    this.logger.log(
      `Searching civics for addressId: ${queryDto.addressId}, query: ${queryDto.query || 'all'}`,
    );
    const response = await this.twtService.getCivics(queryDto.addressId, queryDto.query);

    // Trasforma la risposta TWT nel formato atteso dal frontend
    return {
      success: response.Success,
      data: response.Body?.map((civic) => ({
        civic: civic.Number,
        addressId: queryDto.addressId.toString(),
      })) || [],
      errors: response.Errors || [],
    };
  }

  /**
   * GET /api/coverage/headers
   * Ottiene gli header ID necessari per verificare la copertura
   */
  @Get('headers')
  @ApiOperation({
    summary: 'Ottieni header ID',
    description:
      'Restituisce gli header ID necessari per verificare la copertura dei servizi',
  })
  @ApiResponse({
    status: 200,
    description: 'Header ID trovati',
  })
  @ApiResponse({
    status: 400,
    description: 'Parametri non validi',
  })
  @ApiResponse({
    status: 404,
    description: 'Indirizzo non trovato',
  })
  async getHeaders(@Query(ValidationPipe) queryDto: HeadersQueryDto) {
    this.logger.log(
      `Getting headers for: ${queryDto.street || ''} ${queryDto.address} ${queryDto.number}, ${queryDto.city}`,
    );
    const response = await this.twtService.getHeaders(
      queryDto.city,
      queryDto.province,
      queryDto.address,
      queryDto.number,
      queryDto.street,
    );

    // Trasforma la risposta TWT nel formato atteso dal frontend
    return {
      success: response.Success,
      data: response.Body?.map((header) => ({
        headerId: header.IdHeader.toString(),
        egonCode: header.CodiceEgon.toString(),
      })) || [],
      errors: response.Errors || [],
    };
  }

  /**
   * GET /api/coverage/services
   * Verifica la copertura dei servizi per un indirizzo
   * FILTRATO per Provider TIM (ID = 10)
   */
  @Get('services')
  @ApiOperation({
    summary: 'Verifica copertura servizi',
    description:
      "Restituisce i servizi di connettività disponibili per l'indirizzo specificato (solo provider TIM)",
  })
  @ApiResponse({
    status: 200,
    description: 'Servizi disponibili (filtrati per provider TIM)',
  })
  @ApiResponse({
    status: 400,
    description: 'Parametri non validi',
  })
  @ApiResponse({
    status: 404,
    description: 'Nessun servizio disponibile',
  })
  async getCoverageServices(@Query(ValidationPipe) queryDto: CoverageQueryDto) {
    this.logger.log(
      `Checking coverage for address with headers: ${queryDto.headersId.join(',')}`,
    );
    const response = await this.twtService.getCoverageServices(
      queryDto.headersId,
      queryDto.cityEgon,
      queryDto.addressEgon,
      queryDto.mainEgon,
      queryDto.streetNumber,
    );

    // Trasforma la risposta TWT nel formato atteso dal frontend
    // Filtra solo servizi con StatusCoverage=true, selezionabili e provider configurato
    const availableServices = response.Body?.AvailabilityReports?.filter(
      (service) => {
        // Verifica che il servizio sia disponibile e selezionabile
        if (!service.StatusCoverage || !service.Selectable) return false;

        // Se c'è un filtro provider, verifica che almeno uno dei provider corrisponda
        if (this.providerFilter.length > 0) {
          const hasMatchingProvider = service.Providers?.some(provider =>
            this.providerFilter.includes(provider.Id)
          );
          return hasMatchingProvider;
        }

        // Nessun filtro: mostra tutti i servizi disponibili e selezionabili
        return true;
      }
    ) || [];

    return {
      success: response.Success,
      data: availableServices.map((service) => ({
        serviceId: service.ServiceId.toString(),
        name: service.ServiceName,
        description: service.ServiceDescription,
        downloadSpeed: service.MaxSpeedValue || 0,
        uploadSpeed: service.MaxSpeedValue || 0, // TWT non specifica upload separato
        technology: service.ConnectionType,
        available: service.StatusCoverage,
        maxSpeed: service.MaxSpeed,
        connectionElement: service.ConnectionElementName,
      })),
      errors: response.Errors || [],
    };
  }

  /**
   * GET /api/coverage/geocode
   * Geocode un indirizzo per ottenere le coordinate
   */
  @Get('geocode')
  @ApiOperation({
    summary: 'Geocode indirizzo',
    description: "Ottiene le coordinate geografiche di un indirizzo",
  })
  @ApiResponse({
    status: 200,
    description: "Coordinate ottenute",
  })
  async geocode(
    @Query('address') address: string,
    @Query('city') city: string,
    @Query('province') province: string,
  ) {
    this.logger.log(`Geocoding: ${address}, ${city}, ${province}`);

    try {
      const query = `${address}, ${city}, ${province}, Italia`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TWT-Partner-Dashboard/1.0',
        },
      });

      const data = await response.json();

      if (data && data.length > 0) {
        return {
          success: true,
          coordinates: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
        };
      }

      return {
        success: false,
        coordinates: null,
      };
    } catch (error) {
      this.logger.error('Geocoding error:', error);
      return {
        success: false,
        coordinates: null,
      };
    }
  }

  /**
   * GET /api/coverage/health
   * Verifica lo stato di salute dell'integrazione TWT
   */
  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: "Verifica lo stato di salute dell'integrazione con le API TWT",
  })
  @ApiResponse({
    status: 200,
    description: "Stato di salute dell'integrazione",
  })
  async healthCheck() {
    this.logger.log('Performing health check');
    return this.twtService.healthCheck();
  }
}
