# Deploy Completo con Registry Privato + Auto-Deploy

Guida completa per deploy automatico PRIVATO su Portainer con Watchtower.

## Come Funziona

```
┌─────────────┐
│  git push   │  ← Tu fai push su main
│   su main   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   GitHub    │  ← GitHub Actions builda le immagini
│   Actions   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Registry  │  ← Registry PRIVATO sul tuo server
│   Privato   │     (solo tu hai accesso)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Watchtower  │  ← Controlla ogni 5 minuti se ci sono nuove immagini
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Container  │  ← Deploy automatico!
│ Aggiornati  │
└─────────────┘
```

**Tempo totale:** git push → deploy = circa 10-15 minuti

---

## PARTE 1: Setup Registry Privato (5 minuti)

### STEP 1.1: Crea Stack Registry in Portainer

1. Accedi a Portainer: `http://IP-SERVER:9000`
2. Menu → **Stacks** → **+ Add stack**
3. Name: `registry`
4. Build method: **Web editor**
5. Incolla questo compose:

```yaml
version: '3.8'

services:
  registry:
    image: registry:2
    container_name: docker-registry
    restart: unless-stopped

    ports:
      - "5000:5000"

    environment:
      # Registry storage
      REGISTRY_STORAGE_FILESYSTEM_ROOTDIRECTORY: /var/lib/registry

      # Enable deletion
      REGISTRY_STORAGE_DELETE_ENABLED: "true"

      # Basic auth (user: admin, password: changeme)
      # Generato con: docker run --entrypoint htpasswd httpd:2 -Bbn admin changeme
      REGISTRY_AUTH: htpasswd
      REGISTRY_AUTH_HTPASSWD_REALM: Registry Realm
      REGISTRY_AUTH_HTPASSWD_PATH: /auth/htpasswd

    volumes:
      - registry-data:/var/lib/registry
      - registry-auth:/auth

    networks:
      - registry-network

    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "2"

  # Setup htpasswd per autenticazione
  registry-setup:
    image: httpd:2
    container_name: registry-setup
    restart: "no"

    volumes:
      - registry-auth:/auth

    command: >
      sh -c "
        if [ ! -f /auth/htpasswd ]; then
          htpasswd -Bbn admin changeme > /auth/htpasswd;
          echo 'Auth file created';
        else
          echo 'Auth file already exists';
        fi
      "

    networks:
      - registry-network

networks:
  registry-network:
    name: registry-network
    driver: bridge

volumes:
  registry-data:
    name: registry-data
    driver: local
  registry-auth:
    name: registry-auth
    driver: local
```

6. Click **"Deploy the stack"**

### STEP 1.2: Verifica Registry Funziona

```bash
# SSH nel server
ssh user@IP-SERVER

# Test registry (dovrebbe rispondere vuoto [])
curl http://localhost:5000/v2/_catalog

# Output atteso: {"repositories":[]}
```

**✅ Registry privato attivo!**

---

## PARTE 2: Configura GitHub Secrets (2 minuti)

### STEP 2.1: Crea GitHub Secrets

Vai su: `https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD/settings/secrets/actions`

Click **"New repository secret"** per OGNUNO:

| Name | Value | Note |
|------|-------|------|
| `REGISTRY_HOST` | `IP-TUO-SERVER:5000` | Es: `192.168.1.100:5000` |
| `REGISTRY_USERNAME` | `admin` | Username del registry |
| `REGISTRY_PASSWORD` | `changeme` | Password del registry |
| `VITE_API_URL` | `http://IP-TUO-SERVER:3000/api` | URL API per frontend |

**IMPORTANTE:** Sostituisci `IP-TUO-SERVER` con l'IP reale del tuo server!

---

## PARTE 3: Configura GitHub Actions (3 minuti)

### STEP 3.1: Crea Workflow File

Sul tuo Mac:

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Crea il workflow
cat > .github/workflows/deploy-private.yml << 'EOF'
name: Build and Deploy to Private Registry

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build-and-push:
    name: Build and Push Images
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout code
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Setup Docker Buildx
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      # 3. Login to Private Registry
      - name: Login to Private Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ secrets.REGISTRY_HOST }}
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      # 4. Build and Push Backend
      - name: Build and Push Backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: ${{ secrets.REGISTRY_HOST }}/twt-partner-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # 5. Build and Push Frontend
      - name: Build and Push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: ${{ secrets.REGISTRY_HOST }}/twt-partner-frontend:latest
          build-args: |
            VITE_API_URL=${{ secrets.VITE_API_URL }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      # 6. Success notification
      - name: Success
        run: |
          echo "✅ Images pushed to private registry!"
          echo "Backend: ${{ secrets.REGISTRY_HOST }}/twt-partner-backend:latest"
          echo "Frontend: ${{ secrets.REGISTRY_HOST }}/twt-partner-frontend:latest"
EOF
```

### STEP 3.2: Push Workflow su GitHub

```bash
git add .github/workflows/deploy-private.yml
git commit -m "ci: add private registry workflow"
git push origin main
```

### STEP 3.3: Verifica Workflow

1. Vai su: `https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD/actions`
2. Dovresti vedere il workflow "Build and Deploy to Private Registry" in esecuzione
3. Attendi che diventi ✅ verde (circa 5-10 minuti)

### STEP 3.4: Verifica Immagini nel Registry

```bash
# SSH nel server
ssh user@IP-SERVER

# Lista immagini nel registry
curl -u admin:changeme http://localhost:5000/v2/_catalog

# Output atteso:
# {"repositories":["twt-partner-backend","twt-partner-frontend"]}
```

**✅ Immagini nel registry privato!**

---

## PARTE 4: Deploy Applicazione su Portainer (5 minuti)

### STEP 4.1: Crea Docker Compose Locale

Sul tuo Mac:

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

cat > docker-compose.private-registry.yml << 'EOF'
version: '3.8'

# ============================================
# TWT Partner Dashboard - Private Registry
# ============================================
#
# Usa immagini dal registry PRIVATO locale
# Nessuna immagine pubblica necessaria!
# ============================================

services:
  backend:
    image: ${REGISTRY_HOST}/twt-partner-backend:latest
    container_name: twt-partner-backend
    restart: unless-stopped

    ports:
      - "3000:3000"

    environment:
      NODE_ENV: production
      PORT: 3000
      CORS_ORIGIN: ${CORS_ORIGIN}
      TWT_API_BASE_URL: https://reseller.twt.it/api/xdsl
      TWT_API_USERNAME: ${TWT_API_USERNAME}
      TWT_API_PASSWORD: ${TWT_API_PASSWORD}
      TWT_API_TIMEOUT: 30000
      TWT_API_MAX_RETRIES: 3
      RATE_LIMIT_TTL: 60
      RATE_LIMIT_MAX: 100
      TWT_PROVIDER_FILTER: ${TWT_PROVIDER_FILTER:-10}
      TWT_TECHNOLOGY_FILTER: ${TWT_TECHNOLOGY_FILTER:-FTTC,FTTH}
      TWT_INCLUDE_VARIANTS: ${TWT_INCLUDE_VARIANTS:-}
      TWT_EXCLUDE_VARIANTS: ${TWT_EXCLUDE_VARIANTS:-Lite}
      EXCLUDE_PROFILES_WITH_PRIORITY: ${EXCLUDE_PROFILES_WITH_PRIORITY:-9999}
      PROFILE_DESCRIPTION_PREFIX: ${PROFILE_DESCRIPTION_PREFIX:-TWT_TI}
      EXCLUDE_PROFILES_BY_KEYWORD: ${EXCLUDE_PROFILES_BY_KEYWORD:-}
      PROFILE_TABLE_COLUMNS: ${PROFILE_TABLE_COLUMNS:-description}

    volumes:
      - backend-logs:/app/logs

    networks:
      - app-network
      - registry-network

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
      - "com.centurylinklabs.watchtower.enable=true"

  frontend:
    image: ${REGISTRY_HOST}/twt-partner-frontend:latest
    container_name: twt-partner-frontend
    restart: unless-stopped

    ports:
      - "80:80"

    depends_on:
      backend:
        condition: service_healthy

    networks:
      - app-network
      - registry-network

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
      - "com.centurylinklabs.watchtower.enable=true"

networks:
  app-network:
    name: twt-partner-network
    driver: bridge
  registry-network:
    external: true
    name: registry-network

volumes:
  backend-logs:
    name: twt-partner-backend-logs
    driver: local
EOF
```

### STEP 4.2: Push su GitHub

```bash
git add docker-compose.private-registry.yml
git commit -m "feat: add private registry docker compose"
git push origin main
```

### STEP 4.3: Configura Stack in Portainer

1. Portainer → **Stacks** → **+ Add stack**
2. Name: `twt-partner-dashboard`
3. Build method: **Repository**
4. Repository URL: `https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD`
5. Repository reference: `refs/heads/main`
6. Compose path: `docker-compose.private-registry.yml`
7. Authentication: (lascia vuoto se repo pubblico)

### STEP 4.4: Environment Variables in Portainer

Aggiungi queste variabili:

| Name | Value |
|------|-------|
| `REGISTRY_HOST` | `IP-SERVER:5000` (es: `192.168.1.100:5000`) |
| `CORS_ORIGIN` | `http://IP-SERVER` |
| `TWT_API_USERNAME` | `GREENTEL_PAVONE` |
| `TWT_API_PASSWORD` | `Pc_260516` |

Opzionali (hanno default):
- `TWT_PROVIDER_FILTER` = `10`
- `TWT_TECHNOLOGY_FILTER` = `FTTC,FTTH`
- `TWT_EXCLUDE_VARIANTS` = `Lite`

### STEP 4.5: Deploy Stack

Click **"Deploy the stack"**

**IMPORTANTE:** La prima volta potrebbe dare errore perché i container devono autenticarsi al registry.

---

## PARTE 5: Setup Autenticazione Registry (3 minuti)

### STEP 5.1: Crea Docker Config nel Server

```bash
# SSH nel server
ssh user@IP-SERVER

# Login al registry privato
docker login IP-SERVER:5000
# Username: admin
# Password: changeme

# Verifica che funzioni
docker pull IP-SERVER:5000/twt-partner-backend:latest
docker pull IP-SERVER:5000/twt-partner-frontend:latest
```

### STEP 5.2: Riavvia Stack

In Portainer:
1. Stacks → `twt-partner-dashboard`
2. Click **"Stop this stack"**
3. Attendi 10 secondi
4. Click **"Start this stack"**

### STEP 5.3: Verifica Container

Menu → **Containers**

Dovresti vedere:
```
✅ twt-partner-backend    [healthy]
✅ twt-partner-frontend   [healthy]
```

---

## PARTE 6: Deploy Watchtower (2 minuti)

### STEP 6.1: Crea Stack Watchtower

1. Portainer → **Stacks** → **+ Add stack**
2. Name: `watchtower`
3. Build method: **Web editor**
4. Incolla questo compose:

```yaml
version: '3.8'

services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped

    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      # Config per autenticazione al registry privato
      - /root/.docker/config.json:/config.json:ro

    environment:
      # Check ogni 5 minuti (300 secondi)
      WATCHTOWER_POLL_INTERVAL: 300

      # Solo container con label
      WATCHTOWER_LABEL_ENABLE: "true"

      # Cleanup vecchie immagini
      WATCHTOWER_CLEANUP: "true"

      # Rolling restart
      WATCHTOWER_ROLLING_RESTART: "true"

      # Include restarting containers
      WATCHTOWER_INCLUDE_RESTARTING: "true"

      # Timezone
      TZ: Europe/Rome

      # Debug (opzionale, rimuovere in produzione)
      # WATCHTOWER_DEBUG: "true"

    networks:
      - registry-network

    logging:
      driver: "json-file"
      options:
        max-size: "5m"
        max-file: "2"

    labels:
      - "com.centurylinklabs.watchtower.enable=false"

networks:
  registry-network:
    external: true
    name: registry-network
```

5. Click **"Deploy the stack"**

### STEP 6.2: Verifica Watchtower

```bash
# SSH nel server
ssh user@IP-SERVER

# Controlla logs
docker logs -f watchtower

# Dovresti vedere:
# level=info msg="Watchtower started"
# level=info msg="Checking containers"
```

**✅ Watchtower attivo e monitora il registry privato!**

---

## PARTE 7: Test Completo (5 minuti)

### TEST 1: Verifica Applicazione Funziona

```bash
# Test backend
curl http://IP-SERVER:3000/api/health

# Output atteso: {"status":"ok",...}
```

Browser: `http://IP-SERVER` → Dovrebbe caricare il frontend

### TEST 2: Test Deploy Automatico

Facciamo una modifica e verifichiamo che si deploya automaticamente!

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Modifica qualcosa (es: aggiungi un commento)
echo "// Test deploy automatico" >> backend/src/main.ts

# Commit e push
git add .
git commit -m "test: deploy automatico"
git push origin main
```

**Cosa succede ora:**

1. **0-5 min:** GitHub Actions builda le nuove immagini
2. **5 min:** Immagini pushate al registry privato
3. **0-5 min:** Watchtower rileva nuove immagini
4. **1 min:** Watchtower aggiorna i container
5. **✅ Deploy completato!**

**Verifica:**

```bash
# Dopo 10-15 minuti, controlla i container
ssh user@IP-SERVER
docker ps --format "table {{.Names}}\t{{.Status}}"

# Controlla logs Watchtower
docker logs watchtower --tail 20

# Dovresti vedere qualcosa come:
# level=info msg="Found new image" container=twt-partner-backend
# level=info msg="Stopping container" container=twt-partner-backend
# level=info msg="Starting container" container=twt-partner-backend
```

**✅ Se vedi questi logs: FUNZIONA! Deploy automatico attivo!**

---

## 📋 CHECKLIST FINALE

- [ ] Registry privato deployato su Portainer
- [ ] Registry risponde su porta 5000
- [ ] GitHub Secrets configurati (4 secrets)
- [ ] Workflow GitHub Actions presente
- [ ] Primo workflow completato con successo
- [ ] Immagini visibili nel registry (`curl`)
- [ ] Docker compose pushato su GitHub
- [ ] Stack applicazione deployato su Portainer
- [ ] Environment variables configurate
- [ ] Container backend healthy
- [ ] Container frontend healthy
- [ ] Docker login eseguito sul server
- [ ] Watchtower deployato
- [ ] Test deploy automatico completato

---

## 🎯 WORKFLOW FINALE

**Da ora in poi, ogni volta che fai:**

```bash
git add .
git commit -m "feat: nuova funzionalità"
git push origin main
```

**Succede automaticamente:**
1. GitHub Actions builda (5 min)
2. Push al registry privato (1 min)
3. Watchtower rileva (max 5 min)
4. Container aggiornati (1 min)

**Totale: 10-15 minuti dal push al deploy in produzione!**

---

## 🔒 SICUREZZA

✅ **Immagini private** - Solo sul tuo server
✅ **Autenticazione** - Username/password per registry
✅ **Network isolato** - Container su network dedicato
✅ **No esposizione pubblica** - Nessuna immagine su internet

---

## 🆘 TROUBLESHOOTING

### Container non parte: "pull access denied"

**Causa:** Docker non autenticato al registry

**Soluzione:**
```bash
ssh user@IP-SERVER
docker login IP-SERVER:5000
# Username: admin, Password: changeme
docker restart twt-partner-backend twt-partner-frontend
```

### Watchtower non aggiorna

**Causa:** Watchtower non può accedere al registry

**Soluzione:**
```bash
# Verifica che watchtower abbia accesso al config.json
docker exec watchtower cat /config.json
# Dovrebbe mostrare le credenziali del registry

# Se vuoto, rifai login
docker login IP-SERVER:5000
docker restart watchtower
```

### Workflow GitHub fallisce

**Causa:** Secrets non configurati o IP errato

**Soluzione:**
1. Verifica secrets su GitHub
2. Verifica `REGISTRY_HOST` = `IP:5000` (con porta!)
3. Verifica IP server raggiungibile da internet (o usa VPN)

### Registry non risponde

**Soluzione:**
```bash
ssh user@IP-SERVER
docker logs docker-registry --tail 50
# Cerca errori

# Riavvia se necessario
docker restart docker-registry
```

---

## 🚀 COMANDI UTILI

```bash
# Verifica immagini nel registry
curl -u admin:changeme http://localhost:5000/v2/_catalog

# Verifica tag di un'immagine
curl -u admin:changeme http://localhost:5000/v2/twt-partner-backend/tags/list

# Forza Watchtower a controllare subito
docker exec watchtower /watchtower --run-once

# Logs real-time
docker logs -f watchtower
docker logs -f twt-partner-backend
docker logs -f twt-partner-frontend

# Riavvia applicazione
docker restart twt-partner-backend twt-partner-frontend
```

---

**🎉 FATTO! Hai un sistema di deploy automatico completamente PRIVATO!**

---

**Data:** 2025-01-20
**Versione:** 1.0.0
