# Deploy TWT Partner Dashboard - Guida Rapida

Ci sono **DUE modi** per deployare questo progetto su Portainer con Watchtower:

---

## ⭐ SOLUZIONE CONSIGLIATA: GitHub Actions (CI/CD Automatico)

**Vantaggi:**
- ✅ Build automatico ad ogni push su GitHub
- ✅ Zero configurazione macchina locale
- ✅ Deploy completamente automatico
- ✅ Multi-platform (AMD64 + ARM64)
- ✅ CI/CD professionale

**Workflow:**
1. Push codice su GitHub
2. GitHub Actions builda le immagini
3. GitHub Actions pusha su Docker Hub
4. Watchtower rileva nuove immagini
5. Watchtower aggiorna container automaticamente

**📖 Segui questa guida:** [DEPLOY-GITHUB-ACTIONS.md](./DEPLOY-GITHUB-ACTIONS.md)

---

## 🔧 SOLUZIONE ALTERNATIVA: Build Manuale

**Quando usarla:**
- Non hai repository GitHub
- Vuoi controllo totale del processo
- Test/sviluppo locale

**Workflow:**
1. Build immagini Docker localmente
2. Push manuale su Docker Hub
3. Deploy manuale su Portainer
4. Watchtower aggiorna automaticamente

**📖 Segui questa guida:** [deploy-portainer.md](./deploy-portainer.md)

---

## Confronto Soluzioni

| Caratteristica | GitHub Actions | Build Manuale |
|---------------|---------------|--------------|
| Automazione | ✅ Completa | ⚠️ Parziale |
| Setup Iniziale | ⚠️ Medio | ✅ Veloce |
| Manutenzione | ✅ Zero | ⚠️ Manuale |
| Tracciabilità | ✅ Completa | ❌ Nessuna |
| CI/CD | ✅ Sì | ❌ No |
| Costo | ✅ Gratis | ✅ Gratis |
| Complessità | ⚠️ Media | ✅ Bassa |

---

## Quick Start

### Per GitHub Actions:

```bash
# 1. Setup GitHub Secrets
# 2. Push workflow su GitHub
git add .github/workflows/docker-build-push.yml
git commit -m "ci: add GitHub Actions"
git push

# 3. Deploy stack su Portainer (una volta)
# 4. Deploy Watchtower (una volta)
# 5. Fatto! Ogni push deploierà automaticamente
```

### Per Build Manuale:

```bash
# 1. Build immagini
docker build -t username/twt-partner-backend:latest ./backend
docker build -t username/twt-partner-frontend:latest ./frontend

# 2. Push
docker push username/twt-partner-backend:latest
docker push username/twt-partner-frontend:latest

# 3. Deploy su Portainer
# 4. Ripeti ad ogni update
```

---

## Supporto

- **GitHub Actions:** [DEPLOY-GITHUB-ACTIONS.md](./DEPLOY-GITHUB-ACTIONS.md)
- **Build Manuale:** [deploy-portainer.md](./deploy-portainer.md)
- **Progetto:** [README.md](./README.md)

---

**Raccomandazione:** Inizia con **GitHub Actions** se hai una repository GitHub. È la soluzione più scalabile e professionale.
