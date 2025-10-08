#!/bin/bash

# ============================================
# TWT Partner Dashboard - Build Script
# ============================================
# This script builds Docker images
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
echo -e "${BLUE}TWT Partner Dashboard - Building Images${NC}"
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
NO_CACHE=false
SERVICE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --service)
            SERVICE="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--no-cache] [--service backend|frontend]"
            exit 1
            ;;
    esac
done

# Build command
BUILD_CMD="docker-compose build"

if [ "$NO_CACHE" = true ]; then
    BUILD_CMD="$BUILD_CMD --no-cache"
    echo -e "${YELLOW}Building without cache...${NC}"
fi

if [ -n "$SERVICE" ]; then
    BUILD_CMD="$BUILD_CMD $SERVICE"
    echo -e "${BLUE}Building service: ${YELLOW}$SERVICE${NC}"
else
    echo -e "${BLUE}Building all services...${NC}"
fi

echo ""

# Execute build
eval $BUILD_CMD

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "  Start services:   ${YELLOW}./scripts/start.sh${NC}"
echo ""
echo -e "${BLUE}Build options:${NC}"
echo -e "  No cache:         ${YELLOW}./scripts/build.sh --no-cache${NC}"
echo -e "  Specific service: ${YELLOW}./scripts/build.sh --service backend${NC}"
echo ""
