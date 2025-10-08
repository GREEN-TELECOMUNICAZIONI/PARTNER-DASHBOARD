# TWT Partner Dashboard

Dashboard per la verifica di copertura e gestione contratti TWT.

## 🚀 Features

### ✅ Verifica Copertura (Completata)
- **Ricerca indirizzo**: Autocomplete per città, vie e civici
- **Mappa interattiva**: Visualizzazione geografica con Leaflet + OpenStreetMap
- **Verifica servizi**: Controllo disponibilità servizi di connettività
- **Filtro provider configurabile**: Mostra solo i provider desiderati (TIM, Fastweb, etc.)
- **Geocoding**: Coordinate esatte degli indirizzi

### 🔜 Nuovo Contratto (Placeholder)
- Funzionalità in fase di pianificazione

## 🛠️ Stack Tecnologico

### Backend
- **NestJS 10.x** - Framework Node.js
- **TypeScript** - Type-safe development
- **Axios** - HTTP client per TWT API
- **class-validator** - Validazione input
- **Swagger** - Documentazione API automatica

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool
- **Material-UI 6.5** - Component library
- **TanStack Query 5.90** - Data fetching & caching
- **Leaflet** - Mappa interattiva
- **TypeScript** - Type-safe development

## 📦 Setup Rapido

### Prerequisiti
- Node.js 20.x
- npm 10.x

### 1. Installazione

```bash
# Clone repository
git clone <repository-url>
cd PARTNER-DASHBOARD

# Installa dipendenze backend
cd backend
npm install

# Installa dipendenze frontend
cd ../frontend
npm install
```

### 2. Configurazione

Crea il file `.env` nel backend:

```bash
cd backend
cp .env.example .env
nano .env
```

Configura le credenziali TWT:

```env
TWT_API_USERNAME=your_username
TWT_API_PASSWORD=your_password
TWT_PROVIDER_FILTER=10  # 10 = TIM
```

### 3. Avvio Sviluppo

```bash
# Dalla root del progetto
./run.dev.sh
```

Oppure manualmente:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Accesso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## ⚙️ Configurazione Filtri Servizi

Il sistema permette di filtrare i servizi per **provider**, **tecnologia** e **varianti**. Vedi [PROVIDER_FILTER.md](backend/PROVIDER_FILTER.md) per dettagli completi.

### Filtro Provider

```env
# Solo TIM
TWT_PROVIDER_FILTER=10

# TIM + Fastweb
TWT_PROVIDER_FILTER=10,20

# Tutti i provider
TWT_PROVIDER_FILTER=
```

**Provider IDs:**
- `10` = TIM
- `20` = Fastweb
- `30` = Altri
- `160` = FWA EW

### Filtro Tecnologia

```env
# Solo FTTC e FTTH
TWT_TECHNOLOGY_FILTER=FTTC,FTTH

# Solo FTTH
TWT_TECHNOLOGY_FILTER=FTTH

# Tutte le tecnologie
TWT_TECHNOLOGY_FILTER=
```

### Esclusione Varianti

```env
# Escludi servizi "Lite"
TWT_EXCLUDE_VARIANTS=Lite

# Escludi Lite e VULA
TWT_EXCLUDE_VARIANTS=Lite,VULA

# Nessuna esclusione
TWT_EXCLUDE_VARIANTS=
```

## 📚 Documentazione API

### Backend Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/api/coverage/cities` | GET | Cerca città per nome |
| `/api/coverage/streets` | GET | Cerca vie in una città |
| `/api/coverage/civics` | GET | Cerca civici per via |
| `/api/coverage/headers` | GET | Ottieni header IDs per indirizzo |
| `/api/coverage/services` | GET | Verifica servizi disponibili |
| `/api/coverage/geocode` | GET | Geocoding indirizzo |
| `/api/coverage/health` | GET | Health check |

### Esempio Utilizzo

```bash
# 1. Cerca città
curl "http://localhost:3000/api/coverage/cities?query=torino"

# 2. Cerca vie
curl "http://localhost:3000/api/coverage/streets?query=roma&cityId=5900"

# 3. Cerca civici
curl "http://localhost:3000/api/coverage/civics?addressId=1043922"

# 4. Ottieni headers
curl "http://localhost:3000/api/coverage/headers?city=TORINO&province=TORINO&address=ROMA&number=108&street=VIA"

# 5. Verifica servizi
curl "http://localhost:3000/api/coverage/services?headersId=123&headersId=456&cityEgon=38000001274&addressEgon=38000069719&mainEgon=380100007715713&streetNumber=108"
```

## 🧪 Test

### Backend
```bash
cd backend
npm run test
```

### Frontend
```bash
cd frontend
npm run test
```

### Test Integrazione
```bash
# Health check
curl http://localhost:3000/api/coverage/health

# Test completo workflow
bash /tmp/final_test.sh
```

## 🐳 Docker (Coming Soon)

```bash
docker-compose up
```

## 📁 Struttura Progetto

```
PARTNER-DASHBOARD/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── coverage/     # Verifica copertura
│   │   │   ├── twt/          # Integrazione TWT API
│   │   │   └── contracts/    # Gestione contratti (TODO)
│   │   └── main.ts
│   ├── .env                  # Configurazione (non in git)
│   ├── .env.example          # Template configurazione
│   └── PROVIDER_FILTER.md    # Documentazione filtro
├── frontend/
│   ├── src/
│   │   ├── api/              # Client API
│   │   ├── components/       # Componenti React
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Pagine
│   │   └── types/            # TypeScript types
│   └── vite.config.ts
├── documentazione/           # Documentazione TWT API
├── run.dev.sh               # Script avvio sviluppo
├── stop.dev.sh              # Script stop servizi
└── README.md                # Questo file
```

## 🔒 Sicurezza

- ✅ Credenziali in `.env` (non committate)
- ✅ Basic Auth per TWT API
- ✅ CORS configurato
- ✅ Validazione input con class-validator
- ✅ TypeScript per type safety

## 📝 Workflow Verifica Copertura

1. **Utente seleziona indirizzo**:
   - Città (es: TORINO)
   - Via (es: VIA ROMA)
   - Civico (es: 108)

2. **Sistema geocodifica** l'indirizzo per la mappa

3. **Utente clicca "Verifica Copertura"**:
   - Backend chiama TWT API per headers
   - Backend chiama TWT API per servizi
   - Applica filtro provider configurato
   - Restituisce solo servizi disponibili

4. **Frontend mostra risultati**:
   - Card per ogni servizio disponibile
   - Velocità download/upload
   - Tecnologia (FTTH, FTTCab, etc.)
   - Nome centrale

## 🆘 Troubleshooting

### Backend non si avvia
```bash
# Verifica .env
cat backend/.env | grep TWT_API

# Verifica dipendenze
cd backend && npm install

# Check logs
tail -f /tmp/backend.log
```

### Frontend errore 401
```bash
# Verifica credenziali TWT in backend/.env
# Riavvia backend
cd backend && npm run start:dev
```

### Nessun servizio trovato
```bash
# Verifica filtro provider
grep TWT_PROVIDER_FILTER backend/.env

# Test API diretta
curl http://localhost:3000/api/coverage/health
```

## 📄 License

Proprietario - Green Partner

## 👥 Autori

- Sviluppo iniziale: 2025
- Integrazione TWT API: Gennaio 2025

## 🔄 Changelog

### v1.1.0 (2025-01-07)
- ✅ Verifica copertura completata e testata
- ✅ Filtro provider configurabile via ENV
- ✅ Geocoding implementato
- ✅ Fix loop infinito frontend
- ✅ Documentazione completa

### v1.0.0 (2025-01-06)
- 🎉 Release iniziale
- ✅ Setup backend NestJS
- ✅ Setup frontend React + Vite
- ✅ Integrazione TWT API
- ✅ Autocomplete indirizzo
- ✅ Mappa Leaflet
