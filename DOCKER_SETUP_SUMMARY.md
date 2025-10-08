# Docker Setup Summary - TWT Partner Dashboard

## Configuration Complete

La configurazione Docker completa e production-ready per il TWT Partner Dashboard è stata creata con successo.

---

## Files Created

### Backend (/backend)
1. **Dockerfile** - Multi-stage build optimized per NestJS
   - Stage 1: Build con TypeScript compilation
   - Stage 2: Production con Node.js Alpine
   - Non-root user (nestjs:1001)
   - Health check integrato
   - Size: ~200MB

2. **.dockerignore** - Esclusioni per build ottimizzata
   - node_modules, dist, test, logs
   - File di configurazione e documentazione

### Frontend (/frontend)
1. **Dockerfile** - Multi-stage build con Nginx
   - Stage 1: Build React con Vite
   - Stage 2: Nginx Alpine per serving
   - Non-root user (nginx-user:1001)
   - Health check integrato
   - Size: ~50MB

2. **nginx.conf** - Configurazione Nginx production-ready
   - Proxy API requests a backend
   - Gzip compression
   - Security headers
   - Cache ottimizzata
   - SPA routing support

3. **.dockerignore** - Esclusioni per build ottimizzata
   - node_modules, dist, .vite, test

### Root (/)
1. **docker-compose.yml** - Orchestrazione completa
   - Backend service (porta 3000)
   - Frontend service (porta 80)
   - Network isolata
   - Volume per logs
   - Health checks
   - Restart policies

2. **.dockerignore** - Esclusioni globali
   - Git files, documentazione, IDE config

3. **DOCKER_README.md** - Documentazione completa
   - Quick start guide
   - Architettura
   - Configurazione
   - Troubleshooting
   - Production deployment
   - Security best practices

### Scripts (/scripts)
1. **start.sh** - Avvia tutti i servizi
   - Verifica Docker installation
   - Crea .env se mancanti
   - Avvio in detached mode
   - Mostra URLs dei servizi

2. **stop.sh** - Ferma tutti i servizi
   - Graceful shutdown
   - Opzione per rimuovere volumes
   - Cleanup networks

3. **build.sh** - Build delle immagini
   - Build all/singolo servizio
   - No-cache option
   - Progress output

4. **logs.sh** - Visualizza logs
   - Follow mode
   - Filter per servizio
   - Custom tail lines
   - Help integrato

---

## Quick Start Commands

### Setup Iniziale
```bash
# 1. Configura environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Modifica backend/.env con le tue API credentials
nano backend/.env

# 3. Build immagini
./scripts/build.sh

# 4. Avvia servizi
./scripts/start.sh
```

### URLs dei Servizi
- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Health Check Backend**: http://localhost:3000/api/health
- **Health Check Frontend**: http://localhost/health

### Comandi Principali
```bash
# Avvia servizi
./scripts/start.sh

# Ferma servizi
./scripts/stop.sh

# Visualizza logs
./scripts/logs.sh -f

# Build immagini
./scripts/build.sh

# Rebuild senza cache
./scripts/build.sh --no-cache

# Status servizi
docker-compose ps

# Health check
curl http://localhost:3000/api/health
curl http://localhost/health
```

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Docker Compose Stack            │
│                                         │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Frontend  │      │   Backend    │  │
│  │  (Nginx)   │─────▶│  (NestJS)    │  │
│  │  Port: 80  │      │  Port: 3000  │  │
│  │  ~50MB     │      │  ~200MB      │  │
│  └────────────┘      └──────────────┘  │
│       │                     │           │
│       └──────────┬──────────┘           │
│                  │                      │
│         ┌────────▼────────┐            │
│         │ Docker Network  │            │
│         │ (twt-network)   │            │
│         └─────────────────┘            │
│                                         │
│         ┌─────────────────┐            │
│         │     Volumes     │            │
│         │ (backend-logs)  │            │
│         └─────────────────┘            │
└─────────────────────────────────────────┘
```

---

## Key Features

### Security
- ✅ Multi-stage builds (no build tools in production)
- ✅ Non-root users in all containers
- ✅ Alpine Linux base (minimal attack surface)
- ✅ Security headers in Nginx
- ✅ Internal Docker network
- ✅ Environment variables per secrets

### Performance
- ✅ Immagini ottimizzate (~250MB totale)
- ✅ Layer caching per build veloci
- ✅ Gzip compression
- ✅ Static assets caching
- ✅ Nginx proxy con buffering

### Reliability
- ✅ Health checks automatici
- ✅ Restart policies (unless-stopped)
- ✅ Graceful shutdown (dumb-init)
- ✅ Log rotation
- ✅ Dependency management (depends_on)

### Developer Experience
- ✅ Helper scripts per operazioni comuni
- ✅ Documentazione completa
- ✅ .dockerignore per build veloci
- ✅ Logging strutturato
- ✅ Easy debugging

---

## Environment Variables

### Backend (backend/.env)
```bash
NODE_ENV=production
PORT=3000
CORS_ORIGIN=http://localhost
TWT_API_BASE_URL=https://api.twt.it
TWT_API_KEY=your_api_key_here
TWT_API_TIMEOUT=30000
TWT_API_MAX_RETRIES=3
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Frontend (frontend/.env)
```bash
VITE_API_URL=http://localhost:3000
```

---

## Health Checks

### Backend Health Check
- **Endpoint**: http://localhost:3000/api/health
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 40s

### Frontend Health Check
- **Endpoint**: http://localhost/health
- **Interval**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 20s

### Verifica Status
```bash
# Check all services
docker-compose ps

# Detailed health status
docker inspect twt-partner-backend | grep Health -A 10
docker inspect twt-partner-frontend | grep Health -A 10
```

---

## Troubleshooting

### Logs
```bash
# All services
./scripts/logs.sh

# Follow logs
./scripts/logs.sh -f

# Specific service
./scripts/logs.sh --service backend
./scripts/logs.sh --service frontend
```

### Common Issues

**Port già in uso**:
```bash
# Trova processo
lsof -i :3000
lsof -i :80

# Uccidi processo o cambia porta in docker-compose.yml
```

**Build fallita**:
```bash
# Rebuild senza cache
./scripts/build.sh --no-cache

# Clean Docker system
docker system prune -a
```

**Container non parte**:
```bash
# Check logs
./scripts/logs.sh --service backend

# Check configuration
docker-compose config

# Inspect container
docker inspect twt-partner-backend
```

---

## Production Deployment

### Checklist
- [ ] Update environment variables per production
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS (reverse proxy)
- [ ] Configure domain names
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure log aggregation (ELK)
- [ ] Set resource limits
- [ ] Implement backup strategy
- [ ] Security scan delle immagini
- [ ] Test health checks

### Reverse Proxy
Usa Nginx, Traefik o HAProxy come reverse proxy per:
- SSL/TLS termination
- Load balancing
- Rate limiting globale
- DDoS protection

### Monitoring
```bash
# Resource usage
docker stats

# Container status
docker-compose ps

# Network inspection
docker network inspect twt-partner-network
```

---

## Maintenance

### Update Services
```bash
# Pull latest code
git pull

# Rebuild images
./scripts/build.sh --no-cache

# Restart services
./scripts/stop.sh && ./scripts/start.sh
```

### Cleanup
```bash
# Remove unused resources
docker system prune -a

# Remove volumes (BE CAREFUL!)
docker volume prune
```

### Backup Logs
```bash
# Backup volume
docker run --rm -v twt-partner-backend-logs:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/logs-$(date +%Y%m%d).tar.gz /data
```

---

## Testing

### Verify Installation
```bash
# Check Docker version
docker --version
docker-compose --version

# Build images
./scripts/build.sh

# Start services
./scripts/start.sh

# Wait for health checks (30-60 seconds)
docker-compose ps

# Test endpoints
curl http://localhost:3000/api/health
curl http://localhost/health
curl http://localhost

# View logs
./scripts/logs.sh

# Stop services
./scripts/stop.sh
```

---

## File Structure

```
PARTNER-DASHBOARD/
├── backend/
│   ├── Dockerfile                 # Backend multi-stage build
│   ├── .dockerignore              # Backend exclusions
│   └── .env                       # Backend environment
├── frontend/
│   ├── Dockerfile                 # Frontend multi-stage build
│   ├── .dockerignore              # Frontend exclusions
│   ├── nginx.conf                 # Nginx configuration
│   └── .env                       # Frontend environment
├── scripts/
│   ├── start.sh                   # Start services
│   ├── stop.sh                    # Stop services
│   ├── build.sh                   # Build images
│   └── logs.sh                    # View logs
├── docker-compose.yml             # Service orchestration
├── .dockerignore                  # Root exclusions
├── DOCKER_README.md               # Complete documentation
└── DOCKER_SETUP_SUMMARY.md        # This file
```

---

## Next Steps

1. **Configure Environment Variables**
   ```bash
   nano backend/.env
   ```

2. **Build and Start**
   ```bash
   ./scripts/build.sh
   ./scripts/start.sh
   ```

3. **Verify Services**
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost
   ```

4. **Check Logs**
   ```bash
   ./scripts/logs.sh -f
   ```

5. **Access Application**
   - Open browser: http://localhost
   - Test API: http://localhost:3000/api-docs

---

## Support

Per ulteriori informazioni:
- **Complete Guide**: Leggi `DOCKER_README.md`
- **Logs**: Usa `./scripts/logs.sh`
- **Status**: Esegui `docker-compose ps`
- **Documentation**: Consulta i README dei singoli servizi

---

## Summary

La configurazione Docker è completa e include:

✅ **12 file creati**:
- 2 Dockerfile (backend, frontend)
- 3 .dockerignore (backend, frontend, root)
- 1 nginx.conf (frontend)
- 1 docker-compose.yml (root)
- 4 helper scripts (start, stop, build, logs)
- 2 documentazioni (README, SUMMARY)

✅ **Production-ready**:
- Multi-stage builds ottimizzati
- Non-root users per security
- Health checks automatici
- Log management
- Restart policies

✅ **Developer-friendly**:
- Easy setup con scripts
- Documentazione completa
- Build veloci con caching
- Troubleshooting guide

✅ **Secure by default**:
- Alpine Linux base
- Security headers
- Internal networking
- Environment variables

---

**Tutto è pronto per l'uso!**

Esegui semplicemente:
```bash
./scripts/build.sh
./scripts/start.sh
```

E accedi a http://localhost per testare l'applicazione.

---

**Version**: 1.0.0
**Date**: October 2025
**Project**: TWT Partner Dashboard
**Status**: Ready for Production
