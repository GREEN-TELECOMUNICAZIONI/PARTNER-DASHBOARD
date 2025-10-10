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
  private readonly technologyFilter: string[];
  private readonly includeVariants: string[];
  private readonly excludeVariants: string[];
  private readonly excludeProfilePriorities: number[];
  private readonly profileDescriptionPrefixes: string[];
  private readonly excludeProfileKeywords: string[];
  private readonly retailPriceMarkup: number;

  constructor(
    private readonly twtService: TwtService,
    private readonly configService: ConfigService,
  ) {
    // Parse provider filter from environment variable
    const filterString = this.configService.get<string>('TWT_PROVIDER_FILTER', '');
    this.providerFilter = filterString
      ? filterString.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id))
      : [];

    // Parse technology filter from environment variable
    const techFilterString = this.configService.get<string>('TWT_TECHNOLOGY_FILTER', '');
    this.technologyFilter = techFilterString
      ? techFilterString.split(',').map(tech => tech.trim().toUpperCase())
      : [];

    // Parse include variants from environment variable
    const includeString = this.configService.get<string>('TWT_INCLUDE_VARIANTS', '');
    this.includeVariants = includeString
      ? includeString.split(',').map(variant => variant.trim())
      : [];

    // Parse exclude variants from environment variable
    const excludeString = this.configService.get<string>('TWT_EXCLUDE_VARIANTS', '');
    this.excludeVariants = excludeString
      ? excludeString.split(',').map(variant => variant.trim())
      : [];

    // Parse exclude profile priorities from environment variable
    const excludePrioritiesString = this.configService.get<string>('EXCLUDE_PROFILES_WITH_PRIORITY', '');
    this.excludeProfilePriorities = excludePrioritiesString
      ? excludePrioritiesString.split(',').map(priority => parseInt(priority.trim(), 10)).filter(p => !isNaN(p))
      : [];

    // Parse profile description prefixes from environment variable
    const prefixesString = this.configService.get<string>('PROFILE_DESCRIPTION_PREFIX', '');
    this.profileDescriptionPrefixes = prefixesString
      ? prefixesString.split(',').map(prefix => prefix.trim())
      : [];

    // Parse exclude profile keywords from environment variable
    const excludeKeywordsString = this.configService.get<string>('EXCLUDE_PROFILES_BY_KEYWORD', '');
    this.excludeProfileKeywords = excludeKeywordsString
      ? excludeKeywordsString.split(',').map(keyword => keyword.trim())
      : [];

    // Log active filters
    if (this.providerFilter.length > 0) {
      this.logger.log(`Provider filter active: ${this.providerFilter.join(', ')}`);
    } else {
      this.logger.log('No provider filter - showing all providers');
    }

    if (this.technologyFilter.length > 0) {
      this.logger.log(`Technology filter active: ${this.technologyFilter.join(', ')}`);
    } else {
      this.logger.log('No technology filter - showing all technologies');
    }

    if (this.includeVariants.length > 0) {
      this.logger.log(`Including ONLY variants: ${this.includeVariants.join(', ')}`);
    } else {
      this.logger.log('No variant inclusion filter - all variants allowed');
    }

    if (this.excludeVariants.length > 0) {
      this.logger.log(`Excluding variants: ${this.excludeVariants.join(', ')}`);
    } else {
      this.logger.log('No variant exclusions');
    }

    if (this.excludeProfilePriorities.length > 0) {
      this.logger.log(`Excluding profiles with priority: ${this.excludeProfilePriorities.join(', ')}`);
    } else {
      this.logger.log('No profile priority exclusions');
    }

    if (this.profileDescriptionPrefixes.length > 0) {
      this.logger.log(`Filtering profiles by description prefix: ${this.profileDescriptionPrefixes.join(', ')}`);
    } else {
      this.logger.log('No profile description prefix filter - showing all profiles');
    }

    if (this.excludeProfileKeywords.length > 0) {
      this.logger.log(`Excluding profiles with keywords: ${this.excludeProfileKeywords.join(', ')}`);
    } else {
      this.logger.log('No profile keyword exclusions');
    }

    // Parse retail price markup from environment variable
    const markupString = this.configService.get<string>('RETAIL_PRICE_MARKUP', '0');
    this.retailPriceMarkup = parseFloat(markupString) || 0;
    if (this.retailPriceMarkup > 0) {
      this.logger.log(`Retail price markup active: +${this.retailPriceMarkup}€`);
    } else {
      this.logger.log('No retail price markup - showing wholesale prices');
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
    // Filtra solo servizi con StatusCoverage=true, selezionabili, provider e tecnologia configurati
    const availableServices = response.Body?.AvailabilityReports?.filter(
      (service) => {
        const serviceName = service.ServiceName || '';

        // Verifica che il servizio sia disponibile e selezionabile
        if (!service.StatusCoverage || !service.Selectable) return false;

        // Se c'è un filtro provider, verifica che almeno uno dei provider corrisponda
        if (this.providerFilter.length > 0) {
          const hasMatchingProvider = service.Providers?.some(provider =>
            this.providerFilter.includes(provider.Id)
          );
          if (!hasMatchingProvider) return false;
        }

        // Filtro tecnologia: controlla se ServiceName contiene una delle tecnologie consentite
        if (this.technologyFilter.length > 0) {
          const serviceNameUpper = serviceName.toUpperCase();
          const hasTechnology = this.technologyFilter.some(tech =>
            serviceNameUpper.includes(tech)
          );
          if (!hasTechnology) return false;
        }

        // Include SOLO varianti specificate (se configurato)
        // Se TWT_INCLUDE_VARIANTS è impostato, il servizio DEVE contenere almeno una keyword
        if (this.includeVariants.length > 0) {
          const hasIncludedVariant = this.includeVariants.some(variant =>
            serviceName.includes(variant)
          );
          if (!hasIncludedVariant) return false;
        }

        // Escludi varianti: controlla se ServiceName contiene keyword da escludere
        // EXCLUDE ha priorità su INCLUDE (se un servizio passa INCLUDE ma è in EXCLUDE, viene escluso)
        if (this.excludeVariants.length > 0) {
          const hasExcludedVariant = this.excludeVariants.some(variant =>
            serviceName.includes(variant)
          );
          if (hasExcludedVariant) return false;
        }

        // Tutti i filtri passati
        return true;
      }
    ) || [];

    this.logger.log(
      `Filtered services: ${availableServices.length} out of ${response.Body?.AvailabilityReports?.length || 0} total services`
    );

    // Raggruppa servizi per BsRsTipoProdotto+BsRsTipoServizio+Provider per ottimizzare chiamate GetListino
    // Servizi con stessi parametri riceveranno gli stessi profili dall'API
    const listinoCache: Map<string, any[]> = new Map();

    // Per ogni servizio disponibile, ottieni i profili dal listino
    const servicesWithProfiles = await Promise.all(
      availableServices.map(async (service) => {
        let profiles: any[] = [];

        try {
          // Prepara i fornitori per la chiamata GetListino
          // Filtra i provider basandosi sul filtro configurato
          let providersForListino = service.Providers?.map(provider => ({
            IdFornitore: provider.Id,
            SpeedLimit: provider.SpeedLimit,
          })) || [];

          // Applica il filtro provider se configurato
          if (this.providerFilter.length > 0) {
            providersForListino = providersForListino.filter(provider =>
              this.providerFilter.includes(provider.IdFornitore)
            );
          }

          // Chiama GetListino solo se ci sono fornitori e i dati necessari
          if (providersForListino.length > 0 && service.BsRsTipoProdotto && service.BsRsTipoServizio) {
            // Crea chiave di cache basata su parametri GetListino
            const cacheKey = `${service.BsRsTipoProdotto}_${service.BsRsTipoServizio}_${providersForListino.map(p => `${p.IdFornitore}_${p.SpeedLimit}`).join('_')}`;

            // Verifica se abbiamo già fatto questa chiamata GetListino
            if (listinoCache.has(cacheKey)) {
              this.logger.log(
                `Using cached profiles for service "${service.ServiceName}" (ServiceId: ${service.ServiceId}) - same BsRsTipoProdotto/BsRsTipoServizio as previous service`
              );
              profiles = listinoCache.get(cacheKey) || [];
            } else {
              this.logger.log(
                `Fetching profiles for service "${service.ServiceName}" (ServiceId: ${service.ServiceId}) - BsRsTipoProdotto: ${service.BsRsTipoProdotto}, BsRsTipoServizio: ${service.BsRsTipoServizio}, Providers: [${providersForListino.map(p => p.IdFornitore).join(', ')}]`
              );

              const listinoResponse = await this.twtService.getListino(
                providersForListino,
                service.BsRsTipoProdotto,
                service.BsRsTipoServizio,
              );

              // Estrai i profili dai prodotti
              if (listinoResponse.Success && listinoResponse.Body?.Products) {
                listinoResponse.Body.Products.forEach(product => {
                  // Ogni opzione rappresenta un profilo di velocità
                  product.Opzioni?.forEach(option => {
                  // Skip profiles with excluded priorities
                  if (this.excludeProfilePriorities.length > 0 &&
                      this.excludeProfilePriorities.includes(option.Priorita)) {
                    return; // Skip this profile
                  }

                  // Filter profiles by description prefix (if configured)
                  if (this.profileDescriptionPrefixes.length > 0) {
                    const matchesPrefix = this.profileDescriptionPrefixes.some(prefix =>
                      option.Descrizione?.startsWith(prefix)
                    );
                    if (!matchesPrefix) {
                      return; // Skip this profile
                    }
                  }

                  // Exclude profiles by keywords in description
                  if (this.excludeProfileKeywords.length > 0) {
                    const containsExcludedKeyword = this.excludeProfileKeywords.some(keyword =>
                      option.Descrizione?.includes(keyword)
                    );
                    if (containsExcludedKeyword) {
                      return; // Skip this profile
                    }
                  }

                    profiles.push({
                      id: option.IDOpzione.toString(),
                      productId: product.IDProdotto.toString(),
                      description: option.Descrizione,
                      downloadSpeed: option.Pcrdown ? Math.round(option.Pcrdown / 1024) : 0, // Converti da Kbps a Mbps
                      uploadSpeed: option.Pcrup ? Math.round(option.Pcrup / 1024) : 0,
                      providerId: product.IdFornitore,
                      providerName: this.getProviderName(product.IdFornitore),
                      activationCost: option.Attivazione,
                      monthlyCost: Number(option.Canone) + this.retailPriceMarkup,
                      priority: option.Priorita,
                    });
                  });
                });

                // Filtra profili in base alla variante del servizio
                // EVDSL = solo profili >= 200 Mbps
                // FTTCab normale = tutti profili ECCETTO >= 200 Mbps (quindi 10, 30, 50, 100 Mb)
                const isEVDSL = service.ServiceName.toUpperCase().includes('EVDSL');
                const isFTTCab = service.ServiceName.toUpperCase().includes('FTTCAB') && !isEVDSL;

                if (isEVDSL || isFTTCab) {
                  const beforeFilter = profiles.length;

                  profiles = profiles.filter(profile => {
                    // Estrai la velocità dalla descrizione del profilo
                    // Es: "TWT_TI FTTCab 200 Mb/20 Mb" -> 200
                    const speedMatch = profile.description.match(/(\d+)\s*(?:Gb|Mb)/i);
                    if (!speedMatch) return true; // Mantieni profili senza velocità riconoscibile

                    let profileSpeed = parseInt(speedMatch[1]);
                    // Se la velocità è in Gb, converti in Mb
                    if (speedMatch[0].toLowerCase().includes('gb')) {
                      profileSpeed *= 1000;
                    }

                    // EVDSL: mostra SOLO profili >= 200 Mbps
                    // FTTCab normale: mostra tutti profili < 200 Mbps
                    if (isEVDSL) {
                      return profileSpeed >= 200;
                    } else {
                      return profileSpeed < 200;
                    }
                  });

                  if (beforeFilter !== profiles.length) {
                    this.logger.log(
                      `Filtered profiles for ${service.ServiceName} (${isEVDSL ? 'EVDSL >= 200M' : 'FTTCab < 200M'}): ${profiles.length}/${beforeFilter} profiles shown`
                    );
                  }
                }

                // Per FTTCab, mostra solo 1 profilo per velocità
                // Preferisce profili con priority < 9999, ma accetta 9999 se è l'unica opzione
                if (isFTTCab && profiles.length > 0) {
                  const beforeDedup = profiles.length;
                  const profilesBySpeed = new Map<number, typeof profiles[0]>();

                  profiles.forEach(profile => {
                    const speedMatch = profile.description.match(/(\d+)\s*(?:Gb|Mb)/i);
                    if (speedMatch) {
                      let speed = parseInt(speedMatch[1]);
                      if (speedMatch[0].toLowerCase().includes('gb')) {
                        speed *= 1000;
                      }

                      const existing = profilesBySpeed.get(speed);

                      if (!existing) {
                        // Nessun profilo per questa velocità, aggiungi questo
                        profilesBySpeed.set(speed, profile);
                      } else {
                        // Esiste già un profilo per questa velocità
                        const existingIs9999 = existing.priority >= 9999;
                        const currentIs9999 = profile.priority >= 9999;

                        // Se l'esistente è 9999 e il corrente no, sostituisci
                        if (existingIs9999 && !currentIs9999) {
                          profilesBySpeed.set(speed, profile);
                        }
                        // Se entrambi non sono 9999, o entrambi sono 9999, prendi quello con priority più bassa
                        else if (existingIs9999 === currentIs9999 && profile.priority < existing.priority) {
                          profilesBySpeed.set(speed, profile);
                        }
                      }
                    }
                  });

                  profiles = Array.from(profilesBySpeed.values());

                  if (beforeDedup !== profiles.length) {
                    this.logger.log(
                      `Deduplicated FTTCab profiles by speed: ${profiles.length}/${beforeDedup} profiles shown (1 per speed, prefer priority < 9999)`
                    );
                  }
                }

                this.logger.log(
                  `Found ${profiles.length} profiles for service ${service.ServiceName}`
                );

                // Salva nella cache per servizi futuri con stessi parametri
                listinoCache.set(cacheKey, profiles);
              }
            }
          }
        } catch (error) {
          this.logger.warn(
            `Failed to fetch listino for service ${service.ServiceName}: ${error.message}`
          );
        }

        return {
          serviceId: service.ServiceId.toString(),
          name: service.ServiceName,
          description: service.ServiceDescription,
          downloadSpeed: service.SpeedDown || service.MaxSpeedValue || 0,
          uploadSpeed: service.SpeedUp || service.MaxSpeedValue || 0,
          technology: service.ConnectionType,
          available: service.StatusCoverage,
          maxSpeed: service.MaxSpeed,
          connectionElement: service.ConnectionElementName,
          connectionElementDetail: service.ConnectionElementDetail,
          distance: service.Distance,
          // Dettagli completi per tutti i profili/provider disponibili
          providers: service.Providers?.map(provider => ({
            id: provider.Id,
            name: this.getProviderName(provider.Id),
            alarm: provider.Alarm,
            notes: provider.Notes,
            speedLimit: provider.SpeedLimit,
            hasMultipleConnection: provider.HasMultipleConnection,
            coverageDetails: provider.CoverageDetails,
          })) || [],
          // NUOVO: Array di profili di velocità disponibili
          profiles: profiles,
          // Informazioni tecniche aggiuntive
          serviceTypeId: service.ServiceTypeId,
          coverageId: service.CoverageId,
          bsRsTipoServizio: service.BsRsTipoServizio,
          bsRsTipoProdotto: service.BsRsTipoProdotto,
          alarm: service.Alarm,
          selectable: service.Selectable,
          planned: service.Planned,
        };
      })
    );

    return {
      success: response.Success,
      data: servicesWithProfiles,
      errors: response.Errors || [],
    };
  }

  /**
   * Helper per ottenere il nome del provider dall'ID
   */
  private getProviderName(providerId: number): string {
    const providerNames = {
      10: 'TIM',
      20: 'Fastweb',
      30: 'Altri',
      160: 'FWA EW',
    };
    return providerNames[providerId] || `Provider ${providerId}`;
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
   * GET /api/coverage/config
   * Restituisce la configurazione dell'interfaccia utente
   */
  @Get('config')
  @ApiOperation({
    summary: 'UI Configuration',
    description: 'Restituisce la configurazione per l\'interfaccia utente',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurazione UI',
  })
  getConfig() {
    const columnsString = this.configService.get<string>('PROFILE_TABLE_COLUMNS', 'all');
    const columns = columnsString === 'all' || !columnsString
      ? ['description', 'speed', 'provider', 'monthlyCost', 'activationCost']
      : columnsString.split(',').map(col => col.trim());

    return {
      profileTable: {
        visibleColumns: columns,
      },
    };
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
