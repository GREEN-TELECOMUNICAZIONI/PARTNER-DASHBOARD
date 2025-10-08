# Architecture - TWT Partner Dashboard Frontend

## Overview

Questo documento descrive l'architettura del frontend della dashboard Partner TWT, costruita con React 18 + TypeScript + Vite.

## Architettura Generale

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (User)                       │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTP
                    │
┌───────────────────▼─────────────────────────────────────┐
│              React Application                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │           React Router (Routing)                 │   │
│  │  / → Dashboard                                   │   │
│  │  /verifica-copertura → VerificaCopertura        │   │
│  │  /nuovo-contratto → NuovoContratto              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │        React Query (Data Management)             │   │
│  │  - Caching                                       │   │
│  │  - Background refetching                         │   │
│  │  - Request deduplication                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Axios (HTTP Client)                 │   │
│  │  - Request/Response interceptors                 │   │
│  │  - Error handling                                │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ Proxy (Vite)
                    │ /api → http://localhost:3000/api
                    │
┌───────────────────▼─────────────────────────────────────┐
│              NestJS Backend API                          │
└─────────────────────────────────────────────────────────┘
```

## Layered Architecture

### 1. Presentation Layer (Components)

**Responsabilità:** UI rendering, user interaction, local state

```
components/
├── layout/          # Layout globale (AppBar, Sidebar)
├── dashboard/       # Componenti dashboard homepage
└── coverage/        # Componenti verifica copertura
```

**Principi:**

- Componenti funzionali con hooks
- Props drilling minimizzato
- Componenti presentazionali vs container
- Material-UI per UI consistency

### 2. Business Logic Layer (Hooks)

**Responsabilità:** State management, data fetching, business rules

```
hooks/
└── useCoverage.ts   # Custom hooks per React Query
```

**Pattern utilizzati:**

- Custom hooks per incapsulare logica riutilizzabile
- React Query hooks per data fetching
- Separazione concerns: UI vs logic

### 3. Data Layer (API)

**Responsabilità:** Comunicazione con backend, data transformation

```
api/
├── client.ts        # Axios configuration e interceptors
└── coverage.ts      # API endpoints per coverage
```

**Features:**

- Axios interceptors per auth token
- Error handling centralizzato
- Type-safe API calls

### 4. Type Layer

**Responsabilità:** Type safety, contract con backend

```
types/
└── api.ts          # TypeScript interfaces per API
```

## Data Flow

### 1. User Interaction → API Call → UI Update

```
User seleziona città
    ↓
AddressAutocomplete component
    ↓
useCities hook (React Query)
    ↓
coverageApi.getCities (Axios)
    ↓
HTTP GET /api/coverage/cities
    ↓
Backend NestJS
    ↓
Response → React Query cache
    ↓
Component re-render con dati
```

### 2. React Query Caching Strategy

```typescript
{
  staleTime: 5 * 60 * 1000,      // Dati fresh per 5 minuti
  retry: 1,                       // 1 retry su errore
  refetchOnWindowFocus: false,    // No refetch al focus
}
```

**Vantaggi:**

- Riduzione chiamate API duplicate
- UX migliore (instant loading da cache)
- Background updates automatici

## Component Architecture

### Smart vs Dumb Components

**Smart Components (Container):**

- `pages/VerificaCopertura.tsx`
- `pages/Dashboard.tsx`
- Gestiscono state e business logic
- Chiamano hooks
- Orchestrano componenti dumb

**Dumb Components (Presentational):**

- `components/coverage/AddressAutocomplete.tsx`
- `components/coverage/CoverageResults.tsx`
- `components/dashboard/DashboardCard.tsx`
- Solo rendering
- Props driven
- Riutilizzabili

### Component Communication

```
Parent (VerificaCopertura)
    │
    │ props down
    │
    ├─→ AddressAutocomplete
    │       │
    │       │ callback up
    │       │ onAddressSelected(address)
    │       │
    ├─→ MapView (props: address)
    │
    └─→ CoverageResults (props: services)
```

## State Management Strategy

### 1. Local State (useState)

**Quando usare:**

- UI state (drawer aperto/chiuso)
- Form state (input values)
- Temporary state (modal visibility)

**Esempio:**

```typescript
const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
```

### 2. Server State (React Query)

**Quando usare:**

- Dati dal backend
- Async data fetching
- Caching requirements

**Esempio:**

```typescript
const { data: cities, isLoading } = useCities(query);
```

### 3. URL State (React Router)

**Quando usare:**

- Navigation state
- Shareable state (bookmarkable)

**Esempio:**

```typescript
const navigate = useNavigate();
navigate('/verifica-copertura');
```

## Error Handling Strategy

### 1. API Level (Axios Interceptors)

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
    }
    return Promise.reject(error);
  }
);
```

### 2. Hook Level (React Query)

```typescript
const { data, error, isError } = useCities(query);

if (isError) {
  // Handle error in component
}
```

### 3. Component Level (Error Boundaries)

```typescript
{error && (
  <Alert severity="error">
    Si è verificato un errore
  </Alert>
)}
```

## Performance Optimizations

### 1. Code Splitting

**Attuale:** Single bundle

**Futuro:** Route-based splitting

```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
```

### 2. React Query Optimizations

- Automatic request deduplication
- Background refetching
- Stale-while-revalidate pattern
- Optimistic updates (future)

### 3. Memoization

**Quando necessario:**

```typescript
const memoizedValue = useMemo(() =>
  expensiveCalculation(deps),
  [deps]
);

const memoizedCallback = useCallback(() => {
  doSomething();
}, [deps]);
```

## Security Considerations

### 1. Authentication

**Preparato per JWT:**

```typescript
// In client.ts
const token = localStorage.getItem('authToken');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

### 2. XSS Protection

- React automatic escaping
- No `dangerouslySetInnerHTML`
- Sanitized user input

### 3. CSRF Protection

- Handled by backend
- SameSite cookies (future)

## Testing Strategy (Future)

### 1. Unit Tests

- Utility functions
- Custom hooks
- Pure components

### 2. Integration Tests

- User flows
- API integration
- React Query interactions

### 3. E2E Tests

- Critical paths
- Verifica copertura flow
- Contract creation flow

## Build & Deployment

### Development

```bash
npm run dev
# Vite dev server with HMR
# Port: 5173
```

### Production Build

```bash
npm run build
# Output: dist/
# Optimizations:
# - Minification
# - Tree shaking
# - Code splitting (future)
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

**Nota:** Vite espone solo variabili con prefisso `VITE_`

## Future Improvements

### 1. State Management

- Zustand per global state (se necessario)
- Ridurre prop drilling

### 2. Performance

- Implement lazy loading per routes
- Virtual scrolling per liste lunghe
- Image optimization

### 3. Developer Experience

- Storybook per component library
- React Query DevTools
- Redux DevTools (se Redux implementato)

### 4. Testing

- Jest + React Testing Library
- Cypress per E2E
- MSW per API mocking

### 5. Monitoring

- Sentry per error tracking
- Analytics (Google Analytics / Mixpanel)
- Performance monitoring (Web Vitals)

## Conventions & Best Practices

### File Naming

- Components: PascalCase (`Dashboard.tsx`)
- Hooks: camelCase with `use` prefix (`useCoverage.ts`)
- Utils: camelCase (`api.ts`)
- Types: camelCase (`api.ts` for API types)

### Import Order

1. React imports
2. Third-party libraries
3. Internal components
4. Internal hooks
5. Internal utilities
6. Types
7. Styles

### Component Structure

```typescript
// 1. Imports
import React from 'react';

// 2. Types
interface Props {}

// 3. Constants
const CONSTANT = 'value';

// 4. Component
export const Component: React.FC<Props> = () => {
  // 4.1. Hooks
  const [state, setState] = useState();

  // 4.2. Handlers
  const handleClick = () => {};

  // 4.3. Effects
  useEffect(() => {}, []);

  // 4.4. Render
  return <div />;
};
```

## Troubleshooting Guide

### Common Issues

1. **Leaflet markers not showing**
   - Check icon imports in `MapView.tsx`
   - Verify Leaflet CSS is loaded

2. **React Query not refetching**
   - Check `enabled` flag in query config
   - Verify `queryKey` changes

3. **TypeScript errors after MUI update**
   - Lock MUI to v6 (Grid API changes in v7)
   - Run `npm run type-check`

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Material-UI](https://mui.com)
- [Vite](https://vitejs.dev)
- [React Router](https://reactrouter.com)

## License

Proprietario - TWT
