const inquirer = require('inquirer');
const { installStack } = require('../installers');
const { log } = require('../utils/logger');

const menuOptions = {
  TRAEFIK_PORTAINER: '1',
  CHATWOOT: '2',
  EVOLUTION: '3',
  N8N: '6',
  EXIT: 'exit'
};

const menuChoices = [
  {
    name: 'Traefik & Portainer',
    value: menuOptions.TRAEFIK_PORTAINER
  },
  {
    name: 'Chatwoot',
    value: menuOptions.CHATWOOT
  },
  {
    name: 'Evolution API',
    value: menuOptions.EVOLUTION
  },
  {
    name: 'N8N',
    value: menuOptions.N8N
  },
  {
    name: 'Sair',
    value: menuOptions.EXIT
  }
];

async function showMainMenu() {
  while (true) {
    const { option } = await inquirer.prompt([
      {
        type: 'list',
        name: 'option',
        message: 'Selecione uma opção:',
        choices: menuChoices
      }
    ]);

    if (option === menuOptions.EXIT) {
      log.info('Saindo do instalador...');
      process.exit(0);
    }

    await installStack(option);
  }
}

module.exports = {
  showMainMenu,
  menuOptions
};