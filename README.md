# GTM Pro Whatsapp Stack Installer

Sistema automatizado para instalação e gerenciamento de stacks Docker para WhatsApp e ferramentas relacionadas.

⚠️ **AVISO: Este código está ofuscado para proteção da propriedade intelectual**

## 🚀 Recursos

- Instalação automatizada do Docker Swarm
- Gerenciamento de stacks via Portainer
- Suporte para:
  - Chatwoot
  - Evolution API
  - N8N
- Configuração automática de:
  - Traefik (proxy reverso)
  - PostgreSQL
  - Redis
  - Certificados SSL

## 📋 Pré-requisitos

- Ubuntu 20.04 ou superior
- Mínimo 2GB RAM
- Domínios configurados apontando para o servidor

## 🔧 Instalação

Execute como root:

```bash
curl -fsSL https://raw.githubusercontent.com/1kpas/GTM-Pro-Whatstracking/main/install.sh | sudo bash
```

Após a instalação, execute:

```bash
gtm-installer
```

## 🛠️ Configuração

O instalador irá guiá-lo através das seguintes etapas:

1. Configuração do Traefik e Portainer
2. Escolha das stacks para instalar
3. Configuração de domínios e SMTP
4. Deploy automático das stacks

## 📝 Logs

Os logs são salvos em:
- `/root/dados_vps/logs/instalador.log`

## 🔒 Segurança

- Todas as senhas são geradas automaticamente
- Comunicação via HTTPS
- Autenticação em todas as interfaces
- Dados sensíveis criptografados

## 🆘 Suporte

Para suporte, entre em contato através do WhatsApp.

## ⚖️ Licença

Copyright © 2023 GTM Pro Whatsapp. Todos os direitos reservados.