# TWT Partner Dashboard - Backend API

Backend NestJS per la dashboard Partner TWT - Verifica copertura servizi xDSL.

## Descrizione

API REST per l'integrazione con le API TWT xDSL, fornendo endpoints per:
- Ricerca toponomastica (città, strade, civici)
- Verifica copertura servizi (filtrato per provider TIM - ID 10)
- Health check dell'integrazione

## Tecnologie

- **NestJS 11.x** - Framework backend progressivo
- **TypeScript** - Type-safe development
- **Axios** - HTTP client per chiamate API TWT
- **class-validator** - Validazione request automatica
- **Swagger/OpenAPI** - Documentazione API interattiva
- **ConfigModule** - Gestione environment variables

## Prerequisiti

- Node.js >= 18.x
- npm >= 9.x

## Installazione

```bash
# Installa le dipendenze
npm install

# Copia il file .env.example
cp .env.example .env

# Configura le variabili d'ambiente in .env
# - TWT_API_TOKEN: Token di autenticazione TWT
# - TWT_API_AUTH_TYPE: Bearer o Basic
```

## Configurazione

Modifica il file `.env` con le tue credenziali TWT:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# TWT API Configuration
TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
TWT_API_TOKEN=your_token_here
TWT_API_AUTH_TYPE=Bearer
```

## Esecuzione

```bash
# Development mode (con hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

L'applicazione sarà disponibile su `http://localhost:3000`

## API Documentation

Swagger UI disponibile su: `http://localhost:3000/api/docs`

### Endpoints Disponibili

#### Coverage API

- `GET /api/coverage/cities?query={query}` - Cerca città
- `GET /api/coverage/streets?query={query}&cityId={id}` - Cerca strade
- `GET /api/coverage/civics?addressId={id}&query={query}` - Cerca civici
- `GET /api/coverage/headers?city={city}&province={province}&address={address}&number={number}&street={street}` - Ottieni header ID
- `GET /api/coverage/services?headersId[]={id}&cityEgon={egon}&addressEgon={egon}&mainEgon={egon}&streetNumber={num}` - Verifica copertura servizi (filtrato per TIM)
- `GET /api/coverage/health` - Health check TWT integration

## Struttura del Progetto

```
backend/
├── src/
│   ├── common/                 # Utilità condivise
│   │   ├── filters/           # Exception filters globali
│   │   ├── interceptors/      # Logging interceptor
│   │   └── guards/            # Guards (future)
│   ├── modules/
│   │   ├── twt/              # Modulo integrazione TWT
│   │   │   ├── dto/          # Data Transfer Objects
│   │   │   ├── interfaces/   # TypeScript interfaces
│   │   │   ├── twt.service.ts
│   │   │   └── twt.module.ts
│   │   ├── coverage/         # Modulo verifica copertura
│   │   │   ├── coverage.controller.ts
│   │   │   └── coverage.module.ts
│   │   └── contracts/        # Modulo contratti (placeholder)
│   ├── app.module.ts         # Modulo principale
│   └── main.ts              # Bootstrap applicazione
├── .env.example             # Template variabili d'ambiente
├── nest-cli.json           # Configurazione NestJS CLI
├── tsconfig.json          # Configurazione TypeScript
└── package.json          # Dipendenze e scripts
```

## Features

### Validazione Request
- Validazione automatica con `class-validator`
- DTOs tipizzati per ogni endpoint
- Trasformazione automatica dei tipi

### Error Handling
- Exception filter globale
- Risposte di errore uniformi
- Logging strutturato

### Logging
- Logger NestJS integrato
- Logging interceptor per development
- Log di tutte le richieste/risposte

### CORS
- Configurabile via environment variables
- Abilitato per frontend locale (default: http://localhost:5173)

### Filtro Provider TIM
- Tutti i servizi sono automaticamente filtrati per Provider ID = 10 (TIM)
- Implementato nel `TwtService.getCoverageServices()`

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## Lint & Format

```bash
# Lint e fix automatico
npm run lint

# Solo check (senza fix)
npm run lint:check

# Format code
npm run format
```

## Build

```bash
# Build per produzione
npm run build

# Output in ./dist
```

## Note Tecniche

### Integrazione TWT API

Il service `TwtService` implementa i seguenti metodi:

- **getCities(query)**: Ricerca città (minimo 2 caratteri)
- **getStreets(query, cityId)**: Ricerca strade per città
- **getCivics(addressId, query?)**: Ricerca civici per indirizzo
- **getHeaders(city, province, address, number, street?)**: Ottieni header ID
- **getCoverageServices(...)**: Verifica copertura (filtrato TIM)
- **healthCheck()**: Verifica connettività API TWT

### Provider TIM Filter

Il filtro per il provider TIM (ID = 10) è implementato in `twt.service.ts` nel metodo `getCoverageServices()`:

```typescript
const filteredReports = response.data.Body.AvailabilityReports.map(report => ({
  ...report,
  Providers: report.Providers.filter(provider => provider.Id === 10),
})).filter(report => report.Providers.length > 0);
```

### Autenticazione TWT

Supporta due tipi di autenticazione:
- **Bearer Token**: `TWT_API_AUTH_TYPE=Bearer`
- **Basic Auth**: `TWT_API_AUTH_TYPE=Basic` (token deve essere base64 encoded)

## Troubleshooting

### Errore: Cannot connect to TWT API
- Verifica che `TWT_API_TOKEN` sia configurato correttamente
- Controlla che `TWT_API_BASE_URL` sia corretto
- Verifica la connettività di rete

### Errore: Validation failed
- Assicurati che i parametri rispettino i vincoli dei DTO
- Consulta la documentazione Swagger per i parametri richiesti

### CORS errors dal frontend
- Verifica che `CORS_ORIGIN` punti all'URL corretto del frontend
- Controlla che il frontend stia usando l'URL corretto del backend

## Roadmap

- [ ] Implementazione modulo Contracts (gestione contratti)
- [ ] Autenticazione JWT per proteggere le API
- [ ] Rate limiting per le chiamate API
- [ ] Caching delle risposte TWT (Redis)
- [ ] Metriche e monitoring (Prometheus)
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

UNLICENSED - Proprietà TWT Partner Team
