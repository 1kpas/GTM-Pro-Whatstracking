const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');

const LOG_DIR = path.join(process.env.HOME, 'dados_vps/logs');

const log = {
  async salvar(tipo, mensagem, dados = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      tipo,
      mensagem,
      dados
    };

    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(
      path.join(LOG_DIR, 'instalador.log'),
      JSON.stringify(logEntry) + '\n'
    );
  },

  info(mensagem, dados = null) {
    console.log(chalk.blue('INFO:'), mensagem);
    this.salvar('info', mensagem, dados);
  },

  sucesso(mensagem, dados = null) {
    console.log(chalk.green('SUCESSO:'), mensagem);
    this.salvar('sucesso', mensagem, dados);
  },

  erro(mensagem, dados = null) {
    console.error(chalk.red('ERRO:'), mensagem);
    this.salvar('erro', mensagem, dados);
  },

  aviso(mensagem, dados = null) {
    console.warn(chalk.yellow('AVISO:'), mensagem);
    this.salvar('aviso', mensagem, dados);
  }
};

module.exports = {
  log
};