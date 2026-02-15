# Quick Start Guide

## 🚀 Get Started in 2 Commands

```bash
make install    # Install dependencies
make dev-all    # Start MongoDB + Web + CMS
```

Then open:
- **Web App**: http://localhost:3333
- **CMS Admin**: http://localhost:3001/admin

---

## 📋 Common Commands

### Development

```bash
# Start everything (MongoDB + Web + CMS)
make dev-all

# Start only web + CMS (MongoDB must be running)
make dev

# Start individual services
make dev-web    # Web app only (port 3333)
make dev-cms    # CMS only (port 3001)
make dev-db     # MongoDB only (port 27017)
```

### Database

```bash
# Start MongoDB
make dev-db

# Stop MongoDB
make stop-db

# Check MongoDB status
make status

# View MongoDB logs
make logs-db

# Restart MongoDB
make restart-db
```

### Testing

```bash
# Run unit tests
make test

# Run unit tests in watch mode
make test-watch

# Run E2E tests (requires dev servers running)
make test-e2e

# Run health check
make doctor
```

### Code Quality

```bash
# Lint code
make lint

# Format code
make format

# Type check
make typecheck
```

### Build & Clean

```bash
# Build all apps
make build

# Clean all node_modules and build artifacts
make clean
```

---

## 🎯 Typical Workflows

### First Time Setup

```bash
# 1. Install dependencies
make install

# 2. Start everything
make dev-all

# 3. Open browser
# Web: http://localhost:3333
# CMS: http://localhost:3001/admin
```

### Daily Development

```bash
# Start dev servers
make dev-all

# In another terminal, run tests in watch mode
make test-watch
```

### Before Committing

```bash
# Format code
make format

# Run linter
make lint

# Run type check
make typecheck

# Run tests
make test

# Or use the health check
make doctor
```

### Running E2E Tests

```bash
# Terminal 1: Start dev servers
make dev-all

# Terminal 2: Run E2E tests
make test-e2e
```

---

## 🔧 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
make status

# If not running, start it
make dev-db

# View logs
make logs-db

# Restart MongoDB
make restart-db
```

### Port Conflicts

If ports are already in use:
- **3333**: Web app
- **3001**: CMS
- **27017**: MongoDB

```bash
# Find and kill processes using ports
lsof -ti:3333,3001,27017 | xargs kill -9

# Restart services
make dev-all
```

### Clean Start

```bash
# Stop everything
make stop-db

# Clean all artifacts
make clean

# Reinstall
make install

# Start fresh
make dev-all
```

---

## 📚 More Information

- **Full Setup Guide**: `docs/SETUP.md`
- **Development Workflow**: `docs/WORKFLOW.md`
- **E2E Testing Guide**: `docs/E2E_TESTING_GUIDE.md`
- **All Commands**: Run `make help`

---

## 🎉 You're Ready!

```bash
make dev-all
```

Happy coding! 🚀

