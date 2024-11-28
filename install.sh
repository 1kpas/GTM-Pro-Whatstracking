#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}GTM - Pro Whatsapp Stack Installer${NC}"
echo "=============================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root${NC}"
  exit
fi

# Install Docker if not installed
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Installing Docker...${NC}"
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
fi

# Initialize Docker Swarm
if ! docker info | grep -q "Swarm: active"; then
  echo -e "${YELLOW}Initializing Docker Swarm...${NC}"
  ip=$(hostname -I | awk '{print $1}')
  docker swarm init --advertise-addr $ip
fi

# Create data directory
mkdir -p /root/dados_vps

# Download installer
echo -e "${YELLOW}Downloading installer...${NC}"
curl -o /usr/local/bin/gtm-installer https://raw.githubusercontent.com/GTM-Pro/installer/main/src/index.js
chmod +x /usr/local/bin/gtm-installer

# Install Node.js dependencies
npm install -g axios chalk inquirer

echo -e "${GREEN}Installation complete!${NC}"
echo "Run 'gtm-installer' to start installing stacks"