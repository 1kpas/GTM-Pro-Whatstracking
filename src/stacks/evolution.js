const swarm = require('../config/swarm');
const { log } = require('../utils/logger');

async function deployEvolution(config) {
  const stack = {
    version: '3.7',
    services: {
      evolution: {
        image: 'atendai/evolution-api:v2.1.0',
        volumes: ['evolution_instances:/evolution/instances'],
        networks: [config.networkName],
        environment: {
          SERVER_URL: `https://${config.domain}`,
          AUTHENTICATION_API_KEY: config.apiKey,
          DATABASE_CONNECTION_URI: `postgresql://postgres:${config.dbPassword}@postgres:5432/evolution`,
          CACHE_REDIS_URI: 'redis://redis:6379/8',
          LANGUAGE: 'pt-BR'
        },
        deploy: {
          mode: 'replicated',
          replicas: 1,
          placement: {
            constraints: ['node.role == manager']
          },
          labels: [
            'traefik.enable=true',
            `traefik.http.routers.evolution.rule=Host(\`${config.domain}\`)`,
            'traefik.http.routers.evolution.entrypoints=websecure',
            'traefik.http.routers.evolution.tls.certresolver=letsencryptresolver'
          ]
        }
      }
    },
    networks: {
      [config.networkName]: {
        external: true
      }
    },
    volumes: {
      evolution_instances: {
        external: true
      }
    }
  };

  return await swarm.deployStack('evolution', stack);
}

module.exports = {
  deployEvolution
};