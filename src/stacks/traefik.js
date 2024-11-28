const swarm = require('../config/swarm');

async function deployTraefik(domain, email) {
  const stack = {
    version: '3.7',
    services: {
      traefik: {
        image: 'traefik:v2.11.2',
        command: [
          '--api.dashboard=true',
          '--providers.docker.swarmMode=true',
          '--providers.docker.exposedbydefault=false',
          '--entrypoints.web.address=:80',
          '--entrypoints.websecure.address=:443',
          '--certificatesresolvers.letsencryptresolver.acme.httpchallenge=true',
          `--certificatesresolvers.letsencryptresolver.acme.email=${email}`
        ],
        deploy: {
          placement: {
            constraints: ['node.role == manager']
          },
          labels: [
            'traefik.enable=true',
            `traefik.http.routers.traefik.rule=Host(\`${domain}\`)`,
            'traefik.http.services.traefik.loadbalancer.server.port=8080'
          ]
        },
        ports: [
          '80:80',
          '443:443'
        ],
        volumes: [
          '/var/run/docker.sock:/var/run/docker.sock:ro'
        ]
      }
    }
  };

  return await swarm.deployStack('traefik', stack);
}

module.exports = {
  deployTraefik
};