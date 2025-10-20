# Setup Portainer con GitHub Repository

Guida per deployare lo stack usando il **repository GitHub** invece del Web editor.

## Vantaggi di questo Approccio

✅ **Single Source of Truth** - Docker compose su GitHub
✅ **Versionato** - Tutte le modifiche tracciate
✅ **Auto-sync** - Portainer può aggiornare stack da GitHub
✅ **Collaborativo** - Team può modificare facilmente
✅ **Rollback facile** - Usa commit precedenti
✅ **Nessuna duplicazione** - Compose non copiato in Portainer

---

## STEP 1: Push File su GitHub

### 1.1 Commit e Push

```bash
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Aggiungi i nuovi file
git add docker-compose.portainer.yml
git add .env.portainer.example
git add .gitignore

# Commit
git commit -m "feat: add Portainer stack configuration"

# Push
git push origin main
```

### 1.2 Verifica su GitHub

Vai su GitHub e verifica che questi file siano presenti:
- `docker-compose.portainer.yml`
- `.env.portainer.example`

---

## STEP 2: Configura Stack in Portainer

### 2.1 Crea Nuovo Stack

1. Accedi a Portainer: `http://IP-SERVER:9000`
2. Menu laterale → **Stacks**
3. Click **+ Add stack**

### 2.2 Configurazione Base

**Name:**
```
twt-partner-dashboard
```

**Build method:** Seleziona **"Repository"** (NON "Web editor"!)

### 2.3 Repository Settings

#### Repository URL:
```
https://github.com/<your-github-username>/PARTNER-DASHBOARD
```

**Esempio:** Se il tuo username GitHub è `mkou`:
```
https://github.com/mkou/PARTNER-DASHBOARD
```

#### Repository reference:
```
refs/heads/main
```

(Oppure `refs/heads/master` se il branch principale si chiama `master`)

#### Compose path:
```
docker-compose.portainer.yml
```

#### Authentication:

**Repository pubblico:**
- Lascia vuoto

**Repository privato:**
- Username: `<tuo-github-username>`
- Personal access token: (vedi sotto come crearlo)

---

## STEP 3: Environment Variables

Scorri in basso fino a **"Environment variables"** e aggiungi:

### Variabili OBBLIGATORIE:

| Name | Value | Esempio |
|------|-------|---------|
| `DOCKER_USERNAME` | Username Docker Hub | `mkou` |
| `CORS_ORIGIN` | URL server | `http://192.168.1.100` |
| `TWT_API_USERNAME` | Username TWT | `GREENTEL_PAVONE` |
| `TWT_API_PASSWORD` | Password TWT | `Pc_260516` |

### Variabili OPZIONALI (con default):

| Name | Value | Note |
|------|-------|------|
| `TWT_PROVIDER_FILTER` | `10` | 10=TIM, 20=Fastweb |
| `TWT_TECHNOLOGY_FILTER` | `FTTC,FTTH` | Tecnologie |
| `TWT_EXCLUDE_VARIANTS` | `Lite` | Escludi varianti Lite |
| `EXCLUDE_PROFILES_WITH_PRIORITY` | `9999` | Escludi profili deprecated |
| `PROFILE_DESCRIPTION_PREFIX` | `TWT_TI` | Solo profili TIM |
| `PROFILE_TABLE_COLUMNS` | `description` | Colonne visibili |

Le altre variabili (`TWT_INCLUDE_VARIANTS`, `EXCLUDE_PROFILES_BY_KEYWORD`) possono essere omesse (default vuoto).

---

## STEP 4: Deploy

1. ✅ Verifica che tutti i campi siano compilati:
   - Name = `twt-partner-dashboard`
   - Repository URL corretto
   - Reference = `refs/heads/main`
   - Compose path = `docker-compose.portainer.yml`
   - Almeno 4 variabili obbligatorie configurate

2. Click **"Deploy the stack"**

3. Portainer:
   - Clona il repository GitHub
   - Legge `docker-compose.portainer.yml`
   - Scarica immagini Docker
   - Crea network e volumes
   - Avvia i container

4. Attendi 2-3 minuti

---

## STEP 5: Verifica

### 5.1 Controlla Container

Menu → **Containers**

Dovresti vedere:
```
✅ twt-partner-backend    [healthy]   Up 2 minutes
✅ twt-partner-frontend   [healthy]   Up 2 minutes
```

### 5.2 Test Backend

```bash
curl http://IP-SERVER:3000/api/health
```

Output atteso:
```json
{"status":"ok","timestamp":"2025-01-20T..."}
```

### 5.3 Test Frontend

Apri browser: `http://IP-SERVER`

---

## STEP 6: GitHub Personal Access Token (Solo per Repo Privati)

Se il tuo repository è **privato**, devi creare un Personal Access Token.

### 6.1 Crea Token su GitHub

1. Vai su: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Note: `Portainer Access`
4. Expiration: `No expiration` (oppure 1 anno)
5. Scopes: Seleziona **SOLO**:
   - ✅ `repo` (Full control of private repositories)
6. Click **"Generate token"**
7. **COPIA IL TOKEN** (lo vedi una sola volta!)

### 6.2 Usa Token in Portainer

In Portainer, nella sezione **Authentication**:
- Username: `<tuo-github-username>`
- Personal access token: `ghp_xxxxxxxxxxxxxxxxxxxxx` (incolla il token)

---

## VANTAGGI: Workflow Update Stack

### Scenario: Modificare Docker Compose

#### 1. Modifica Locale
```bash
# Modifica docker-compose.portainer.yml
nano docker-compose.portainer.yml

# Esempio: cambia porta backend
ports:
  - "3001:3000"  # invece di 3000:3000
```

#### 2. Commit e Push
```bash
git add docker-compose.portainer.yml
git commit -m "chore: change backend port to 3001"
git push origin main
```

#### 3. Update in Portainer

**Opzione A - Manuale:**
1. Vai su Portainer → Stacks → `twt-partner-dashboard`
2. Click **"Pull and redeploy"**
3. Portainer fa pull da GitHub e aggiorna lo stack

**Opzione B - Webhook Automatico (avanzato):**
1. In Portainer Stack, abilita **Webhook**
2. Copia Webhook URL
3. Su GitHub → Repository → Settings → Webhooks → Add webhook
4. Incolla URL e salva
5. Ogni push su `main` triggera auto-update in Portainer!

---

## Confronto: Repository vs Web Editor

| Caratteristica | Repository GitHub | Web Editor |
|---------------|------------------|------------|
| Versionamento | ✅ Completo su Git | ❌ Solo snapshot Portainer |
| Modifiche | ✅ Git workflow | ⚠️ Edita in Portainer UI |
| Collaborazione | ✅ Pull request | ❌ Accesso Portainer richiesto |
| Backup | ✅ Automatico (GitHub) | ⚠️ Manuale |
| Rollback | ✅ Git revert | ⚠️ Re-edit manuale |
| CI/CD | ✅ Integrabile | ❌ No |
| Webhook | ✅ Auto-update | ❌ No |
| Semplicità setup | ⚠️ Media | ✅ Alta |

**Raccomandazione:** Usa **Repository** per produzione, Web editor solo per test rapidi.

---

## Troubleshooting

### Errore: "Failed to clone repository"

**Causa:** URL repository errato o repo privato senza authentication

**Soluzione:**
1. Verifica URL su GitHub (click "Code" → HTTPS)
2. Se repo privato → aggiungi Personal Access Token
3. Verifica reference: `refs/heads/main` (non solo `main`)

### Errore: "Compose file not found"

**Causa:** Path compose errato

**Soluzione:**
1. Verifica file esista su GitHub: `docker-compose.portainer.yml`
2. Path deve essere esatto: `docker-compose.portainer.yml` (NON `/docker-compose.portainer.yml`)
3. Commit e push se file manca

### Errore: "Environment variable not set"

**Causa:** Variabile obbligatoria mancante (es: `DOCKER_USERNAME`)

**Soluzione:**
1. Stacks → Editor
2. Scorri a "Environment variables"
3. Aggiungi variabile mancante
4. "Update the stack"

### Container "unhealthy"

**Causa:** Variabili d'ambiente errate o immagini mancanti

**Soluzione:**
1. Click container → Logs
2. Cerca errori
3. Verifica `DOCKER_USERNAME` corrisponda al tuo username Docker Hub
4. Verifica immagini esistano: `https://hub.docker.com/r/<username>/twt-partner-backend`

---

## Best Practice

### ✅ DO:
- Usa branch `main` o `master` come reference stabile
- Testa modifiche al compose localmente prima di pushare
- Usa variabili d'ambiente per valori che cambiano tra ambienti
- Documenta variabili in `.env.portainer.example`
- Versionamento semantico: `v1.0.0`, `v1.1.0`, etc.

### ❌ DON'T:
- NON committare secrets nel compose (usa env vars)
- NON usare reference `HEAD` (instabile)
- NON hardcodare IP/hostname nel compose
- NON modificare stack direttamente in Portainer UI (perdi sync con GitHub)

---

## Comandi Utili

### Verifica Configurazione Stack

```bash
# SSH nel server
ssh user@IP-SERVER

# Controlla quale compose usa lo stack
docker ps --format "{{.Names}}\t{{.Image}}"

# Controlla environment variables
docker exec twt-partner-backend env | grep TWT

# Verifica repository reference
# (In Portainer UI: Stacks → twt-partner-dashboard → info)
```

### Force Pull da GitHub

```bash
# In Portainer:
# 1. Stacks → twt-partner-dashboard
# 2. Click "Pull and redeploy"

# Oppure via API:
curl -X POST "http://IP-SERVER:9000/api/stacks/<stack-id>/git/redeploy" \
  -H "X-API-Key: <api-key>"
```

---

## Next Steps

Dopo aver deployato lo stack con GitHub repository:

1. ✅ Deploy Watchtower (vedi `DEPLOY-GITHUB-ACTIONS.md`)
2. ✅ Setup webhook GitHub → Portainer (opzionale)
3. ✅ Test workflow completo: modifica compose → push → auto-update

---

**Vantaggi finali:**
- Git push → GitHub Actions builda immagini
- Watchtower aggiorna container con nuove immagini
- Se modifichi compose → Pull and redeploy in Portainer
- **Tutto versionato e tracciato!** 🎉

---

**Data:** 2025-01-20
**Versione:** 1.0.0
