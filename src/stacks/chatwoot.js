const swarm = require('../config/swarm');
const { log } = require('../utils/logger');

async function deployChatwoot(config) {
  const stack = {
    version: '3.7',
    services: {
      chatwoot_web: {
        image: 'chatwoot/chatwoot:latest',
        command: 'bundle exec rails s -p 3000 -b 0.0.0.0',
        environment: {
          FRONTEND_URL: `https://${config.domain}`,
          SECRET_KEY_BASE: config.secretKey,
          POSTGRES_HOST: 'postgres',
          POSTGRES_USERNAME: 'postgres',
          POSTGRES_PASSWORD: config.dbPassword,
          REDIS_URL: 'redis://redis:6379',
          SMTP_ADDRESS: config.smtp.host,
          SMTP_PORT: config.smtp.port,
          SMTP_USERNAME: config.smtp.user,
          SMTP_PASSWORD: config.smtp.password,
          SMTP_DOMAIN: config.smtp.domain,
          DEFAULT_LOCALE: 'pt_BR'
        },
        volumes: [
          'chatwoot_storage:/app/storage',
          'chatwoot_public:/app/public'
        ],
        networks: [config.networkName],
        deploy: {
          replicas: 1,
          placement: {
            constraints: ['node.role == manager']
          },
          labels: [
            'traefik.enable=true',
            `traefik.http.routers.chatwoot.rule=Host(\`${config.domain}\`)`,
            'traefik.http.routers.chatwoot.entrypoints=websecure',
            'traefik.http.routers.chatwoot.tls.certresolver=letsencryptresolver'
          ]
        }
      },
      chatwoot_sidekiq: {
        image: 'chatwoot/chatwoot:latest',
        command: 'bundle exec sidekiq',
        environment: {
          REDIS_URL: 'redis://redis:6379',
          POSTGRES_HOST: 'postgres',
          POSTGRES_USERNAME: 'postgres',
          POSTGRES_PASSWORD: config.dbPassword
        },
        volumes: [
          'chatwoot_storage:/app/storage',
          'chatwoot_public:/app/public'
        ],
        networks: [config.networkName],
        deploy: {
          replicas: 1,
          placement: {
            constraints: ['node.role == manager']
          }
        }
      }
    },
    networks: {
      [config.networkName]: {
        external: true
      }
    },
    volumes: {
      chatwoot_storage: {
        external: true
      },
      chatwoot_public: {
        external: true
      }
    }
  };

  return await swarm.deployStack('chatwoot', stack);
}

module.exports = {
  deployChatwoot
};