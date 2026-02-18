.PHONY: help install dev dev-all dev-web dev-cms dev-db stop-db status build build-packages build-cms build-web start start-cms start-web test test-watch test-e2e test-e2e-prod lint format clean doctor fresh-start flush-db seed

# Default target
help:
	@echo "🚀 Mindmap Learning App - Development Commands"
	@echo ""
	@echo "📦 Setup:"
	@echo "  make install       Install all dependencies"
	@echo ""
	@echo "🔧 Development:"
	@echo "  make dev           Start web + CMS (MongoDB must be running)"
	@echo "  make dev-all       Start MongoDB + web + CMS (recommended)"
	@echo "  make dev-web       Start web app only (port 3333)"
	@echo "  make dev-cms       Start CMS only (port 3001)"
	@echo "  make dev-db        Start MongoDB (Docker)"
	@echo "  make stop-db       Stop MongoDB"
	@echo "  make status        Check MongoDB status"
	@echo ""
	@echo "🏗️  Build:"
	@echo "  make build         Build all apps and packages"
	@echo "  make build-packages Build only packages (domain, flashcard, etc.)"
	@echo "  make build-cms     Build CMS only"
	@echo "  make build-web     Build Web only"
	@echo ""
	@echo "▶️  Production:"
	@echo "  make start         Start all apps in production mode"
	@echo "  make start-cms     Start CMS in production mode"
	@echo "  make start-web     Start Web in production mode"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  make test          Run unit tests"
	@echo "  make test-watch    Run unit tests in watch mode"
	@echo "  make test-e2e      Run E2E tests (requires dev servers)"
	@echo "  make test-e2e-prod Run E2E tests in production mode (faster)"
	@echo "  make doctor        Run health check"
	@echo ""
	@echo "🔍 Code Quality:"
	@echo "  make lint          Run ESLint"
	@echo "  make format        Format code with Prettier"
	@echo "  make typecheck     Run TypeScript type checking"
	@echo ""
	@echo "🧹 Cleanup:"
	@echo "  make clean         Remove all node_modules and build artifacts"
	@echo "  make flush-db      Flush MongoDB database (delete all data)"
	@echo "  make fresh-start   Complete fresh start (flush DB + clean + install + seed + dev)"
	@echo ""
	@echo "🌱 Database:"
	@echo "  make seed          Seed foundation data"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  make install && make dev-all"
	@echo ""
	@echo "🔄 Fresh Start:"
	@echo "  make fresh-start   # Complete reset and restart"

# Setup
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "🔨 Building packages..."
	@make build-packages
	@echo "✅ Installation complete"

# Development - Start everything
dev-all:
	@echo "🚀 Starting MongoDB + Web + CMS..."
	@make dev-db
	@sleep 3
	@echo "🔨 Building packages (if needed)..."
	@make build-packages
	@npm run dev

# Development - Start web + CMS only
dev:
	@echo "🚀 Starting Web + CMS..."
	@echo "⚠️  Make sure MongoDB is running (make dev-db)"
	@echo "🔨 Building packages (if needed)..."
	@make build-packages
	npm run dev

# Development - Individual services
dev-web:
	@echo "🌐 Starting Web App (port 3333)..."
	npm run dev:web

dev-cms:
	@echo "⚙️  Starting CMS (port 3001)..."
	npm run dev:cms

dev-db:
	@echo "🗄️  Starting MongoDB..."
	cd apps/mindmap-cms && docker compose up -d mongo
	@echo "✅ MongoDB started on port 27017"

stop-db:
	@echo "🛑 Stopping MongoDB..."
	cd apps/mindmap-cms && docker compose stop mongo
	@echo "✅ MongoDB stopped"

status:
	@echo "📊 MongoDB Status:"
	@cd apps/mindmap-cms && docker compose ps mongo

# Build
build-packages:
	@echo "🔨 Building packages..."
	@npm run build --workspace=packages/flashcard
	@npm run build --workspace=packages/scheduler
	@echo "✅ Packages built"

build-cms: build-packages
	@echo "🏗️  Building CMS..."
	@npm run build --workspace=apps/mindmap-cms
	@echo "✅ CMS built"

build-web: build-packages
	@echo "🏗️  Building Web..."
	@npm run build --workspace=apps/mindmap-web
	@echo "✅ Web built"

build: build-packages
	@echo "🏗️  Building all apps..."
	@npm run build --workspace=apps/mindmap-cms
	@npm run build --workspace=apps/mindmap-web
	@echo "✅ Build complete"

# Production Start
start-cms:
	@echo "▶️  Starting CMS in production mode..."
	@npm run start --workspace=apps/mindmap-cms

start-web:
	@echo "▶️  Starting Web in production mode..."
	@npm run start --workspace=apps/mindmap-web

start:
	@echo "▶️  Starting all apps in production mode..."
	@npm run start --workspaces --if-present

# Testing
test:
	@echo "🧪 Running unit tests..."
	npm test

test-watch:
	@echo "🧪 Running unit tests in watch mode..."
	npm run test:watch

test-e2e:
	@echo "🧪 Running E2E tests..."
	@echo "⚠️  Make sure dev servers are running (make dev-all)"
	@if [ -n "$(FILE)" ]; then \
		echo "📄 Running specific test file: $(FILE)"; \
		npx playwright test $(FILE); \
	else \
		echo "📦 Running all E2E tests"; \
		npm run test:e2e; \
	fi

test-e2e-prod:
	@echo "🧪 Running E2E tests in production mode..."
	@echo "⚠️  Make sure MongoDB is running (make dev-db)"
	@echo "📦 Building web app..."
	@npm run build --workspace=apps/mindmap-web
	@echo "🚀 Running E2E tests..."
	npm run test:e2e:prod

doctor:
	@echo "🏥 Running health check..."
	npm run doctor

# Code Quality
lint:
	@echo "🔍 Running ESLint..."
	npm run lint

format:
	@echo "✨ Formatting code..."
	npm run format

typecheck:
	@echo "🔍 Running TypeScript type checking..."
	npm run typecheck

# Cleanup
clean:
	@echo "🧹 Cleaning up..."
	npm run clean
	@echo "✅ Cleanup complete"

# Logs
logs-db:
	@echo "📋 MongoDB logs:"
	cd apps/mindmap-cms && docker compose logs -f mongo

# Database Management
flush-db:
	@echo "🗑️  Flushing MongoDB database..."
	@echo "⚠️  WARNING: This will delete ALL data in the database!"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		cd apps/mindmap-cms && docker compose down -v; \
		echo "✅ Database flushed successfully"; \
	else \
		echo "❌ Database flush cancelled"; \
	fi

seed:
	@echo "🌱 Seeding foundation data..."
	@cd apps/mindmap-cms && npm run seed:foundation
	@echo "✅ Seed complete"

# Fresh Start - Complete Reset
fresh-start:
	@echo "🔄 Starting fresh start process..."
	@echo ""
	@echo "Step 1/7: Stopping MongoDB..."
	@make stop-db || true
	@echo ""
	@echo "Step 2/7: Flushing database..."
	@cd apps/mindmap-cms && docker compose down -v
	@echo "✅ Database flushed"
	@echo ""
	@echo "Step 3/7: Cleaning build artifacts and node_modules..."
	@make clean
	@echo "✅ Cleanup complete"
	@echo ""
	@echo "Step 4/7: Installing dependencies..."
	@make install
	@echo "✅ Dependencies installed"
	@echo ""
	@echo "Step 5/7: Starting MongoDB..."
	@make dev-db
	@sleep 5
	@echo "✅ MongoDB started"
	@echo ""
	@echo "Step 6/7: Seeding foundation data..."
	@make seed
	@echo "✅ Seed complete"
	@echo ""
	@echo "Step 7/7: Starting development servers..."
	@echo "🚀 Starting CMS and Web..."
	@npm run dev

# Quick commands
restart-db: stop-db dev-db
	@echo "♻️  MongoDB restarted"

