# Docker Quick Test Guide

## Prerequisiti

1. Docker e Docker Compose installati
2. Porte 80 e 3000 disponibili
3. File .env configurati

## Test Rapido (5 minuti)

### Step 1: Configura Environment Variables

```bash
# Backend
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/backend
cp .env.example .env
nano .env  # Aggiungi le tue credenziali API

# Frontend
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/frontend
cp .env.example .env

# Torna alla root
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD
```

### Step 2: Build Immagini

```bash
./scripts/build.sh
```

Output atteso:
```
============================================
TWT Partner Dashboard - Building Images
============================================

Building all services...
[+] Building ...
✓ Backend image built
✓ Frontend image built
```

### Step 3: Avvia Servizi

```bash
./scripts/start.sh
```

Output atteso:
```
============================================
TWT Partner Dashboard - Starting Services
============================================

Starting Docker containers...
[+] Running 3/3
 ✓ Network twt-partner-network    Created
 ✓ Container twt-partner-backend  Started
 ✓ Container twt-partner-frontend Started

============================================
Services started successfully!
============================================

Service URLs:
  Frontend: http://localhost
  Backend:  http://localhost:3000
  API Docs: http://localhost:3000/api-docs
```

### Step 4: Verifica Status

```bash
# Check container status
docker-compose ps
```

Output atteso:
```
NAME                     STATUS              PORTS
twt-partner-backend      Up (healthy)        0.0.0.0:3000->3000/tcp
twt-partner-frontend     Up (healthy)        0.0.0.0:80->80/tcp
```

### Step 5: Test Endpoints

```bash
# Test backend health
curl http://localhost:3000/api/health

# Expected output:
# {"status":"ok","timestamp":"..."}

# Test frontend health
curl http://localhost/health

# Expected output:
# healthy

# Test frontend homepage
curl -I http://localhost

# Expected output:
# HTTP/1.1 200 OK
```

### Step 6: Visualizza Logs

```bash
# All services
./scripts/logs.sh

# Backend only
./scripts/logs.sh --service backend

# Frontend only
./scripts/logs.sh --service frontend

# Follow logs in real-time
./scripts/logs.sh -f
```

### Step 7: Test Application

1. Apri browser: http://localhost
2. Verifica che il frontend si carichi
3. Apri DevTools > Network
4. Verifica le chiamate API a /api/*
5. Test API Docs: http://localhost:3000/api-docs

### Step 8: Stop Servizi

```bash
./scripts/stop.sh
```

## Test Completo

### Test di Performance

```bash
# Monitor resource usage
docker stats

# Expected output:
# twt-partner-backend: ~100MB RAM, <5% CPU
# twt-partner-frontend: ~10MB RAM, <1% CPU
```

### Test di Network

```bash
# Inspect network
docker network inspect twt-partner-network

# Expected: backend and frontend in same network
```

### Test di Volumes

```bash
# List volumes
docker volume ls

# Expected:
# twt-partner-backend-logs

# Inspect volume
docker volume inspect twt-partner-backend-logs
```

### Test di Health Checks

```bash
# Backend health details
docker inspect twt-partner-backend | grep -A 10 Health

# Frontend health details
docker inspect twt-partner-frontend | grep -A 10 Health

# Expected: "Status": "healthy"
```

### Test di Logs

```bash
# Check backend logs
docker logs twt-partner-backend

# Check frontend logs
docker logs twt-partner-frontend

# Check for errors (should be none)
docker logs twt-partner-backend 2>&1 | grep -i error
```

## Test di Rebuild

### Test No-Cache Build

```bash
# Stop services
./scripts/stop.sh

# Rebuild without cache
./scripts/build.sh --no-cache

# Restart services
./scripts/start.sh
```

### Test Service-Specific Build

```bash
# Rebuild only backend
./scripts/build.sh --service backend
docker-compose up -d backend

# Rebuild only frontend
./scripts/build.sh --service frontend
docker-compose up -d frontend
```

## Test di Restart

### Test Restart Policy

```bash
# Kill backend container
docker kill twt-partner-backend

# Wait 5 seconds
sleep 5

# Check status (should be restarted)
docker-compose ps

# Expected: backend is running again
```

### Test Dependency

```bash
# Stop backend only
docker stop twt-partner-backend

# Check frontend status
curl http://localhost

# Expected: frontend still serves static files
# API calls will fail but frontend is accessible
```

## Test di Security

### Test Non-Root User

```bash
# Backend
docker exec twt-partner-backend whoami
# Expected: nestjs

# Frontend
docker exec twt-partner-frontend whoami
# Expected: nginx-user
```

### Test Image Size

```bash
docker images | grep twt-partner

# Expected output:
# twt-partner-backend   latest   ...   ~200MB
# twt-partner-frontend  latest   ...   ~50MB
```

### Test Security Headers

```bash
curl -I http://localhost

# Expected headers:
# X-Frame-Options: SAMEORIGIN
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

## Load Testing (Optional)

### Simple Load Test

```bash
# Install Apache Bench (if not installed)
# macOS: brew install httpd
# Linux: sudo apt-get install apache2-utils

# Test frontend
ab -n 1000 -c 10 http://localhost/

# Test backend health endpoint
ab -n 1000 -c 10 http://localhost:3000/api/health
```

### Expected Results
- Frontend: >500 req/s
- Backend: >200 req/s
- Zero failed requests

## Cleanup Test

### Complete Cleanup

```bash
# Stop all services and remove volumes
./scripts/stop.sh --volumes

# Remove all images
docker rmi twt-partner-backend:latest twt-partner-frontend:latest

# Clean Docker system
docker system prune -a

# Rebuild from scratch
./scripts/build.sh
./scripts/start.sh
```

## Troubleshooting Tests

### Test Port Conflicts

```bash
# Check if ports are in use
lsof -i :3000
lsof -i :80

# If ports are used, either:
# 1. Stop conflicting services
# 2. Change ports in docker-compose.yml
```

### Test Docker Daemon

```bash
# Check Docker is running
docker info

# Check Docker Compose version
docker-compose --version

# Expected: v1.29+ or v2.0+
```

### Test File Permissions

```bash
# Check script permissions
ls -la scripts/*.sh

# All should be executable (rwxr-xr-x)

# If not:
chmod +x scripts/*.sh
```

## Success Criteria

Tutti i test devono passare:

- [ ] Build completa senza errori
- [ ] Servizi si avviano correttamente
- [ ] Health checks sono "healthy"
- [ ] Backend risponde su porta 3000
- [ ] Frontend risponde su porta 80
- [ ] API proxy funziona correttamente
- [ ] Logs sono accessibili
- [ ] Non-root users sono configurati
- [ ] Security headers sono presenti
- [ ] Restart policy funziona
- [ ] Volumi sono persistenti
- [ ] Network è isolata
- [ ] Stop funziona correttamente

## Quick Commands Reference

```bash
# Build
./scripts/build.sh

# Start
./scripts/start.sh

# Stop
./scripts/stop.sh

# Logs
./scripts/logs.sh -f

# Status
docker-compose ps

# Resource usage
docker stats

# Health check
curl http://localhost:3000/api/health
curl http://localhost/health

# Open browser
open http://localhost
```

## Next Steps

Dopo aver completato i test:

1. Configura le credenziali API reali
2. Test con dati reali
3. Configura monitoring (Prometheus/Grafana)
4. Set up log aggregation (ELK)
5. Prepara per production deployment
6. Configura backup strategy
7. Set up CI/CD pipeline

## Support

Per problemi durante il testing:

1. Controlla `DOCKER_README.md` per troubleshooting
2. Visualizza logs: `./scripts/logs.sh -f`
3. Verifica status: `docker-compose ps`
4. Controlla configurazione: `docker-compose config`

---

**Tempo stimato per test completo**: 5-10 minuti
**Prerequisiti verificati**: Docker, Docker Compose, Porte disponibili
**Stato**: Ready for testing
