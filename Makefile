.PHONY: help install dev dev-all dev-web dev-cms dev-db stop-db status build test test-watch test-e2e test-e2e-prod lint format clean doctor

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
	@echo "  make build         Build all apps"
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
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  make install && make dev-all"

# Setup
install:
	@echo "📦 Installing dependencies..."
	npm install

# Development - Start everything
dev-all:
	@echo "🚀 Starting MongoDB + Web + CMS..."
	@make dev-db
	@sleep 3
	@npm run dev

# Development - Start web + CMS only
dev:
	@echo "🚀 Starting Web + CMS..."
	@echo "⚠️  Make sure MongoDB is running (make dev-db)"
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
build:
	@echo "🏗️  Building all apps..."
	npm run build

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

# Quick commands
restart-db: stop-db dev-db
	@echo "♻️  MongoDB restarted"

