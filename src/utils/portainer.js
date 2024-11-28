const inquirer = require('inquirer');
const portainerConfig = require('../config/portainer');
const { log } = require('./logger');
const { validateDomain } = require('./validators');

async function ensurePortainerConfig() {
  let config = await portainerConfig.load();
  
  if (!config) {
    config = await promptPortainerCredentials();
    await portainerConfig.save(config);
  }

  try {
    await portainerConfig.authenticate();
  } catch (error) {
    log.error('Credenciais do Portainer inválidas ou servidor inacessível');
    config = await promptPortainerCredentials();
    await portainerConfig.save(config);
    await portainerConfig.authenticate();
  }

  return config;
}

async function promptPortainerCredentials() {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'url',
      message: 'Digite a URL do Portainer (ex: https://portainer.seudominio.com):',
      validate: validateDomain
    },
    {
      type: 'input',
      name: 'username',
      message: 'Digite o usuário do Portainer:',
      validate: input => input.length >= 3
    },
    {
      type: 'password',
      name: 'password',
      message: 'Digite a senha do Portainer:',
      validate: input => input.length >= 8
    }
  ]);

  return answers;
}

module.exports = {
  ensurePortainerConfig
};