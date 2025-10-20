#!/bin/bash

# ============================================
# Setup CI/CD Automatico - Script Rapido
# ============================================

set -e

echo "🚀 Setup CI/CD per TWT Partner Dashboard"
echo ""

# Colori
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Chiedi IP server
echo -e "${YELLOW}Inserisci l'IP del tuo server (es: 192.168.1.100):${NC}"
read SERVER_IP

if [ -z "$SERVER_IP" ]; then
    echo -e "${RED}❌ IP server obbligatorio!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ IP server: $SERVER_IP${NC}"
echo ""

# Crea directory workflows se non esiste
mkdir -p .github/workflows

# Crea workflow GitHub Actions
echo -e "${YELLOW}📝 Creazione workflow GitHub Actions...${NC}"
cat > .github/workflows/build.yml << EOF
name: Build and Push

on:
  push:
    branches: [ main ]
  workflow_dispatch:

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ghcr.io/\${{ github.repository_owner }}

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
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Build and Push Backend
        run: |
          docker build -t \${{ env.IMAGE_PREFIX }}/backend:latest ./backend
          docker push \${{ env.IMAGE_PREFIX }}/backend:latest

      - name: Build and Push Frontend
        run: |
          docker build -t \${{ env.IMAGE_PREFIX }}/frontend:latest \\
            --build-arg VITE_API_URL=http://${SERVER_IP}:3000/api \\
            ./frontend
          docker push \${{ env.IMAGE_PREFIX }}/frontend:latest

      - name: Success
        run: echo "✅ Images pushed successfully!"
EOF

echo -e "${GREEN}✓ Workflow creato${NC}"
echo ""

# Crea docker-compose per produzione
echo -e "${YELLOW}📝 Creazione docker-compose.prod.yml...${NC}"
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

echo -e "${GREEN}✓ Docker compose creato${NC}"
echo ""

# Crea file README per Portainer
echo -e "${YELLOW}📝 Creazione istruzioni Portainer...${NC}"
cat > PORTAINER-SETUP.txt << EOF
╔════════════════════════════════════════════════════════════╗
║                SETUP PORTAINER - ISTRUZIONI                ║
╚════════════════════════════════════════════════════════════╝

STEP 1: Crea Stack Applicazione
--------------------------------
1. Apri Portainer: http://${SERVER_IP}:9000
2. Menu → Stacks → + Add stack
3. Name: app
4. Build method: Repository
5. Repository URL: https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD
6. Reference: refs/heads/main
7. Compose path: docker-compose.prod.yml

STEP 2: Environment Variables
------------------------------
Aggiungi queste variabili:

CORS_ORIGIN = http://${SERVER_IP}
TWT_API_USERNAME = GREENTEL_PAVONE
TWT_API_PASSWORD = Pc_260516

STEP 3: Deploy
--------------
Click "Deploy the stack"

STEP 4: Watchtower (nuovo stack)
---------------------------------
1. Stacks → + Add stack
2. Name: watchtower
3. Build method: Web editor
4. Incolla:

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

5. Deploy!

✅ FATTO! Ora ogni git push deploierà automaticamente in 10-15 min.
EOF

echo -e "${GREEN}✓ Istruzioni Portainer create: PORTAINER-SETUP.txt${NC}"
echo ""

# Mostra riepilogo
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✅ SETUP COMPLETATO                     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📋 PROSSIMI PASSI:${NC}"
echo ""
echo "1️⃣  Push su GitHub:"
echo "   git add .github/workflows/build.yml docker-compose.prod.yml"
echo "   git commit -m 'ci: add CI/CD setup'"
echo "   git push origin main"
echo ""
echo "2️⃣  Verifica build su GitHub:"
echo "   https://github.com/GREEN-TELECOMUNICAZIONI/PARTNER-DASHBOARD/actions"
echo ""
echo "3️⃣  Rendi pubbliche le immagini Docker:"
echo "   https://github.com/orgs/GREEN-TELECOMUNICAZIONI/packages"
echo "   (Cambia visibility → Public per backend e frontend)"
echo ""
echo "4️⃣  Configura Portainer:"
echo "   Leggi PORTAINER-SETUP.txt per istruzioni dettagliate"
echo ""
echo -e "${GREEN}🎉 Dopo il setup, ogni 'git push' deploierà automaticamente!${NC}"
echo ""
EOF

chmod +x /Users/mkou/GREEN-PARTNER-DASHBOARD/PARTNER-DASHBOARD/setup-ci.sh
