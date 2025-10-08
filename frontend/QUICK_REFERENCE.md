# Quick Reference Guide

## Daily Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run type-check

# Lint code
npm run lint

# Clean cache
npm run clean
```

## Project URLs

```
Development:  http://localhost:5173
Backend API:  http://localhost:3000/api
```

## File Locations

### Components

```
Layout:           src/components/layout/Layout.tsx
Dashboard Card:   src/components/dashboard/DashboardCard.tsx
Address Search:   src/components/coverage/AddressAutocomplete.tsx
Map:              src/components/coverage/MapView.tsx
Results:          src/components/coverage/CoverageResults.tsx
Loading:          src/components/coverage/LoadingSpinner.tsx
```

### Pages

```
Dashboard:         src/pages/Dashboard.tsx
Verifica:          src/pages/VerificaCopertura.tsx
Nuovo Contratto:   src/pages/NuovoContratto.tsx
```

### API & Hooks

```
API Client:    src/api/client.ts
Coverage API:  src/api/coverage.ts
Hooks:         src/hooks/useCoverage.ts
Types:         src/types/api.ts
```

### Config

```
Vite:          vite.config.ts
TypeScript:    tsconfig.json
Theme:         src/theme/theme.ts
Environment:   .env
```

## Common Tasks

### Add New Page

1. Create: `src/pages/MyNewPage.tsx`
2. Add route in `src/App.tsx`:
   ```typescript
   <Route path="/my-page" element={<MyNewPage />} />
   ```
3. Add nav in `src/components/layout/Layout.tsx`

### Add API Endpoint

1. Add method in `src/api/coverage.ts`:
   ```typescript
   myEndpoint: async () => {
     const response = await apiClient.get('/my-endpoint');
     return response.data;
   }
   ```

2. Add hook in `src/hooks/useCoverage.ts`:
   ```typescript
   export const useMyData = () => {
     return useQuery({
       queryKey: ['myData'],
       queryFn: () => coverageApi.myEndpoint(),
     });
   };
   ```

3. Use in component:
   ```typescript
   const { data, isLoading } = useMyData();
   ```

### Update Theme

Edit `src/theme/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#YOUR_COLOR',
    },
  },
});
```

## Code Snippets

### React Component

```typescript
import React from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
  );
};
```

### React Query Hook

```typescript
import { useQuery } from '@tanstack/react-query';
import { myApi } from '../api/myApi';

export const useMyData = (id: string) => {
  return useQuery({
    queryKey: ['myData', id],
    queryFn: () => myApi.getData(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
```

### API Method

```typescript
import { apiClient } from './client';

export const myApi = {
  getData: async (id: string) => {
    const response = await apiClient.get(`/my-endpoint/${id}`);
    return response.data;
  },
};
```

## Keyboard Shortcuts (VSCode)

```
Cmd+Shift+P    Command palette
Cmd+P          Quick file open
Cmd+B          Toggle sidebar
F2             Rename symbol
Shift+Alt+F    Format document
Cmd+/          Toggle comment
```

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push to remote
git push origin feature/my-feature

# Create PR
# Merge when approved
```

## Debugging

### React DevTools

```
Chrome Extension: React Developer Tools
```

### Network Tab

```
Chrome DevTools > Network > Filter: XHR
```

### Console Errors

```
Chrome DevTools > Console
```

### React Query DevTools (Optional)

```bash
npm install @tanstack/react-query-devtools

# Add to App.tsx:
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

<ReactQueryDevtools initialIsOpen={false} />
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Node Modules Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Fails

```bash
npm run clean
npm run type-check
npm run build
```

### CORS Errors

1. Check Vite proxy in `vite.config.ts`
2. Ensure backend is running
3. Verify API URL in `.env`

## Environment Variables

```env
# Development
VITE_API_URL=http://localhost:3000/api

# Staging
VITE_API_URL=https://api.staging.twt.it/api

# Production
VITE_API_URL=https://api.twt.it/api
```

## Package Management

```bash
# Install new package
npm install package-name

# Install dev dependency
npm install -D package-name

# Update packages
npm update

# Check outdated
npm outdated

# Audit security
npm audit
```

## Testing (Future)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Code Conventions

### Naming

```typescript
// Components: PascalCase
const MyComponent: React.FC = () => {}

// Functions: camelCase
const handleClick = () => {}

// Constants: UPPER_CASE
const API_URL = 'http://...'

// Types/Interfaces: PascalCase
interface MyInterface {}
```

### Import Order

```typescript
// 1. React
import React from 'react';

// 2. Third-party
import { Box } from '@mui/material';

// 3. Internal
import { MyComponent } from './components/MyComponent';

// 4. Types
import type { MyType } from './types/api';

// 5. Styles (if any)
import './styles.css';
```

## Performance Tips

1. **Use React.memo for expensive components**
   ```typescript
   export const MyComponent = React.memo(({ data }) => {
     // ...
   });
   ```

2. **Use useMemo for expensive calculations**
   ```typescript
   const expensiveValue = useMemo(() => {
     return expensiveCalculation(data);
   }, [data]);
   ```

3. **Use useCallback for callbacks**
   ```typescript
   const handleClick = useCallback(() => {
     // ...
   }, [deps]);
   ```

## Helpful Links

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material-UI Docs](https://mui.com)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Vite Docs](https://vitejs.dev)
- [React Router Docs](https://reactrouter.com)
- [Leaflet Docs](https://leafletjs.com)

## Team Contacts

| Role | Contact |
|------|---------|
| Frontend Lead | [Name] - [Email] |
| Backend Lead | [Name] - [Email] |
| Designer | [Name] - [Email] |
| PM | [Name] - [Email] |

---

**Keep this file handy for quick reference!**
