const swarm = require('../config/swarm');
const { log } = require('../utils/logger');

async function deployTraefik(domain, email) {
  try {
    log.info('Implantando stack do Traefik...');

    const stack = {
      version: '3.7',
      services: {
        traefik: {
          image: 'traefik:v2.11.2',
          command: [
            '--api.dashboard=true',
            '--providers.docker.swarmMode=true',
            '--providers.docker.exposedbydefault=false',
            '--providers.docker.network=gtm_network', // Usa a rede já criada
            '--entrypoints.web.address=:80',
            '--entrypoints.websecure.address=:443',
            '--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true',
            `--certificatesresolvers.letsencryptresolver.acme.email=${email}`,
          ],
          deploy: {
            placement: {
              constraints: ['node.role == manager'],
            },
            labels: [
              'traefik.enable=true',
              `traefik.http.routers.traefik.rule=Host(\`${domain}\`)`,
              'traefik.http.services.traefik.loadbalancer.server.port=8080',
              'traefik.http.routers.traefik.entrypoints=websecure',
              'traefik.http.routers.traefik.tls.certresolver=letsencryptresolver',
            ],
          },
          ports: ['80:80', '443:443'],
          volumes: ['/var/run/docker.sock:/var/run/docker.sock:ro'],
          networks: ['gtm_network'], // Conecta à rede criada
        },
      },
      networks: {
        gtm_network: {
          external: true, // Usa a rede externa criada no Swarm
        },
      },
    };

    await swarm.deployStack('traefik', stack);
    log.sucesso('Traefik implantado com sucesso!');
  } catch (error) {
    log.erro(`Erro ao implantar Traefik: ${error.message}`);
    throw error;
  }
}

module.exports = {
  deployTraefik,
};
