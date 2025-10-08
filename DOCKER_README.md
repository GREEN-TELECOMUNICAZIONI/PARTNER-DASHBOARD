# Docker Configuration - TWT Partner Dashboard

Complete Docker setup for the TWT Partner Dashboard application with production-ready configurations.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Configuration](#configuration)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)
- [Production Deployment](#production-deployment)
- [Security Best Practices](#security-best-practices)

---

## Overview

This Docker configuration provides a complete containerized setup for the TWT Partner Dashboard:

- **Backend**: NestJS API running on Node.js 20 Alpine
- **Frontend**: React SPA served by Nginx Alpine
- **Networking**: Internal Docker network for service communication
- **Volumes**: Persistent storage for logs
- **Health Checks**: Automated health monitoring for all services

### Key Features

- Multi-stage builds for optimized image sizes
- Non-root users for enhanced security
- Automated health checks
- Log rotation and management
- Graceful shutdown handling with dumb-init
- Nginx proxy with compression and caching
- Development and production configurations

---

## Prerequisites

### Required Software

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 1.29 or higher (or Docker Compose V2)

### System Requirements

- **CPU**: 2 cores minimum
- **RAM**: 2GB minimum (4GB recommended)
- **Disk**: 2GB free space

### Installation

#### macOS
```bash
brew install docker docker-compose
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install docker-compose-plugin
```

#### Windows
Download Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop)

---

## Quick Start

### 1. Clone and Configure

```bash
# Navigate to project root
cd /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit backend/.env with your credentials
nano backend/.env
```

### 2. Build and Start

```bash
# Build Docker images
./scripts/build.sh

# Start all services
./scripts/start.sh
```

### 3. Access Services

- **Frontend**: http://localhost
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs

### 4. Stop Services

```bash
# Stop containers (preserve data)
./scripts/stop.sh

# Stop and remove volumes
./scripts/stop.sh --volumes
```

---

## Architecture

### Service Architecture

```
┌─────────────────────────────────────────────┐
│              Docker Host                     │
│                                             │
│  ┌──────────────┐      ┌──────────────┐   │
│  │   Frontend   │      │   Backend    │   │
│  │  (Nginx)     │─────▶│  (NestJS)    │   │
│  │  Port: 80    │      │  Port: 3000  │   │
│  └──────────────┘      └──────────────┘   │
│         │                       │           │
│         │                       │           │
│         └───────────┬───────────┘           │
│                     │                       │
│            ┌────────▼────────┐             │
│            │  Docker Network │             │
│            │  (twt-network)  │             │
│            └─────────────────┘             │
│                                             │
│            ┌─────────────────┐             │
│            │     Volumes     │             │
│            │  (backend-logs) │             │
│            └─────────────────┘             │
└─────────────────────────────────────────────┘
```

### Image Details

#### Backend Image
- **Base**: node:20-alpine
- **Size**: ~200MB (optimized)
- **Layers**: Multi-stage build
- **User**: Non-root (nestjs:1001)
- **Port**: 3000

#### Frontend Image
- **Base**: nginx:alpine
- **Size**: ~50MB (optimized)
- **Layers**: Multi-stage build
- **User**: Non-root (nginx-user:1001)
- **Port**: 80

---

## Configuration

### Docker Compose

The `docker-compose.yml` file defines the complete stack:

```yaml
# Backend service configuration
backend:
  - Runs on port 3000
  - Connects to TWT API
  - Stores logs in volume
  - Health check enabled

# Frontend service configuration
frontend:
  - Runs on port 80
  - Proxies API requests to backend
  - Serves static React build
  - Health check enabled
```

### Nginx Configuration

Located at `frontend/nginx.conf`:

- **API Proxy**: Routes `/api/*` to backend service
- **Compression**: Gzip enabled for all text assets
- **Caching**: Aggressive caching for static assets
- **Security Headers**: X-Frame-Options, CSP, etc.
- **SPA Routing**: Fallback to index.html for client-side routes

### Dockerfile Structure

#### Backend Dockerfile

```dockerfile
# Stage 1: Build
- Install dependencies
- Compile TypeScript
- Prune dev dependencies

# Stage 2: Production
- Copy compiled files
- Create non-root user
- Configure health check
- Use dumb-init for signals
```

#### Frontend Dockerfile

```dockerfile
# Stage 1: Build
- Install dependencies
- Build React app with Vite
- Generate optimized bundle

# Stage 2: Production
- Copy build to nginx
- Configure nginx
- Create non-root user
- Set up health check
```

---

## Scripts

Helper scripts are located in the `scripts/` directory.

### start.sh

Start all Docker services.

```bash
./scripts/start.sh
```

**Features**:
- Checks for Docker installation
- Creates .env files if missing
- Starts containers in detached mode
- Displays service URLs

### stop.sh

Stop all Docker services.

```bash
# Stop containers (preserve volumes)
./scripts/stop.sh

# Stop and remove volumes
./scripts/stop.sh --volumes
```

**Features**:
- Graceful shutdown
- Optional volume removal
- Cleans up networks

### build.sh

Build Docker images.

```bash
# Build all services
./scripts/build.sh

# Build without cache
./scripts/build.sh --no-cache

# Build specific service
./scripts/build.sh --service backend
```

**Features**:
- Parallel builds
- Cache management
- Service-specific builds

### logs.sh

View container logs.

```bash
# View all logs (last 100 lines)
./scripts/logs.sh

# Follow logs in real-time
./scripts/logs.sh -f

# View specific service
./scripts/logs.sh --service backend

# Custom tail lines
./scripts/logs.sh --tail 500

# Combined options
./scripts/logs.sh -f --service frontend --tail 50
```

**Options**:
- `-f, --follow`: Follow log output
- `--service SERVICE`: Filter by service
- `--tail LINES`: Number of lines to show
- `-h, --help`: Show help

---

## Environment Variables

### Backend Environment Variables

Located in `backend/.env`:

```bash
# Application
NODE_ENV=production
PORT=3000

# CORS
CORS_ORIGIN=http://localhost

# TWT API Configuration
TWT_API_BASE_URL=https://api.twt.it
TWT_API_KEY=your_api_key_here
TWT_API_TIMEOUT=30000
TWT_API_MAX_RETRIES=3

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables

Located in `frontend/.env`:

```bash
# API Configuration
VITE_API_URL=http://localhost:3000
```

### Docker Compose Variables

You can override these in `docker-compose.yml`:

```bash
# Set custom ports
BACKEND_PORT=3000
FRONTEND_PORT=80

# Set API URL for frontend build
VITE_API_URL=http://localhost:3000
```

---

## Health Checks

### Backend Health Check

```bash
# Manual check
curl http://localhost:3000/api/health

# Docker health status
docker inspect twt-partner-backend | grep Health -A 10
```

**Configuration**:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 40 seconds

### Frontend Health Check

```bash
# Manual check
curl http://localhost/health

# Docker health status
docker inspect twt-partner-frontend | grep Health -A 10
```

**Configuration**:
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3
- Start period: 20 seconds

### Check All Services

```bash
docker-compose ps
```

Healthy services show `(healthy)` status.

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port
lsof -i :3000
# Kill the process
kill -9 <PID>
# Or change port in docker-compose.yml
```

#### 2. Permission Denied

**Error**: `permission denied while trying to connect to Docker daemon`

**Solution**:
```bash
# Add user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker

# macOS - restart Docker Desktop
```

#### 3. Container Exits Immediately

**Solution**:
```bash
# Check logs
./scripts/logs.sh --service backend

# Check environment variables
docker-compose config

# Rebuild without cache
./scripts/build.sh --no-cache
```

#### 4. API Connection Failed

**Symptoms**: Frontend can't connect to backend

**Solution**:
```bash
# Check network
docker network inspect twt-partner-network

# Check backend health
curl http://localhost:3000/api/health

# Check nginx config
docker exec twt-partner-frontend nginx -t
```

#### 5. Build Failed

**Error**: `npm ERR!` or build timeout

**Solution**:
```bash
# Increase Docker memory (Docker Desktop Settings)
# Clean build cache
docker system prune -a

# Build with verbose logging
docker-compose build --no-cache --progress=plain
```

### Debug Commands

```bash
# View container status
docker-compose ps

# View resource usage
docker stats

# Inspect container
docker inspect twt-partner-backend

# Execute command in container
docker exec -it twt-partner-backend sh

# View network details
docker network ls
docker network inspect twt-partner-network

# View volume details
docker volume ls
docker volume inspect twt-partner-backend-logs
```

---

## Production Deployment

### Preparation Checklist

- [ ] Update environment variables for production
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates (use reverse proxy)
- [ ] Configure domain names
- [ ] Set up monitoring and alerts
- [ ] Configure backup strategy
- [ ] Review security settings
- [ ] Test health checks
- [ ] Configure log aggregation

### Production Environment Variables

```bash
# Backend
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
TWT_API_KEY=production_key_here

# Frontend
VITE_API_URL=https://api.yourdomain.com
```

### Using a Reverse Proxy (Recommended)

Example with Traefik:

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
```

### Scaling

```bash
# Scale backend replicas
docker-compose up -d --scale backend=3

# Use load balancer in front
```

### Backup Strategy

```bash
# Backup volumes
docker run --rm -v twt-partner-backend-logs:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/logs-$(date +%Y%m%d).tar.gz /data

# Restore volumes
docker run --rm -v twt-partner-backend-logs:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/logs-20231215.tar.gz -C /
```

### Monitoring

**Recommended Tools**:
- Prometheus + Grafana for metrics
- ELK Stack for log aggregation
- Sentry for error tracking
- Uptime Kuma for availability monitoring

```bash
# Export metrics
curl http://localhost:3000/metrics
```

---

## Security Best Practices

### Image Security

- ✅ Use Alpine Linux base images (smaller attack surface)
- ✅ Run as non-root user
- ✅ Multi-stage builds (no build tools in production)
- ✅ Minimal dependencies
- ✅ Regular security updates

### Runtime Security

```bash
# Scan images for vulnerabilities
docker scan twt-partner-backend:latest
docker scan twt-partner-frontend:latest

# Update base images regularly
./scripts/build.sh --no-cache
```

### Network Security

- ✅ Internal Docker network (not exposed to host)
- ✅ Only necessary ports exposed
- ✅ Use environment variables for secrets
- ✅ Enable CORS restrictions

### Best Practices Checklist

- [ ] Never commit .env files
- [ ] Use Docker secrets for sensitive data
- [ ] Enable read-only filesystem where possible
- [ ] Implement rate limiting
- [ ] Set resource limits (CPU/memory)
- [ ] Use security headers (implemented in nginx)
- [ ] Regular vulnerability scanning
- [ ] Keep base images updated
- [ ] Monitor logs for suspicious activity
- [ ] Implement proper backup strategy

### Resource Limits

Add to `docker-compose.yml`:

```yaml
backend:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

---

## Additional Resources

### Documentation

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Nginx Documentation](https://nginx.org/en/docs/)

### Project Documentation

- `backend/README.md` - Backend API documentation
- `frontend/README.md` - Frontend application documentation
- `PROJECT_SUMMARY.md` - Project overview
- `QUICK_START.md` - Quick start guide

### Support

For issues and questions:
1. Check this documentation
2. Review container logs: `./scripts/logs.sh`
3. Check Docker status: `docker-compose ps`
4. Consult project documentation

---

## Maintenance

### Regular Tasks

**Weekly**:
```bash
# Check for updates
docker-compose pull

# Rebuild images
./scripts/build.sh --no-cache

# Restart services
./scripts/stop.sh && ./scripts/start.sh
```

**Monthly**:
```bash
# Clean up unused resources
docker system prune -a --volumes

# Review logs
./scripts/logs.sh --tail 1000 > logs-review.txt

# Backup volumes
# (See Backup Strategy section)
```

### Updating Services

```bash
# Update backend
cd backend
git pull
cd ..
./scripts/build.sh --service backend
docker-compose up -d backend

# Update frontend
cd frontend
git pull
cd ..
./scripts/build.sh --service frontend
docker-compose up -d frontend
```

---

## Summary

This Docker configuration provides:

- **Production-ready** multi-stage builds
- **Secure** non-root containers
- **Optimized** Alpine-based images
- **Automated** health checks and restart policies
- **Easy management** with helper scripts
- **Scalable** architecture
- **Comprehensive** logging and monitoring

For quick reference, use these commands:

```bash
# Start
./scripts/start.sh

# Stop
./scripts/stop.sh

# Build
./scripts/build.sh

# Logs
./scripts/logs.sh -f
```

---

**Version**: 1.0.0
**Last Updated**: October 2025
**Project**: TWT Partner Dashboard
**Maintainer**: TWT Partner Team
