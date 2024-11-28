const { installTraefikPortainer } = require('./traefik-portainer');
const { installChatwoot } = require('./chatwoot');
const { installEvolution } = require('./evolution');
const { installN8N } = require('./n8n');
const { menuOptions } = require('../ui/menu');
const { log } = require('../utils/logger');

async function installStack(option) {
  try {
    switch (option) {
      case menuOptions.TRAEFIK_PORTAINER:
        await installTraefikPortainer();
        break;
      case menuOptions.CHATWOOT:
        await installChatwoot();
        break;
      case menuOptions.EVOLUTION:
        await installEvolution();
        break;
      case menuOptions.N8N:
        await installN8N();
        break;
      default:
        log.error('Opção inválida');
    }
  } catch (error) {
    log.error(`Erro ao instalar stack: ${error.message}`);
  }
}

module.exports = {
  installStack
};