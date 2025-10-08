# Frontend - TWT Partner Dashboard

## Quick Links

- **Main Documentation:** [frontend/README.md](./frontend/README.md)
- **Quick Start:** [frontend/GETTING_STARTED.md](./frontend/GETTING_STARTED.md)
- **Documentation Index:** [frontend/DOCUMENTATION_INDEX.md](./frontend/DOCUMENTATION_INDEX.md)

## Project Location

```
/Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/frontend/
```

## Quick Start

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App available at: http://localhost:5173

## What's Inside

- **React 18** + **TypeScript** application
- **Material-UI** components
- **React Query** for data fetching
- **Leaflet** maps integration
- **16 TypeScript components**
- **1,167+ lines of code**
- **2,746+ lines of documentation**

## Features

1. **Dashboard** - Homepage with navigation cards
2. **Verifica Copertura** - Complete coverage verification flow
   - Address autocomplete (città/via/civico)
   - Interactive map with markers
   - Coverage check and results display
3. **Nuovo Contratto** - Placeholder for future implementation

## Tech Stack

- React 18.3
- TypeScript 5.9
- Vite 7.1
- Material-UI 6.5
- React Router 7.9
- TanStack Query 5.90
- Axios 1.12
- Leaflet 1.9

## Documentation

### For New Developers

1. [GETTING_STARTED.md](./frontend/GETTING_STARTED.md) - Setup guide
2. [QUICK_REFERENCE.md](./frontend/QUICK_REFERENCE.md) - Daily commands
3. [ARCHITECTURE.md](./frontend/ARCHITECTURE.md) - Technical architecture

### For Backend Integration

1. [API_INTEGRATION.md](./frontend/API_INTEGRATION.md) - Complete API guide
2. [PROJECT_SUMMARY.md](./frontend/PROJECT_SUMMARY.md) - Project overview

### For Deployment

1. [DEPLOYMENT_CHECKLIST.md](./frontend/DEPLOYMENT_CHECKLIST.md) - Deployment guide
2. [PROJECT_DELIVERY.md](./frontend/PROJECT_DELIVERY.md) - Delivery summary

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API clients (Axios)
│   ├── components/       # React components
│   │   ├── coverage/    # Coverage verification components
│   │   ├── dashboard/   # Dashboard components
│   │   └── layout/      # Layout components
│   ├── hooks/           # Custom React hooks (React Query)
│   ├── pages/           # Page components
│   ├── theme/           # Material-UI theme
│   └── types/           # TypeScript interfaces
├── public/              # Static assets
├── .env                 # Environment variables
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run type-check   # TypeScript type checking
npm run lint         # Run ESLint
npm run clean        # Clean cache
```

## Integration with Backend

Frontend expects backend NestJS running on:

```
http://localhost:3000
```

Vite proxy configured to forward `/api/*` requests to backend.

## API Endpoints Used

- `GET /api/coverage/cities?query=...`
- `GET /api/coverage/streets?query=...&cityId=...`
- `GET /api/coverage/civics?addressId=...`
- `GET /api/coverage/headers?cityId=...&addressId=...&civic=...`
- `GET /api/coverage/services?headerId=...`

## Status

**Version:** 1.0.0
**Status:** ✅ Ready for Integration Testing
**Build:** ✅ Passing
**TypeScript:** ✅ No errors
**Documentation:** ✅ Complete

## Next Steps

1. Start backend on port 3000
2. Test integration
3. Fix any issues
4. Deploy to staging

## Support

See comprehensive documentation in `frontend/` directory.

Start with: [frontend/DOCUMENTATION_INDEX.md](./frontend/DOCUMENTATION_INDEX.md)

---

**Created:** 2025-10-06
**Last Updated:** 2025-10-06
