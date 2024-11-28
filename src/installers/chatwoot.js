const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { log } = require('../utils/logger');
const { validateDomain, validateEmail } = require('../utils/validators');
const { setupDatabase } = require('../utils/database');

async function installChatwoot() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'domain',
        message: 'Digite o domínio para o Chatwoot:',
        validate: validateDomain
      },
      {
        type: 'input',
        name: 'email',
        message: 'Digite o email para SMTP:',
        validate: validateEmail
      },
      {
        type: 'input',
        name: 'smtpUser',
        message: 'Digite o usuário SMTP:',
        validate: input => input.length >= 3
      },
      {
        type: 'password',
        name: 'smtpPassword',
        message: 'Digite a senha SMTP:',
        validate: input => input.length >= 6
      },
      {
        type: 'input',
        name: 'smtpHost',
        message: 'Digite o host SMTP:',
        validate: validateDomain
      },
      {
        type: 'number',
        name: 'smtpPort',
        message: 'Digite a porta SMTP:',
        default: 587
      }
    ]);

    // Configurar banco de dados
    await setupDatabase('chatwoot');
    log.info('Banco de dados configurado com sucesso');

    // Gerar chave de criptografia
    const encryptionKey = execSync('openssl rand -hex 32').toString().trim();

    // Criar stack do Chatwoot
    const chatwootStack = generateChatwootStack({
      ...answers,
      encryptionKey
    });

    execSync(`echo '${chatwootStack}' > chatwoot.yaml`);
    execSync('docker stack deploy --prune --resolve-image always -c chatwoot.yaml chatwoot');
    log.info('Chatwoot implantado com sucesso');

    // Configurar banco de dados inicial
    await setupChatwootDatabase();
    log.info('Banco de dados do Chatwoot inicializado');

  } catch (error) {
    log.error(`Erro na instalação do Chatwoot: ${error.message}`);
    throw error;
  }
}

function generateChatwootStack(config) {
  return `
version: '3.7'
services:
  chatwoot:
    image: chatwoot/chatwoot:latest
    environment:
      - RAILS_ENV=production
      - SECRET_KEY_BASE=${config.encryptionKey}
      - FRONTEND_URL=https://${config.domain}
      - SMTP_ADDRESS=${config.smtpHost}
      - SMTP_PORT=${config.smtpPort}
      - SMTP_USERNAME=${config.smtpUser}
      - SMTP_PASSWORD=${config.smtpPassword}
      - SMTP_AUTHENTICATION=plain
      - SMTP_ENABLE_STARTTLS_AUTO=true
      - SMTP_OPENSSL_VERIFY_MODE=none
      - DEFAULT_LOCALE=pt_BR
      - POSTGRES_HOST=postgres
      - POSTGRES_DATABASE=chatwoot
      - POSTGRES_USERNAME=postgres
      - POSTGRES_PASSWORD=${config.dbPassword}
      - REDIS_URL=redis://redis:6379
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
      labels:
        - traefik.enable=true
        - traefik.http.routers.chatwoot.rule=Host(\`${config.domain}\`)
        - traefik.http.services.chatwoot.loadbalancer.server.port=3000
        - traefik.http.routers.chatwoot.entrypoints=websecure
        - traefik.http.routers.chatwoot.tls.certresolver=letsencryptresolver
    networks:
      - chatwoot_network

networks:
  chatwoot_network:
    external: true
    name: chatwoot_network
`;
}

async function setupChatwootDatabase() {
  const container = execSync('docker ps -q -f name=chatwoot_web').toString().trim();
  execSync(`docker exec ${container} bundle exec rails db:chatwoot_prepare`);
}

module.exports = {
  installChatwoot
};