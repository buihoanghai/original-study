# Deployment Checklist - Quick Reference

Use this checklist for deploying to your Digital Ocean server.

---

## ✅ Pre-Deployment Checklist

### 1. Server Requirements
- [ ] Ubuntu 20.04/22.04 installed
- [ ] Minimum 2GB RAM available
- [ ] Docker installed (`docker --version`)
- [ ] Docker Compose installed (`docker-compose --version`)
- [ ] Nginx installed and running
- [ ] Git installed

### 2. Domain Setup
- [ ] DNS A record created for `mindmap.yourdomain.com`
- [ ] DNS A record created for `mindmap-api.yourdomain.com`
- [ ] DNS propagated (test with `dig` or `nslookup`)

### 3. Firewall Configuration
- [ ] Port 22 (SSH) open
- [ ] Port 80 (HTTP) open
- [ ] Port 443 (HTTPS) open
- [ ] UFW configured if using

---

## 🚀 Deployment Steps

### Step 1: Clone Repository
```bash
cd /var/www
git clone https://github.com/yourusername/original-study.git mindmap
cd mindmap
```
- [ ] Repository cloned successfully

### Step 2: Configure Environment
```bash
cp .env.production.example .env.production
nano .env.production
```

**Required values:**
- [ ] `MONGO_ROOT_PASSWORD` set (generate: `openssl rand -base64 32`)
- [ ] `PAYLOAD_SECRET` set (generate: `openssl rand -base64 32`)
- [ ] `PAYLOAD_PUBLIC_SERVER_URL` set to your API domain
- [ ] `NEXT_PUBLIC_CMS_URL` set to your API domain

### Step 3: SSL Certificates
```bash
sudo certbot certonly --nginx -d mindmap.yourdomain.com
sudo certbot certonly --nginx -d mindmap-api.yourdomain.com
```
- [ ] SSL certificate obtained for web app
- [ ] SSL certificate obtained for API
- [ ] Certificates saved to `/etc/letsencrypt/live/`

### Step 4: Nginx Configuration
```bash
sudo cp nginx/mindmap.conf /etc/nginx/sites-available/mindmap
sudo nano /etc/nginx/sites-available/mindmap
```
- [ ] Replace `yourdomain.com` with your actual domain
- [ ] Replace `mindmap.yourdomain.com` with your web domain
- [ ] Replace `mindmap-api.yourdomain.com` with your API domain

```bash
sudo ln -s /etc/nginx/sites-available/mindmap /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```
- [ ] Nginx config symlinked
- [ ] Nginx config test passed
- [ ] Nginx reloaded

### Step 5: Deploy Application
```bash
chmod +x deploy.sh
./deploy.sh deploy
```
- [ ] Deploy script executable
- [ ] Docker images built successfully
- [ ] Containers started
- [ ] All services healthy

### Step 6: Verify Deployment
```bash
# Check services
./deploy.sh status

# Check logs
./deploy.sh logs

# Test endpoints
curl http://localhost:3000
curl http://localhost:3001/admin
curl https://mindmap.yourdomain.com
curl https://mindmap-api.yourdomain.com/admin
```
- [ ] All containers running
- [ ] No errors in logs
- [ ] Web app accessible locally
- [ ] CMS accessible locally
- [ ] Web app accessible via domain
- [ ] CMS accessible via domain

---

## 🔍 Post-Deployment Verification

### Application Access
- [ ] Visit `https://mindmap.yourdomain.com` - Web app loads
- [ ] Visit `https://mindmap-api.yourdomain.com/admin` - CMS admin loads
- [ ] Create first admin user in CMS
- [ ] Login to web app works
- [ ] Create test mindmap works

### SSL/HTTPS
- [ ] HTTPS works for web app (no certificate warnings)
- [ ] HTTPS works for API (no certificate warnings)
- [ ] HTTP redirects to HTTPS
- [ ] Mixed content warnings resolved

### Performance
- [ ] Page load time acceptable (< 3 seconds)
- [ ] No console errors in browser
- [ ] API responses fast (< 500ms)

### Monitoring
- [ ] Docker containers auto-restart on failure
- [ ] Nginx logs being written
- [ ] Application logs accessible

---

## 🔧 Maintenance Setup

### Automated Backups
```bash
# Add to crontab
crontab -e

# Add this line (daily backup at 2 AM)
0 2 * * * cd /var/www/mindmap && ./deploy.sh backup
```
- [ ] Cron job added for daily backups
- [ ] Test backup: `./deploy.sh backup`
- [ ] Verify backup file created in `./backups/`

### Log Rotation
```bash
sudo nano /etc/logrotate.d/mindmap
```

Add:
```
/var/log/nginx/mindmap-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```
- [ ] Log rotation configured

### Monitoring
- [ ] Set up uptime monitoring (optional)
- [ ] Configure error alerts (optional)
- [ ] Set up resource monitoring (optional)

---

## 📝 Common Commands Reference

```bash
# Service Management
./deploy.sh status      # Check service status
./deploy.sh logs        # View logs
./deploy.sh restart     # Restart services
./deploy.sh stop        # Stop services
./deploy.sh start       # Start services

# Updates
git pull origin main    # Pull latest code
./deploy.sh deploy      # Rebuild and deploy

# Backups
./deploy.sh backup      # Create database backup

# Debugging
docker ps               # List containers
docker logs mindmap-web # View web app logs
docker logs mindmap-cms # View CMS logs
docker logs mindmap-mongo # View MongoDB logs

# Nginx
sudo nginx -t           # Test config
sudo systemctl reload nginx # Reload Nginx
sudo tail -f /var/log/nginx/mindmap-web-error.log # View errors
```

---

## 🆘 Troubleshooting Quick Fixes

### Services won't start
```bash
sudo systemctl restart docker
./deploy.sh start
```

### Port conflicts
```bash
sudo lsof -i :3000
sudo lsof -i :3001
# Kill conflicting process if needed
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo tail -f /var/log/nginx/error.log
```

### SSL issues
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Out of disk space
```bash
docker system prune -a
find ./backups -name "*.gz" -mtime +30 -delete
```

---

## ✅ Deployment Complete!

Once all items are checked:
1. Your app is live at `https://mindmap.yourdomain.com`
2. CMS admin at `https://mindmap-api.yourdomain.com/admin`
3. Automated backups configured
4. Monitoring in place

**Next Steps:**
- Create your first admin user
- Configure CMS settings
- Start creating mindmaps!

---

**Need help?** See full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)

