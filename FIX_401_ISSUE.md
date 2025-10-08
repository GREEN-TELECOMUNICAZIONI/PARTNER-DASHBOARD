# Fix 401 Unauthorized - TWT API

## 🐛 Problema

Errore in console frontend:
```
GET http://localhost:3000/api/coverage/cities?query=to 401 (Unauthorized)
```

## 🔍 Causa

Il backend non sta leggendo le credenziali dal file `.env`, quindi le richieste alle API TWT falliscono con 401.

**Verifica:**
```bash
curl http://localhost:3000/api/coverage/health
```

Risposta mostra:
```json
{
  "status": "unhealthy",
  "baseUrl": "https://reseller.twt.it/api/xdsl",
  "authenticated": false  // ❌ Dovrebbe essere true
}
```

## ✅ Soluzione

### Opzione 1: Riavvia Backend (Quick Fix)

```bash
# 1. Ferma il backend
# Se avviato con run.dev.sh: Ctrl+C o ./stop.dev.sh
# Se avviato manualmente: Ctrl+C nel terminale

# 2. Verifica che .env contenga le credenziali
cat backend/.env | grep TWT_API

# Output atteso:
# TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
# TWT_API_USERNAME=GREENTEL_PAVONE
# TWT_API_PASSWORD=Pc_260516

# 3. Riavvia il backend
cd backend
npm run start:dev

# 4. Verifica autenticazione
curl http://localhost:3000/api/coverage/health
# Deve mostrare: "authenticated": true
```

### Opzione 2: Usa Script Automatico

```bash
# Stop everything
./stop.dev.sh

# Restart
./run.dev.sh
```

## 🧪 Test dopo Fix

### 1. Verifica Health Check

```bash
curl http://localhost:3000/api/coverage/health
```

**Risposta attesa:**
```json
{
  "status": "healthy",
  "baseUrl": "https://reseller.twt.it/api/xdsl",
  "authenticated": true  // ✅ Deve essere true
}
```

### 2. Test Ricerca Città

```bash
curl "http://localhost:3000/api/coverage/cities?query=to"
```

**Risposta attesa:**
```json
{
  "success": true,
  "data": [
    {
      "Id": 7904,
      "Description": "TORINO",
      "Cap": "10121",
      ...
    }
  ]
}
```

### 3. Test nel Browser

1. Apri http://localhost:5173
2. Clicca "Verifica Copertura"
3. Digita "to" nel campo città
4. Dovresti vedere "TORINO" nell'autocomplete

## 🔍 Debug Logs

Quando il backend si avvia correttamente, dovresti vedere nei logs:

```
[NestApplication] Nest application successfully started
[TwtService] TWT Service initialized with base URL: https://reseller.twt.it/api/xdsl
[TwtService] Using Basic Auth with username: GREENTEL_PAVONE  // ✅ Questo è importante
```

Se NON vedi "Using Basic Auth", le variabili d'ambiente non sono caricate.

## 🔧 Troubleshooting

### Problema: "authenticated" ancora false dopo riavvio

**Causa:** File `.env` non nel path corretto o sintassi errata

**Soluzione:**
```bash
# Verifica path corretto
ls -la backend/.env

# Verifica contenuto (no spazi extra, no commenti inline)
cat backend/.env

# Deve essere esattamente così:
TWT_API_USERNAME=GREENTEL_PAVONE
TWT_API_PASSWORD=Pc_260516

# NO spazi:
# TWT_API_USERNAME = GREENTEL_PAVONE  ❌
# TWT_API_USERNAME= GREENTEL_PAVONE   ❌

# NO commenti inline:
# TWT_API_USERNAME=GREENTEL_PAVONE # username  ❌
```

### Problema: Backend non legge .env

**Causa:** ConfigModule non configurato correttamente

**Verifica:**
```bash
# Controlla che app.module.ts abbia:
grep -A3 "ConfigModule" backend/src/app.module.ts
```

Deve contenere:
```typescript
ConfigModule.forRoot({
  isGlobal: true,
}),
```

### Problema: "Cannot connect to backend"

```bash
# Verifica che backend sia in ascolto
lsof -i :3000

# Verifica logs
tail -f backend/.logs/backend.log
# Oppure se avviato manualmente, controlla terminale
```

## 📋 Checklist Completa

Dopo il fix, verifica tutto:

- [ ] `backend/.env` ha le credenziali corrette
- [ ] Backend riavviato
- [ ] Health check mostra `authenticated: true`
- [ ] Logs backend mostrano "Using Basic Auth with username: GREENTEL_PAVONE"
- [ ] Test curl ricerca città funziona (200 OK)
- [ ] Frontend carica senza errori console
- [ ] Autocomplete città funziona

## 🎯 Root Cause

Il file `.env` è stato modificato DOPO l'avvio del backend.

**Node.js e NestJS caricano le variabili d'ambiente solo all'avvio**, quindi modifiche al `.env` richiedono sempre un restart del server.

## 💡 Best Practice

Per evitare questo problema in futuro:

1. **Configura sempre `.env` PRIMA di avviare il backend**
2. **Riavvia il backend dopo ogni modifica al `.env`**
3. **Usa script `run.dev.sh`** che verifica `.env` all'avvio

## 🚀 Quick Command

```bash
# One-liner per fix rapido
./stop.dev.sh && ./run.dev.sh
```

## ✅ Status dopo Fix

Dopo aver riavviato il backend, dovresti vedere:

**Console Backend:**
```
[TwtService] Using Basic Auth with username: GREENTEL_PAVONE
```

**Health Check:**
```json
{
  "authenticated": true
}
```

**Console Frontend:**
```
✓ No 401 errors
✓ Autocomplete funziona
```

---

**Fix Status**: ✅ **READY TO APPLY**

Semplicemente riavvia il backend per caricare le credenziali dal `.env`.
