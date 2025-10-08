# API Integration Guide

## Overview

Questo documento descrive come il frontend React si integra con il backend NestJS.

## Base Configuration

### Environment Variables

**File:** `.env`

```env
VITE_API_URL=http://localhost:3000/api
```

### Vite Proxy

**File:** `vite.config.ts`

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

**Come funziona:**

```
Browser Request:  http://localhost:5173/api/coverage/cities
                             ↓
Vite Proxy:       http://localhost:3000/api/coverage/cities
```

## Axios Client Configuration

**File:** `src/api/client.ts`

### Features

1. **Base URL Configuration**

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

2. **Request Interceptor (Authentication)**

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

3. **Response Interceptor (Error Handling)**

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## API Endpoints

### 1. Get Cities

**Endpoint:** `GET /api/coverage/cities`

**Query Params:**

- `query` (string, required): Search term (min 2 chars)

**Frontend Implementation:**

```typescript
// File: src/api/coverage.ts
getCities: async (query: string): Promise<City[]> => {
  const response = await apiClient.get('/coverage/cities', {
    params: { query },
  });
  return response.data;
}
```

**React Query Hook:**

```typescript
// File: src/hooks/useCoverage.ts
export const useCities = (query: string) => {
  return useQuery({
    queryKey: ['cities', query],
    queryFn: () => coverageApi.getCities(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Usage in Component:**

```typescript
const { data: cities, isLoading } = useCities(cityQuery);
```

**Expected Response:**

```typescript
[
  {
    id: "string",
    name: "Milano",
    province: "MI"
  }
]
```

### 2. Get Streets

**Endpoint:** `GET /api/coverage/streets`

**Query Params:**

- `query` (string, required): Search term (min 2 chars)
- `cityId` (string, required): Selected city ID

**Frontend Implementation:**

```typescript
getStreets: async (query: string, cityId: string): Promise<Street[]> => {
  const response = await apiClient.get('/coverage/streets', {
    params: { query, cityId },
  });
  return response.data;
}
```

**React Query Hook:**

```typescript
export const useStreets = (query: string, cityId: string) => {
  return useQuery({
    queryKey: ['streets', query, cityId],
    queryFn: () => coverageApi.getStreets(query, cityId),
    enabled: query.length >= 2 && !!cityId,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Expected Response:**

```typescript
[
  {
    id: "string",
    name: "Via Roma",
    cityId: "string"
  }
]
```

### 3. Get Civics

**Endpoint:** `GET /api/coverage/civics`

**Query Params:**

- `addressId` (string, required): Selected street ID

**Frontend Implementation:**

```typescript
getCivics: async (addressId: string): Promise<Civic[]> => {
  const response = await apiClient.get('/coverage/civics', {
    params: { addressId },
  });
  return response.data;
}
```

**React Query Hook:**

```typescript
export const useCivics = (addressId: string) => {
  return useQuery({
    queryKey: ['civics', addressId],
    queryFn: () => coverageApi.getCivics(addressId),
    enabled: !!addressId,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Expected Response:**

```typescript
[
  {
    civic: "1",
    addressId: "string"
  }
]
```

### 4. Get Coverage Headers

**Endpoint:** `GET /api/coverage/headers`

**Query Params:**

- `cityId` (string, required)
- `addressId` (string, required)
- `civic` (string, required)

**Frontend Implementation:**

```typescript
getHeaders: async (
  cityId: string,
  addressId: string,
  civic: string
): Promise<CoverageHeader[]> => {
  const response = await apiClient.get('/coverage/headers', {
    params: { cityId, addressId, civic },
  });
  return response.data;
}
```

**React Query Hook:**

```typescript
export const useHeaders = (
  cityId: string,
  addressId: string,
  civic: string
) => {
  return useQuery({
    queryKey: ['headers', cityId, addressId, civic],
    queryFn: () => coverageApi.getHeaders(cityId, addressId, civic),
    enabled: !!cityId && !!addressId && !!civic,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Expected Response:**

```typescript
[
  {
    headerId: "string",
    provider: "TIM", // Already filtered by backend
    technology: "FTTH",
    address: "Via Roma 1, Milano"
  }
]
```

**Note:** Il backend filtra già solo provider TIM, quindi il frontend usa il primo header.

### 5. Get Coverage Services

**Endpoint:** `GET /api/coverage/services`

**Query Params:**

- `headerId` (string, required)

**Frontend Implementation:**

```typescript
getServices: async (headerId: string): Promise<CoverageService[]> => {
  const response = await apiClient.get('/coverage/services', {
    params: { headerId },
  });
  return response.data;
}
```

**React Query Hook:**

```typescript
export const useServices = (headerId: string) => {
  return useQuery({
    queryKey: ['services', headerId],
    queryFn: () => coverageApi.getServices(headerId),
    enabled: !!headerId,
    staleTime: 5 * 60 * 1000,
  });
};
```

**Expected Response:**

```typescript
[
  {
    serviceId: "string",
    name: "Fibra 1000 Mega",
    downloadSpeed: 1000,
    uploadSpeed: 300,
    technology: "FTTH",
    available: true,
    price: 29.90,
    installationCost: 0
  }
]
```

## Complete Flow Example

### User Journey: Verifica Copertura

```typescript
// Step 1: User types "Milano" in city field
const { data: cities } = useCities("Milano");
// → GET /api/coverage/cities?query=Milano

// Step 2: User selects "Milano (MI)"
setSelectedCity(cities[0]);

// Step 3: User types "Via Roma" in street field
const { data: streets } = useStreets("Via Roma", selectedCity.id);
// → GET /api/coverage/streets?query=Via Roma&cityId=xxx

// Step 4: User selects "Via Roma"
setSelectedStreet(streets[0]);

// Step 5: Civics load automatically
const { data: civics } = useCivics(selectedStreet.id);
// → GET /api/coverage/civics?addressId=xxx

// Step 6: User selects civic "1"
setSelectedCivic(civics[0]);

// Step 7: User clicks "Verifica Copertura"
const { data: headers } = useHeaders(
  selectedCity.id,
  selectedAddress.addressId,
  selectedCivic.civic
);
// → GET /api/coverage/headers?cityId=xxx&addressId=xxx&civic=1

// Step 8: Extract headerId and get services
const headerId = headers[0].headerId;
const { data: services } = useServices(headerId);
// → GET /api/coverage/services?headerId=xxx

// Step 9: Display results
<CoverageResults services={services} />
```

## Error Handling

### API Errors

**HTTP Status Codes:**

- `200` - Success
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token / invalid token)
- `404` - Not Found (no results)
- `500` - Internal Server Error

**Frontend Handling:**

```typescript
const { data, error, isError, isLoading } = useCities(query);

if (isLoading) {
  return <LoadingSpinner />;
}

if (isError) {
  return (
    <Alert severity="error">
      {error.message || 'Si è verificato un errore'}
    </Alert>
  );
}

if (!data || data.length === 0) {
  return (
    <Alert severity="info">
      Nessun risultato trovato
    </Alert>
  );
}

// Render data...
```

### Network Errors

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (no internet, CORS, etc.)
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);
```

## React Query Configuration

### Global Config

**File:** `src/App.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,  // No auto-refetch on tab focus
      retry: 1,                      // Retry once on failure
      staleTime: 5 * 60 * 1000,     // Cache for 5 minutes
    },
  },
});
```

### Query Keys Strategy

```typescript
// Pattern: [entity, ...params]
['cities', query]                          // Cities search
['streets', query, cityId]                 // Streets search
['civics', addressId]                      // Civics list
['headers', cityId, addressId, civic]      // Coverage headers
['services', headerId]                     // Services list
```

**Benefits:**

- Automatic cache management
- Query invalidation
- Request deduplication

## CORS Configuration

### Development

Vite proxy gestisce CORS automaticamente.

### Production

Backend deve configurare CORS:

```typescript
// Backend NestJS
app.enableCors({
  origin: 'https://partner-dashboard.twt.it',
  credentials: true,
});
```

## Authentication Flow (Future)

### Login

```typescript
// 1. User login
const response = await apiClient.post('/auth/login', {
  username,
  password,
});

// 2. Store token
localStorage.setItem('authToken', response.data.token);

// 3. Redirect to dashboard
navigate('/');
```

### Authenticated Requests

```typescript
// Automatic via interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Logout

```typescript
// 1. Clear token
localStorage.removeItem('authToken');

// 2. Invalidate queries
queryClient.clear();

// 3. Redirect to login
navigate('/login');
```

## Testing API Integration

### Mock Service Worker (MSW)

**Future Implementation:**

```typescript
// mocks/handlers.ts
export const handlers = [
  rest.get('/api/coverage/cities', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Milano', province: 'MI' }
      ])
    );
  }),
];
```

## Performance Optimization

### Request Deduplication

React Query automatically deduplicates requests with same queryKey.

```typescript
// Multiple components calling useCities("Milano")
// → Only 1 HTTP request
```

### Background Refetching

```typescript
// Stale data shown immediately
// Fresh data fetched in background
// UI updates smoothly when fresh data arrives
```

### Caching Strategy

```typescript
staleTime: 5 * 60 * 1000,  // 5 minutes
```

- Data fresh for 5 minutes
- No refetch if within staleTime
- Background refetch after staleTime

## Debugging

### Network Tab

1. Open Chrome DevTools
2. Network tab
3. Filter: XHR/Fetch
4. Inspect requests to `/api/*`

### React Query DevTools (Optional)

```bash
npm install @tanstack/react-query-devtools
```

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

## Troubleshooting

### Issue: CORS errors

**Solution:**

1. Check Vite proxy configuration
2. Verify backend CORS settings
3. Ensure correct API base URL

### Issue: 401 Unauthorized

**Solution:**

1. Check token in localStorage
2. Verify token expiration
3. Check Authorization header

### Issue: Request not firing

**Solution:**

1. Check `enabled` flag in useQuery
2. Verify query params are valid
3. Check React Query DevTools

### Issue: Stale data

**Solution:**

1. Adjust `staleTime` configuration
2. Manually invalidate queries:

```typescript
queryClient.invalidateQueries(['cities']);
```

## License

Proprietario - TWT
