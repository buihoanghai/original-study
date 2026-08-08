# Deployment Files Overview

This directory contains all files needed to deploy the Mindmap Learning App to production.

---

## 📁 Deployment Files

### Configuration Files

1. **`docker-compose.prod.yml`**
   - Production Docker Compose configuration
   - Defines MongoDB, CMS, and Web services
   - Includes health checks and networking
   - Binds to localhost only (Nginx proxies external traffic)

2. **`.env.production.example`**
   - Template for production environment variables
   - Copy to `.env.production` and fill in your values
   - Contains MongoDB, Payload CMS, and app configuration

3. **`nginx/mindmap.conf`**
   - Nginx virtual host configuration
   - Reverse proxy for web app and CMS
   - SSL/HTTPS configuration
   - Security headers

### Dockerfiles

4. **`apps/mindmap-web/Dockerfile`**
   - Multi-stage build for Next.js web app
   - Optimized for production
   - Includes all workspace packages

5. **`apps/mindmap-cms/Dockerfile`**
   - Multi-stage build for Payload CMS
   - Optimized for production
   - Includes domain package

### Scripts

6. **`deploy.sh`**
   - Main deployment script
   - Commands: build, start, stop, restart, logs, status, backup, deploy
   - Automated deployment workflow

### Documentation

7. **`DEPLOYMENT.md`**
   - Complete deployment guide
   - Step-by-step instructions
   - Troubleshooting section
   - Maintenance procedures

8. **`DEPLOYMENT_CHECKLIST.md`**
   - Quick reference checklist
   - Pre-deployment requirements
   - Deployment steps
   - Post-deployment verification

---

## 🚀 Quick Start

### For First-Time Deployment

```bash
# 1. Clone repository on your server
git clone <your-repo> mindmap
cd mindmap

# 2. Configure environment
cp .env.production.example .env.production
nano .env.production  # Fill in your values

# 3. Set up SSL certificates
sudo certbot certonly --nginx -d mindmap.yourdomain.com
sudo certbot certonly --nginx -d mindmap-api.yourdomain.com

# 4. Configure Nginx
sudo cp nginx/mindmap.conf /etc/nginx/sites-available/mindmap
sudo nano /etc/nginx/sites-available/mindmap  # Update domains
sudo ln -s /etc/nginx/sites-available/mindmap /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 5. Deploy
chmod +x deploy.sh
./deploy.sh deploy
```

### For Updates

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy.sh deploy
```

---

## 🏗️ Architecture

### Server Layout

```
Digital Ocean Server
├── Nginx (ports 80, 443)
│   ├── mindmap.yourdomain.com → localhost:3000 (Web)
│   └── mindmap-api.yourdomain.com → localhost:3001 (CMS)
│
├── Docker Containers
│   ├── mindmap-mongo (MongoDB)
│   ├── mindmap-cms (Payload CMS)
│   └── mindmap-web (Next.js)
│
└── Existing Services
    ├── Laravel (existing)
    ├── MySQL (existing)
    └── Elasticsearch (existing)
```

### Port Mapping

| Service | Internal Port | External Access |
|---------|--------------|-----------------|
| Web App | 3000 | Via Nginx (443) |
| CMS | 3001 | Via Nginx (443) |
| MongoDB | 27017 | Localhost only |
| Nginx | 80, 443 | Public |

---

## 🔐 Security Features

1. **Container Isolation**
   - Services run in isolated Docker network
   - Only Nginx exposed to public

2. **Localhost Binding**
   - App ports (3000, 3001, 27017) only accessible from localhost
   - External traffic goes through Nginx reverse proxy

3. **SSL/HTTPS**
   - Let's Encrypt certificates
   - Automatic HTTP to HTTPS redirect
   - Security headers configured

4. **Environment Variables**
   - Secrets stored in `.env.production` (not in git)
   - Strong password generation recommended

5. **Health Checks**
   - Automatic container restart on failure
   - Health monitoring for all services

---

## 📊 Monitoring

### Check Service Status

```bash
./deploy.sh status
```

### View Logs

```bash
# All services
./deploy.sh logs

# Specific service
docker logs mindmap-web -f
docker logs mindmap-cms -f
docker logs mindmap-mongo -f

# Nginx logs
sudo tail -f /var/log/nginx/mindmap-web-access.log
sudo tail -f /var/log/nginx/mindmap-cms-access.log
```

### Resource Usage

```bash
# Container stats
docker stats

# Server resources
htop
df -h
```

---

## 💾 Backup & Restore

### Create Backup

```bash
./deploy.sh backup
```

Backups saved to: `./backups/mindmap-backup-YYYYMMDD-HHMMSS.gz`

### Restore Backup

```bash
docker exec -i mindmap-mongo mongorestore \
  --archive=/path/to/backup.gz \
  --gzip \
  -u admin \
  -p YOUR_PASSWORD \
  --authenticationDatabase admin
```

### Automated Backups

Add to crontab:
```bash
0 2 * * * cd /var/www/mindmap && ./deploy.sh backup
```

---

## 🔄 Update Workflow

### Standard Update

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild and deploy
./deploy.sh deploy

# 3. Verify
./deploy.sh status
./deploy.sh logs
```

### Rollback

```bash
# 1. Checkout previous version
git checkout <previous-commit>

# 2. Rebuild and deploy
./deploy.sh deploy
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   sudo systemctl restart docker
   ./deploy.sh start
   ```

2. **Port conflicts**
   ```bash
   sudo lsof -i :3000
   sudo lsof -i :3001
   ```

3. **Nginx errors**
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

4. **SSL issues**
   ```bash
   sudo certbot renew
   sudo systemctl reload nginx
   ```

5. **Out of disk space**
   ```bash
   docker system prune -a
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed troubleshooting.

---

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Complete deployment guide
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Quick checklist
- **[QUICK_START.md](./QUICK_START.md)** - Development quick start

---

## 🆘 Support

If you encounter issues:

1. Check logs: `./deploy.sh logs`
2. Check status: `./deploy.sh status`
3. Review troubleshooting section in DEPLOYMENT.md
4. Check GitHub issues

---

## 📝 Notes

- This deployment is designed for **multi-project servers**
- Works alongside existing Laravel, MySQL, Elasticsearch
- Uses Docker for isolation and easy management
- Nginx handles SSL and reverse proxy
- MongoDB runs in Docker (separate from your MySQL)

---

**Happy Deploying! 🚀**

