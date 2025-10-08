# Test Credenziali TWT - Quick Guide

## ✅ Modifiche Completate

Le credenziali TWT sono state configurate con **Basic Authentication**:
- Username: `GREENTEL_PAVONE`
- Password: `Pc_260516`

## 🚀 Test Immediato

### 1. Avvia il Backend

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/backend
npm run start:dev
```

Dovresti vedere nei logs:
```
[TwtService] TWT Service initialized with base URL: https://reseller.twt.it/api/xdsl
[TwtService] Using Basic Auth with username: GREENTEL_PAVONE
```

### 2. Test Health Check

```bash
# In un nuovo terminale
curl http://localhost:3000/api/coverage/health
```

Risposta attesa:
```json
{
  "status": "healthy",
  "baseUrl": "https://reseller.twt.it/api/xdsl",
  "authenticated": true
}
```

### 3. Test Ricerca Città (Chiamata TWT Reale)

```bash
curl "http://localhost:3000/api/coverage/cities?query=Milano"
```

Risposta attesa (se credenziali corrette):
```json
{
  "success": true,
  "data": [
    {
      "Id": 123,
      "Description": "MILANO",
      "Cap": "20100",
      ...
    }
  ]
}
```

### 4. Test con Frontend

```bash
# Nuovo terminale
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/frontend
npm run dev
```

Apri http://localhost:5173 e:
1. Clicca su "Verifica Copertura"
2. Inizia a digitare "Milano" nel campo città
3. Dovresti vedere l'autocomplete con le città

## 🧪 Test Diretto API TWT (senza backend)

```bash
# Genera Basic Auth token
echo -n "GREENTEL_PAVONE:Pc_260516" | base64
# Output: R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==

# Test diretto
curl -X GET \
  "https://reseller.twt.it/api/xdsl/Toponomastica/GetCities?query=Milano" \
  -H "Authorization: Basic R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==" \
  -H "Content-Type: application/json"
```

## 🔍 Possibili Risultati

### ✅ Success (200 OK)
Credenziali corrette, API funzionante. Vedrai lista città.

### ❌ 401 Unauthorized
Credenziali non valide o non accettate da TWT.
**Azione:** Verifica con TWT che le credenziali siano corrette.

### ❌ 403 Forbidden
Credenziali valide ma account senza permessi.
**Azione:** Chiedi a TWT di abilitare accesso alle API.

### ❌ 404 Not Found
Endpoint non corretto.
**Azione:** Verifica base URL in `.env`

### ❌ Timeout
Server TWT non risponde.
**Azione:** Verifica connessione internet, firewall.

## 📋 Checklist Verifica

- [ ] File `.env` ha username e password corretti
- [ ] Backend compila senza errori (`npm run build`)
- [ ] Backend si avvia senza errori (`npm run start:dev`)
- [ ] Health check ritorna `authenticated: true`
- [ ] Test ricerca città ritorna dati (non 401/403)
- [ ] Frontend si connette al backend
- [ ] Autocomplete città funziona
- [ ] Test completo verifica copertura end-to-end

## 🐛 Troubleshooting

### "Cannot connect to backend"

Verifica backend in ascolto:
```bash
curl http://localhost:3000/api/coverage/health
```

### "CORS error"

Verifica CORS_ORIGIN in `.env`:
```bash
cat backend/.env | grep CORS_ORIGIN
# Deve essere: CORS_ORIGIN=http://localhost:5173
```

### "401 Unauthorized from TWT"

Verifica credenziali:
```bash
cat backend/.env | grep TWT_API
# TWT_API_USERNAME=GREENTEL_PAVONE
# TWT_API_PASSWORD=Pc_260516
```

Restart backend dopo modifica `.env`.

## 📊 Log da Verificare

Nel backend dovrebbero apparire (quando chiami API):

```
[TwtService] Getting cities with query: Milano
[TwtService] TWT API call succeeded: GET /Toponomastica/GetCities
```

Se vedi errori 401/403:
```
[TwtService] Error in getCities: Request failed with status code 401
[TwtService] Response status: 401
```

## ✨ Next Steps

Una volta che il test ha successo:

1. ✅ Test ricerca città funziona
2. ✅ Test ricerca via (dopo aver selezionato città)
3. ✅ Test ricerca civico (dopo aver selezionato via)
4. ✅ Test verifica copertura completa
5. ✅ Verifica filtro provider TIM (ID: 10)
6. ✅ Test UI completo da frontend

## 📝 Note

- Le credenziali sono già configurate in `backend/.env`
- Il service genera automaticamente l'header Basic Auth
- Non serve toccare il codice, solo avviare i servizi
- Tutti gli endpoint backend sono già implementati
- Il frontend è già configurato per chiamare il backend

---

**Pronto per il test!** 🚀

Esegui i comandi nella sezione "Test Immediato" per verificare l'integrazione.
