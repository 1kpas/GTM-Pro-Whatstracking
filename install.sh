#!/bin/bash

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para log
log() {
    echo -e "${2:-$GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Verificar root
if [ "$EUID" -ne 0 ]; then 
    log "Execute como root (sudo)" "$RED"
    exit 1
fi

# Atualizar sistema
log "Atualizando sistema..."
apt-get update && apt-get upgrade -y
apt-get install -y software-properties-common curl wget git apt-transport-https ca-certificates gnupg

# Configurar timezone
log "Configurando timezone..."
timedatectl set-timezone America/Sao_Paulo

# Instalar Node.js 20 LTS
log "Configurando Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    npm install -g npm@latest
    node_version=$(node --version)
    log "Node.js $node_version instalado com sucesso"
else
    log "Node.js já instalado."
fi

# Instalar Docker
log "Configurando Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
else
    log "Docker já instalado."
fi

# Inicializar Swarm
log "Configurando Docker Swarm..."
if ! docker info | grep -q "Swarm: active"; then
    ip=$(hostname -I | awk '{print $1}')
    docker swarm init --advertise-addr $ip
else
    log "Docker Swarm já configurado."
fi

# Limpar configuração anterior
INSTALL_DIR="/opt/gtm-installer"
SYMLINK="/usr/local/bin/gtm-installer"

log "Limpando qualquer instalação anterior..." "$YELLOW"
docker stack rm gtm_stack &>/dev/null || true
sleep 5
docker system prune -af --volumes &>/dev/null || true

if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    log "Diretório $INSTALL_DIR removido." "$RED"
fi

if [ -L "$SYMLINK" ]; then
    rm -f "$SYMLINK"
    log "Link simbólico $SYMLINK removido." "$RED"
fi

# Clonar repositório
log "Clonando repositório..."
git clone https://github.com/1kpas/GTM-Pro-Whatstracking.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Instalar dependências
log "Instalando dependências..."
npm install --production &>/tmp/npm-install.log
if [ $? -ne 0 ]; then
    log "Erro ao instalar dependências. Verifique o log em /tmp/npm-install.log" "$RED"
    exit 1
fi

# Criar link simbólico
log "Criando link simbólico para o GTM Installer..."
cat > "$SYMLINK" <<EOF
#!/usr/bin/env node
require('$INSTALL_DIR/src/index.js');
EOF
chmod +x "$SYMLINK"

# Configurar atualizações automáticas
log "Configurando atualizações automáticas..."
cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
EOF

# Configurar limpeza automática
log "Configurando limpeza automática do Docker..."
cat > /etc/cron.daily/docker-cleanup <<EOF
#!/bin/bash
docker system prune -af --volumes
EOF
chmod +x /etc/cron.daily/docker-cleanup

log "Instalação concluída!" "$GREEN"
log "Execute 'gtm-installer' para começar a instalar as stacks" "$YELLOW"
