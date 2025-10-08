#!/bin/bash

################################################################################
# TWT Partner Dashboard - Development Startup Script
#
# Questo script avvia automaticamente backend e frontend in modalità sviluppo
#
# Usage: ./run.dev.sh [options]
#
# Options:
#   --backend-only    Avvia solo il backend
#   --frontend-only   Avvia solo il frontend
#   --check           Verifica prerequisiti senza avviare
#   --install         Installa dipendenze prima di avviare
#   --help            Mostra questo help
################################################################################

set -e  # Exit on error

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directory del progetto
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# File di log
LOG_DIR="${SCRIPT_DIR}/.logs"
BACKEND_LOG="${LOG_DIR}/backend.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"

# PID files
PID_DIR="${SCRIPT_DIR}/.pids"
BACKEND_PID="${PID_DIR}/backend.pid"
FRONTEND_PID="${PID_DIR}/frontend.pid"

################################################################################
# Funzioni Utility
################################################################################

print_header() {
    echo -e "${CYAN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║        TWT Partner Dashboard - Development Mode           ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_step() {
    echo -e "${CYAN}▶ $1${NC}"
}

################################################################################
# Funzioni Controllo Prerequisiti
################################################################################

check_node() {
    print_step "Verifica Node.js..."

    if ! command -v node &> /dev/null; then
        print_error "Node.js non installato"
        echo "Installa Node.js 20+ da: https://nodejs.org"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_warning "Node.js version $NODE_VERSION < 20 (raccomandato 20+)"
    else
        print_success "Node.js $(node --version)"
    fi
}

check_npm() {
    print_step "Verifica npm..."

    if ! command -v npm &> /dev/null; then
        print_error "npm non installato"
        exit 1
    fi

    print_success "npm $(npm --version)"
}

check_directories() {
    print_step "Verifica directory progetto..."

    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "Directory backend non trovata: $BACKEND_DIR"
        exit 1
    fi

    if [ ! -d "$FRONTEND_DIR" ]; then
        print_error "Directory frontend non trovata: $FRONTEND_DIR"
        exit 1
    fi

    print_success "Directory backend e frontend trovate"
}

check_env_file() {
    print_step "Verifica file .env..."

    if [ ! -f "$BACKEND_DIR/.env" ]; then
        print_warning "File .env non trovato in backend/"
        print_info "Creazione da .env.example..."

        if [ -f "$BACKEND_DIR/.env.example" ]; then
            cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
            print_warning "File .env creato. CONFIGURA LE CREDENZIALI TWT!"
            echo ""
            echo -e "${YELLOW}Apri backend/.env e configura:${NC}"
            echo "  TWT_API_USERNAME=GREENTEL_PAVONE"
            echo "  TWT_API_PASSWORD=Pc_260516"
            echo ""
        else
            print_error "File .env.example non trovato"
            exit 1
        fi
    else
        # Verifica che le credenziali siano configurate
        if grep -q "your_username_here" "$BACKEND_DIR/.env" 2>/dev/null; then
            print_warning "Credenziali TWT non configurate in .env"
            print_info "Aggiorna TWT_API_USERNAME e TWT_API_PASSWORD"
        else
            print_success "File .env configurato"
        fi
    fi
}

check_dependencies() {
    print_step "Verifica dipendenze installate..."

    NEEDS_INSTALL=false

    if [ ! -d "$BACKEND_DIR/node_modules" ]; then
        print_warning "Dipendenze backend non installate"
        NEEDS_INSTALL=true
    fi

    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        print_warning "Dipendenze frontend non installate"
        NEEDS_INSTALL=true
    fi

    if [ "$NEEDS_INSTALL" = true ]; then
        print_info "Esegui: ./run.dev.sh --install"
        return 1
    fi

    print_success "Dipendenze installate"
    return 0
}

check_ports() {
    print_step "Verifica porte disponibili..."

    # Verifica porta 3000 (backend)
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Porta 3000 già in uso (backend potrebbe essere già avviato)"
        PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
        print_info "Processo: $PID - Usa 'kill $PID' per fermarlo"
    fi

    # Verifica porta 5173 (frontend)
    if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Porta 5173 già in uso (frontend potrebbe essere già avviato)"
        PID=$(lsof -Pi :5173 -sTCP:LISTEN -t)
        print_info "Processo: $PID - Usa 'kill $PID' per fermarlo"
    fi
}

################################################################################
# Funzioni Installazione
################################################################################

install_dependencies() {
    print_header
    echo ""
    print_step "Installazione dipendenze..."
    echo ""

    # Backend
    print_info "Installazione dipendenze backend..."
    cd "$BACKEND_DIR"
    npm install
    print_success "Backend dipendenze installate"
    echo ""

    # Frontend
    print_info "Installazione dipendenze frontend..."
    cd "$FRONTEND_DIR"
    npm install
    print_success "Frontend dipendenze installate"
    echo ""

    print_success "Tutte le dipendenze installate con successo!"
}

################################################################################
# Funzioni Avvio Servizi
################################################################################

setup_directories() {
    # Crea directory per logs e PIDs
    mkdir -p "$LOG_DIR"
    mkdir -p "$PID_DIR"
}

start_backend() {
    print_step "Avvio backend su porta 3000..."

    cd "$BACKEND_DIR"

    # Avvia backend in background
    npm run start:dev > "$BACKEND_LOG" 2>&1 &
    BACKEND_PID_NUM=$!
    echo $BACKEND_PID_NUM > "$BACKEND_PID"

    print_info "Backend PID: $BACKEND_PID_NUM"
    print_info "Logs: tail -f $BACKEND_LOG"

    # Attendi che il backend sia pronto
    print_info "Attendo avvio backend..."
    sleep 5

    # Verifica che il processo sia ancora attivo
    if ps -p $BACKEND_PID_NUM > /dev/null; then
        print_success "Backend avviato: http://localhost:3000"
        print_info "API Docs: http://localhost:3000/api/docs"
    else
        print_error "Backend non avviato correttamente"
        print_info "Controlla i logs: cat $BACKEND_LOG"
        exit 1
    fi
}

start_frontend() {
    print_step "Avvio frontend su porta 5173..."

    cd "$FRONTEND_DIR"

    # Avvia frontend in background
    npm run dev > "$FRONTEND_LOG" 2>&1 &
    FRONTEND_PID_NUM=$!
    echo $FRONTEND_PID_NUM > "$FRONTEND_PID"

    print_info "Frontend PID: $FRONTEND_PID_NUM"
    print_info "Logs: tail -f $FRONTEND_LOG"

    # Attendi che il frontend sia pronto
    print_info "Attendo avvio frontend..."
    sleep 5

    # Verifica che il processo sia ancora attivo
    if ps -p $FRONTEND_PID_NUM > /dev/null; then
        print_success "Frontend avviato: http://localhost:5173"
    else
        print_error "Frontend non avviato correttamente"
        print_info "Controlla i logs: cat $FRONTEND_LOG"
        exit 1
    fi
}

################################################################################
# Funzione Cleanup
################################################################################

cleanup() {
    echo ""
    print_warning "Arresto servizi in corso..."

    # Uccidi backend
    if [ -f "$BACKEND_PID" ]; then
        PID=$(cat "$BACKEND_PID")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            print_info "Backend arrestato (PID: $PID)"
        fi
        rm -f "$BACKEND_PID"
    fi

    # Uccidi frontend
    if [ -f "$FRONTEND_PID" ]; then
        PID=$(cat "$FRONTEND_PID")
        if ps -p $PID > /dev/null 2>&1; then
            kill $PID 2>/dev/null || true
            print_info "Frontend arrestato (PID: $PID)"
        fi
        rm -f "$FRONTEND_PID"
    fi

    echo ""
    print_success "Servizi arrestati con successo"
    exit 0
}

# Trap SIGINT e SIGTERM
trap cleanup SIGINT SIGTERM

################################################################################
# Funzione Main
################################################################################

show_help() {
    cat << EOF
TWT Partner Dashboard - Development Startup Script

Usage: ./run.dev.sh [options]

Options:
  --backend-only     Avvia solo il backend
  --frontend-only    Avvia solo il frontend
  --check            Verifica prerequisiti senza avviare
  --install          Installa dipendenze prima di avviare
  --help             Mostra questo help

Esempi:
  ./run.dev.sh                    # Avvia backend e frontend
  ./run.dev.sh --install          # Installa dipendenze e avvia
  ./run.dev.sh --backend-only     # Solo backend
  ./run.dev.sh --check            # Solo verifica prerequisiti

URLs:
  Backend:    http://localhost:3000
  API Docs:   http://localhost:3000/api/docs
  Frontend:   http://localhost:5173

Logs:
  Backend:    .logs/backend.log
  Frontend:   .logs/frontend.log

Per arrestare: Ctrl+C

EOF
}

main() {
    # Parse arguments
    BACKEND_ONLY=false
    FRONTEND_ONLY=false
    CHECK_ONLY=false
    DO_INSTALL=false

    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend-only)
                BACKEND_ONLY=true
                shift
                ;;
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --check)
                CHECK_ONLY=true
                shift
                ;;
            --install)
                DO_INSTALL=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                print_error "Opzione sconosciuta: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Print header
    print_header
    echo ""

    # Verifica prerequisiti
    print_step "Verifica prerequisiti..."
    echo ""
    check_node
    check_npm
    check_directories
    check_env_file
    echo ""

    # Installa dipendenze se richiesto
    if [ "$DO_INSTALL" = true ]; then
        install_dependencies
        echo ""
    fi

    # Verifica dipendenze
    if ! check_dependencies; then
        if [ "$CHECK_ONLY" = false ]; then
            echo ""
            print_error "Installa prima le dipendenze con: ./run.dev.sh --install"
            exit 1
        fi
    fi

    echo ""
    check_ports
    echo ""

    # Se solo check, esci
    if [ "$CHECK_ONLY" = true ]; then
        print_success "Tutti i prerequisiti soddisfatti!"
        exit 0
    fi

    # Setup directories
    setup_directories

    # Avvio servizi
    echo ""
    print_step "Avvio servizi..."
    echo ""

    if [ "$FRONTEND_ONLY" = false ]; then
        start_backend
        echo ""
    fi

    if [ "$BACKEND_ONLY" = false ]; then
        start_frontend
        echo ""
    fi

    # Summary
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}║              🚀 Servizi Avviati con Successo!             ║${NC}"
    echo -e "${GREEN}║                                                            ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    if [ "$FRONTEND_ONLY" = false ]; then
        echo -e "  ${CYAN}Backend:${NC}     http://localhost:3000"
        echo -e "  ${CYAN}API Docs:${NC}    http://localhost:3000/api/docs"
        echo -e "  ${CYAN}Health:${NC}      http://localhost:3000/api/coverage/health"
    fi

    if [ "$BACKEND_ONLY" = false ]; then
        echo -e "  ${CYAN}Frontend:${NC}    http://localhost:5173"
    fi

    echo ""
    echo -e "  ${YELLOW}Logs Backend:${NC}  tail -f $BACKEND_LOG"
    echo -e "  ${YELLOW}Logs Frontend:${NC} tail -f $FRONTEND_LOG"
    echo ""
    echo -e "  ${RED}Premi Ctrl+C per arrestare tutti i servizi${NC}"
    echo ""

    # Mostra logs in tempo reale (opzionale)
    print_info "Visualizzazione logs in tempo reale..."
    print_info "Segui i logs separatamente con: tail -f .logs/backend.log o .logs/frontend.log"
    echo ""

    # Mantieni lo script in esecuzione
    wait
}

################################################################################
# Esecuzione
################################################################################

main "$@"
