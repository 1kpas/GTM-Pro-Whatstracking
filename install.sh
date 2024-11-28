#!/bin/bash

# Configuração
DEV_MODE=false # Altere para "true" para habilitar modo de desenvolvimento

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
    
    # Configurar Docker daemon
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json <<EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    },
    "default-address-pools": [
        {
            "base": "172.17.0.0/16",
            "size": 24
        }
    ]
}
EOF
    systemctl restart docker
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

# Criar diretórios
log "Criando diretórios..."
mkdir -p /root/dados_vps/{logs,configs,stacks}
chmod 700 /root/dados_vps

# Instalar GTM Installer
log "Instalando GTM Installer..."
INSTALL_DIR="/opt/gtm-installer"

if [ "$DEV_MODE" = true ]; then
    log "Modo de desenvolvimento ativo: reinstalando tudo..." "$YELLOW"
    rm -rf "$INSTALL_DIR"
elif [ -d "$INSTALL_DIR" ]; then
    log "GTM Installer já está instalado."
    read -p "Deseja reinstalar? (y/n): " resposta
    if [[ "$resposta" =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
        log "Reinstalando GTM Installer..." "$YELLOW"
    else
        log "Instalação não modificada. Execute 'gtm-installer' para começar." "$GREEN"
        exit 0
    fi
fi

# Clonar repositório
git clone https://github.com/1kpas/GTM-Pro-Whatstracking.git "$INSTALL_DIR"
cd "$INSTALL_DIR"

# Instalar dependências
npm ci --production

# Criar link simbólico
log "Criando link simbólico para o GTM Installer..."
cat > /usr/local/bin/gtm-installer <<EOF
#!/usr/bin/env node
require('$INSTALL_DIR/src/index.js');
EOF
chmod +x /usr/local/bin/gtm-installer

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
