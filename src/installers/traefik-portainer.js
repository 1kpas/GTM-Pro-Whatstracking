const inquirer = require('inquirer');
const { execSync } = require('child_process');
const { log } = require('../utils/logger');
const { validateDomain, validateEmail } = require('../utils/validators');

async function installTraefikPortainer() {
  try {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'portainerDomain',
        message: 'Digite o domínio para o Portainer:',
        validate: validateDomain
      },
      {
        type: 'input',
        name: 'serverName',
        message: 'Digite o nome do servidor:',
        validate: input => input.length >= 3
      },
      {
        type: 'input',
        name: 'networkName',
        message: 'Digite o nome da rede interna:',
        validate: input => /^[a-zA-Z0-9_-]+$/.test(input)
      },
      {
        type: 'input',
        name: 'email',
        message: 'Digite o email para o SSL:',
        validate: validateEmail
      }
    ]);

    // Criar rede Docker
    execSync(`docker network create --driver=overlay ${answers.networkName}`);
    log.info('Rede Docker criada com sucesso');

    // Criar e implantar stack do Traefik
    const traefikStack = generateTraefikStack(answers);
    execSync(`echo '${traefikStack}' > traefik.yaml`);
    execSync('docker stack deploy --prune --resolve-image always -c traefik.yaml traefik');
    log.info('Traefik implantado com sucesso');

    // Criar e implantar stack do Portainer
    const portainerStack = generatePortainerStack(answers);
    execSync(`echo '${portainerStack}' > portainer.yaml`);
    execSync('docker stack deploy --prune --resolve-image always -c portainer.yaml portainer');
    log.info('Portainer implantado com sucesso');

  } catch (error) {
    log.error(`Erro na instalação: ${error.message}`);
    throw error;
  }
}

function generateTraefikStack(config) {
  return `
version: "3.7"
services:
  traefik:
    image: traefik:v2.11.2
    command:
      - "--api.dashboard=true"
      - "--providers.docker.swarmMode=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=${config.networkName}"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencryptresolver.acme.email=${config.email}"
    deploy:
      placement:
        constraints:
          - node.role == manager
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - ${config.networkName}

networks:
  ${config.networkName}:
    external: true
`;
}

function generatePortainerStack(config) {
  return `
version: "3.7"
services:
  portainer:
    image: portainer/portainer-ce:latest
    command: -H unix:///var/run/docker.sock
    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.portainer.rule=Host(\`${config.portainerDomain}\`)"
        - "traefik.http.services.portainer.loadbalancer.server.port=9000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - ${config.networkName}

volumes:
  portainer_data:

networks:
  ${config.networkName}:
    external: true
`;
}

module.exports = {
  installTraefikPortainer
};