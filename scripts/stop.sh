#!/bin/bash

# ============================================
# TWT Partner Dashboard - Stop Script
# ============================================
# This script stops all Docker containers
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
echo -e "${BLUE}TWT Partner Dashboard - Stopping Services${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker or docker-compose is not installed${NC}"
    exit 1
fi

# Navigate to project root
cd "$PROJECT_ROOT"

# Parse arguments
REMOVE_VOLUMES=false
if [ "$1" == "--volumes" ] || [ "$1" == "-v" ]; then
    REMOVE_VOLUMES=true
fi

# Stop containers
echo -e "${BLUE}Stopping Docker containers...${NC}"
docker-compose down

# Remove volumes if requested
if [ "$REMOVE_VOLUMES" = true ]; then
    echo -e "${YELLOW}Removing volumes...${NC}"
    docker-compose down -v
    echo -e "${GREEN}Volumes removed${NC}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Services stopped successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

if [ "$REMOVE_VOLUMES" = false ]; then
    echo -e "${BLUE}Note:${NC} Volumes are preserved. To remove them, run:"
    echo -e "  ${YELLOW}./scripts/stop.sh --volumes${NC}"
    echo ""
fi
