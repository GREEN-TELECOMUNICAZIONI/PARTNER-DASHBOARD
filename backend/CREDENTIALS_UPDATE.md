# Aggiornamento Credenziali TWT - Basic Authentication

## Modifiche Applicate

### 1. Configurazione Environment Variables

**File modificati:**
- `backend/.env.example`
- `backend/.env`

**Vecchia configurazione:**
```env
TWT_API_TOKEN=your_api_token_here
TWT_API_AUTH_TYPE=Bearer
```

**Nuova configurazione:**
```env
TWT_API_USERNAME=GREENTEL_PAVONE
TWT_API_PASSWORD=Pc_260516
```

### 2. Modifiche al TWT Service

**File:** `backend/src/modules/twt/twt.service.ts`

**Cambiamenti:**

#### Prima (Bearer Token):
```typescript
private readonly authToken: string;
private readonly authType: string;

constructor() {
  this.authToken = this.configService.get<string>('TWT_API_TOKEN') || '';
  this.authType = this.configService.get<string>('TWT_API_AUTH_TYPE') || 'Bearer';
}

private getAuthHeaders(): Record<string, string> {
  if (this.authToken) {
    if (this.authType === 'Basic') {
      headers['Authorization'] = `Basic ${this.authToken}`;
    } else {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
  }
}
```

#### Dopo (Basic Auth):
```typescript
private readonly username: string;
private readonly password: string;

constructor() {
  this.username = this.configService.get<string>('TWT_API_USERNAME') || '';
  this.password = this.configService.get<string>('TWT_API_PASSWORD') || '';

  if (this.username) {
    this.logger.log(`Using Basic Auth with username: ${this.username}`);
  }
}

private getAuthHeaders(): Record<string, string> {
  if (this.username && this.password) {
    // Genera Basic Auth token: base64(username:password)
    const credentials = Buffer.from(
      `${this.username}:${this.password}`,
    ).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  }
}
```

### 3. Come Funziona Basic Authentication

Le API TWT richiedono Basic Authentication:

1. **Credenziali fornite da TWT:**
   - Username: `GREENTEL_PAVONE`
   - Password: `Pc_260516`

2. **Il service automaticamente:**
   - Concatena username e password con `:` → `GREENTEL_PAVONE:Pc_260516`
   - Converte in Base64 → `R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==`
   - Aggiunge header → `Authorization: Basic R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==`

3. **Esempio richiesta HTTP:**
```http
GET https://reseller.twt.it/api/xdsl/Toponomastica/GetCities?query=Milano
Authorization: Basic R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==
Content-Type: application/json
```

## Test delle Credenziali

### Opzione 1: Tramite Backend

```bash
cd backend
npm run start:dev

# In un altro terminale
curl http://localhost:3000/api/coverage/health
curl "http://localhost:3000/api/coverage/cities?query=Milano"
```

### Opzione 2: Direttamente con TWT API

```bash
# Genera Base64 delle credenziali
echo -n "GREENTEL_PAVONE:Pc_260516" | base64
# Output: R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==

# Test diretto API TWT
curl -X GET \
  "https://reseller.twt.it/api/xdsl/Toponomastica/GetCities?query=Milano" \
  -H "Authorization: Basic R1JFRU5URUxfUEFWT05FOlBjXzI2MDUxNg==" \
  -H "Content-Type: application/json"
```

## Variabili Environment

### Produzione

Per deployment in produzione, configura le variabili d'ambiente:

```bash
# Docker
docker run -e TWT_API_USERNAME=GREENTEL_PAVONE \
           -e TWT_API_PASSWORD=Pc_260516 \
           backend-image

# Kubernetes
kubectl create secret generic twt-credentials \
  --from-literal=username=GREENTEL_PAVONE \
  --from-literal=password=Pc_260516
```

### Sviluppo

File: `backend/.env`

```env
TWT_API_USERNAME=GREENTEL_PAVONE
TWT_API_PASSWORD=Pc_260516
```

## Sicurezza

⚠️ **IMPORTANTE - Best Practices:**

1. **Non committare credenziali nel repository**
   - `.env` è già in `.gitignore`
   - Usa `.env.example` come template

2. **Usa secrets manager in produzione:**
   - AWS Secrets Manager
   - Azure Key Vault
   - Google Secret Manager
   - HashiCorp Vault

3. **Rotazione credenziali:**
   - Chiedi a TWT policy di rotazione
   - Aggiorna `.env` quando necessario
   - Restart del backend dopo cambio credenziali

4. **Environment variables separate:**
   - Development: `.env` locale
   - Staging: Secrets manager
   - Production: Secrets manager

## Verifica Modifiche

### 1. Check Files

```bash
# Verifica .env
cat backend/.env | grep TWT_API

# Output atteso:
# TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl
# TWT_API_USERNAME=GREENTEL_PAVONE
# TWT_API_PASSWORD=Pc_260516
```

### 2. Test Build

```bash
cd backend
npm run build
# Deve compilare senza errori
```

### 3. Test Runtime

```bash
cd backend
npm run start:dev

# Verifica logs:
# [TwtService] TWT Service initialized with base URL: https://reseller.twt.it/api/xdsl
# [TwtService] Using Basic Auth with username: GREENTEL_PAVONE
```

### 4. Test API

```bash
# Health check
curl http://localhost:3000/api/coverage/health

# Test ricerca città (richiede autenticazione TWT)
curl "http://localhost:3000/api/coverage/cities?query=Milano"
```

## Troubleshooting

### Errore 401 Unauthorized

**Causa:** Credenziali non valide o non configurate

**Soluzione:**
```bash
# Verifica credenziali in .env
cat backend/.env | grep TWT_API_USERNAME
cat backend/.env | grep TWT_API_PASSWORD

# Restart backend
cd backend
npm run start:dev
```

### Errore 403 Forbidden

**Causa:** Credenziali valide ma permessi insufficienti

**Soluzione:**
- Contatta TWT per verificare permessi account
- Verifica che l'account abbia accesso alle API Toponomastica e Disponibilità

### Errore: "Missing credentials"

**Causa:** Variabili d'ambiente non caricate

**Soluzione:**
```bash
# Verifica che .env esista
ls -la backend/.env

# Verifica ConfigModule in app.module.ts
# Deve avere: ConfigModule.forRoot({ isGlobal: true })
```

## Prossimi Step

1. ✅ Credenziali configurate
2. ✅ Service aggiornato per Basic Auth
3. ⏭️ **Avvia backend e testa:** `npm run start:dev`
4. ⏭️ **Testa integrazione completa con frontend**
5. ⏭️ **Verifica tutte le funzionalità verifica copertura**

## Documentazione TWT API

Le API TWT utilizzano Basic Authentication come standard per l'autenticazione.

**Documentazione:** `/documentazione/TWT API xDSL rev.21.txt`

**Endpoints utilizzati:**
- `/Toponomastica/GetCities` - Ricerca città
- `/Toponomastica/GetAddressesByCity` - Ricerca vie
- `/Toponomastica/GetStreetNumberByAddress` - Ricerca civici
- `/Toponomastica/GetHeaders` - Ottieni header ID
- `/Disponibilita/GetCoverageServices` - Verifica copertura

Tutti richiedono header:
```
Authorization: Basic <base64(username:password)>
```

---

**Ultimo aggiornamento:** 2025-01-06
**Status:** ✅ Configurazione completata e pronta per test
