const inquirer = require('inquirer');
const chalk = require('chalk');
const { iniciarSwarm } = require('./utils/swarm');
const { configurarTraefik } = require('./stacks/traefik');
const { configurarChatwoot } = require('./stacks/chatwoot');
const { configurarEvolution } = require('./stacks/evolution');
const { configurarN8N } = require('./stacks/n8n');
const { log } = require('./utils/logger');

async function main() {
  console.clear();
  log.info('Instalador de Stacks GTM - Pro Whatsapp');
  
  // Configuração inicial do Traefik e Portainer
  const config = await configurarTraefik();
  
  while (true) {
    const { acao } = await inquirer.prompt([{
      type: 'list',
      name: 'acao',
      message: 'Escolha uma opção:',
      choices: [
        { name: 'Instalar Chatwoot', value: 'chatwoot' },
        { name: 'Instalar Evolution API', value: 'evolution' },
        { name: 'Instalar N8N', value: 'n8n' },
        { name: 'Sair', value: 'sair' }
      ]
    }]);

    if (acao === 'sair') break;

    try {
      switch (acao) {
        case 'chatwoot':
          await configurarChatwoot(config);
          break;
        case 'evolution':
          await configurarEvolution(config);
          break;
        case 'n8n':
          await configurarN8N(config);
          break;
      }
    } catch (erro) {
      log.error(`Erro: ${erro.message}`);
    }
  }
}

main().catch(erro => {
  log.error(`Erro fatal: ${erro.message}`);
  process.exit(1);
});