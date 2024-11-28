const swarm = require('../config/swarm');
const { log } = require('../utils/logger');

async function deployN8N(config) {
  const stack = {
    version: '3.7',
    services: {
      n8n: {
        image: 'n8nio/n8n:latest',
        environment: {
          N8N_HOST: config.domain,
          DB_TYPE: 'postgresdb',
          DB_POSTGRESDB_HOST: 'postgres',
          DB_POSTGRESDB_DATABASE: 'n8n',
          DB_POSTGRESDB_USER: 'postgres',
          DB_POSTGRESDB_PASSWORD: config.dbPassword,
          N8N_EMAIL_MODE: 'smtp',
          N8N_SMTP_HOST: config.smtp.host,
          N8N_SMTP_PORT: config.smtp.port,
          N8N_SMTP_USER: config.smtp.user,
          N8N_SMTP_PASS: config.smtp.password,
          N8N_SMTP_SENDER: config.smtp.from,
          WEBHOOK_URL: `https://${config.webhookDomain}`,
          GENERIC_TIMEZONE: 'America/Sao_Paulo'
        },
        volumes: ['n8n_data:/home/node/.n8n'],
        networks: [config.networkName],
        deploy: {
          replicas: 1,
          placement: {
            constraints: ['node.role == manager']
          },
          labels: [
            'traefik.enable=true',
            `traefik.http.routers.n8n.rule=Host(\`${config.domain}\`)`,
            'traefik.http.routers.n8n.entrypoints=websecure',
            'traefik.http.routers.n8n.tls.certresolver=letsencryptresolver'
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
      n8n_data: {
        external: true
      }
    }
  };

  return await swarm.deployStack('n8n', stack);
}

module.exports = {
  deployN8N
};