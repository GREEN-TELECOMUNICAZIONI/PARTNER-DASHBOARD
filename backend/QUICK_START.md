# Quick Start Guide - TWT Partner Dashboard Backend

## Setup Rapido

```bash
# 1. Installa dipendenze (già fatto)
npm install

# 2. Configura environment variables
cp .env.example .env
# Modifica .env con le tue credenziali TWT

# 3. Avvia in development mode
npm run start:dev
```

## Test Rapido API (senza autenticazione TWT)

Dopo aver avviato il server, prova questi endpoints:

### 1. Health Check
```bash
curl http://localhost:3000/api/coverage/health
```

### 2. Swagger UI
Apri nel browser: `http://localhost:3000/api/docs`

## Test con Autenticazione TWT

Una volta configurato il token TWT in `.env`:

### 3. Cerca Città
```bash
curl "http://localhost:3000/api/coverage/cities?query=Milano"
```

### 4. Cerca Strade
```bash
# Usa il cityId ottenuto dalla chiamata precedente
curl "http://localhost:3000/api/coverage/streets?query=Via&cityId=38000002491"
```

### 5. Cerca Civici
```bash
# Usa l'addressId ottenuto dalla chiamata precedente
curl "http://localhost:3000/api/coverage/civics?addressId=38000053701"
```

### 6. Ottieni Headers
```bash
curl "http://localhost:3000/api/coverage/headers?city=MILANO&province=MILANO&street=VIA&address=VESPRI%20SICILIANI&number=12"
```

### 7. Verifica Copertura Servizi (Filtrato TIM)
```bash
curl "http://localhost:3000/api/coverage/services?headersId=17209508&cityEgon=38000002491&addressEgon=38000053701&mainEgon=380100004477903&streetNumber=33"
```

## Struttura Progetto

```
backend/
├── src/
│   ├── common/                    # Utilità globali
│   │   ├── filters/              # Exception filters
│   │   └── interceptors/         # Logging interceptor
│   ├── modules/
│   │   ├── twt/                  # Integrazione TWT API
│   │   │   ├── dto/             # Request validation
│   │   │   ├── interfaces/      # TypeScript interfaces
│   │   │   ├── twt.service.ts   # Business logic
│   │   │   └── twt.module.ts    # Module config
│   │   ├── coverage/            # Coverage endpoints
│   │   │   ├── coverage.controller.ts
│   │   │   └── coverage.module.ts
│   │   └── contracts/           # Placeholder
│   ├── app.module.ts
│   └── main.ts
├── .env                         # Your config
├── .env.example                # Template
└── README.md                   # Full docs
```

## Endpoints Disponibili

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/coverage/cities` | Cerca città |
| GET | `/api/coverage/streets` | Cerca strade |
| GET | `/api/coverage/civics` | Cerca civici |
| GET | `/api/coverage/headers` | Ottieni header ID |
| GET | `/api/coverage/services` | Verifica copertura (TIM) |
| GET | `/api/coverage/health` | Health check |

## Features Principali

- **Validazione Automatica**: class-validator su tutti gli input
- **Error Handling**: Risposte uniformi con dettagli errore
- **Logging**: Console log dettagliati in development
- **Swagger**: Documentazione interattiva su /api/docs
- **CORS**: Abilitato per frontend localhost:5173
- **Filtro TIM**: Solo provider TIM (ID=10) nei risultati copertura

## Prossimi Passi

1. Configura le credenziali TWT in `.env`
2. Testa gli endpoints con Swagger UI
3. Integra il frontend React/Vue/Angular
4. Implementa il modulo Contracts (se necessario)

## Troubleshooting

**Errore: PORT already in use**
```bash
# Cambia porta in .env
PORT=3001
```

**Errore: TWT API connection failed**
- Verifica `TWT_API_TOKEN` in `.env`
- Verifica `TWT_API_AUTH_TYPE` (Bearer o Basic)
- Testa con `/api/coverage/health`

**Errore: CORS**
- Verifica `CORS_ORIGIN` in `.env`
- Default: `http://localhost:5173`
