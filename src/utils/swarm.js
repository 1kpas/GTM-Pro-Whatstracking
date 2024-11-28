const { execSync } = require('child_process');
const { log } = require('./logger');

const iniciarSwarm = async () => {
  try {
    const swarmStatus = execSync('docker info --format "{{.Swarm.LocalNodeState}}"')
      .toString()
      .trim();

    if (swarmStatus === 'active') {
      log.info('Docker Swarm já está ativo.');
      return true;
    }

    const ip = execSync("hostname -I | awk '{print $1}'").toString().trim();
    execSync(`docker swarm init --advertise-addr ${ip}`);
    log.sucesso('Docker Swarm inicializado com sucesso.');

    execSync('docker network create --driver overlay gtm_network');
    log.sucesso('Rede gtm_network criada.');

    return true;
  } catch (error) {
    log.erro(`Erro ao inicializar Docker Swarm: ${error.message}`);
    throw error;
  }
};

module.exports = {
  iniciarSwarm,
};
