# Getting Started - TWT Partner Dashboard Frontend

## Quick Start

### 1. Installazione

```bash
npm install
```

### 2. Configurazione

Crea il file `.env`:

```bash
cp .env.example .env
```

Il file `.env` contiene:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Avvio

```bash
npm run dev
```

L'applicazione sarà disponibile su: http://localhost:5173

## Prerequisiti

Assicurati che il backend NestJS sia in esecuzione su `http://localhost:3000`

## Struttura Cartelle

```
frontend/
├── public/                 # Asset statici
├── src/
│   ├── api/               # Client API e configurazione Axios
│   │   ├── client.ts      # Configurazione Axios con interceptors
│   │   └── coverage.ts    # API endpoints per copertura
│   │
│   ├── components/
│   │   ├── coverage/      # Componenti verifica copertura
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   ├── CoverageResults.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── MapView.tsx
│   │   ├── dashboard/     # Componenti dashboard
│   │   │   └── DashboardCard.tsx
│   │   └── layout/        # Layout e navigazione
│   │       └── Layout.tsx
│   │
│   ├── hooks/             # Custom React hooks
│   │   └── useCoverage.ts # Hooks per React Query
│   │
│   ├── pages/             # Pagine dell'applicazione
│   │   ├── Dashboard.tsx
│   │   ├── NuovoContratto.tsx
│   │   └── VerificaCopertura.tsx
│   │
│   ├── theme/             # Configurazione tema MUI
│   │   └── theme.ts
│   │
│   ├── types/             # TypeScript types
│   │   └── api.ts
│   │
│   ├── App.tsx            # Root component con routing
│   └── main.tsx           # Entry point
│
├── .env.example           # Template variabili ambiente
├── index.html             # HTML template
├── package.json           # Dependencies e scripts
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite config (con proxy)
└── README.md              # Documentazione completa
```

## Funzionalità Implementate

### 1. Dashboard (/)

- Card "Verifica Copertura" → Naviga a /verifica-copertura
- Card "Nuovo Contratto" → Naviga a /nuovo-contratto (placeholder)

### 2. Verifica Copertura (/verifica-copertura)

#### Sezione 1: Ricerca Indirizzo

- **Campo Città**: Autocomplete con ricerca da backend
  - Minimo 2 caratteri per attivare ricerca
  - Endpoint: `GET /api/coverage/cities?query=...`

- **Campo Via**: Autocomplete dipendente da città
  - Minimo 2 caratteri per attivare ricerca
  - Endpoint: `GET /api/coverage/streets?query=...&cityId=...`

- **Campo Civico**: Select dipendente da via
  - Endpoint: `GET /api/coverage/civics?addressId=...`

#### Sezione 2: Mappa

- Mappa Leaflet interattiva
- Marker automatico sull'indirizzo selezionato
- Zoom e pan
- Default: Milano (45.4642, 9.1900)

#### Sezione 3: Verifica Copertura

- Pulsante "Verifica Copertura"
- Stati gestiti:
  - Loading spinner durante chiamata API
  - Errore con messaggio
  - Nessun risultato
  - Risultati con card servizi

#### Sezione 4: Risultati

- Card per ogni servizio disponibile
- Informazioni mostrate:
  - Nome servizio
  - Stato disponibilità
  - Tecnologia (FTTH, FTTC, etc.)
  - Velocità download
  - Velocità upload
  - Prezzo (se disponibile)
  - Costo attivazione (se disponibile)

### 3. Nuovo Contratto (/nuovo-contratto)

- Placeholder in costruzione

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** - Build tool ultra veloce
- **Material-UI v6** - UI components
- **React Router v7** - Routing
- **TanStack Query (React Query)** - Data fetching, caching, sincronizzazione
- **Axios** - HTTP client
- **Leaflet + React-Leaflet** - Mappe

## React Query Configuration

```typescript
{
  refetchOnWindowFocus: false,  // Non ricarica al focus
  retry: 1,                      // 1 solo retry su errore
  staleTime: 5 * 60 * 1000,     // Cache per 5 minuti
}
```

## API Endpoints

Tutti gli endpoint sono proxy-ati attraverso Vite al backend NestJS:

```
Frontend: http://localhost:5173/api/...
↓ (proxy)
Backend:  http://localhost:3000/api/...
```

Endpoints utilizzati:

| Metodo | Endpoint | Params | Descrizione |
|--------|----------|--------|-------------|
| GET | /coverage/cities | query | Ricerca città |
| GET | /coverage/streets | query, cityId | Ricerca vie |
| GET | /coverage/civics | addressId | Lista civici |
| GET | /coverage/headers | cityId, addressId, civic | Headers copertura |
| GET | /coverage/services | headerId | Servizi disponibili |

## Scripts NPM

```bash
# Sviluppo
npm run dev          # Avvia dev server (porta 5173)
npm start            # Alias per npm run dev

# Build
npm run build        # Build per produzione
npm run preview      # Preview build produzione

# Quality
npm run lint         # Esegue ESLint
npm run type-check   # Controllo tipi TypeScript

# Utility
npm run clean        # Pulisce cache e build
```

## Responsive Breakpoints

```typescript
- xs: 0px
- sm: 600px
- md: 900px
- lg: 1200px
- xl: 1536px
```

## Troubleshooting

### Problema: Autocomplete non funziona

**Soluzione:**
1. Verifica che il backend sia attivo su `http://localhost:3000`
2. Controlla la console per errori di rete
3. Assicurati di digitare almeno 2 caratteri per città/via
4. Rispetta la sequenza: città → via → civico

### Problema: Mappa non si visualizza

**Soluzione:**
1. Leaflet CSS è caricato in `index.html`
2. Controlla che non ci siano errori nella console
3. Verifica connessione internet (tiles da OpenStreetMap)

### Problema: CORS errors

**Soluzione:**
1. Il proxy Vite dovrebbe gestire CORS automaticamente
2. Verifica `vite.config.ts` → sezione `server.proxy`
3. Assicurati che backend accetti richieste da `http://localhost:5173`

### Problema: Build fallisce

**Soluzione:**
1. Esegui `npm run type-check` per verificare errori TypeScript
2. Esegui `npm run clean` e poi `npm install`
3. Verifica versioni dipendenze in `package.json`

## Development Tips

### Hot Module Replacement (HMR)

Vite supporta HMR nativo. Le modifiche ai file si riflettono istantaneamente nel browser senza refresh completo.

### React Query DevTools

Per aggiungere React Query DevTools (opzionale):

```bash
npm install @tanstack/react-query-devtools
```

Poi in `App.tsx`:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// In return JSX:
<QueryClientProvider client={queryClient}>
  {/* ... */}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### VSCode Extensions Raccomandate

Le extension sono già configurate in `.vscode/extensions.json`:

- ESLint
- Prettier
- ES7+ React/Redux/React-Native snippets

## Prossimi Passi

1. Implementare pagina "Nuovo Contratto"
2. Aggiungere autenticazione (login/logout)
3. Implementare gestione errori globale
4. Aggiungere test (Jest + React Testing Library)
5. Implementare analytics
6. Ottimizzare bundle size con code splitting

## License

Proprietario - TWT
