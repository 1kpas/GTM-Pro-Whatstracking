const inquirer = require('inquirer');
const log = require('./utils/logger');
const { iniciarSwarm } = require('./utils/swarm');
const { deployTraefik } = require('./stacks/traefik');
const { configurarChatwoot } = require('./stacks/chatwoot');
const { configurarEvolution } = require('./stacks/evolution');
const { configurarN8N } = require('./stacks/n8n');

async function main() {
  console.clear();
  log.info('Instalador de Stacks GTM - Pro Whatsapp');

  // Configuração inicial do Swarm e rede
  try {
    await iniciarSwarm();
    log.sucesso('Docker Swarm configurado com sucesso!');
  } catch (erro) {
    log.erro(`Erro ao configurar Docker Swarm: ${erro.message}`);
    process.exit(1);
  }

  // Solicitar informações do Traefik
  let config;
  try {
    config = await solicitarInformacoesTraefik();
    await deployTraefik(config.domain, config.email);
  } catch (erro) {
    log.erro(`Erro ao configurar Traefik: ${erro.message}`);
    process.exit(1);
  }

  log.sucesso('Traefik configurado com sucesso! O instalador está pronto para usar.');

  // Menu principal
  while (true) {
    const { acao } = await inquirer.prompt([
      {
        type: 'list',
        name: 'acao',
        message: 'Escolha uma opção:',
        choices: [
          { name: 'Instalar Chatwoot', value: 'chatwoot' },
          { name: 'Instalar Evolution API', value: 'evolution' },
          { name: 'Instalar N8N', value: 'n8n' },
          { name: 'Sair', value: 'sair' },
        ],
      },
    ]);

    if (acao === 'sair') {
      log.info('Encerrando o instalador. Até breve!');
      break;
    }

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
      log.erro(`Erro durante a instalação: ${erro.message}`);
    }
  }

  log.sucesso('Todas as ações foram concluídas. Obrigado por usar o Instalador de Stacks GTM!');
  process.exit(0);
}

// Função para solicitar informações do Traefik
async function solicitarInformacoesTraefik() {
  log.info('Configuração de Traefik:');
  return await inquirer.prompt([
    {
      type: 'input',
      name: 'domain',
      message: 'Digite o domínio principal para o Traefik:',
      validate: (input) => (input.length > 3 ? true : 'O domínio deve ter pelo menos 3 caracteres.'),
    },
    {
      type: 'input',
      name: 'email',
      message: 'Digite o email para certificados SSL:',
      validate: (input) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) ? true : 'Digite um email válido.'),
    },
  ]);
}

main();
