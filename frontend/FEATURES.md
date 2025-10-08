# Features Overview - TWT Partner Dashboard Frontend

## Implemented Features

### 1. Layout & Navigation

#### AppBar + Sidebar Layout

**File:** `src/components/layout/Layout.tsx`

- Responsive sidebar con drawer mobile
- AppBar fisso in alto
- Menu navigazione con icone Material
- Auto-collapse su mobile dopo navigazione
- Breadcrumb path highlighting

**Features:**

- Desktop (>900px): Sidebar permanente
- Mobile (<900px): Drawer collassabile con hamburger menu
- Smooth transitions
- ARIA labels per accessibilità

### 2. Dashboard Homepage

**File:** `src/pages/Dashboard.tsx`

**Route:** `/`

**Features:**

- Grid layout responsive (2 colonne desktop, 1 colonna mobile)
- Card "Verifica Copertura" (funzionale)
- Card "Nuovo Contratto" (placeholder disabled)
- Click-to-navigate
- Hover effects

**Components utilizzati:**

- `DashboardCard` - Card riutilizzabile con icona, titolo, descrizione, CTA button

### 3. Verifica Copertura

**File:** `src/pages/VerificaCopertura.tsx`

**Route:** `/verifica-copertura`

#### 3.1 Address Autocomplete

**Component:** `src/components/coverage/AddressAutocomplete.tsx`

**Features:**

- Autocomplete città con ricerca backend
  - Minimo 2 caratteri
  - Debouncing automatico (React Query)
  - Loading spinner
  - Display: "Città (Provincia)"

- Autocomplete via con ricerca backend
  - Dipende da città selezionata
  - Minimo 2 caratteri
  - Disabilitato fino a selezione città

- Select civico
  - Dipende da via selezionata
  - Caricamento automatico civici
  - Disabilitato fino a selezione via

**UX:**

- Progressive disclosure (città → via → civico)
- Clear error states
- Loading indicators
- Disabled states con tooltip messages

#### 3.2 Map View

**Component:** `src/components/coverage/MapView.tsx`

**Features:**

- Mappa Leaflet interattiva
- Marker automatico su indirizzo selezionato
- Popup con indirizzo completo
- Auto-center e zoom su selezione
- OpenStreetMap tiles
- Touch-friendly (mobile)

**Default:**

- Centro: Milano (45.4642, 9.1900)
- Zoom level: 15

#### 3.3 Coverage Check

**Features:**

- Pulsante "Verifica Copertura"
- Stati gestiti:
  - Idle: Button enabled
  - Loading: Button disabled con spinner
  - Success: Mostra risultati
  - Error: Alert con messaggio errore

**API Flow:**

1. User click "Verifica Copertura"
2. Chiamata `GET /api/coverage/headers`
3. Estrazione primo headerId (già filtrato TIM da backend)
4. Chiamata `GET /api/coverage/services`
5. Display risultati

#### 3.4 Coverage Results

**Component:** `src/components/coverage/CoverageResults.tsx`

**Features:**

- Grid responsive di card servizi
- Ogni card mostra:
  - Nome servizio
  - Badge disponibilità (verde/grigio)
  - Icona tecnologia (FTTH, FTTC, etc.)
  - Velocità download con icona
  - Velocità upload con icona
  - Prezzo mensile (se disponibile)
  - Costo attivazione (se disponibile)

**Design:**

- Card border verde se disponibile
- Colori icone semantici:
  - Download: verde
  - Upload: blu
  - Tecnologia: primario
  - Prezzo: warning
- Responsive: 1/2/3 colonne (mobile/tablet/desktop)

### 4. Nuovo Contratto (Placeholder)

**File:** `src/pages/NuovoContratto.tsx`

**Route:** `/nuovo-contratto`

**Features:**

- Icona "Construction"
- Alert info "In sviluppo"
- Placeholder per future implementazioni

## Technical Features

### API Integration

**File:** `src/api/coverage.ts`

**Endpoints implementati:**

```typescript
coverageApi.getCities(query)       // GET /api/coverage/cities
coverageApi.getStreets(query, id)  // GET /api/coverage/streets
coverageApi.getCivics(addressId)   // GET /api/coverage/civics
coverageApi.getHeaders(...)        // GET /api/coverage/headers
coverageApi.getServices(headerId)  // GET /api/coverage/services
```

### React Query Hooks

**File:** `src/hooks/useCoverage.ts`

**Hooks implementati:**

```typescript
useCities(query)                    // Query città
useStreets(query, cityId)           // Query vie
useCivics(addressId)                // Query civici
useHeaders(cityId, addressId, civic) // Query headers
useServices(headerId)               // Query servizi
```

**Features:**

- Automatic caching (5 minuti)
- Request deduplication
- Background refetching
- Error handling
- Loading states
- Conditional fetching (enabled flag)

### Axios Client

**File:** `src/api/client.ts`

**Features:**

- Base URL configuration
- Request interceptor per auth token
- Response interceptor per errori globali
- 401 handling (redirect to login)
- Type-safe con TypeScript

### TypeScript Types

**File:** `src/types/api.ts`

**Interfaces definite:**

```typescript
City                 // Città
Street               // Via
Civic                // Civico
CoverageHeader       // Header copertura
CoverageService      // Servizio disponibile
SelectedAddress      // Indirizzo completo selezionato
AutocompleteOption   // Opzione autocomplete
```

### Material-UI Theming

**File:** `src/theme/theme.ts`

**Customizations:**

- Palette colori personalizzata
- Typography (font Inter)
- Button styling (no text-transform)
- Card hover effects
- Border radius globale (8px)
- Component overrides

## UI/UX Features

### Responsive Design

- Mobile-first approach
- Breakpoints Material-UI standard
- Touch-optimized interactions
- Adaptive layouts per device

### Loading States

**Component:** `src/components/coverage/LoadingSpinner.tsx`

- Centered spinner
- Custom message
- Consistent styling
- Used across app

### Error Handling

- Alert components per errori API
- Inline validation messages
- Toast notifications (future)
- Error boundaries (future)

### Accessibility

- ARIA labels su tutti gli interactive elements
- Keyboard navigation support
- Semantic HTML
- Focus management
- Screen reader friendly

### Performance

- React Query caching
- Automatic request deduplication
- Lazy loading ready (future)
- Optimized re-renders con useMemo/useCallback (dove necessario)

## Code Quality Features

### TypeScript

- Strict mode enabled
- Type-safe API calls
- Interface-driven development
- No `any` types (best effort)

### Code Organization

- Feature-based folder structure
- Clear separation of concerns
- Reusable components
- Custom hooks for logic reuse

### Developer Experience

- Hot Module Replacement (HMR)
- Fast Vite dev server
- TypeScript autocomplete
- ESLint configuration
- VSCode settings & extensions

## Build Features

### Production Build

```bash
npm run build
```

**Output:**

- Minified JavaScript
- CSS extraction e minification
- Tree shaking
- Optimized chunks
- Source maps (configurable)

**Size:**

- Main bundle: ~766 KB (242 KB gzipped)
- CSS: ~15 KB (6 KB gzipped)

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

- Type-safe access: `import.meta.env.VITE_API_URL`
- Different configs per environment

## Future Features (Roadmap)

### Authentication

- [ ] Login page
- [ ] JWT token management
- [ ] Protected routes
- [ ] User profile

### Nuovo Contratto

- [ ] Multi-step form
- [ ] Contract creation
- [ ] Document upload
- [ ] E-signature integration

### Advanced Coverage

- [ ] Comparison tool
- [ ] Filtering e sorting servizi
- [ ] Export risultati (PDF/Excel)
- [ ] Storico ricerche

### Analytics

- [ ] Google Analytics integration
- [ ] User behavior tracking
- [ ] Performance monitoring
- [ ] Error tracking (Sentry)

### Testing

- [ ] Unit tests (Jest)
- [ ] Integration tests (React Testing Library)
- [ ] E2E tests (Cypress/Playwright)
- [ ] Visual regression tests

### Performance

- [ ] Code splitting per route
- [ ] Image optimization
- [ ] Service Worker (PWA)
- [ ] Virtual scrolling

### Internationalization

- [ ] i18n support
- [ ] Multiple languages (IT/EN)
- [ ] Date/number formatting

## Known Limitations

1. **Bundle Size:** Single bundle (~766KB), necessita code splitting
2. **Offline Support:** Nessun service worker, richiede connessione
3. **Accessibility:** Parziale, necessita audit completo
4. **Error Recovery:** Basic error handling, necessita retry strategies
5. **SEO:** SPA senza SSR, limitato SEO

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 12+
- Chrome Android: Latest

## License

Proprietario - TWT
