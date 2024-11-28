const { execSync } = require('child_process');
const { log } = require('./logger');

async function iniciarSwarm() {
  try {
    // Verificar se já está em modo swarm
    const swarmStatus = execSync('docker info --format "{{.Swarm.LocalNodeState}}"')
      .toString()
      .trim();

    if (swarmStatus === 'active') {
      log.info('Docker Swarm já está ativo');
      return true;
    }

    // Obter IP da interface principal
    const ip = execSync("hostname -I | awk '{print $1}'")
      .toString()
      .trim();

    // Inicializar swarm
    execSync(`docker swarm init --advertise-addr ${ip}`);
    log.sucesso('Docker Swarm inicializado com sucesso');

    // Criar rede overlay
    const redeNome = 'gtm_network';
    execSync(`docker network create --driver overlay ${redeNome}`);
    log.sucesso(`Rede ${redeNome} criada`);

    return true;

  } catch (erro) {
    log.erro(`Erro ao inicializar Docker Swarm: ${erro.message}`);
    throw erro;
  }
}

async function verificarSwarm() {
  try {
    const swarmStatus = execSync('docker info --format "{{.Swarm.LocalNodeState}}"')
      .toString()
      .trim();
    return swarmStatus === 'active';
  } catch (erro) {
    return false;
  }
}

async function criarRede(nome) {
  try {
    // Verificar se a rede já existe
    const redes = execSync('docker network ls --format "{{.Name}}"')
      .toString()
      .split('\n');

    if (!redes.includes(nome)) {
      execSync(`docker network create --driver overlay ${nome}`);
      log.sucesso(`Rede ${nome} criada`);
    } else {
      log.info(`Rede ${nome} já existe`);
    }
    return true;
  } catch (erro) {
    log.erro(`Erro ao criar rede ${nome}: ${erro.message}`);
    throw erro;
  }
}

async function removerStack(nome) {
  try {
    execSync(`docker stack rm ${nome}`);
    log.sucesso(`Stack ${nome} removida`);
    return true;
  } catch (erro) {
    log.erro(`Erro ao remover stack ${nome}: ${erro.message}`);
    throw erro;
  }
}

async function listarStacks() {
  try {
    const stacks = execSync('docker stack ls --format "{{.Name}}"')
      .toString()
      .split('\n')
      .filter(Boolean);
    return stacks;
  } catch (erro) {
    log.erro(`Erro ao listar stacks: ${erro.message}`);
    return [];
  }
}

module.exports = {
  iniciarSwarm,
  verificarSwarm,
  criarRede,
  removerStack,
  listarStacks
};