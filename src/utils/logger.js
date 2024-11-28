const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.env.HOME || '/root', 'dados_vps/logs');
const LOG_FILE = path.join(LOG_DIR, 'instalador.log');

const logToFile = (tipo, mensagem, dados = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    tipo,
    mensagem,
    dados,
  };
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, JSON.stringify(logEntry) + '\n');
  } catch (err) {
    console.error(`Erro ao salvar log: ${err.message}`);
  }
};

const log = {
  info: (mensagem, dados = null) => {
    console.log(chalk.blue('INFO:'), mensagem);
    logToFile('info', mensagem, dados);
  },
  sucesso: (mensagem, dados = null) => {
    console.log(chalk.green('SUCESSO:'), mensagem);
    logToFile('sucesso', mensagem, dados);
  },
  erro: (mensagem, dados = null) => {
    console.error(chalk.red('ERRO:'), mensagem);
    logToFile('erro', mensagem, dados);
  },
  aviso: (mensagem, dados = null) => {
    console.warn(chalk.yellow('AVISO:'), mensagem);
    logToFile('aviso', mensagem, dados);
  },
};

module.exports = {
  log,
};
