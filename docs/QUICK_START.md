# Quick Start Guide

Get up and running with the Mindmap application in 5 minutes.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure CMS Environment
```bash
# Copy environment template
cp .env.example apps/mindmap-cms/.env

# Edit apps/mindmap-cms/.env if needed
# Default values should work for local development
```

### 3. Start MongoDB
```bash
cd apps/mindmap-cms
docker-compose up -d mongo
cd ../..
```

### 4. Start Development Servers
```bash
# Start both web and CMS
npm run dev
```

**That's it!** 🎉

## 📍 Access Your Apps

| App | URL | Description |
|-----|-----|-------------|
| **Web App** | http://localhost:3000 | Main application |
| **CMS Admin** | http://localhost:3001/admin | Content management |
| **CMS API** | http://localhost:3001/api | REST API |
| **GraphQL** | http://localhost:3001/api/graphql | GraphQL API |

## 🔑 First Time CMS Setup

1. Go to http://localhost:3001/admin
2. Create your first admin user
3. Start managing content!

## 📦 Common Commands

### Development
```bash
npm run dev              # Start both apps
npm run dev:web          # Start web app only (port 3000)
npm run dev:cms          # Start CMS only (port 3001)
```

### Testing
```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
npm run typecheck        # Type checking
```

### Building
```bash
npm run build            # Build all apps
npm run build:web        # Build web app
npm run build:cms        # Build CMS
```

### Code Quality
```bash
npm run lint             # Lint code
npm run format           # Format code
npm run format:check     # Check formatting
```

### Cleanup
```bash
npm run clean            # Remove all node_modules and build artifacts
```

## 🛠️ Troubleshooting

### Port Already in Use
If you see "Port 3000 is already in use":
```bash
# Kill the process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
cd apps/mindmap-cms
docker-compose ps

# Restart MongoDB
docker-compose restart mongo

# View MongoDB logs
docker-compose logs mongo
```

### TypeScript Errors
```bash
# Rebuild TypeScript project references
npm run typecheck
```

### Clean Install
```bash
# Complete cleanup and reinstall
npm run clean
npm install
```

## 📚 Next Steps

- Read [SETUP.md](./SETUP.md) for detailed architecture
- Check [CONTEXT.md](./CONTEXT.md) for project rules
- Review [How-AI-work.md](./How-AI-work.md) for AI workflow
- See [PR_CHECKLIST.md](./PR_CHECKLIST.md) before submitting PRs

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Payload CMS Documentation](https://payloadcms.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)

## 💡 Tips

1. **Use workspace commands** from the root directory
2. **Keep MongoDB running** while developing with CMS
3. **Check logs** if something doesn't work
4. **Run typecheck** before committing
5. **Use git hooks** - they run automatically on commit/push

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages carefully
3. Check if all services are running
4. Verify environment variables are set
5. Try a clean install

---

**Happy coding!** 🚀

