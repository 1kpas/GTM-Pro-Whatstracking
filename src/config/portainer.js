const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { log } = require('../utils/logger');

class PortainerConfig {
  constructor() {
    this.configPath = path.join(process.env.HOME, 'dados_vps/portainer.json');
    this.config = null;
    this.token = null;
    this.maxRetries = 10;
    this.retryDelay = 5000;
  }

  async load() {
    try {
      const data = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(data);
      return this.config;
    } catch {
      return null;
    }
  }

  async save(config) {
    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  async authenticate(retryCount = 0) {
    try {
      if (!this.config) {
        throw new Error('Configuração do Portainer não encontrada');
      }

      const response = await axios.post(`${this.config.url}/api/auth`, {
        username: this.config.username,
        password: this.config.password
      });

      this.token = response.data.jwt;
      return this.token;

    } catch (error) {
      if (retryCount < this.maxRetries) {
        log.warning(`Tentativa ${retryCount + 1}/${this.maxRetries} de autenticação falhou. Tentando novamente em 5 segundos...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.authenticate(retryCount + 1);
      }

      await this.clearConfig();
      throw new Error('Falha na autenticação do Portainer após várias tentativas');
    }
  }

  async clearConfig() {
    this.config = null;
    this.token = null;
    try {
      await fs.unlink(this.configPath);
    } catch {
      // Ignora erro se arquivo não existir
    }
  }

  async deployStack(name, composeContent) {
    try {
      if (!this.token) {
        await this.authenticate();
      }

      const endpointId = await this.getEndpointId();
      const swarmId = await this.getSwarmId(endpointId);

      const formData = new FormData();
      formData.append('Name', name);
      formData.append('file', new Blob([composeContent], { type: 'text/yaml' }));
      formData.append('SwarmID', swarmId);
      formData.append('Env', []);

      await axios.post(
        `${this.config.url}/api/stacks/create/swarm/file?endpointId=${endpointId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      log.success(`Stack ${name} implantada com sucesso`);
      return true;

    } catch (error) {
      throw new Error(`Erro ao implantar stack ${name}: ${error.message}`);
    }
  }

  async getEndpointId() {
    try {
      const response = await axios.get(`${this.config.url}/api/endpoints`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      
      const endpoint = response.data.find(e => e.Name === 'primary');
      if (!endpoint) {
        throw new Error('Endpoint primário não encontrado');
      }
      
      return endpoint.Id;
    } catch (error) {
      throw new Error(`Erro ao obter endpoint ID: ${error.message}`);
    }
  }

  async getSwarmId(endpointId) {
    try {
      const response = await axios.get(
        `${this.config.url}/api/endpoints/${endpointId}/docker/swarm`,
        {
          headers: { 'Authorization': `Bearer ${this.token}` }
        }
      );
      return response.data.ID;
    } catch (error) {
      throw new Error(`Erro ao obter Swarm ID: ${error.message}`);
    }
  }
}

module.exports = new PortainerConfig();