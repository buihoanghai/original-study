#!/bin/bash

# ============================================
# Mindmap Learning App - Deployment Script
# ============================================
# This script deploys the Mindmap app to production
# Usage: ./deploy.sh [build|start|stop|restart|logs|status]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    print_info "Checking requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check .env.production file
    if [ ! -f "$ENV_FILE" ]; then
        print_error "$ENV_FILE file not found"
        print_info "Copy .env.production.example to .env.production and configure it"
        exit 1
    fi
    
    print_success "All requirements met"
}

build_images() {
    print_info "Building Docker images..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache
    print_success "Images built successfully"
}

start_services() {
    print_info "Starting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
    print_success "Services started"
    
    print_info "Waiting for services to be healthy..."
    sleep 10
    docker-compose -f "$COMPOSE_FILE" ps
}

stop_services() {
    print_info "Stopping services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down
    print_success "Services stopped"
}

restart_services() {
    print_info "Restarting services..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart
    print_success "Services restarted"
}

show_logs() {
    print_info "Showing logs (Ctrl+C to exit)..."
    docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f
}

show_status() {
    print_info "Service status:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    print_info "Container health:"
    docker ps --filter "name=mindmap" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

backup_database() {
    print_info "Creating database backup..."
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/mindmap-backup-$(date +%Y%m%d-%H%M%S).gz"
    
    docker exec mindmap-mongo mongodump --archive="$BACKUP_FILE" --gzip
    print_success "Backup created: $BACKUP_FILE"
}

# Main script
case "$1" in
    build)
        check_requirements
        build_images
        ;;
    start)
        check_requirements
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    backup)
        backup_database
        ;;
    deploy)
        check_requirements
        print_warning "This will rebuild and restart all services"
        read -p "Continue? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            build_images
            stop_services
            start_services
            show_status
            print_success "Deployment complete!"
        fi
        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status|backup|deploy}"
        echo ""
        echo "Commands:"
        echo "  build    - Build Docker images"
        echo "  start    - Start all services"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  logs     - Show service logs"
        echo "  status   - Show service status"
        echo "  backup   - Backup MongoDB database"
        echo "  deploy   - Full deployment (build + restart)"
        exit 1
        ;;
esac

