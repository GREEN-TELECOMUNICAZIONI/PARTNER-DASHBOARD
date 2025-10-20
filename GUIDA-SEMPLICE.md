# Deploy Automatico - Guida Semplicissima

Il metodo PIÙ SEMPLICE per avere CI/CD automatico.

## Come Funziona (in 3 step)

```
1. git push su GitHub
   ↓
2. GitHub Actions builda e pusha immagini Docker
   ↓
3. Watchtower le scarica automaticamente ogni 5 minuti
```

**Tempo setup totale: 10 minuti**
**Tempo deploy dopo: 10-15 minuti automatici**

---

## SETUP INIZIALE (Una volta sola)

### STEP 1: Configura GitHub (3 minuti)

#### 1.1 Crea i file necessari

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Crea workflow GitHub Actions
mkdir -p .github/workflows
cat > .github/workflows/build.yml << 'EOF'
name: Build and Push

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/${{ github.repository_owner }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Backend
        run: |
          docker build -t ${{ env.IMAGE_PREFIX }}/backend:latest ./backend
          docker push ${{ env.IMAGE_PREFIX }}/backend:latest

      - name: Build and Push Frontend
        run: |
          docker build -t ${{ env.IMAGE_PREFIX }}/frontend:latest \
            --build-arg VITE_API_URL=http://YOUR_SERVER_IP:3000/api \
            ./frontend
          docker push ${{ env.IMAGE_PREFIX }}/frontend:latest

      - name: Success
        run: echo "✅ Images pushed successfully!"
EOF

# Crea docker-compose per Portainer
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: ghcr.io/green-telecomunicazioni/backend:latest
    container_name: backend
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
      TWT_PROVIDER_FILTER: ${TWT_PROVIDER_FILTER:-10}
      TWT_TECHNOLOGY_FILTER: ${TWT_TECHNOLOGY_FILTER:-FTTC,FTTH}
      TWT_EXCLUDE_VARIANTS: ${TWT_EXCLUDE_VARIANTS:-Lite}
      EXCLUDE_PROFILES_WITH_PRIORITY: ${EXCLUDE_PROFILES_WITH_PRIORITY:-9999}
      PROFILE_DESCRIPTION_PREFIX: ${PROFILE_DESCRIPTION_PREFIX:-TWT_TI}
      PROFILE_TABLE_COLUMNS: ${PROFILE_TABLE_COLUMNS:-description}
    volumes:
      - backend-logs:/app/logs
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

  frontend:
    image: ghcr.io/green-telecomunicazioni/frontend:latest
    container_name: frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      backend:
        condition: service_healthy
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

networks:
  app-network:
    driver: bridge

volumes:
  backend-logs:
EOF
```

#### 1.2 Modifica il workflow con il TUO IP

Apri `.github/workflows/build.yml` e sostituisci `YOUR_SERVER_IP` con l'IP del tuo server.

```bash
# Usa sed per sostituire (macOS)
sed -i '' 's/YOUR_SERVER_IP/192.168.1.100/g' .github/workflows/build.yml
```

Oppure apri il file e modifica manualmente la riga:
```yaml
--build-arg VITE_API_URL=http://192.168.1.100:3000/api \
```

#### 1.3 Push su GitHub

```bash
git add .github/workflows/build.yml docker-compose.prod.yml
git commit -m "ci: add simple CI/CD setup"
git push origin main
```

---

### STEP 2: Verifica Build (5 minuti)

#### 2.1 Controlla Workflow

Vai su: https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD/actions

Dovresti vedere il workflow "Build and Push" in esecuzione (pallino giallo 🟡).

Attendi che diventi verde ✅ (circa 5 minuti).

#### 2.2 Rendi Pubbliche le Immagini Docker

**IMPORTANTE:** Le immagini Docker (non il codice!) devono essere pubbliche per Watchtower.

1. Vai su: https://github.com/orgs/GREEN-TELECOMUNICAZIONI/packages
2. Dovresti vedere: `backend` e `frontend`
3. Per OGNUNA:
   - Click sul package
   - Click "Package settings" (sidebar destra)
   - Scorri giù a "Danger Zone"
   - Click "Change visibility"
   - Seleziona "Public"
   - Conferma

**Nota:** Stai rendendo pubbliche solo le immagini Docker (compilate), NON il codice sorgente!

---

### STEP 3: Deploy su Portainer (2 minuti)

#### 3.1 Crea Stack Applicazione

1. Apri Portainer: http://YOUR_SERVER_IP:9000
2. Menu → **Stacks** → **+ Add stack**
3. Name: `app`
4. Build method: **Repository**
5. Compila:
   - Repository URL: `https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD`
   - Reference: `refs/heads/main`
   - Compose path: `docker-compose.prod.yml`
   - Authentication: (vuoto, se repo pubblico)

#### 3.2 Aggiungi Environment Variables

Clicca "+ Add an environment variable" per ognuna:

| Name | Value |
|------|-------|
| `CORS_ORIGIN` | `http://YOUR_SERVER_IP` |
| `TWT_API_USERNAME` | `GREENTEL_PAVONE` |
| `TWT_API_PASSWORD` | `Pc_260516` |

Opzionali (puoi saltarle):
- `TWT_PROVIDER_FILTER` = `10`
- `TWT_TECHNOLOGY_FILTER` = `FTTC,FTTH`
- Altre...

#### 3.3 Deploy

Click **"Deploy the stack"**

Attendi 2-3 minuti.

Verifica su Menu → **Containers**:
- ✅ backend [healthy]
- ✅ frontend [healthy]

---

### STEP 4: Deploy Watchtower (1 minuto)

#### 4.1 Crea Stack Watchtower

1. Portainer → **Stacks** → **+ Add stack**
2. Name: `watchtower`
3. Build method: **Web editor**
4. Incolla:

```yaml
version: '3.8'

services:
  watchtower:
    image: containrrr/watchtower:latest
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      WATCHTOWER_POLL_INTERVAL: 300
      WATCHTOWER_LABEL_ENABLE: "true"
      WATCHTOWER_CLEANUP: "true"
      TZ: Europe/Rome
    labels:
      - "com.centurylinklabs.watchtower.enable=false"
```

5. Click **"Deploy the stack"**

**✅ FATTO! Setup completo!**

---

## COME USARE (ogni giorno)

### Fai una modifica e pusha:

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Modifica qualcosa
nano backend/src/main.ts

# Commit e push
git add .
git commit -m "feat: nuova funzionalità"
git push origin main
```

### Cosa succede automaticamente:

1. **0-5 min:** GitHub Actions builda nuove immagini
2. **5-10 min:** Watchtower controlla (ogni 5 min)
3. **10 min:** Container aggiornati automaticamente!

### Verifica deploy:

```bash
# SSH nel server
ssh user@YOUR_SERVER_IP

# Controlla logs Watchtower
docker logs watchtower --tail 20

# Dovresti vedere:
# level=info msg="Found new image" container=/backend
# level=info msg="Stopping container" container=/backend
# level=info msg="Starting container" container=/backend
```

---

## TEST VELOCE

Facciamo un test per vedere che funziona:

```bash
# Sul tuo Mac
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Aggiungi un commento qualsiasi
echo "// Test deploy $(date)" >> backend/src/main.ts

# Push
git add .
git commit -m "test: verifica deploy automatico"
git push origin main
```

**Aspetta 10-15 minuti** e controlla:

```bash
ssh user@YOUR_SERVER_IP
docker logs watchtower --tail 30
```

Se vedi "Found new image" → **FUNZIONA!** 🎉

---

## TROUBLESHOOTING

### Workflow GitHub fallisce

**Problema:** Action rossa su GitHub

**Controlla:**
1. Logs del workflow (click sul workflow rosso)
2. Spesso è un errore di build (controlla Dockerfile)

### Immagini non trovate (pull access denied)

**Problema:** Container non parte

**Soluzione:**
1. Verifica immagini pubbliche: https://github.com/orgs/GREEN-TELECOMUNICAZIONI/packages
2. Ogni package deve essere "Public"

### Watchtower non aggiorna

**Problema:** Container non si aggiornano

**Verifica:**
```bash
# Controlla logs Watchtower
docker logs watchtower -f

# Dovrebbe mostrare "Checking containers" ogni 5 minuti
```

**Forza aggiornamento:**
```bash
docker exec watchtower /watchtower --run-once
```

### Container unhealthy

**Problema:** Container non passa healthcheck

**Soluzione:**
```bash
# Controlla logs
docker logs backend --tail 50
docker logs frontend --tail 50

# Spesso è un problema di env variables
# Verifica in Portainer → Stacks → app → Editor → Environment variables
```

---

## COMANDI UTILI

```bash
# Verifica stato container
docker ps

# Logs real-time
docker logs -f backend
docker logs -f frontend
docker logs -f watchtower

# Forza Watchtower a controllare subito
docker exec watchtower /watchtower --run-once

# Riavvia container manualmente
docker restart backend frontend

# Test API
curl http://localhost:3000/api/health
```

---

## CHECKLIST RAPIDA

Setup iniziale (una volta):
- [ ] File workflow creato
- [ ] IP server modificato nel workflow
- [ ] Push su GitHub
- [ ] Workflow completato (✅ verde)
- [ ] Immagini Docker rese pubbliche
- [ ] Stack "app" deployato su Portainer
- [ ] Environment variables configurate
- [ ] Container healthy
- [ ] Stack "watchtower" deployato

Uso quotidiano:
- [ ] Modifica codice
- [ ] git push
- [ ] Aspetta 10-15 min
- [ ] Verifica deploy automatico

---

## RIASSUNTO

**Setup:** 10 minuti (una volta sola)
**Deploy:** 10-15 minuti (automatico dopo ogni push)
**Complessità:** Minima
**Costi:** Zero
**Funziona?** Sì! ✅

---

**Nota sulla sicurezza:**
- Il codice sorgente rimane privato su GitHub
- Solo le immagini Docker (compilate) sono pubbliche
- Le immagini Docker non contengono sorgenti leggibili
- Le env variables (credenziali) sono solo su Portainer

---

**🎉 Hai CI/CD professionale con 3 comandi!**

```bash
git add .
git commit -m "feat: ..."
git push
```

E tutto il resto è automatico! 🚀
