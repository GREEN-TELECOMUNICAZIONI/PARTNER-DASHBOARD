# Getting Started - TWT Partner Dashboard

Guida rapida per iniziare a utilizzare la TWT Partner Dashboard in meno di 5 minuti.

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere:

- ✅ Node.js 20 o superiore
- ✅ npm 10 o superiore
- ✅ Git
- ✅ (Opzionale) Docker + Docker Compose

Verifica le versioni installate:

```bash
node --version   # v20.x.x o superiore
npm --version    # 10.x.x o superiore
docker --version # (opzionale)
```

## 🚀 Setup Rapido (5 minuti)

### Metodo 1: Sviluppo Locale (Raccomandato per sviluppo)

#### Step 1: Clone del repository (se necessario)

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD
```

#### Step 2: Setup Backend

```bash
# Naviga nella directory backend
cd backend

# Copia il file di configurazione
cp .env.example .env

# Apri .env e configura il token TWT
nano .env
# Oppure usa qualsiasi editor:
# code .env
# vim .env
```

**Configura nel file .env:**
```env
TWT_API_TOKEN=your_twt_api_token_here
```

```bash
# Installa le dipendenze
npm install

# Avvia il backend
npm run start:dev
```

✅ Backend avviato su: http://localhost:3000

#### Step 3: Setup Frontend (nuovo terminale)

```bash
# Torna alla root e vai al frontend
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/frontend

# Installa le dipendenze
npm install

# Avvia il frontend
npm run dev
```

✅ Frontend avviato su: http://localhost:5173

#### Step 4: Verifica Installazione

Apri il browser e visita:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/coverage/health
- Swagger UI: http://localhost:3000/api/docs

---

### Metodo 2: Docker (Raccomandato per produzione)

#### Step 1: Configura Backend

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/backend
cp .env.example .env
nano .env  # Aggiungi TWT_API_TOKEN
```

#### Step 2: Build e Avvia

```bash
# Torna alla root
cd ..

# Build delle immagini Docker
./scripts/build.sh

# Avvia i servizi
./scripts/start.sh
```

#### Step 3: Verifica

```bash
# Health check backend
curl http://localhost:3000/api/coverage/health

# Apri frontend
open http://localhost
```

✅ Servizi avviati:
- Frontend: http://localhost
- Backend: http://localhost:3000

---

## 🎯 Primo Test

### 1. Verifica Backend

Apri http://localhost:3000/api/docs nel browser per vedere la documentazione Swagger.

Oppure usa curl:

```bash
# Health check
curl http://localhost:3000/api/coverage/health

# Test ricerca città
curl "http://localhost:3000/api/coverage/cities?query=Milano"
```

### 2. Verifica Frontend

1. Apri http://localhost:5173 (locale) o http://localhost (Docker)
2. Clicca su "Verifica Copertura"
3. Inserisci una città (es: "Milano")
4. Seleziona una via
5. Seleziona un civico
6. Clicca "Verifica Copertura"

---

## 🔧 Configurazione Avanzata

### Backend (.env)

File: `backend/.env`

```env
# Server
PORT=3000
NODE_ENV=development

# TWT API - OBBLIGATORIO
TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
TWT_API_TOKEN=your_twt_api_token_here
TWT_API_AUTH_TYPE=Bearer
TWT_API_TIMEOUT=30000

# Provider Filter
TIM_PROVIDER_ID=10

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

### Frontend (.env)

File: `frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

---

## 📚 Comandi Utili

### Backend

```bash
cd backend

# Sviluppo
npm run start:dev      # Avvia con hot-reload
npm run start:debug    # Avvia in debug mode

# Build
npm run build          # Compila TypeScript
npm run start:prod     # Avvia in produzione

# Quality
npm run lint           # ESLint + auto-fix
npm run format         # Prettier
npm run test           # Unit tests
npm run test:cov       # Test con coverage
```

### Frontend

```bash
cd frontend

# Sviluppo
npm run dev            # Dev server (porta 5173)
npm start              # Alias per dev

# Build
npm run build          # Build produzione
npm run preview        # Preview build locale

# Quality
npm run type-check     # Verifica tipi TypeScript
npm run lint           # ESLint
npm run clean          # Pulisci cache
```

### Docker

```bash
# Dalla root del progetto

# Gestione servizi
./scripts/start.sh         # Avvia tutti i servizi
./scripts/stop.sh          # Ferma tutti i servizi
./scripts/build.sh         # Build immagini

# Logs
./scripts/logs.sh          # Mostra logs
./scripts/logs.sh -f       # Segui logs in tempo reale
./scripts/logs.sh backend  # Logs solo backend
./scripts/logs.sh frontend # Logs solo frontend

# Status
docker-compose ps          # Lista servizi
docker-compose top         # Processi attivi
docker stats               # Uso risorse

# Cleanup
docker-compose down        # Ferma e rimuovi container
docker-compose down -v     # + rimuovi volumi
```

---

## 🐛 Troubleshooting Comune

### Problema: "Port already in use"

```bash
# Trova processo che usa la porta 3000
lsof -ti:3000 | xargs kill -9

# Oppure porta 5173
lsof -ti:5173 | xargs kill -9
```

### Problema: "Cannot connect to backend"

**Verifica:**
1. Backend è in esecuzione?
   ```bash
   curl http://localhost:3000/api/coverage/health
   ```

2. CORS configurato correttamente?
   ```bash
   cat backend/.env | grep CORS_ORIGIN
   # Deve essere: CORS_ORIGIN=http://localhost:5173
   ```

3. Proxy Vite funziona?
   ```bash
   cat frontend/vite.config.ts | grep proxy
   ```

### Problema: "TWT API errors"

**Verifica:**
1. Token configurato?
   ```bash
   cat backend/.env | grep TWT_API_TOKEN
   # Non deve essere vuoto
   ```

2. Base URL corretto?
   ```bash
   cat backend/.env | grep TWT_API_BASE_URL
   # Deve essere: https://reseller.twt.it/api/xdsl
   ```

3. Test connessione TWT?
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://reseller.twt.it/api/xdsl/Toponomastica/GetCities?query=Milano"
   ```

### Problema: "npm install fails"

```bash
# Pulisci cache e reinstalla
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problema: Docker build fallisce

```bash
# Cleanup completo
docker-compose down -v
docker system prune -a -f

# Rebuild
./scripts/build.sh
```

---

## 📖 Prossimi Passi

### 1. Esplora la Documentazione

- **Backend**: `backend/README.md`
- **Frontend**: `frontend/DOCUMENTATION_INDEX.md`
- **Docker**: `DOCKER_README.md`
- **API**: http://localhost:3000/api/docs

### 2. Configura Credenziali TWT

Contatta TWT per ottenere:
- API Token/Credentials
- Documentazione aggiornata
- Ambiente sandbox per testing
- Rate limits

### 3. Personalizza l'Applicazione

- **Theme**: `frontend/src/theme/theme.ts`
- **Configurazione**: File `.env` in backend e frontend
- **Componenti**: `frontend/src/components/`
- **API Logic**: `backend/src/modules/`

### 4. Testing

```bash
# Backend tests
cd backend
npm run test
npm run test:cov

# Frontend type checking
cd frontend
npm run type-check
```

### 5. Deploy in Produzione

Leggi `DOCKER_README.md` per deployment su:
- AWS (ECS, EC2, Elastic Beanstalk)
- Google Cloud Platform (Cloud Run, GKE)
- Azure (Container Instances, AKS)
- DigitalOcean (App Platform)

---

## 🎓 Risorse Aggiuntive

### Documentazione Tecnica

1. **NestJS**: https://docs.nestjs.com
2. **React**: https://react.dev
3. **Material-UI**: https://mui.com
4. **React Query**: https://tanstack.com/query
5. **Leaflet**: https://leafletjs.com
6. **Docker**: https://docs.docker.com

### Struttura Directory

```
PARTNER-DASHBOARD/
├── backend/              # Backend NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── twt/      # Integrazione TWT API
│   │   │   └── coverage/ # Endpoints REST
│   │   └── common/       # Filters, interceptors
│   └── test/             # Tests
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/   # Componenti React
│   │   ├── pages/        # Pagine/Route
│   │   ├── api/          # API client
│   │   ├── hooks/        # React Query hooks
│   │   └── types/        # TypeScript types
│   └── public/           # Static assets
├── documentazione/       # Docs TWT API
├── scripts/             # Helper scripts
└── docker-compose.yml   # Orchestrazione
```

### File Chiave

**Backend:**
- `backend/src/main.ts` - Bootstrap
- `backend/src/modules/twt/twt.service.ts` - TWT API logic
- `backend/src/modules/coverage/coverage.controller.ts` - REST endpoints

**Frontend:**
- `frontend/src/App.tsx` - Root component
- `frontend/src/pages/VerificaCopertura.tsx` - Pagina principale
- `frontend/src/hooks/useCoverage.ts` - React Query hooks
- `frontend/src/api/coverage.ts` - API client

---

## ✅ Checklist Setup Completo

Prima di iniziare lo sviluppo, verifica:

- [ ] Node.js 20+ installato
- [ ] Backend dependencies installate (`npm install`)
- [ ] Frontend dependencies installate (`npm install`)
- [ ] File `.env` configurati in backend (con `TWT_API_TOKEN`)
- [ ] Backend si avvia senza errori
- [ ] Frontend si avvia senza errori
- [ ] Health check backend risponde (http://localhost:3000/api/coverage/health)
- [ ] Frontend si connette al backend
- [ ] Swagger UI accessibile (http://localhost:3000/api/docs)
- [ ] Leaflet mappa si carica correttamente
- [ ] Test manuale verifica copertura funziona

---

## 🚀 Sei Pronto!

Ora hai tutto il necessario per iniziare a sviluppare con la TWT Partner Dashboard.

**Cosa fare ora:**
1. ✅ Avvia backend e frontend
2. ✅ Testa la verifica copertura
3. ✅ Esplora la documentazione
4. ✅ Personalizza secondo le tue esigenze

**Serve aiuto?**
- Consulta `README.md` nella root
- Leggi la documentazione in `backend/` e `frontend/`
- Controlla `DOCKER_README.md` per Docker
- Visualizza logs: `./scripts/logs.sh -f`

---

**Buon lavoro! 🎉**
