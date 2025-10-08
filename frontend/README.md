# TWT Partner Dashboard - Frontend

Dashboard web per partner TWT per la gestione della verifica copertura e contratti.

## Tecnologie

- **React 18** - Libreria UI
- **TypeScript** - Type safety
- **Vite** - Build tool e dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Routing
- **TanStack Query (React Query)** - Data fetching e caching
- **Axios** - HTTP client
- **Leaflet + React-Leaflet** - Mappe interattive

## Struttura Progetto

```
src/
├── api/              # API clients e configurazione Axios
├── components/       # Componenti React riusabili
│   ├── coverage/    # Componenti verifica copertura
│   ├── dashboard/   # Componenti dashboard
│   └── layout/      # Layout e navigazione
├── hooks/           # Custom React hooks
├── pages/           # Pagine applicazione
├── theme/           # Configurazione tema MUI
├── types/           # TypeScript types e interfaces
├── App.tsx          # Componente root con routing
└── main.tsx         # Entry point
```

## Installazione

```bash
npm install
```

## Configurazione

Crea un file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Modifica `.env` se necessario:

```env
VITE_API_URL=http://localhost:3000/api
```

## Sviluppo

Avvia il dev server:

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## Build

Build per produzione:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

## Script Disponibili

- `npm run dev` - Avvia dev server
- `npm run build` - Build per produzione
- `npm run preview` - Preview build produzione
- `npm run lint` - Esegue ESLint
- `npm run type-check` - Controllo tipi TypeScript
- `npm run clean` - Pulisce cache e build

## Funzionalità

### Dashboard Principale

- Card "Verifica Copertura" (funzionale)
- Card "Nuovo Contratto" (placeholder)

### Verifica Copertura

1. **Ricerca Indirizzo**
   - Autocomplete città (minimo 2 caratteri)
   - Autocomplete via (richiede città selezionata)
   - Selezione civico (richiede via selezionata)

2. **Visualizzazione Mappa**
   - Mappa interattiva Leaflet
   - Marker automatico su indirizzo selezionato
   - Zoom e pan

3. **Verifica Servizi**
   - Pulsante per verificare copertura
   - Loading state con spinner
   - Gestione errori

4. **Risultati**
   - Card per ogni servizio disponibile
   - Dettagli: velocità download/upload, tecnologia, prezzo
   - Filtro automatico provider TIM (dal backend)

## API Integration

L'applicazione si connette al backend NestJS attraverso un proxy configurato in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

### Endpoints Utilizzati

- `GET /api/coverage/cities?query=...`
- `GET /api/coverage/streets?query=...&cityId=...`
- `GET /api/coverage/civics?addressId=...`
- `GET /api/coverage/headers?cityId=...&addressId=...&civic=...`
- `GET /api/coverage/services?headerId=...`

## React Query

Configurazione caching:

- `staleTime`: 5 minuti
- `retry`: 1 tentativo
- `refetchOnWindowFocus`: disabilitato

Hooks disponibili:

- `useCities(query)` - Ricerca città
- `useStreets(query, cityId)` - Ricerca vie
- `useCivics(addressId)` - Ricerca civici
- `useHeaders(cityId, addressId, civic)` - Verifica copertura
- `useServices(headerId)` - Dettagli servizi

## Responsive Design

L'applicazione è completamente responsive:

- **Mobile** (< 768px): Menu drawer collassabile
- **Tablet** (768px - 1024px): Layout ottimizzato
- **Desktop** (> 1024px): Sidebar fissa, layout multi-colonna

## Accessibilità

- ARIA labels su tutti i componenti interattivi
- Navigazione keyboard-friendly
- Contrasti colore WCAG 2.1 AA
- Screen reader support

## Temi

Il tema MUI è personalizzabile in `src/theme/theme.ts`:

- Palette colori primaria/secondaria
- Typography (font Inter)
- Border radius (8px)
- Shadow personalizzate
- Componenti custom styles

## Troubleshooting

### La mappa non si visualizza

Assicurati che il CSS di Leaflet sia importato in `MapView.tsx`:

```typescript
import 'leaflet/dist/leaflet.css';
```

### Errori CORS

Il proxy Vite dovrebbe gestire automaticamente i CORS. Se persiste il problema, verifica:

1. Backend in ascolto su `http://localhost:3000`
2. Configurazione proxy in `vite.config.ts` corretta

### Autocomplete non funziona

Verifica:

1. Backend attivo e raggiungibile
2. Query minimo 2 caratteri per città/vie
3. Selezione dipendenze (città → via → civico)

## License

Proprietario - TWT
