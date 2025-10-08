#!/bin/bash

################################################################################
# TWT Partner Dashboard - Stop Development Services
#
# Arresta i servizi backend e frontend avviati da run.dev.sh
################################################################################

set -e

# Colori
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PID_DIR="${SCRIPT_DIR}/.pids"
BACKEND_PID="${PID_DIR}/backend.pid"
FRONTEND_PID="${PID_DIR}/frontend.pid"

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo ""
echo -e "${YELLOW}Arresto servizi TWT Partner Dashboard...${NC}"
echo ""

# Arresta backend
if [ -f "$BACKEND_PID" ]; then
    PID=$(cat "$BACKEND_PID")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null || true
        print_success "Backend arrestato (PID: $PID)"
    else
        print_warning "Backend non in esecuzione (PID file stale)"
    fi
    rm -f "$BACKEND_PID"
else
    print_info "Nessun PID file backend trovato"
fi

# Arresta frontend
if [ -f "$FRONTEND_PID" ]; then
    PID=$(cat "$FRONTEND_PID")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null || kill -9 $PID 2>/dev/null || true
        print_success "Frontend arrestato (PID: $PID)"
    else
        print_warning "Frontend non in esecuzione (PID file stale)"
    fi
    rm -f "$FRONTEND_PID"
else
    print_info "Nessun PID file frontend trovato"
fi

# Controlla porte e uccidi eventuali processi residui
echo ""
print_info "Verifica porte..."

# Porta 3000 (backend)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    print_warning "Processo ancora in ascolto su porta 3000 (PID: $PID)"
    print_info "Arresto forzato..."
    kill -9 $PID 2>/dev/null || true
    print_success "Processo su porta 3000 arrestato"
fi

# Porta 5173 (frontend)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    PID=$(lsof -Pi :5173 -sTCP:LISTEN -t)
    print_warning "Processo ancora in ascolto su porta 5173 (PID: $PID)"
    print_info "Arresto forzato..."
    kill -9 $PID 2>/dev/null || true
    print_success "Processo su porta 5173 arrestato"
fi

echo ""
print_success "Tutti i servizi sono stati arrestati"
echo ""
