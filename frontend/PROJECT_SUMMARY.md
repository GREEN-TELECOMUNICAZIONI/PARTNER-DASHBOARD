# Project Summary - TWT Partner Dashboard Frontend

## Quick Overview

Dashboard React per partner TWT per verificare la copertura dei servizi e gestire contratti.

## Tech Stack

- **React 18.3** + **TypeScript 5.9**
- **Vite 7** (dev server + build tool)
- **Material-UI 6** (UI components)
- **React Router 7** (routing)
- **TanStack Query 5** (data fetching)
- **Axios 1.12** (HTTP client)
- **Leaflet 1.9** (maps)

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API clients
│   ├── components/             # React components
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Page components
│   ├── theme/                  # MUI theme
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── .env                        # Environment variables
├── vite.config.ts              # Vite configuration
└── package.json                # Dependencies
```

## Key Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, routing setup |
| `src/main.tsx` | Entry point |
| `src/api/client.ts` | Axios configuration |
| `src/api/coverage.ts` | Coverage API endpoints |
| `src/hooks/useCoverage.ts` | React Query hooks |
| `src/types/api.ts` | TypeScript interfaces |
| `src/theme/theme.ts` | MUI theme customization |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Start dev server
npm run dev

# 4. Open browser
# http://localhost:5173
```

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # Run ESLint
npm run clean        # Clean cache
```

## Features Implemented

### 1. Dashboard (/)

- 2 cards: "Verifica Copertura" e "Nuovo Contratto"
- Responsive grid layout
- Navigation to sub-pages

### 2. Verifica Copertura (/verifica-copertura)

- **Address Selection:**
  - City autocomplete (min 2 chars)
  - Street autocomplete (depends on city)
  - Civic number select (depends on street)

- **Map View:**
  - Interactive Leaflet map
  - Automatic marker on selected address
  - Zoom and pan

- **Coverage Check:**
  - Button to verify coverage
  - Loading spinner
  - Error handling

- **Results Display:**
  - Card grid of available services
  - Service details: speed, technology, price
  - Availability status

### 3. Nuovo Contratto (/nuovo-contratto)

- Placeholder page (coming soon)

## API Endpoints

| Endpoint | Method | Params | Description |
|----------|--------|--------|-------------|
| `/api/coverage/cities` | GET | query | Search cities |
| `/api/coverage/streets` | GET | query, cityId | Search streets |
| `/api/coverage/civics` | GET | addressId | Get civic numbers |
| `/api/coverage/headers` | GET | cityId, addressId, civic | Get coverage headers |
| `/api/coverage/services` | GET | headerId | Get available services |

## Components

### Layout

- `Layout.tsx` - Main layout with AppBar and Sidebar

### Pages

- `Dashboard.tsx` - Homepage with cards
- `VerificaCopertura.tsx` - Coverage verification
- `NuovoContratto.tsx` - Contract creation (placeholder)

### Coverage Components

- `AddressAutocomplete.tsx` - Address search fields
- `MapView.tsx` - Leaflet map
- `CoverageResults.tsx` - Results display
- `LoadingSpinner.tsx` - Loading indicator

### Dashboard Components

- `DashboardCard.tsx` - Reusable card component

## Configuration

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

### Vite Proxy

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

Proxies `/api/*` requests to backend at `http://localhost:3000`

### React Query

```typescript
{
  refetchOnWindowFocus: false,
  retry: 1,
  staleTime: 5 * 60 * 1000, // 5 minutes
}
```

## Build Output

```bash
npm run build
```

**Output directory:** `dist/`

**Bundle size:**

- JavaScript: ~766 KB (242 KB gzipped)
- CSS: ~15 KB (6 KB gzipped)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile Safari: iOS 12+
- Chrome Android: Latest

## Responsive Breakpoints

- Mobile: < 600px
- Tablet: 600px - 900px
- Desktop: > 900px

## Code Quality

- **TypeScript:** Strict mode enabled
- **ESLint:** Configured with React rules
- **Prettier:** Code formatting (recommended)

## Documentation

| File | Description |
|------|-------------|
| `README.md` | Main documentation |
| `GETTING_STARTED.md` | Quick start guide |
| `ARCHITECTURE.md` | Architecture overview |
| `FEATURES.md` | Features documentation |
| `API_INTEGRATION.md` | API integration guide |
| `PROJECT_SUMMARY.md` | This file |

## Development Workflow

1. **Feature development:**
   ```bash
   npm run dev
   # Make changes
   # Hot reload automatic
   ```

2. **Type checking:**
   ```bash
   npm run type-check
   ```

3. **Build verification:**
   ```bash
   npm run build
   npm run preview
   ```

## Common Tasks

### Add new page

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Layout.tsx`

### Add new API endpoint

1. Add method in `src/api/coverage.ts`
2. Add hook in `src/hooks/useCoverage.ts`
3. Add TypeScript types in `src/types/api.ts`
4. Use hook in component

### Customize theme

Edit `src/theme/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    // ...
  },
});
```

## Dependencies (Main)

```json
{
  "@mui/material": "^6.5.0",
  "@mui/icons-material": "^6.5.0",
  "@tanstack/react-query": "^5.90.2",
  "axios": "^1.12.2",
  "leaflet": "^1.9.4",
  "react": "^19.1.1",
  "react-leaflet": "^5.0.0",
  "react-router-dom": "^7.9.3"
}
```

## Known Issues

1. **Bundle Size:** Single bundle ~766KB, needs code splitting
2. **Map Icons:** Requires manual icon configuration for Leaflet
3. **MUI v7:** Not compatible yet (using v6)

## Future Improvements

- [ ] Code splitting per route
- [ ] Authentication system
- [ ] Nuovo Contratto implementation
- [ ] Unit tests (Jest + RTL)
- [ ] E2E tests (Cypress/Playwright)
- [ ] PWA support
- [ ] i18n support

## Support

Per domande o problemi:

1. Controlla `README.md` per documentazione completa
2. Verifica `TROUBLESHOOTING.md` per soluzioni comuni
3. Consulta `API_INTEGRATION.md` per problemi API

## License

Proprietario - TWT

---

**Last Updated:** 2025-10-06

**Version:** 1.0.0

**Status:** Development Ready
