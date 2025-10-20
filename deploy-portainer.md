# Deploy TWT Partner Dashboard su Portainer con Watchtower

Guida completa per deployare il TWT Partner Dashboard in produzione su Portainer con aggiornamenti automatici tramite Watchtower.

## Indice

1. [Prerequisiti](#prerequisiti)
2. [Preparazione Progetto](#preparazione-progetto)
3. [Setup Docker Registry](#setup-docker-registry)
4. [Build e Push Immagini](#build-e-push-immagini)
5. [Deploy su Portainer](#deploy-su-portainer)
6. [Setup Watchtower](#setup-watchtower)
7. [Verifica Deployment](#verifica-deployment)
8. [Gestione e Manutenzione](#gestione-e-manutenzione)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisiti

### Server di Produzione
- Portainer installato e funzionante
- Docker Engine 24.x o superiore
- Accesso SSH al server
- Porte disponibili: 80 (frontend), 3000 (backend)

### Locale (Macchina di Sviluppo)
- Docker Desktop installato
- Git configurato
- Accesso alla repository del progetto
- Account Docker Hub (o registry privato configurato)

---

## Preparazione Progetto

### 1. Clone Repository

```bash
# Clona la repository
git clone <repository-url>
cd PARTNER-DASHBOARD

# Verifica che i Dockerfile esistano
ls -la backend/Dockerfile frontend/Dockerfile
ls -la docker-compose.yml
```

### 2. Configurazione Variabili d'Ambiente

Crea il file `.env` nella root del progetto con le configurazioni di produzione:

```bash
nano .env
```

Inserisci le seguenti variabili (personalizza con i tuoi valori):

```env
# ============================================
# CONFIGURAZIONE PRODUZIONE
# ============================================

# CORS Configuration - URL pubblico del frontend
CORS_ORIGIN=https://your-domain.com

# Frontend API URL - URL pubblico del backend
VITE_API_URL=https://your-domain.com/api

# ============================================
# TWT API CONFIGURATION
# ============================================

# TWT API Base URL
TWT_API_BASE_URL=https://reseller.twt.it/api/xdsl

# TWT API Credentials
TWT_API_USERNAME=your_twt_username
TWT_API_PASSWORD=your_twt_password

# API Timeouts and Rate Limiting
TWT_API_TIMEOUT=30000
TWT_API_MAX_RETRIES=3
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# ============================================
# FILTRI PROVIDER E SERVIZI
# ============================================

# Provider Filter (10=TIM, 20=Fastweb, 30=Altri, 160=FWA EW)
# Esempi:
# TWT_PROVIDER_FILTER=10          # Solo TIM
# TWT_PROVIDER_FILTER=10,20       # TIM e Fastweb
# TWT_PROVIDER_FILTER=            # Tutti i provider
TWT_PROVIDER_FILTER=10

# Technology Filter (FTTC, FTTH, ETH)
TWT_TECHNOLOGY_FILTER=FTTC,FTTH

# Include/Exclude Variants
TWT_INCLUDE_VARIANTS=
TWT_EXCLUDE_VARIANTS=Lite

# Profile Filters
EXCLUDE_PROFILES_WITH_PRIORITY=9999
PROFILE_DESCRIPTION_PREFIX=TWT_TI
EXCLUDE_PROFILES_BY_KEYWORD=
PROFILE_TABLE_COLUMNS=description
```

**IMPORTANTE:** NON committare il file `.env` in git! Verifica che sia in `.gitignore`.

---

## Setup Docker Registry

Hai due opzioni per hostare le immagini Docker:

### Opzione A: Docker Hub (Consigliato per Semplicità)

#### 1. Crea Account Docker Hub

Vai su https://hub.docker.com e registrati (se non hai già un account).

#### 2. Login Locale

```bash
# Login da terminale
docker login

# Inserisci username e password
```

#### 3. Crea Repository Pubblici o Privati

Vai su Docker Hub e crea due repository:
- `<your-username>/twt-partner-backend`
- `<your-username>/twt-partner-frontend`

### Opzione B: Registry Privato

Se preferisci un registry privato:

```bash
# Deploy registry su Portainer
# Crea un nuovo Stack chiamato "registry" con questo compose:

version: '3.8'

services:
  registry:
    image: registry:2
    container_name: docker-registry
    restart: unless-stopped
    ports:
      - "5000:5000"
    volumes:
      - registry-data:/var/lib/registry
    environment:
      REGISTRY_STORAGE_DELETE_ENABLED: "true"

volumes:
  registry-data:
```

---

## Build e Push Immagini

### 1. Definisci il Tag delle Immagini

```bash
# Per Docker Hub
export DOCKER_REGISTRY="<your-dockerhub-username>"

# Per Registry Privato
# export DOCKER_REGISTRY="your-server-ip:5000"

# Tag versione (usa git tag o numero versione)
export VERSION="1.0.0"
```

### 2. Build Immagini

```bash
# Build Backend
cd backend
docker build \
  --tag ${DOCKER_REGISTRY}/twt-partner-backend:${VERSION} \
  --tag ${DOCKER_REGISTRY}/twt-partner-backend:latest \
  --platform linux/amd64 \
  .

# Build Frontend
cd ../frontend
docker build \
  --tag ${DOCKER_REGISTRY}/twt-partner-frontend:${VERSION} \
  --tag ${DOCKER_REGISTRY}/twt-partner-frontend:latest \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=https://your-domain.com/api \
  .

# Torna alla root
cd ..
```

**NOTA:** `--platform linux/amd64` è necessario se stai buildando su Mac M1/M2 (ARM).

### 3. Test Locale (Opzionale)

Prima di pushare, testa le immagini localmente:

```bash
# Crea file docker-compose.test.yml
cat > docker-compose.test.yml <<EOF
version: '3.8'

services:
  backend:
    image: ${DOCKER_REGISTRY}/twt-partner-backend:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      CORS_ORIGIN: http://localhost
      TWT_API_BASE_URL: https://reseller.twt.it/api/xdsl
      TWT_API_USERNAME: ${TWT_API_USERNAME}
      TWT_API_PASSWORD: ${TWT_API_PASSWORD}
      TWT_PROVIDER_FILTER: 10

  frontend:
    image: ${DOCKER_REGISTRY}/twt-partner-frontend:latest
    ports:
      - "8080:80"
    depends_on:
      - backend
EOF

# Avvia i container
docker-compose -f docker-compose.test.yml up

# Testa su http://localhost:8080
# Premi Ctrl+C per fermare

# Cleanup
docker-compose -f docker-compose.test.yml down
rm docker-compose.test.yml
```

### 4. Push Immagini al Registry

```bash
# Push Backend
docker push ${DOCKER_REGISTRY}/twt-partner-backend:${VERSION}
docker push ${DOCKER_REGISTRY}/twt-partner-backend:latest

# Push Frontend
docker push ${DOCKER_REGISTRY}/twt-partner-frontend:${VERSION}
docker push ${DOCKER_REGISTRY}/twt-partner-frontend:latest

# Verifica su Docker Hub
echo "Verifica le immagini su:"
echo "https://hub.docker.com/r/${DOCKER_REGISTRY}/twt-partner-backend"
echo "https://hub.docker.com/r/${DOCKER_REGISTRY}/twt-partner-frontend"
```

---

## Deploy su Portainer

### 1. Accedi a Portainer

Apri Portainer nel browser: `http://your-server-ip:9000` (o la porta configurata)

### 2. Crea Nuovo Stack

1. Nel menu laterale, vai su **Stacks**
2. Clicca **+ Add stack**
3. Nome stack: `twt-partner-dashboard`
4. Build method: **Web editor**

### 3. Copia il Docker Compose per Produzione

Incolla questo `docker-compose.yml` nell'editor (personalizza i valori):

```yaml
version: '3.8'

# ============================================
# TWT Partner Dashboard - Production Stack
# ============================================

services:
  # ==========================================
  # Backend Service (NestJS)
  # ==========================================
  backend:
    image: <your-dockerhub-username>/twt-partner-backend:latest
    container_name: twt-partner-backend
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      # Application
      NODE_ENV: production
      PORT: 3000

      # CORS - URL pubblico del frontend
      CORS_ORIGIN: ${CORS_ORIGIN}

      # TWT API Configuration
      TWT_API_BASE_URL: ${TWT_API_BASE_URL}
      TWT_API_USERNAME: ${TWT_API_USERNAME}
      TWT_API_PASSWORD: ${TWT_API_PASSWORD}
      TWT_API_TIMEOUT: ${TWT_API_TIMEOUT:-30000}
      TWT_API_MAX_RETRIES: ${TWT_API_MAX_RETRIES:-3}

      # Rate Limiting
      RATE_LIMIT_TTL: ${RATE_LIMIT_TTL:-60}
      RATE_LIMIT_MAX: ${RATE_LIMIT_MAX:-100}

      # Provider Filters
      TWT_PROVIDER_FILTER: ${TWT_PROVIDER_FILTER:-10}
      TWT_TECHNOLOGY_FILTER: ${TWT_TECHNOLOGY_FILTER:-FTTC,FTTH}
      TWT_INCLUDE_VARIANTS: ${TWT_INCLUDE_VARIANTS:-}
      TWT_EXCLUDE_VARIANTS: ${TWT_EXCLUDE_VARIANTS:-Lite}

      # Profile Filters
      EXCLUDE_PROFILES_WITH_PRIORITY: ${EXCLUDE_PROFILES_WITH_PRIORITY:-9999}
      PROFILE_DESCRIPTION_PREFIX: ${PROFILE_DESCRIPTION_PREFIX:-TWT_TI}
      EXCLUDE_PROFILES_BY_KEYWORD: ${EXCLUDE_PROFILES_BY_KEYWORD:-}
      PROFILE_TABLE_COLUMNS: ${PROFILE_TABLE_COLUMNS:-description}

    volumes:
      # Logs volume
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
      # Watchtower labels
      - "com.centurylinklabs.watchtower.enable=true"

  # ==========================================
  # Frontend Service (React + Nginx)
  # ==========================================
  frontend:
    image: <your-dockerhub-username>/twt-partner-frontend:latest
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
      # Watchtower labels
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

### 4. Configura Environment Variables

Scorri in basso fino alla sezione **Environment variables** e aggiungi tutte le variabili dal file `.env`:

**Clicca "Add an environment variable"** per ogni variabile:

| Name | Value |
|------|-------|
| `CORS_ORIGIN` | `https://your-domain.com` |
| `VITE_API_URL` | `https://your-domain.com/api` |
| `TWT_API_BASE_URL` | `https://reseller.twt.it/api/xdsl` |
| `TWT_API_USERNAME` | `your_username` |
| `TWT_API_PASSWORD` | `your_password` |
| `TWT_PROVIDER_FILTER` | `10` |
| `TWT_TECHNOLOGY_FILTER` | `FTTC,FTTH` |
| `TWT_EXCLUDE_VARIANTS` | `Lite` |
| `EXCLUDE_PROFILES_WITH_PRIORITY` | `9999` |
| `PROFILE_DESCRIPTION_PREFIX` | `TWT_TI` |
| `PROFILE_TABLE_COLUMNS` | `description` |

**IMPORTANTE:** Usa valori sicuri per username e password!

### 5. Deploy Stack

1. Clicca **Deploy the stack**
2. Attendi che Portainer scarichi le immagini e avvii i container
3. Verifica lo stato nella pagina **Containers**

---

## Setup Watchtower

Watchtower monitora i registry Docker e aggiorna automaticamente i container quando rilevi una nuova versione del tag `latest`.

### 1. Crea Stack Watchtower

In Portainer:

1. Vai su **Stacks** → **+ Add stack**
2. Nome: `watchtower`
3. Web editor

### 2. Incolla la Configurazione Watchtower

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

      # Se usi registry privato con autenticazione
      # - ~/.docker/config.json:/config.json:ro

    environment:
      # Interval di controllo (secondi) - default: 86400 (24h)
      # 300 = 5 minuti (per test), 3600 = 1 ora (produzione)
      WATCHTOWER_POLL_INTERVAL: 3600

      # Monitora solo container con label specifico
      WATCHTOWER_LABEL_ENABLE: "true"

      # Rimuovi vecchie immagini dopo update
      WATCHTOWER_CLEANUP: "true"

      # Include immagini fermate
      WATCHTOWER_INCLUDE_STOPPED: "false"

      # Include container riavviati
      WATCHTOWER_INCLUDE_RESTARTING: "true"

      # Rolling restart (un container alla volta)
      WATCHTOWER_ROLLING_RESTART: "true"

      # Notifiche (opzionale)
      # WATCHTOWER_NOTIFICATIONS: email
      # WATCHTOWER_NOTIFICATION_EMAIL_FROM: watchtower@example.com
      # WATCHTOWER_NOTIFICATION_EMAIL_TO: admin@example.com
      # WATCHTOWER_NOTIFICATION_EMAIL_SERVER: smtp.example.com
      # WATCHTOWER_NOTIFICATION_EMAIL_SERVER_PORT: 587
      # WATCHTOWER_NOTIFICATION_EMAIL_SERVER_USER: username
      # WATCHTOWER_NOTIFICATION_EMAIL_SERVER_PASSWORD: password

      # Timezone
      TZ: Europe/Rome

    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

    labels:
      - "com.centurylinklabs.watchtower.enable=false"
```

### 3. Deploy Watchtower

1. Clicca **Deploy the stack**
2. Verifica che il container `watchtower` sia in esecuzione

### 4. Verifica Funzionamento

```bash
# SSH nel server
ssh user@your-server-ip

# Controlla i log di Watchtower
docker logs -f watchtower

# Dovresti vedere:
# level=info msg="Watchtower 1.x.x"
# level=info msg="Using notifications: none"
# level=info msg="Checking containers"
```

---

## Verifica Deployment

### 1. Health Check Container

Verifica che i container siano healthy:

```bash
# SSH nel server
ssh user@your-server-ip

# Controlla stato container
docker ps

# Output atteso:
# CONTAINER ID   IMAGE                              STATUS                   PORTS
# xxxx           .../twt-partner-frontend:latest    Up 2 minutes (healthy)   0.0.0.0:80->80/tcp
# yyyy           .../twt-partner-backend:latest     Up 2 minutes (healthy)   0.0.0.0:3000->3000/tcp
# zzzz           containrrr/watchtower:latest       Up 2 minutes

# Controlla health specifico
docker inspect twt-partner-backend | grep -A 5 Health
docker inspect twt-partner-frontend | grep -A 5 Health
```

### 2. Test API Backend

```bash
# Health check
curl http://your-server-ip:3000/api/health

# Output atteso:
# {"status":"ok","timestamp":"2025-01-20T..."}

# Test endpoint cities
curl "http://your-server-ip:3000/api/coverage/cities?query=torino"
```

### 3. Test Frontend

Apri il browser e vai su: `http://your-server-ip`

Verifica:
- ✅ La pagina si carica correttamente
- ✅ Il form di ricerca indirizzo funziona
- ✅ La mappa si visualizza
- ✅ La verifica copertura restituisce risultati

### 4. Test Integrazione Frontend-Backend

1. Apri DevTools del browser (F12)
2. Vai alla tab **Network**
3. Esegui una ricerca città (es: "Torino")
4. Verifica che le chiamate API vadano a buon fine:
   - `/api/coverage/cities?query=torino` → 200 OK
   - `/api/coverage/streets?...` → 200 OK

### 5. Controlla Logs

In Portainer:
1. Vai su **Containers**
2. Clicca su `twt-partner-backend`
3. Tab **Logs** → verifica nessun errore
4. Ripeti per `twt-partner-frontend`

Oppure da SSH:

```bash
# Backend logs
docker logs -f twt-partner-backend

# Frontend logs (Nginx)
docker logs -f twt-partner-frontend

# Watchtower logs
docker logs -f watchtower
```

---

## Gestione e Manutenzione

### Workflow Deploy Aggiornamenti

#### 1. Sviluppo Locale

```bash
# Sviluppa le modifiche
git checkout -b feature/new-feature

# Testa localmente
./run.dev.sh

# Commit e push
git add .
git commit -m "feat: nuova funzionalità"
git push origin feature/new-feature

# Merge su main
git checkout main
git merge feature/new-feature
git push origin main
```

#### 2. Build e Push Nuove Immagini

```bash
# Pull latest
git pull origin main

# Build con nuovo tag versione
export VERSION="1.1.0"
export DOCKER_REGISTRY="<your-dockerhub-username>"

# Build backend
cd backend
docker build \
  --tag ${DOCKER_REGISTRY}/twt-partner-backend:${VERSION} \
  --tag ${DOCKER_REGISTRY}/twt-partner-backend:latest \
  --platform linux/amd64 \
  .
docker push ${DOCKER_REGISTRY}/twt-partner-backend:${VERSION}
docker push ${DOCKER_REGISTRY}/twt-partner-backend:latest

# Build frontend
cd ../frontend
docker build \
  --tag ${DOCKER_REGISTRY}/twt-partner-frontend:${VERSION} \
  --tag ${DOCKER_REGISTRY}/twt-partner-frontend:latest \
  --platform linux/amd64 \
  --build-arg VITE_API_URL=https://your-domain.com/api \
  .
docker push ${DOCKER_REGISTRY}/twt-partner-frontend:${VERSION}
docker push ${DOCKER_REGISTRY}/twt-partner-frontend:latest
```

#### 3. Deploy Automatico con Watchtower

Dopo il push, Watchtower rileverà automaticamente le nuove immagini entro 1 ora (o il tempo configurato in `WATCHTOWER_POLL_INTERVAL`).

Per forzare update immediato:

```bash
# SSH nel server
ssh user@your-server-ip

# Forza controllo Watchtower
docker exec watchtower /watchtower --run-once

# Oppure restart manuale (se non vuoi aspettare)
docker pull <your-registry>/twt-partner-backend:latest
docker pull <your-registry>/twt-partner-frontend:latest
docker-compose -f /opt/stacks/twt-partner-dashboard/docker-compose.yml up -d
```

### Update Variabili d'Ambiente

Se devi modificare le variabili d'ambiente:

1. In Portainer, vai su **Stacks** → `twt-partner-dashboard`
2. Clicca **Editor**
3. Scorri in basso alla sezione **Environment variables**
4. Modifica i valori necessari
5. Clicca **Update the stack**
6. I container verranno riavviati con le nuove variabili

### Backup

#### Backup Configurazione

```bash
# Esporta stack da Portainer
# Stacks → twt-partner-dashboard → Editor → copia tutto il YAML

# Salva in file
cat > backup-stack-$(date +%Y%m%d).yml <<EOF
# ... incolla qui lo YAML
EOF
```

#### Backup Logs

```bash
# Backup volume logs
docker run --rm \
  -v twt-partner-backend-logs:/source \
  -v $(pwd):/backup \
  alpine \
  tar czf /backup/backend-logs-$(date +%Y%m%d).tar.gz -C /source .

# Scarica il file via SCP
scp user@your-server-ip:~/backend-logs-*.tar.gz ./
```

### Rollback Versione

Se un deploy va male:

```bash
# SSH nel server
ssh user@your-server-ip

# Pull versione precedente
docker pull <your-registry>/twt-partner-backend:1.0.0

# Tag come latest
docker tag <your-registry>/twt-partner-backend:1.0.0 \
           <your-registry>/twt-partner-backend:latest

# O modifica lo stack in Portainer:
# Cambia image: .../backend:latest → image: .../backend:1.0.0
# Clicca "Update the stack"
```

### Monitoring

Installa Prometheus + Grafana (opzionale):

```bash
# In Portainer, crea nuovo stack "monitoring"

version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - prometheus-data:/prometheus
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  prometheus-data:
  grafana-data:
```

---

## Troubleshooting

### Container non si Avvia

**Problema:** Backend container si ferma subito dopo l'avvio.

**Soluzione:**

```bash
# Controlla logs
docker logs twt-partner-backend

# Possibili cause:
# 1. Credenziali TWT non valide → verifica TWT_API_USERNAME e PASSWORD
# 2. Variabile d'ambiente mancante → verifica .env in Portainer
# 3. Porta 3000 già in uso → cambia porta in docker-compose

# Test manuale
docker run --rm -it \
  -e TWT_API_USERNAME=xxx \
  -e TWT_API_PASSWORD=yyy \
  <your-registry>/twt-partner-backend:latest \
  /bin/sh

# All'interno del container
node dist/main.js
```

### Frontend 502 Bad Gateway

**Problema:** Nginx restituisce 502 quando provi ad accedere al frontend.

**Soluzione:**

```bash
# Verifica che backend sia healthy
docker ps | grep backend

# Controlla logs frontend
docker logs twt-partner-frontend

# Verifica network
docker network inspect twt-partner-network

# Verifica che backend sia raggiungibile dal frontend
docker exec twt-partner-frontend curl http://backend:3000/api/health

# Se fallisce, verifica docker-compose:
# - depends_on: backend condition: service_healthy
# - networks: entrambi sulla stessa rete
```

### API Chiamate Falliscono (401/403)

**Problema:** Frontend carica ma API restituiscono errori di autenticazione.

**Soluzione:**

```bash
# Verifica credenziali TWT
docker exec twt-partner-backend env | grep TWT_API

# Test manuale credenziali
curl -u "USERNAME:PASSWORD" \
  https://reseller.twt.it/api/xdsl/GetCities?city=torino

# Se fallisce → credenziali errate, contatta TWT
```

### Watchtower non Aggiorna

**Problema:** Pusho nuova immagine ma container non si aggiorna.

**Soluzione:**

```bash
# Verifica logs Watchtower
docker logs watchtower | grep twt-partner

# Verifica label sui container
docker inspect twt-partner-backend | grep watchtower

# Dovrebbe mostrare: "com.centurylinklabs.watchtower.enable": "true"

# Forza update manuale
docker exec watchtower /watchtower --run-once

# Verifica pull nuova immagine
docker pull <your-registry>/twt-partner-backend:latest
docker images | grep twt-partner-backend
```

### Container OOM (Out of Memory)

**Problema:** Container si ferma per mancanza di memoria.

**Soluzione:**

```bash
# Aggiungi limiti memoria in docker-compose.yml

services:
  backend:
    # ... altre config
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

### Logs Troppo Grandi

**Problema:** I log riempiono il disco.

**Soluzione:**

Già configurato nei compose con:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

Per pulire manualmente:

```bash
# Tronca log di un container
truncate -s 0 $(docker inspect --format='{{.LogPath}}' twt-partner-backend)

# Oppure pulisci tutti i log Docker
docker system prune -a --volumes
```

### Problemi CORS

**Problema:** Browser blocca richieste per CORS.

**Soluzione:**

```bash
# Verifica CORS_ORIGIN nel backend
docker exec twt-partner-backend env | grep CORS_ORIGIN

# Deve corrispondere all'URL del frontend
# Esempio: https://your-domain.com (NO trailing slash)

# Modifica in Portainer:
# Stacks → twt-partner-dashboard → Editor → Environment variables
# CORS_ORIGIN = https://your-domain.com
# Update the stack
```

### SSL/HTTPS Setup

**Problema:** Vuoi usare HTTPS in produzione.

**Soluzione:** Usa un reverse proxy come Nginx Proxy Manager o Traefik.

**Esempio con Nginx Proxy Manager:**

1. In Portainer, crea stack `nginx-proxy-manager`:

```yaml
version: '3.8'

services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - npm-data:/data
      - npm-letsencrypt:/etc/letsencrypt
    networks:
      - twt-network

networks:
  twt-network:
    external: true

volumes:
  npm-data:
  npm-letsencrypt:
```

2. Accedi a NPM su `http://your-server-ip:81`
3. Login default: `admin@example.com` / `changeme`
4. Crea Proxy Host:
   - Domain: `your-domain.com`
   - Forward Hostname: `twt-partner-frontend`
   - Forward Port: `80`
   - Enable SSL con Let's Encrypt

5. Aggiorna variabili d'ambiente in Portainer:
   - `CORS_ORIGIN=https://your-domain.com`
   - `VITE_API_URL=https://your-domain.com/api`

6. Rebuild frontend con nuovo VITE_API_URL e push

---

## Comandi Utili

### Docker Commands

```bash
# Lista container in esecuzione
docker ps

# Lista tutte le immagini
docker images

# Controlla logs
docker logs -f <container-name>

# Entra in un container
docker exec -it <container-name> /bin/sh

# Riavvia un container
docker restart <container-name>

# Stoppa tutti i container
docker stop $(docker ps -aq)

# Rimuovi container fermati
docker container prune

# Rimuovi immagini inutilizzate
docker image prune -a

# Spazio disco usato da Docker
docker system df

# Pulisci tutto (ATTENZIONE!)
docker system prune -a --volumes
```

### Portainer CLI

```bash
# SSH nel server
ssh user@your-server-ip

# Update stack via CLI
cd /opt/stacks/twt-partner-dashboard
docker-compose pull
docker-compose up -d

# Backup di tutti gli stack
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(pwd):/backup \
  portainer/portainer-ce:latest \
  --tlsskipverify
```

### Health Checks

```bash
# Check backend
curl http://localhost:3000/api/health

# Check frontend
curl http://localhost:80/health

# Check tutti i servizi
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Best Practices

### Sicurezza

1. ✅ **Non usare `latest` in produzione stabile** - Pinza versioni specifiche (es: `1.0.0`)
2. ✅ **Usa secrets per credenziali sensibili** - Considera Docker Secrets o Vault
3. ✅ **Abilita firewall** - Chiudi porte non necessarie
4. ✅ **Aggiorna regolarmente** - Mantieni Docker e immagini aggiornate
5. ✅ **Backup regolari** - Backup settimanali di configurazioni e dati

### Performance

1. ✅ **Resource limits** - Configura limiti CPU/memoria per ogni container
2. ✅ **Health checks** - Mantieni healthcheck per monitoraggio
3. ✅ **Log rotation** - Già configurato, max 10MB x 3 file
4. ✅ **Multi-stage build** - Già implementato nei Dockerfile

### Monitoring

1. ✅ **Controlla logs giornalmente**
2. ✅ **Setup alerting** - Email/Slack per Watchtower updates
3. ✅ **Disk usage** - Monitora spazio disco su server
4. ✅ **Uptime monitoring** - Usa servizio esterno (es: UptimeRobot)

---

## Checklist Deploy

Prima di considerare il deploy completato, verifica:

- [ ] Immagini Docker builddate e pushate
- [ ] Stack deployato su Portainer senza errori
- [ ] Container backend healthy (verde in Portainer)
- [ ] Container frontend healthy (verde in Portainer)
- [ ] API backend risponde: `curl http://server-ip:3000/api/health`
- [ ] Frontend accessibile nel browser: `http://server-ip`
- [ ] Form ricerca indirizzo funziona
- [ ] Mappa si visualizza correttamente
- [ ] Verifica copertura restituisce risultati
- [ ] Watchtower in esecuzione e monitora i container
- [ ] Logs backend senza errori critici
- [ ] Logs frontend senza errori critici
- [ ] Variabili d'ambiente configurate correttamente
- [ ] CORS configurato per dominio di produzione
- [ ] SSL/HTTPS attivo (se applicabile)
- [ ] Backup configurazione salvato
- [ ] Documentazione deployment aggiornata

---

## Supporto

Per problemi o domande:

1. **Documentazione Docker**: https://docs.docker.com
2. **Portainer Docs**: https://docs.portainer.io
3. **Watchtower Docs**: https://containrrr.dev/watchtower
4. **Issues Repository**: Apri issue su GitHub del progetto

---

## License

Proprietario - Green Partner

---

**Data ultimo aggiornamento:** 2025-01-20
**Versione guida:** 1.0.0
