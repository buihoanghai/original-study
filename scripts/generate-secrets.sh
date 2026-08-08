#!/bin/bash

# ============================================
# Generate Secure Secrets for Production
# ============================================
# This script generates secure random secrets for your .env.production file

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔐 Generating Secure Secrets${NC}"
echo ""

# Generate MongoDB password
MONGO_PASSWORD=$(openssl rand -base64 32)
echo -e "${GREEN}MongoDB Root Password:${NC}"
echo "$MONGO_PASSWORD"
echo ""

# Generate Payload secret
PAYLOAD_SECRET=$(openssl rand -base64 32)
echo -e "${GREEN}Payload Secret:${NC}"
echo "$PAYLOAD_SECRET"
echo ""

# Generate example .env.production
echo -e "${YELLOW}📝 Example .env.production configuration:${NC}"
echo ""
cat << EOF
# MongoDB Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=$MONGO_PASSWORD
MONGO_DATABASE=mindmap

# Payload CMS Configuration
PAYLOAD_SECRET=$PAYLOAD_SECRET
PAYLOAD_PUBLIC_SERVER_URL=https://mindmap-api.yourdomain.com

# Web App Configuration
NEXT_PUBLIC_CMS_URL=https://mindmap-api.yourdomain.com

# Application Configuration
NODE_ENV=production

# Debug Settings (disable in production)
DEBUG_TRACE=0
NEXT_PUBLIC_DEBUG_TRACE=0
EOF

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. Copy the configuration above to .env.production"
echo "2. Replace 'yourdomain.com' with your actual domain"
echo "3. Save the file"
echo ""
echo -e "${YELLOW}⚠️  Keep these secrets secure! Do not commit to git.${NC}"

