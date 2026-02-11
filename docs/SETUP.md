# Web + CMS Setup Guide

This document describes the architecture and setup of the mindmap application with separate web and CMS apps.

## Architecture Overview

```
mindmap-learning-app/
├── apps/
│   ├── mindmap-web/          # Frontend web application (Port 3000)
│   └── mindmap-cms/          # Payload CMS backend (Port 3001)
├── packages/
│   ├── domain/               # Shared domain models
│   ├── editor/               # Editor logic
│   ├── sync/                 # Sync utilities
│   └── testing/              # Testing utilities
└── docs/                     # Documentation
```

## Applications

### 1. Mindmap Web (`apps/mindmap-web`)
- **Port**: 3000
- **Framework**: Next.js 16.1.6 (App Router)
- **Styling**: Tailwind CSS 4
- **Purpose**: Main user-facing web application
- **Features**:
  - React 19
  - TypeScript
  - Workspace package integration (@mindmap/domain, @mindmap/editor, @mindmap/sync)
  - Testing: Vitest, Playwright, Testing Library
  - MSW for API mocking

### 2. Mindmap CMS (`apps/mindmap-cms`)
- **Port**: 3001
- **Framework**: Payload CMS 3.76.0 + Next.js 15.4.11
- **Database**: MongoDB (via Docker)
- **Purpose**: Content management and API backend
- **Features**:
  - User authentication
  - Media uploads
  - GraphQL API
  - Admin panel at http://localhost:3001/admin
  - Testing: Vitest (integration), Playwright (e2e)

## Getting Started

### Prerequisites
- Node.js 18.20.2+ or 20.9.0+
- npm or pnpm
- Docker (for MongoDB)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # For CMS
   cp .env.example apps/mindmap-cms/.env
   ```

3. **Start MongoDB** (for CMS):
   ```bash
   cd apps/mindmap-cms
   docker-compose up -d mongo
   ```

4. **Start development servers**:
   ```bash
   # From root - starts both apps
   npm run dev

   # Or individually
   npm run dev:web    # Web app on port 3000
   npm run dev:cms    # CMS on port 3001
   ```

### Access Points
- **Web App**: http://localhost:3000
- **CMS Admin**: http://localhost:3001/admin
- **CMS API**: http://localhost:3001/api
- **GraphQL**: http://localhost:3001/api/graphql

## Development Workflow

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# E2E tests
npm run test:e2e

# Type checking
npm run typecheck
```

### Building
```bash
# Build all apps
npm run build

# Build individually
npm run build:web
npm run build:cms
```

### Linting & Formatting
```bash
# Lint
npm run lint

# Format
npm run format

# Check formatting
npm run format:check
```

## Configuration Files

### Root Configuration
- `tsconfig.json` - TypeScript project references
- `package.json` - Workspace scripts and dependencies
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration

### Web App Configuration
- `apps/mindmap-web/tsconfig.json` - TypeScript config with workspace paths
- `apps/mindmap-web/next.config.ts` - Next.js config with transpilePackages
- `apps/mindmap-web/postcss.config.mjs` - Tailwind CSS setup

### CMS Configuration
- `apps/mindmap-cms/tsconfig.json` - TypeScript config
- `apps/mindmap-cms/next.config.mjs` - Next.js + Payload integration
- `apps/mindmap-cms/src/payload.config.ts` - Payload CMS configuration
- `apps/mindmap-cms/docker-compose.yml` - MongoDB setup

## Environment Variables

### CMS (.env)
```bash
DATABASE_URL=mongodb://root:secret@127.0.0.1:27017/mindmap?authSource=admin
PAYLOAD_SECRET=your-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3001
```

### Web App (optional .env.local)
```bash
NEXT_PUBLIC_CMS_URL=http://localhost:3001
```

## Troubleshooting

### Port Conflicts
- Web app uses port 3000
- CMS uses port 3001
- MongoDB uses port 27017

### TypeScript Errors
Run `npm run typecheck` to verify all configurations are correct.

### MongoDB Connection Issues
Ensure Docker is running and MongoDB container is up:
```bash
cd apps/mindmap-cms
docker-compose ps
docker-compose up -d mongo
```

