# GitHub Actions CI/CD Setup Guide

Complete guide for setting up automated deployment to Digital Ocean using GitHub Actions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [SSH Key Setup](#ssh-key-setup)
4. [GitHub Secrets Configuration](#github-secrets-configuration)
5. [Initial Server Setup](#initial-server-setup)
6. [Testing the Workflow](#testing-the-workflow)
7. [Workflow Details](#workflow-details)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The GitHub Actions workflow automatically:
1. ✅ Runs tests (lint, typecheck, unit tests, doctor)
2. ✅ Builds Docker images
3. ✅ Deploys to your Digital Ocean server
4. ✅ Verifies deployment
5. ✅ Creates backup after deployment

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

---

## Prerequisites

### On Your Digital Ocean Server

1. **Initial deployment completed** (follow `DEPLOYMENT.md`)
2. **Git repository cloned** at a specific path (e.g., `/var/www/mindmap`)
3. **SSH access** configured
4. **Docker and Docker Compose** installed
5. **Nginx** configured

### On GitHub

1. Repository pushed to GitHub
2. Admin access to repository settings

---

## SSH Key Setup

### 1. Generate SSH Key Pair (on your local machine)

```bash
# Generate a new SSH key for GitHub Actions
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# This creates:
# - ~/.ssh/github_actions_deploy (private key)
# - ~/.ssh/github_actions_deploy.pub (public key)
```

### 2. Add Public Key to Digital Ocean Server

```bash
# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@your-server-ip

# Or manually:
cat ~/.ssh/github_actions_deploy.pub
# Then on server:
# echo "paste-public-key-here" >> ~/.ssh/authorized_keys
```

### 3. Test SSH Connection

```bash
# Test the connection
ssh -i ~/.ssh/github_actions_deploy user@your-server-ip

# Should connect without password
```

### 4. Get Private Key Content

```bash
# Display private key (you'll need this for GitHub)
cat ~/.ssh/github_actions_deploy

# Copy the entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

---

## GitHub Secrets Configuration

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### 2. Add Required Secrets

Add each of these secrets:

#### **Server Connection Secrets**

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DO_SSH_PRIVATE_KEY` | Private SSH key content | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `DO_SSH_USER` | SSH username on server | `root` or `ubuntu` |
| `DO_SERVER_IP` | Server IP address | `123.45.67.89` |
| `DO_PROJECT_PATH` | Full path to project on server | `/var/www/mindmap` |

#### **Application Secrets**

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `MONGO_ROOT_USER` | MongoDB admin username | `admin` |
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | `openssl rand -base64 32` |
| `MONGO_DATABASE` | MongoDB database name | `mindmap` |
| `PAYLOAD_SECRET` | Payload CMS secret key | `openssl rand -base64 32` |
| `PAYLOAD_PUBLIC_SERVER_URL` | CMS public URL | `https://mindmap-api.yourdomain.com` |
| `NEXT_PUBLIC_CMS_URL` | CMS URL for web app | `https://mindmap-api.yourdomain.com` |

### 3. Generate Secrets

```bash
# Generate MongoDB password
openssl rand -base64 32

# Generate Payload secret
openssl rand -base64 32

# Or use the helper script
./scripts/generate-secrets.sh
```

### 4. Verify All Secrets Added

Go to **Settings** → **Secrets and variables** → **Actions**

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

---

## Initial Server Setup

### 1. Clone Repository on Server

```bash
# SSH into your server
ssh user@your-server-ip

# Clone repository
cd /var/www
git clone https://github.com/yourusername/original-study.git mindmap
cd mindmap

# Set up git to allow pulls
git config --global --add safe.directory /var/www/mindmap
```

### 2. Initial Manual Deployment

```bash
# Follow the deployment guide
# This sets up Nginx, SSL, etc.
# See DEPLOYMENT.md for details

# Quick version:
cp .env.production.example .env.production
nano .env.production  # Fill in values

# Set up SSL
sudo certbot certonly --nginx -d mindmap.yourdomain.com
sudo certbot certonly --nginx -d mindmap-api.yourdomain.com

# Configure Nginx
sudo cp nginx/mindmap.conf /etc/nginx/sites-available/mindmap
sudo nano /etc/nginx/sites-available/mindmap  # Update domain
sudo ln -s /etc/nginx/sites-available/mindmap /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Deploy
chmod +x deploy.sh
./deploy.sh deploy
```

### 3. Verify Manual Deployment Works

```bash
./deploy.sh status
curl https://mindmap.yourdomain.com
curl https://mindmap-api.yourdomain.com/admin
```

---

## Testing the Workflow

### 1. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. If prompted, click **I understand my workflows, go ahead and enable them**

### 2. Manual Test Run

1. Go to **Actions** tab
2. Click **Deploy to Production** workflow
3. Click **Run workflow** dropdown
4. Select `main` branch
5. Click **Run workflow**

### 3. Monitor the Workflow

Watch the workflow run:
- ✅ Test job should pass
- ✅ Build job should pass
- ✅ Deploy job should pass

### 4. Verify Deployment

```bash
# SSH into server
ssh user@your-server-ip

# Check services
cd /var/www/mindmap
./deploy.sh status

# Check logs
./deploy.sh logs
```

### 5. Test Automatic Deployment

```bash
# On your local machine
git add .
git commit -m "Test automatic deployment"
git push origin main

# Watch GitHub Actions run automatically
```

---

## Workflow Details

### Workflow Stages

```
┌─────────────────────────────────────────┐
│  1. Test Stage                          │
│  ├─ Lint code                           │
│  ├─ Type check                          │
│  ├─ Run unit tests                      │
│  └─ Run doctor check                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Build Stage                         │
│  ├─ Build Web Docker image              │
│  └─ Build CMS Docker image              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Deploy Stage                        │
│  ├─ Setup SSH connection                │
│  ├─ Create .env.production              │
│  ├─ Pull latest code                    │
│  ├─ Run deploy script                   │
│  ├─ Verify deployment                   │
│  └─ Create backup                       │
└─────────────────────────────────────────┘
```

### Workflow File Location

`.github/workflows/deploy.yml`

### Environment

The workflow uses a GitHub environment called `production`:
- Allows manual approval (optional)
- Tracks deployment history
- Shows deployment URL

---

## Troubleshooting

### Issue: SSH Connection Failed

**Error:** `Permission denied (publickey)`

**Solution:**
```bash
# Verify public key is on server
ssh user@server-ip
cat ~/.ssh/authorized_keys

# Verify private key is correct in GitHub secrets
# Re-add DO_SSH_PRIVATE_KEY secret
```

### Issue: Git Pull Failed

**Error:** `fatal: detected dubious ownership`

**Solution:**
```bash
# On server
cd /var/www/mindmap
git config --global --add safe.directory /var/www/mindmap
```

### Issue: Docker Build Failed

**Error:** `Cannot connect to Docker daemon`

**Solution:**
```bash
# On server
sudo systemctl status docker
sudo systemctl start docker
```

### Issue: Deployment Failed

**Error:** Various deployment errors

**Solution:**
```bash
# On server, check logs
cd /var/www/mindmap
./deploy.sh logs

# Check service status
./deploy.sh status

# Manual deployment
./deploy.sh deploy
```

### Issue: Secrets Not Working

**Error:** Environment variables not set

**Solution:**
1. Verify all secrets are added in GitHub
2. Check secret names match exactly (case-sensitive)
3. Re-add secrets if needed

---

## Security Best Practices

1. **Use Dedicated SSH Key**
   - Don't reuse your personal SSH key
   - Generate a new key specifically for GitHub Actions

2. **Limit SSH Key Permissions**
   ```bash
   # On server, restrict to specific commands (optional)
   # Edit ~/.ssh/authorized_keys
   command="/var/www/mindmap/deploy.sh" ssh-ed25519 AAAA...
   ```

3. **Use GitHub Environments**
   - Set up protection rules
   - Require manual approval for production
   - Limit to specific branches

4. **Rotate Secrets Regularly**
   - Update MongoDB password
   - Update Payload secret
   - Update SSH keys

5. **Monitor Deployments**
   - Check GitHub Actions logs
   - Monitor server logs
   - Set up alerts (optional)

---

## Advanced Configuration

### Add Manual Approval

1. Go to **Settings** → **Environments** → **production**
2. Check **Required reviewers**
3. Add reviewers
4. Now deployments require approval

### Add Slack Notifications

Add to workflow:
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Deployment to production completed!"
      }
```

### Deploy to Staging First

Create separate workflows:
- `.github/workflows/deploy-staging.yml` (on push to `develop`)
- `.github/workflows/deploy-production.yml` (on push to `main`)

---

## Next Steps

1. ✅ Set up SSH keys
2. ✅ Add GitHub secrets
3. ✅ Test manual workflow run
4. ✅ Test automatic deployment
5. ✅ Monitor first few deployments
6. ✅ Set up manual approval (optional)
7. ✅ Add notifications (optional)

---

**Your CI/CD pipeline is ready! 🚀**

Every push to `main` will now automatically deploy to your Digital Ocean server.

