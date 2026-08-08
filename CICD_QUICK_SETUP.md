# CI/CD Quick Setup - GitHub Actions

Quick reference for setting up automated deployment to Digital Ocean.

---

## ⚡ Quick Setup (5 Steps)

### Step 1: Generate SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server-ip

# Get private key (copy entire output)
cat ~/.ssh/github_actions_deploy
```

### Step 2: Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these 10 secrets:

**Server Secrets:**
```
DO_SSH_PRIVATE_KEY     = (paste private key from step 1)
DO_SSH_USER            = root (or ubuntu)
DO_SERVER_IP           = 123.45.67.89
DO_PROJECT_PATH        = /var/www/mindmap
```

**App Secrets:**
```bash
# Generate these first:
openssl rand -base64 32  # For MONGO_ROOT_PASSWORD
openssl rand -base64 32  # For PAYLOAD_SECRET

# Then add:
MONGO_ROOT_USER              = admin
MONGO_ROOT_PASSWORD          = (generated above)
MONGO_DATABASE               = mindmap
PAYLOAD_SECRET               = (generated above)
PAYLOAD_PUBLIC_SERVER_URL    = https://mindmap-api.yourdomain.com
NEXT_PUBLIC_CMS_URL          = https://mindmap-api.yourdomain.com
```

### Step 3: Initial Server Setup

```bash
# SSH into server
ssh user@your-server-ip

# Clone repo
cd /var/www
git clone https://github.com/yourusername/original-study.git mindmap
cd mindmap

# Configure git
git config --global --add safe.directory /var/www/mindmap

# Do initial manual deployment (see DEPLOYMENT.md)
# This sets up Nginx, SSL, etc.
```

### Step 4: Test Workflow

```bash
# On GitHub:
# 1. Go to Actions tab
# 2. Click "Deploy to Production"
# 3. Click "Run workflow"
# 4. Watch it run!
```

### Step 5: Enable Auto-Deploy

```bash
# On your local machine
git add .
git commit -m "Enable CI/CD"
git push origin main

# GitHub Actions will automatically deploy!
```

---

## 🔍 Verify Setup

### Check GitHub Secrets

Go to: **Settings → Secrets and variables → Actions**

You should see 10 secrets:
- ✅ DO_SSH_PRIVATE_KEY
- ✅ DO_SSH_USER
- ✅ DO_SERVER_IP
- ✅ DO_PROJECT_PATH
- ✅ MONGO_ROOT_USER
- ✅ MONGO_ROOT_PASSWORD
- ✅ MONGO_DATABASE
- ✅ PAYLOAD_SECRET
- ✅ PAYLOAD_PUBLIC_SERVER_URL
- ✅ NEXT_PUBLIC_CMS_URL

### Test SSH Connection

```bash
# From local machine
ssh -i ~/.ssh/github_actions_deploy user@your-server-ip

# Should connect without password
```

### Check Workflow File

File should exist: `.github/workflows/deploy.yml`

---

## 🚀 How It Works

```
┌─────────────────────────────────────────┐
│  You push to main branch                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  GitHub Actions triggers                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  1. Run Tests                           │
│     - Lint                              │
│     - Type check                        │
│     - Unit tests                        │
│     - Doctor check                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Build Docker Images                 │
│     - Web app image                     │
│     - CMS image                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Deploy to Digital Ocean             │
│     - SSH into server                   │
│     - Pull latest code                  │
│     - Run deploy script                 │
│     - Verify deployment                 │
│     - Create backup                     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  ✅ Your app is live!                   │
└─────────────────────────────────────────┘
```

---

## 📊 Monitoring Deployments

### View Deployment Status

1. Go to **Actions** tab on GitHub
2. See all workflow runs
3. Click on a run to see details

### Check Deployment on Server

```bash
# SSH into server
ssh user@your-server-ip

# Check status
cd /var/www/mindmap
./deploy.sh status

# View logs
./deploy.sh logs
```

---

## 🐛 Common Issues

### Issue: SSH Permission Denied

```bash
# Verify public key on server
ssh user@server-ip
cat ~/.ssh/authorized_keys

# Should contain your public key
```

### Issue: Workflow Fails at Deploy Step

```bash
# Check server logs
ssh user@server-ip
cd /var/www/mindmap
./deploy.sh logs
```

### Issue: Secrets Not Working

1. Verify secret names match exactly (case-sensitive)
2. Re-add secrets in GitHub
3. Check for extra spaces in secret values

---

## 🎯 Deployment Triggers

### Automatic Deployment

```bash
# Any push to main triggers deployment
git push origin main
```

### Manual Deployment

1. Go to **Actions** tab
2. Click **Deploy to Production**
3. Click **Run workflow**
4. Select branch
5. Click **Run workflow**

---

## 🔐 Security Checklist

- ✅ Use dedicated SSH key (not your personal key)
- ✅ Private key only in GitHub secrets (never commit)
- ✅ Strong MongoDB password (32+ characters)
- ✅ Strong Payload secret (32+ characters)
- ✅ HTTPS enabled on server
- ✅ Firewall configured (ports 22, 80, 443 only)

---

## 📚 Full Documentation

- **Complete Guide**: [GITHUB_ACTIONS_SETUP.md](./GITHUB_ACTIONS_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Quick Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 🎉 You're Done!

Once set up:
1. ✅ Push to `main` → Automatic deployment
2. ✅ Tests run automatically
3. ✅ Docker images built
4. ✅ Deployed to server
5. ✅ Backup created
6. ✅ Verified working

**No more manual deployments! 🚀**

