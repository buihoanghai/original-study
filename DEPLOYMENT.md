# Mindmap Learning App - Production Deployment Guide

Complete guide for deploying to Digital Ocean alongside existing Laravel projects.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Server Architecture](#server-architecture)
3. [Initial Setup](#initial-setup)
4. [Domain Configuration](#domain-configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Deployment](#deployment)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### On Your Digital Ocean Server

- **OS**: Ubuntu 20.04 or 22.04
- **RAM**: Minimum 2GB (4GB recommended)
- **Disk**: Minimum 20GB free space
- **Existing Services**:
  - Nginx (ports 80, 443)
  - MySQL (port 3306)
  - Elasticsearch (port 9200)
  - Laravel projects

### Required Software

```bash
# Check if installed
docker --version          # Should be >= 20.10
docker-compose --version  # Should be >= 1.29
nginx -v                  # Already installed
git --version            # Should be >= 2.0
```

### Install Docker (if not installed)

```bash
# Update packages
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
```

---

## Server Architecture

Your server will run:

```
┌─────────────────────────────────────────────────────────┐
│                    Digital Ocean Server                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Nginx (Ports 80, 443)                                   │
│  ├── yourdomain.com → Laravel (existing)                 │
│  ├── mindmap.yourdomain.com → Mindmap Web (port 3000)   │
│  └── mindmap-api.yourdomain.com → Mindmap CMS (3001)    │
│                                                           │
│  MySQL (Port 3306) - Laravel (existing)                  │
│  Elasticsearch (Port 9200) - Laravel (existing)          │
│  MongoDB (Port 27017) - Mindmap (new, Docker)            │
│                                                           │
│  Docker Containers:                                       │
│  ├── mindmap-mongo (MongoDB)                             │
│  ├── mindmap-cms (Payload CMS)                           │
│  └── mindmap-web (Next.js Web App)                       │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Ports Used:**
- `80, 443` - Nginx (existing)
- `3000` - Mindmap Web (localhost only, proxied by Nginx)
- `3001` - Mindmap CMS (localhost only, proxied by Nginx)
- `27017` - MongoDB (localhost only, Docker)

---

## Initial Setup

### 1. Clone Repository

```bash
# SSH into your Digital Ocean server
ssh user@your-server-ip

# Navigate to your projects directory
cd /var/www  # or wherever you keep your projects

# Clone the repository
git clone https://github.com/yourusername/original-study.git mindmap
cd mindmap
```

### 2. Configure Environment Variables

```bash
# Copy the example file
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required Configuration:**

```bash
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=YOUR_STRONG_PASSWORD_HERE  # Generate: openssl rand -base64 32

# Payload CMS
PAYLOAD_SECRET=YOUR_SECURE_SECRET_MIN_32_CHARS  # Generate: openssl rand -base64 32
PAYLOAD_PUBLIC_SERVER_URL=https://mindmap-api.yourdomain.com

# Web App
NEXT_PUBLIC_CMS_URL=https://mindmap-api.yourdomain.com

# Environment
NODE_ENV=production
```

**Generate Secure Secrets:**

```bash
# Generate MongoDB password
openssl rand -base64 32

# Generate Payload secret
openssl rand -base64 32
```

### 3. Make Deploy Script Executable

```bash
chmod +x deploy.sh
```

---

## Domain Configuration

### 1. Add DNS Records

In your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare):

```
Type    Name            Value               TTL
A       mindmap         your-server-ip      300
A       mindmap-api     your-server-ip      300
```

### 2. Verify DNS Propagation

```bash
# Check if DNS is propagated
dig mindmap.yourdomain.com
dig mindmap-api.yourdomain.com

# Or use nslookup
nslookup mindmap.yourdomain.com
nslookup mindmap-api.yourdomain.com
```

Wait for DNS to propagate (can take 5 minutes to 48 hours).

---

## SSL Certificate Setup

### 1. Install Certbot (if not installed)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificates

```bash
# Get certificate for web app
sudo certbot certonly --nginx -d mindmap.yourdomain.com

# Get certificate for API
sudo certbot certonly --nginx -d mindmap-api.yourdomain.com
```

Follow the prompts:
- Enter your email
- Agree to terms
- Choose whether to share email with EFF

Certificates will be saved to:
- `/etc/letsencrypt/live/mindmap.yourdomain.com/`
- `/etc/letsencrypt/live/mindmap-api.yourdomain.com/`

### 3. Auto-Renewal

Certbot automatically sets up renewal. Verify:

```bash
sudo certbot renew --dry-run
```

---

## Nginx Configuration

### 1. Copy Nginx Configuration

```bash
# Copy the config file
sudo cp nginx/mindmap.conf /etc/nginx/sites-available/mindmap

# Edit and replace yourdomain.com with your actual domain
sudo nano /etc/nginx/sites-available/mindmap
```

**Replace all instances of:**
- `mindmap.yourdomain.com` → your actual domain
- `mindmap-api.yourdomain.com` → your actual API domain

### 2. Enable the Site

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/mindmap /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

## Deployment

### 1. Build and Start Services

```bash
# Full deployment (builds images and starts containers)
./deploy.sh deploy
```

This will:
1. ✅ Check requirements
2. ✅ Build Docker images
3. ✅ Stop old containers
4. ✅ Start new containers
5. ✅ Show service status

### 2. Verify Services

```bash
# Check service status
./deploy.sh status

# Check logs
./deploy.sh logs

# Check individual container
docker logs mindmap-web
docker logs mindmap-cms
docker logs mindmap-mongo
```

### 3. Test the Application

```bash
# Test web app
curl http://localhost:3000

# Test CMS
curl http://localhost:3001/api/health

# Test from outside (with your domain)
curl https://mindmap.yourdomain.com
curl https://mindmap-api.yourdomain.com/api/health
```

---

## Deployment Commands

```bash
# Build Docker images
./deploy.sh build

# Start services
./deploy.sh start

# Stop services
./deploy.sh stop

# Restart services
./deploy.sh restart

# View logs (Ctrl+C to exit)
./deploy.sh logs

# Check status
./deploy.sh status

# Backup database
./deploy.sh backup

# Full deployment (build + restart)
./deploy.sh deploy
```

---

## Monitoring & Maintenance

### Check Service Health

```bash
# Docker containers
docker ps

# Service status
./deploy.sh status

# Resource usage
docker stats

# Disk usage
docker system df
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
sudo tail -f /var/log/nginx/mindmap-web-error.log
sudo tail -f /var/log/nginx/mindmap-cms-error.log
```

### Database Backup

```bash
# Create backup
./deploy.sh backup

# Backups are saved to: ./backups/mindmap-backup-YYYYMMDD-HHMMSS.gz

# Restore from backup
docker exec -i mindmap-mongo mongorestore --archive=/path/to/backup.gz --gzip
```

### Update Application

```bash
# Pull latest code
git pull origin main

# Rebuild and deploy
./deploy.sh deploy
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
sudo systemctl status docker

# Check logs
./deploy.sh logs

# Check environment variables
cat .env.production

# Restart Docker
sudo systemctl restart docker
./deploy.sh start
```

### Port Conflicts

```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :27017

# Kill process if needed
sudo kill -9 <PID>
```

### MongoDB Connection Issues

```bash
# Check MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mindmap-mongo

# Connect to MongoDB shell
docker exec -it mindmap-mongo mongosh -u admin -p YOUR_PASSWORD
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Restart Nginx
sudo systemctl restart nginx

# Check error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew certificates
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

### Application Errors

```bash
# Check web app logs
docker logs mindmap-web --tail 100

# Check CMS logs
docker logs mindmap-cms --tail 100

# Check Nginx access logs
sudo tail -f /var/log/nginx/mindmap-web-access.log
sudo tail -f /var/log/nginx/mindmap-cms-access.log
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean Docker
docker system prune -a

# Remove old images
docker image prune -a

# Remove old containers
docker container prune
```

---

## Security Best Practices

1. **Firewall Configuration**

```bash
# Allow only necessary ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. **Regular Updates**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
./deploy.sh deploy
```

3. **Backup Strategy**

```bash
# Daily backups (add to crontab)
0 2 * * * cd /var/www/mindmap && ./deploy.sh backup

# Keep backups for 30 days
find ./backups -name "*.gz" -mtime +30 -delete
```

4. **Monitor Logs**

```bash
# Set up log rotation
sudo nano /etc/logrotate.d/mindmap
```

---

## Performance Optimization

### 1. Enable Nginx Caching

Already configured in `nginx/mindmap.conf` for static assets.

### 2. Monitor Resource Usage

```bash
# Check container resources
docker stats

# Check server resources
htop
```

### 3. Scale if Needed

If you need more resources, upgrade your Digital Ocean droplet:
- Dashboard → Droplets → Resize
- Choose larger plan
- Restart services

---

## Next Steps

1. ✅ Access your app: `https://mindmap.yourdomain.com`
2. ✅ Access CMS admin: `https://mindmap-api.yourdomain.com/admin`
3. ✅ Create first admin user
4. ✅ Set up automated backups
5. ✅ Configure monitoring (optional)

---

## Support

For issues:
1. Check logs: `./deploy.sh logs`
2. Check status: `./deploy.sh status`
3. Review this guide's troubleshooting section
4. Check GitHub issues

---

**Deployment Complete! 🎉**

