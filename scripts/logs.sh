#!/bin/bash

# ============================================
# TWT Partner Dashboard - Logs Script
# ============================================
# This script displays Docker container logs
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

# Default values
FOLLOW=false
SERVICE=""
TAIL="100"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        --service)
            SERVICE="$2"
            shift 2
            ;;
        --tail)
            TAIL="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  -f, --follow          Follow log output"
            echo "  --service SERVICE     Show logs for specific service (backend|frontend)"
            echo "  --tail LINES          Number of lines to show (default: 100)"
            echo "  -h, --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                    Show last 100 lines of all services"
            echo "  $0 -f                 Follow logs for all services"
            echo "  $0 --service backend  Show backend logs only"
            echo "  $0 -f --service frontend --tail 50"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Navigate to project root
cd "$PROJECT_ROOT"

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker or docker-compose is not installed${NC}"
    exit 1
fi

# Build logs command
LOGS_CMD="docker-compose logs --tail=$TAIL"

if [ "$FOLLOW" = true ]; then
    LOGS_CMD="$LOGS_CMD -f"
fi

if [ -n "$SERVICE" ]; then
    LOGS_CMD="$LOGS_CMD $SERVICE"
fi

# Display header
echo -e "${BLUE}============================================${NC}"
if [ -n "$SERVICE" ]; then
    echo -e "${BLUE}Logs for: ${YELLOW}$SERVICE${NC}"
else
    echo -e "${BLUE}Logs for: ${YELLOW}All Services${NC}"
fi
echo -e "${BLUE}============================================${NC}"
echo ""

# Execute logs command
eval $LOGS_CMD
