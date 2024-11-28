const Docker = require('node-docker-api').Docker;
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

class SwarmManager {
  constructor() {
    this.docker = docker;
  }

  async initSwarm() {
    try {
      const swarmStatus = await this.docker.swarm.inspect();
      return swarmStatus;
    } catch {
      const ip = require('os').networkInterfaces().eth0[0].address;
      return await this.docker.swarm.init({
        ListenAddr: `${ip}:2377`,
        AdvertiseAddr: ip
      });
    }
  }

  async deployStack(name, composeFile) {
    try {
      await this.docker.swarm.services.create({
        Name: name,
        TaskTemplate: {
          ContainerSpec: {
            Image: composeFile.services[name].image
          }
        },
        ...composeFile.services[name].deploy
      });
      return true;
    } catch (error) {
      throw new Error(`Erro ao fazer deploy da stack ${name}: ${error.message}`);
    }
  }
}

module.exports = new SwarmManager();