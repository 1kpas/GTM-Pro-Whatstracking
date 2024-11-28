#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}GTM - Pro Whatsapp Stack Installer${NC}"
echo "=============================="

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Por favor, execute como root (sudo)${NC}"
  exit
fi

# Instalar curl se não estiver instalado
if ! command -v curl &> /dev/null; then
  apt-get update
  apt-get install -y curl
fi

# Instalar Node.js e npm
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Instalando Node.js...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
  apt-get install -y nodejs
fi

# Instalar Docker se não estiver instalado
if ! command -v docker &> /dev/null; then
  echo -e "${YELLOW}Instalando Docker...${NC}"
  curl -fsSL https://get.docker.com | bash
  systemctl enable docker
  systemctl start docker
fi

# Inicializar Docker Swarm
if ! docker info | grep -q "Swarm: active"; then
  echo -e "${YELLOW}Inicializando Docker Swarm...${NC}"
  ip=$(hostname -I | awk '{print $1}')
  docker swarm init --advertise-addr $ip
fi

# Criar diretório de dados
mkdir -p /root/dados_vps

# Clonar repositório
echo -e "${YELLOW}Baixando instalador...${NC}"
git clone https://github.com/1kpas/GTM-Pro-Whatstracking.git /opt/gtm-installer
cd /opt/gtm-installer

# Instalar dependências
npm install

# Criar link simbólico
ln -s /opt/gtm-installer/src/index.js /usr/local/bin/gtm-installer
chmod +x /usr/local/bin/gtm-installer

echo -e "${GREEN}Instalação concluída!${NC}"
echo "Execute 'gtm-installer' para começar a instalar as stacks"