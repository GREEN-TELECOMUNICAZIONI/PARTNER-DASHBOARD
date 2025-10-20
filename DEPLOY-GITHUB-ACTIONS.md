# Deploy Automatico con GitHub Actions + Portainer + Watchtower

Guida completa per setup CI/CD automatico con GitHub Actions che builda le immagini Docker e Watchtower che le deploya automaticamente su Portainer.

## Architettura della Soluzione

```
┌─────────────────┐
│  Git Push       │
│  su GitHub      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions  │
│ Build Images    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Docker Hub     │
│  (Registry)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Watchtower     │
│  Pull & Update  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Portainer     │
│   Containers    │
└─────────────────┘
```

**Workflow:**
1. Developer fa `git push` su branch `main`
2. GitHub Actions rileva il push e lancia workflow
3. GitHub Actions builda backend + frontend (multi-platform)
4. GitHub Actions pusha immagini su Docker Hub con tag `latest`
5. Watchtower (su server) controlla Docker Hub ogni ora
6. Watchtower rileva nuova immagine → pull automatico
7. Watchtower aggiorna container su Portainer (rolling restart)
8. Deploy completato automaticamente!

---

## PARTE 1: Setup GitHub Actions

### 1.1 Verifica File Workflow

Il file `.github/workflows/docker-build-push.yml` è già stato creato nel progetto.

**Cosa fa:**
- Trigger automatico su push a `main` o `master`
- Build backend + frontend in parallelo
- Push su Docker Hub con tag `latest` e versioni
- Multi-platform: `linux/amd64` + `linux/arm64`
- Cache layers per build veloce

### 1.2 Configura GitHub Secrets

Le credenziali sensibili vanno in **GitHub Secrets** (NON nel codice!).

#### Vai su GitHub Repository:
```
https://github.com/<tuo-username>/PARTNER-DASHBOARD/settings/secrets/actions
```

#### Click "New repository secret" per ognuno:

| Secret Name | Valore | Descrizione |
|------------|---------|-------------|
| `DOCKER_USERNAME` | `<tuo-username-dockerhub>` | Username Docker Hub |
| `DOCKER_PASSWORD` | `<tua-password-dockerhub>` | Password Docker Hub |
| `VITE_API_URL` | `http://<IP-SERVER>:3000/api` | URL API backend per frontend |

**Esempio:**
- `DOCKER_USERNAME` = `mkou`
- `DOCKER_PASSWORD` = `dckr_pat_xxxxxxxxxxxxx` (usa Access Token, vedi sotto)
- `VITE_API_URL` = `http://192.168.1.100:3000/api`

#### Come creare Docker Hub Access Token (consigliato):

1. Vai su https://hub.docker.com/settings/security
2. Click **"New Access Token"**
3. Description: `GitHub Actions`
4. Permissions: **Read, Write, Delete**
5. Generate → **Copia il token**
6. Usa questo token come `DOCKER_PASSWORD` in GitHub Secrets

### 1.3 Testa il Workflow

#### Push il workflow su GitHub:

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Aggiungi workflow file
git add .github/workflows/docker-build-push.yml

# Commit
git commit -m "ci: add GitHub Actions workflow for Docker build"

# Push
git push origin main
```

#### Verifica Esecuzione:

1. Vai su GitHub → Repository → Tab **"Actions"**
2. Dovresti vedere il workflow "Build and Push Docker Images" in esecuzione
3. Click sul workflow per vedere i logs
4. Attendi completamento (circa 5-10 minuti)

#### Verifica Immagini su Docker Hub:

```
https://hub.docker.com/r/<tuo-username>/twt-partner-backend
https://hub.docker.com/r/<tuo-username>/twt-partner-frontend
```

Dovresti vedere le immagini con tag `latest` e `main`.

---

## PARTE 2: Setup Portainer

### 2.1 Deploy Stack Applicazione

#### In Portainer:

1. Menu → **Stacks** → **+ Add stack**
2. Nome: `twt-partner-dashboard`
3. Build method: **Web editor**

#### Incolla questo docker-compose.yml:

**IMPORTANTE:** Sostituisci `<tuo-username-dockerhub>` con il tuo username!

```yaml
version: '3.8'

services:
  # ==========================================
  # Backend Service
  # ==========================================
  backend:
    image: <tuo-username-dockerhub>/twt-partner-backend:latest
    container_name: twt-partner-backend
    restart: unless-stopped
    ports:
      - "3000:3000"

    environment:
      NODE_ENV: production
      PORT: 3000

      # CORS - URL pubblico del frontend
      CORS_ORIGIN: ${CORS_ORIGIN}

      # TWT API Configuration
      TWT_API_BASE_URL: https://reseller.twt.it/api/xdsl
      TWT_API_USERNAME: ${TWT_API_USERNAME}
      TWT_API_PASSWORD: ${TWT_API_PASSWORD}
      TWT_API_TIMEOUT: 30000
      TWT_API_MAX_RETRIES: 3

      # Rate Limiting
      RATE_LIMIT_TTL: 60
      RATE_LIMIT_MAX: 100

      # Provider Filters
      TWT_PROVIDER_FILTER: ${TWT_PROVIDER_FILTER}
      TWT_TECHNOLOGY_FILTER: ${TWT_TECHNOLOGY_FILTER}
      TWT_INCLUDE_VARIANTS: ${TWT_INCLUDE_VARIANTS}
      TWT_EXCLUDE_VARIANTS: ${TWT_EXCLUDE_VARIANTS}

      # Profile Filters
      EXCLUDE_PROFILES_WITH_PRIORITY: ${EXCLUDE_PROFILES_WITH_PRIORITY}
      PROFILE_DESCRIPTION_PREFIX: ${PROFILE_DESCRIPTION_PREFIX}
      EXCLUDE_PROFILES_BY_KEYWORD: ${EXCLUDE_PROFILES_BY_KEYWORD}
      PROFILE_TABLE_COLUMNS: ${PROFILE_TABLE_COLUMNS}

    volumes:
      - backend-logs:/app/logs

    networks:
      - twt-network

    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

    labels:
      # Watchtower abilita auto-update per questo container
      - "com.centurylinklabs.watchtower.enable=true"

  # ==========================================
  # Frontend Service
  # ==========================================
  frontend:
    image: <tuo-username-dockerhub>/twt-partner-frontend:latest
    container_name: twt-partner-frontend
    restart: unless-stopped
    ports:
      - "80:80"

    depends_on:
      backend:
        condition: service_healthy

    networks:
      - twt-network

    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 20s

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

    labels:
      # Watchtower abilita auto-update per questo container
      - "com.centurylinklabs.watchtower.enable=true"

# ==========================================
# Networks
# ==========================================
networks:
  twt-network:
    name: twt-partner-network
    driver: bridge

# ==========================================
# Volumes
# ==========================================
volumes:
  backend-logs:
    name: twt-partner-backend-logs
    driver: local
```

#### Aggiungi Environment Variables:

Scorri in basso e aggiungi le variabili:

| Name | Value |
|------|-------|
| `CORS_ORIGIN` | `http://<IP-SERVER>` |
| `TWT_API_USERNAME` | `GREENTEL_PAVONE` |
| `TWT_API_PASSWORD` | `Pc_260516` |
| `TWT_PROVIDER_FILTER` | `10` |
| `TWT_TECHNOLOGY_FILTER` | `FTTC,FTTH` |
| `TWT_INCLUDE_VARIANTS` | `` (vuoto) |
| `TWT_EXCLUDE_VARIANTS` | `Lite` |
| `EXCLUDE_PROFILES_WITH_PRIORITY` | `9999` |
| `PROFILE_DESCRIPTION_PREFIX` | `TWT_TI` |
| `EXCLUDE_PROFILES_BY_KEYWORD` | `` (vuoto) |
| `PROFILE_TABLE_COLUMNS` | `description` |

#### Deploy Stack:
Click **"Deploy the stack"**

---

## PARTE 3: Setup Watchtower

### 3.1 Deploy Watchtower Stack

#### In Portainer:

1. Menu → **Stacks** → **+ Add stack**
2. Nome: `watchtower`
3. Build method: **Web editor**

#### Incolla questa configurazione:

```yaml
version: '3.8'

services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped

    volumes:
      # Socket Docker per controllare i container
      - /var/run/docker.sock:/var/run/docker.sock

    environment:
      # ======================================
      # CONFIGURAZIONE WATCHTOWER
      # ======================================

      # Interval di controllo (secondi)
      # 300 = 5 minuti (per test rapidi)
      # 3600 = 1 ora (produzione)
      WATCHTOWER_POLL_INTERVAL: 3600

      # Monitora SOLO container con label enable=true
      WATCHTOWER_LABEL_ENABLE: "true"

      # Rimuovi vecchie immagini dopo update
      WATCHTOWER_CLEANUP: "true"

      # Include container stopped
      WATCHTOWER_INCLUDE_STOPPED: "false"

      # Include container restarting
      WATCHTOWER_INCLUDE_RESTARTING: "true"

      # Rolling restart (un container alla volta)
      WATCHTOWER_ROLLING_RESTART: "true"

      # Timezone
      TZ: Europe/Rome

      # ======================================
      # NOTIFICHE (opzionale)
      # ======================================

      # Abilita notifiche (decommentare se serve)
      # WATCHTOWER_NOTIFICATIONS: shoutrrr
      # WATCHTOWER_NOTIFICATION_URL: "telegram://token@telegram?channels=chatid"

      # ======================================
      # DEBUG (decommentare per troubleshooting)
      # ======================================
      # WATCHTOWER_DEBUG: "true"
      # WATCHTOWER_TRACE: "true"

    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

    labels:
      # Watchtower NON deve auto-aggiornarsi
      - "com.centurylinklabs.watchtower.enable=false"
```

#### Deploy Watchtower:
Click **"Deploy the stack"**

### 3.2 Verifica Watchtower Funziona

#### SSH nel server:
```bash
ssh user@<IP-SERVER>

# Controlla logs Watchtower
docker logs -f watchtower
```

**Output atteso:**
```
time="2025-01-20T10:00:00Z" level=info msg="Watchtower 1.7.1"
time="2025-01-20T10:00:00Z" level=info msg="Using notifications: none"
time="2025-01-20T10:00:00Z" level=info msg="Checking containers"
time="2025-01-20T10:00:00Z" level=info msg="Scheduling first run: 2025-01-20 11:00:00 +0000 UTC"
time="2025-01-20T10:00:00Z" level=info msg="Note that the first check will be performed in 1 hour"
```

---

## PARTE 4: Workflow Completo - Come Funziona

### Scenario: Deploy di un Nuovo Feature

#### 1. Sviluppo Locale

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Crea branch feature
git checkout -b feature/nuova-funzionalita

# Sviluppa e testa localmente
./run.dev.sh

# Commit
git add .
git commit -m "feat: aggiunta nuova funzionalità"

# Push branch
git push origin feature/nuova-funzionalita
```

#### 2. Merge su Main

```bash
# Via GitHub PR o localmente:
git checkout main
git merge feature/nuova-funzionalita
git push origin main
```

#### 3. GitHub Actions (Automatico)

- ✅ Rileva push su `main`
- ✅ Checkout del codice
- ✅ Build backend (multi-platform)
- ✅ Build frontend (multi-platform)
- ✅ Push su Docker Hub con tag `latest`
- ✅ Durata: ~5-10 minuti

**Verifica su GitHub:**
```
https://github.com/<tuo-username>/PARTNER-DASHBOARD/actions
```

#### 4. Watchtower (Automatico entro 1 ora)

- ✅ Controlla Docker Hub ogni ora
- ✅ Rileva nuova immagine `twt-partner-backend:latest`
- ✅ Rileva nuova immagine `twt-partner-frontend:latest`
- ✅ Pull delle nuove immagini
- ✅ Stop del container backend → Start con nuova immagine
- ✅ Stop del container frontend → Start con nuova immagine
- ✅ Verifica healthcheck
- ✅ Rimozione vecchie immagini

**Verifica su Portainer:**
```
Menu → Containers → twt-partner-backend
```
Vedrai il container aggiornato con la nuova immagine.

#### 5. Verifica Deploy

```bash
# Test backend
curl http://<IP-SERVER>:3000/api/health

# Test frontend
open http://<IP-SERVER>
```

---

## PARTE 5: Comandi Utili

### Forza Update Immediato (senza aspettare 1 ora)

```bash
# SSH nel server
ssh user@<IP-SERVER>

# Forza Watchtower a controllare subito
docker exec watchtower /watchtower --run-once

# Oppure restart manuale del singolo container
docker pull <tuo-username>/twt-partner-backend:latest
docker restart twt-partner-backend
```

### Verifica Stato Container

```bash
# Lista container con healthcheck
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs backend
docker logs -f twt-partner-backend

# Logs frontend
docker logs -f twt-partner-frontend

# Logs Watchtower
docker logs -f watchtower --tail 50
```

### Rollback a Versione Precedente

Se un deploy va male:

```bash
# SSH nel server
ssh user@<IP-SERVER>

# Option 1: Pull versione specifica
docker pull <tuo-username>/twt-partner-backend:v1.0.0
docker tag <tuo-username>/twt-partner-backend:v1.0.0 \
           <tuo-username>/twt-partner-backend:latest
docker restart twt-partner-backend

# Option 2: Modifica stack in Portainer
# Cambia image: ...backend:latest → ...backend:v1.0.0
# Click "Update the stack"
```

### Debugging Watchtower

```bash
# Abilita debug mode
docker exec watchtower sh -c 'export WATCHTOWER_DEBUG=true && /watchtower --run-once'

# Controlla quali container monitora
docker exec watchtower /watchtower --list-containers

# Verifica che i container abbiano il label corretto
docker inspect twt-partner-backend | grep watchtower
```

---

## PARTE 6: Best Practices

### 6.1 Versioning Semantico

Usa tag git per versioni specifiche:

```bash
# Crea tag versione
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

GitHub Actions builderà anche:
- `<username>/twt-partner-backend:v1.0.0`
- `<username>/twt-partner-backend:1.0`
- `<username>/twt-partner-backend:latest`

### 6.2 Testing Prima del Deploy

Aggiungi test nel workflow:

```yaml
# In .github/workflows/docker-build-push.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd backend && npm ci && npm test
      - run: cd frontend && npm ci && npm run type-check

  build-backend:
    needs: test  # Run solo se test passa
    # ... resto del job
```

### 6.3 Notifiche Watchtower

Configurare notifiche Telegram/Slack quando Watchtower aggiorna:

```yaml
# In stack Watchtower
environment:
  WATCHTOWER_NOTIFICATIONS: shoutrrr
  WATCHTOWER_NOTIFICATION_URL: "telegram://token@telegram?channels=chatid"
```

### 6.4 Intervallo Watchtower

**Per ambiente di sviluppo/staging:**
```yaml
WATCHTOWER_POLL_INTERVAL: 300  # 5 minuti
```

**Per produzione:**
```yaml
WATCHTOWER_POLL_INTERVAL: 3600  # 1 ora
```

### 6.5 Security

#### Docker Hub Access Token vs Password:
✅ USA: Docker Hub Access Token (con permessi limitati)
❌ NON USARE: Password principale account

#### GitHub Secrets:
✅ Secrets sono criptati e sicuri
✅ Non appaiono nei logs
✅ Possono essere aggiornati senza modificare codice

---

## PARTE 7: Troubleshooting

### GitHub Actions fallisce al build

**Problema:** Workflow rosso, build failure

**Soluzione:**
```bash
# Controlla logs su GitHub Actions
# Possibili cause:

# 1. Secrets non configurati
# → Verifica GitHub Settings → Secrets → Actions

# 2. Dockerfile errato
# → Testa build locale
docker build -f backend/Dockerfile ./backend

# 3. Context errato
# → Verifica path nel workflow yaml
```

### Watchtower non aggiorna

**Problema:** Push nuova immagine ma container non si aggiorna

**Soluzione:**
```bash
# 1. Verifica label sul container
docker inspect twt-partner-backend | grep watchtower.enable
# Deve mostrare: "com.centurylinklabs.watchtower.enable": "true"

# 2. Verifica che l'immagine sia effettivamente cambiata
docker pull <username>/twt-partner-backend:latest
docker images | grep twt-partner-backend
# Confronta il digest/created time

# 3. Forza update manuale
docker exec watchtower /watchtower --run-once

# 4. Controlla logs Watchtower
docker logs watchtower --tail 100
```

### Container non passa healthcheck

**Problema:** Container si avvia ma rimane unhealthy

**Soluzione:**
```bash
# Controlla logs container
docker logs twt-partner-backend --tail 50

# Testa healthcheck manualmente
docker exec twt-partner-backend \
  node -e "require('http').get('http://localhost:3000/api/health', (r) => {console.log(r.statusCode)})"

# Se fallisce, possibili cause:
# - .env mancante o errato
# - Credenziali TWT non valide
# - Porta non in ascolto
```

### Frontend 502 Bad Gateway

**Problema:** Frontend carica ma API calls falliscono

**Soluzione:**
```bash
# 1. Verifica backend sia healthy
docker ps | grep backend

# 2. Verifica network
docker network inspect twt-partner-network

# 3. Testa connettività frontend → backend
docker exec twt-partner-frontend curl http://backend:3000/api/health

# 4. Verifica VITE_API_URL nel build
# Se hai cambiato IP server, devi:
# - Aggiornare GitHub Secret VITE_API_URL
# - Rebuild frontend (push su GitHub)
```

---

## PARTE 8: Monitoring e Alerting

### Setup Uptime Monitoring

Usa servizio esterno tipo **UptimeRobot**:

1. Registrati su https://uptimerobot.com (gratis)
2. Crea monitor:
   - Type: **HTTP(s)**
   - URL: `http://<IP-SERVER>/health`
   - Interval: **5 minutes**
3. Alert via email se down

### Setup Log Aggregation (Opzionale)

Per logs centralizzati:

```yaml
# In docker-compose.yml
services:
  backend:
    logging:
      driver: "syslog"
      options:
        syslog-address: "tcp://<log-aggregator>:514"
        tag: "twt-partner-backend"
```

---

## Checklist Finale

Prima di considerare il setup completo:

- [ ] GitHub Actions workflow committato e pushato
- [ ] GitHub Secrets configurati (DOCKER_USERNAME, DOCKER_PASSWORD, VITE_API_URL)
- [ ] Primo build su GitHub Actions completato con successo
- [ ] Immagini visibili su Docker Hub
- [ ] Stack applicazione deployato su Portainer
- [ ] Environment variables configurate in Portainer
- [ ] Container backend healthy (verde)
- [ ] Container frontend healthy (verde)
- [ ] Stack Watchtower deployato su Portainer
- [ ] Watchtower logs mostrano monitoraggio attivo
- [ ] Test manuale: backend API risponde
- [ ] Test manuale: frontend carica e funziona
- [ ] Test update: push su GitHub → verifica deploy automatico

---

## Conclusione

Con questo setup hai un **CI/CD completo e professionale**:

✅ **Zero Touch Deployment:** Push su GitHub → Deploy automatico in produzione
✅ **Build Consistente:** Sempre stesso ambiente Linux su GitHub Actions
✅ **Multi-Platform:** Supporto AMD64 + ARM64 automatico
✅ **Rolling Updates:** Watchtower aggiorna senza downtime
✅ **Tracciabilità:** Ogni deploy tracciato su GitHub
✅ **Scalabile:** Facile aggiungere test, staging, etc.

**Next Steps:**
- Setup branch `staging` per ambiente di test
- Aggiungere unit tests nel workflow
- Configurare notifiche Watchtower
- Setup monitoring con Prometheus/Grafana

---

**Data:** 2025-01-20
**Versione Guida:** 2.0.0
