# Setup con GitHub Container Registry (GHCR)

**Alternativa GRATUITA a Docker Hub!**

## Perché GHCR?

✅ **100% Gratis** - Nessun costo, nessun limite
✅ **Integrato con GitHub** - Usa lo stesso account
✅ **Nessun account esterno** - Non serve Docker Hub
✅ **Funziona con GitHub Actions** - Setup automatico
✅ **Pubblico o Privato** - Tu scegli

---

## PARTE 1: Setup GitHub Actions con GHCR

### 1.1 Sostituisci Workflow

Il nuovo workflow usa GHCR invece di Docker Hub:

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Rinomina il vecchio workflow
mv .github/workflows/docker-build-push.yml .github/workflows/docker-build-push.OLD

# Rinomina il nuovo workflow
mv .github/workflows/docker-build-push-ghcr.yml .github/workflows/docker-build-push.yml
```

### 1.2 Configura GitHub Variable (NON Secret!)

Vai su: `https://github.com/<tuo-username>/PARTNER-DASHBOARD/settings/variables/actions`

**Click "New repository variable":**

| Name | Value |
|------|-------|
| `VITE_API_URL` | `http://<IP-SERVER>:3000/api` |

**NOTA:** Usa **Variables** (non Secrets) per VITE_API_URL perché deve essere leggibile nel workflow.

### 1.3 Push e Testa

```bash
# Commit
git add .github/workflows/
git commit -m "ci: switch to GitHub Container Registry"
git push origin main
```

**Verifica su GitHub:**
1. Vai su: `https://github.com/<tuo-username>/PARTNER-DASHBOARD/actions`
2. Attendi completamento workflow (5-10 min)
3. Dovresti vedere: ✅ "Build and Push to GitHub Container Registry"

### 1.4 Rendi Pubbliche le Immagini

**IMPORTANTE:** Di default i package GHCR sono privati. Devi renderli pubblici!

1. Vai su: `https://github.com/<tuo-username>?tab=packages`
2. Dovresti vedere 2 packages:
   - `twt-partner-backend`
   - `twt-partner-frontend`
3. Per OGNUNO:
   - Click sul package
   - Click **"Package settings"** (in basso a destra)
   - Scorri in basso a **"Danger Zone"**
   - Click **"Change visibility"**
   - Seleziona **"Public"**
   - Conferma

**Perché pubblico?** Watchtower su Portainer deve poter fare pull senza autenticazione.

---

## PARTE 2: Deploy Stack su Portainer

### 2.1 Push Docker Compose GHCR

```bash
# Commit il nuovo compose
git add docker-compose.ghcr.yml
git commit -m "feat: add GHCR docker compose"
git push origin main
```

### 2.2 Configura Stack in Portainer

1. Accedi a Portainer
2. Menu → **Stacks** → **+ Add stack**
3. Name: `twt-partner-dashboard`

#### Build method:
```
✅ Repository
```

#### Repository URL:
```
https://github.com/<tuo-username-github>/PARTNER-DASHBOARD
```

#### Repository reference:
```
refs/heads/main
```

#### Compose path:
```
docker-compose.ghcr.yml
```

#### Authentication:
- Lascia vuoto (se repo pubblico)

### 2.3 Environment Variables

Aggiungi QUESTE variabili:

| Name | Value | Esempio |
|------|-------|---------|
| `GITHUB_USERNAME` | Username GitHub (lowercase!) | `mkou` |
| `CORS_ORIGIN` | URL server | `http://192.168.1.100` |
| `TWT_API_USERNAME` | Username TWT | `GREENTEL_PAVONE` |
| `TWT_API_PASSWORD` | Password TWT | `Pc_260516` |

**IMPORTANTE:** `GITHUB_USERNAME` deve essere tutto lowercase (GitHub lo richiede per GHCR).

Variabili opzionali (hanno default):
- `TWT_PROVIDER_FILTER` = `10`
- `TWT_TECHNOLOGY_FILTER` = `FTTC,FTTH`
- `TWT_EXCLUDE_VARIANTS` = `Lite`
- `EXCLUDE_PROFILES_WITH_PRIORITY` = `9999`
- `PROFILE_DESCRIPTION_PREFIX` = `TWT_TI`
- `PROFILE_TABLE_COLUMNS` = `description`

### 2.4 Deploy

Click **"Deploy the stack"**

Attendi 2-3 minuti.

---

## PARTE 3: Verifica

### 3.1 Controlla Container

Menu → **Containers**

Dovresti vedere:
```
✅ twt-partner-backend    [healthy]
✅ twt-partner-frontend   [healthy]
```

### 3.2 Test

```bash
# Backend
curl http://IP-SERVER:3000/api/health

# Frontend
open http://IP-SERVER
```

---

## PARTE 4: Deploy Watchtower

Watchtower funziona anche con GHCR!

### 4.1 Crea Stack Watchtower

1. Portainer → **Stacks** → **+ Add stack**
2. Nome: `watchtower`
3. Web editor

### 4.2 Compose Watchtower

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
      # Check ogni 1 ora
      WATCHTOWER_POLL_INTERVAL: 3600

      # Solo container con label
      WATCHTOWER_LABEL_ENABLE: "true"

      # Cleanup vecchie immagini
      WATCHTOWER_CLEANUP: "true"

      # Rolling restart
      WATCHTOWER_ROLLING_RESTART: "true"

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

### 4.3 Deploy Watchtower

Click **"Deploy the stack"**

---

## Workflow Completo

```
1. Modifico codice localmente
   ↓
2. git push origin main
   ↓
3. GitHub Actions builda immagini
   ↓
4. GitHub Actions pusha su GHCR
   ↓
5. Watchtower rileva nuove immagini
   ↓
6. Watchtower aggiorna container
   ↓
7. Deploy completato! ✅
```

**Tempo totale:** Push → Deploy in produzione = 10 min - 1 ora

---

## Troubleshooting

### Errore: "pull access denied for ghcr.io/..."

**Causa:** Immagini GHCR sono private

**Soluzione:**
1. Vai su: `https://github.com/<username>?tab=packages`
2. Rendi pubblici i package (vedi Parte 1.4)

### Errore: "manifest unknown"

**Causa:** Immagini non esistono ancora su GHCR

**Soluzione:**
1. Verifica workflow GitHub Actions completato
2. Vai su: `https://github.com/<username>?tab=packages`
3. Se non vedi package → workflow è fallito, controlla logs

### Container "unhealthy"

**Causa:** `GITHUB_USERNAME` errato o non lowercase

**Soluzione:**
1. Verifica username GitHub
2. Deve essere lowercase: `Mkou` → `mkou`
3. Update stack in Portainer con username corretto

### Workflow fallisce

**Causa:** Permissions insufficienti

**Soluzione:**
Già configurato nel workflow con:
```yaml
permissions:
  contents: read
  packages: write
```

Se fallisce ancora, verifica Settings → Actions → General → Workflow permissions = "Read and write permissions"

---

## Vantaggi vs Docker Hub

| Caratteristica | GHCR | Docker Hub |
|---------------|------|------------|
| Costo | ✅ Gratis | ⚠️ Limiti free tier |
| Pull rate limit | ✅ Nessuno | ⚠️ 200 pull/6h |
| Account | ✅ GitHub (già ce l'hai) | ❌ Account separato |
| Integrazione CI | ✅ Nativa | ⚠️ Serve config |
| Privacy | ✅ Pubblico/Privato | ⚠️ Free = pubblico |

---

## Comandi Utili

### Verifica Immagini GHCR

```bash
# Lista package GitHub
curl -H "Authorization: token ghp_xxx" \
  https://api.github.com/users/<username>/packages?package_type=container

# Pull manuale (test)
docker pull ghcr.io/<username>/twt-partner-backend:latest
docker pull ghcr.io/<username>/twt-partner-frontend:latest
```

### Force Update Container

```bash
# SSH nel server
ssh user@IP-SERVER

# Force Watchtower check
docker exec watchtower /watchtower --run-once
```

---

## Checklist Setup

- [ ] Workflow GitHub Actions aggiornato e pushato
- [ ] Variabile `VITE_API_URL` configurata su GitHub
- [ ] Workflow completato con successo
- [ ] Package visibili su GitHub
- [ ] Package impostati come **pubblici**
- [ ] `docker-compose.ghcr.yml` pushato su GitHub
- [ ] Stack deployato su Portainer con compose GHCR
- [ ] Environment variables configurate in Portainer
- [ ] Container backend e frontend healthy
- [ ] Watchtower deployato
- [ ] Test completati con successo

---

## Next Steps

Ora hai un setup completo con:
- ✅ CI/CD con GitHub Actions
- ✅ Container Registry gratuito (GHCR)
- ✅ Deploy automatico con Watchtower
- ✅ Zero costi esterni

**Push su GitHub → Deploy automatico in produzione!** 🚀

---

**Data:** 2025-01-20
**Versione:** 1.0.0
