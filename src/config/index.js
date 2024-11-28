const fs = require('fs').promises;
const path = require('path');

const CONFIG_DIR = '/root/dados_vps';
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const defaultConfig = {
  installDir: '/opt/stacks',
  dataDir: '/var/lib/docker/volumes',
  logDir: '/var/log/stacks'
};

async function initConfig() {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
    
    try {
      await fs.access(CONFIG_FILE);
    } catch {
      await fs.writeFile(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2));
    }
  } catch (error) {
    throw new Error(`Erro ao inicializar configurações: ${error.message}`);
  }
}

module.exports = {
  initConfig,
  CONFIG_DIR,
  CONFIG_FILE
};