# Development Scripts - TWT Partner Dashboard

Script per avviare e gestire il progetto in modalità sviluppo locale.

## 📜 Script Disponibili

### 1. `run.dev.sh` - Avvio Sviluppo

Script principale per avviare backend e frontend in modalità sviluppo.

#### Usage Base

```bash
# Avvia backend e frontend
./run.dev.sh
```

#### Opzioni Disponibili

```bash
# Installa dipendenze e avvia
./run.dev.sh --install

# Avvia solo backend
./run.dev.sh --backend-only

# Avvia solo frontend
./run.dev.sh --frontend-only

# Verifica prerequisiti senza avviare
./run.dev.sh --check

# Mostra help
./run.dev.sh --help
```

#### Cosa Fa lo Script

1. **Verifica Prerequisiti**
   - Node.js 20+ installato
   - npm installato
   - Directory backend e frontend esistono
   - File `.env` configurato

2. **Verifica Dipendenze**
   - Controlla se `node_modules` esistono
   - Suggerisce installazione se necessario

3. **Verifica Porte**
   - Porta 3000 (backend) disponibile
   - Porta 5173 (frontend) disponibile
   - Mostra processi in ascolto

4. **Avvia Servizi**
   - Backend: `npm run start:dev` (porta 3000)
   - Frontend: `npm run dev` (porta 5173)
   - Mantiene processi in background
   - Salva PID per gestione

5. **Gestione Logs**
   - Logs backend: `.logs/backend.log`
   - Logs frontend: `.logs/frontend.log`
   - PID files: `.pids/backend.pid`, `.pids/frontend.pid`

#### Output Esempio

```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        TWT Partner Dashboard - Development Mode           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

▶ Verifica prerequisiti...

✓ Node.js v20.11.0
✓ npm 10.2.4
✓ Directory backend e frontend trovate
✓ File .env configurato
✓ Dipendenze installate

▶ Verifica porte disponibili...

▶ Avvio servizi...

▶ Avvio backend su porta 3000...
ℹ Backend PID: 12345
ℹ Logs: tail -f .logs/backend.log
ℹ Attendo avvio backend...
✓ Backend avviato: http://localhost:3000
ℹ API Docs: http://localhost:3000/api/docs

▶ Avvio frontend su porta 5173...
ℹ Frontend PID: 12346
ℹ Logs: tail -f .logs/frontend.log
ℹ Attendo avvio frontend...
✓ Frontend avviato: http://localhost:5173

╔════════════════════════════════════════════════════════════╗
║                                                            ║
║              🚀 Servizi Avviati con Successo!             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

  Backend:     http://localhost:3000
  API Docs:    http://localhost:3000/api/docs
  Health:      http://localhost:3000/api/coverage/health
  Frontend:    http://localhost:5173

  Logs Backend:  tail -f .logs/backend.log
  Logs Frontend: tail -f .logs/frontend.log

  Premi Ctrl+C per arrestare tutti i servizi
```

---

### 2. `stop.dev.sh` - Arresto Servizi

Script per arrestare i servizi avviati da `run.dev.sh`.

#### Usage

```bash
./stop.dev.sh
```

#### Cosa Fa

1. Legge PID files da `.pids/`
2. Arresta processi backend e frontend
3. Verifica porte 3000 e 5173
4. Uccidi processi residui se necessario
5. Pulisce PID files

#### Output Esempio

```
Arresto servizi TWT Partner Dashboard...

✓ Backend arrestato (PID: 12345)
✓ Frontend arrestato (PID: 12346)

ℹ Verifica porte...

✓ Tutti i servizi sono stati arrestati
```

---

## 🚀 Quick Start

### Primo Avvio

```bash
# 1. Rendi gli script eseguibili (già fatto)
chmod +x run.dev.sh stop.dev.sh

# 2. Installa dipendenze e avvia
./run.dev.sh --install
```

### Avvio Successivi

```bash
# Avvia tutto
./run.dev.sh

# Oppure separatamente
./run.dev.sh --backend-only   # Solo backend
./run.dev.sh --frontend-only  # Solo frontend
```

### Arresto

```bash
# Metodo 1: Ctrl+C nel terminale dove gira run.dev.sh
# Metodo 2: Script dedicato
./stop.dev.sh
```

---

## 📊 Gestione Logs

### Visualizza Logs in Tempo Reale

```bash
# Backend
tail -f .logs/backend.log

# Frontend
tail -f .logs/frontend.log

# Entrambi (in terminali separati)
tail -f .logs/backend.log & tail -f .logs/frontend.log
```

### Pulisci Logs

```bash
rm -rf .logs/*.log
```

---

## 🔧 Troubleshooting

### Errore: "Porta 3000 già in uso"

```bash
# Trova processo
lsof -i :3000

# Uccidi processo
kill -9 $(lsof -t -i:3000)

# Oppure usa stop script
./stop.dev.sh
```

### Errore: "Porta 5173 già in uso"

```bash
# Trova processo
lsof -i :5173

# Uccidi processo
kill -9 $(lsof -t -i:5173)

# Oppure usa stop script
./stop.dev.sh
```

### Errore: "Dipendenze non installate"

```bash
./run.dev.sh --install
```

### Errore: "File .env non configurato"

```bash
# Copia template
cp backend/.env.example backend/.env

# Configura credenziali
nano backend/.env

# Aggiungi:
# TWT_API_USERNAME=GREENTEL_PAVONE
# TWT_API_PASSWORD=Pc_260516
```

### Backend non si avvia

```bash
# Controlla logs
cat .logs/backend.log

# Verifica build
cd backend
npm run build

# Reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

### Frontend non si avvia

```bash
# Controlla logs
cat .logs/frontend.log

# Reinstalla dipendenze
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📂 File Generati dagli Script

### `.logs/` - Directory Logs

```
.logs/
├── backend.log   # Output backend (stdout + stderr)
└── frontend.log  # Output frontend (stdout + stderr)
```

### `.pids/` - Directory PID Files

```
.pids/
├── backend.pid   # PID processo backend
└── frontend.pid  # PID processo frontend
```

**Nota**: Queste directory sono create automaticamente e sono in `.gitignore`.

---

## 🎯 Workflow Consigliato

### Sviluppo Normale

```bash
# Mattina: avvia tutto
./run.dev.sh

# Lavora su codice...
# Hot reload automatico backend e frontend

# Sera: arresta
./stop.dev.sh
# Oppure Ctrl+C
```

### Solo Backend (test API)

```bash
./run.dev.sh --backend-only

# Testa API
curl http://localhost:3000/api/coverage/health
curl "http://localhost:3000/api/coverage/cities?query=Milano"

# Swagger UI
open http://localhost:3000/api/docs
```

### Solo Frontend (con mock data)

```bash
./run.dev.sh --frontend-only

# Apri browser
open http://localhost:5173
```

### Check Ambiente

```bash
# Verifica tutto senza avviare
./run.dev.sh --check

# Output mostra stato prerequisiti e dipendenze
```

---

## 🔄 Aggiornamento Dipendenze

```bash
# Backend
cd backend
npm update
npm audit fix

# Frontend
cd frontend
npm update
npm audit fix

# Poi riavvia
cd ..
./run.dev.sh
```

---

## 🐛 Debug Mode

### Backend Debug

```bash
# Avvia solo backend
./run.dev.sh --backend-only

# In VSCode: usa launch.json configuration "Debug Backend"
# Oppure attacca debugger a processo in ascolto su porta 9229
```

### Frontend Debug

```bash
# Usa DevTools browser
# React DevTools extension
# Vue DevTools (se usi Vue)
```

---

## 📝 Personalizzazione Script

Gli script sono modificabili. File sorgente:

- `run.dev.sh` - Script avvio
- `stop.dev.sh` - Script arresto

Puoi personalizzare:
- Porte (cambia variabili in script)
- Timeout avvio (sleep duration)
- Directory logs
- Comportamento errori

---

## ⚙️ Variabili d'Ambiente

Gli script rispettano le variabili in `backend/.env`:

```env
# Server
PORT=3000                    # Porta backend
NODE_ENV=development         # Ambiente

# CORS
CORS_ORIGIN=http://localhost:5173  # Frontend URL

# TWT API
TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
TWT_API_USERNAME=GREENTEL_PAVONE
TWT_API_PASSWORD=Pc_260516
```

---

## 🎬 Demo Video (Comandi)

```bash
# Setup iniziale
./run.dev.sh --install        # 1-2 min

# Avvio normale
./run.dev.sh                   # 10 sec

# Check services
curl http://localhost:3000/api/coverage/health
open http://localhost:5173

# Logs
tail -f .logs/backend.log

# Stop
./stop.dev.sh                  # 1 sec
```

---

## 📚 Riferimenti

- **README.md** - Documentazione principale progetto
- **GETTING_STARTED.md** - Guida setup completa
- **TEST_CREDENTIALS.md** - Test credenziali TWT
- **backend/README.md** - Docs backend
- **frontend/README.md** - Docs frontend

---

## ✨ Features Script

- ✅ Verifica automatica prerequisiti
- ✅ Check dipendenze
- ✅ Verifica porte disponibili
- ✅ Avvio background processes
- ✅ Gestione logs separati
- ✅ PID tracking
- ✅ Cleanup automatico su Ctrl+C
- ✅ Colorized output
- ✅ Help integrato
- ✅ Error handling robusto
- ✅ Supporto opzioni multiple

---

## 🚀 Status

**Script Status**: ✅ **READY TO USE**

Gli script sono completamente funzionali e testati.

---

**Ultimo aggiornamento**: 2025-01-06
**Versione**: 1.0.0
