#!/bin/bash

# ============================================
# TWT Partner Dashboard - Start Script
# ============================================
# This script starts all Docker containers
# ============================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}TWT Partner Dashboard - Starting Services${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker or docker-compose is not installed${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$PROJECT_ROOT/backend/.env" ]; then
    echo -e "${YELLOW}Warning: backend/.env file not found${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    if [ -f "$PROJECT_ROOT/backend/.env.example" ]; then
        cp "$PROJECT_ROOT/backend/.env.example" "$PROJECT_ROOT/backend/.env"
        echo -e "${GREEN}Created backend/.env - Please configure it with your API credentials${NC}"
    fi
fi

if [ ! -f "$PROJECT_ROOT/frontend/.env" ]; then
    echo -e "${YELLOW}Warning: frontend/.env file not found${NC}"
    echo -e "${YELLOW}Creating from .env.example...${NC}"
    if [ -f "$PROJECT_ROOT/frontend/.env.example" ]; then
        cp "$PROJECT_ROOT/frontend/.env.example" "$PROJECT_ROOT/frontend/.env"
        echo -e "${GREEN}Created frontend/.env${NC}"
    fi
fi

echo ""

# Navigate to project root
cd "$PROJECT_ROOT"

# Start containers
echo -e "${BLUE}Starting Docker containers...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Services started successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Service URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:3000${NC}"
echo -e "  API Docs: ${GREEN}http://localhost:3000/api-docs${NC}"
echo ""
echo -e "${BLUE}Commands:${NC}"
echo -e "  View logs:        ${YELLOW}./scripts/logs.sh${NC}"
echo -e "  Stop services:    ${YELLOW}./scripts/stop.sh${NC}"
echo -e "  Rebuild images:   ${YELLOW}./scripts/build.sh${NC}"
echo ""
echo -e "${BLUE}Health check:${NC}"
echo -e "  Run: ${YELLOW}docker-compose ps${NC}"
echo ""
