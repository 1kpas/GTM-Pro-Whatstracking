const fs = require('fs').promises;
const path = require('path');

class SMTPConfig {
  constructor() {
    this.configPath = path.join(process.env.HOME, 'dados_vps/smtp.json');
    this.config = null;
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

  async save(smtpConfig) {
    const config = {
      host: smtpConfig.host,
      port: smtpConfig.port,
      user: smtpConfig.user,
      password: smtpConfig.password,
      from: smtpConfig.from
    };

    await fs.mkdir(path.dirname(this.configPath), { recursive: true });
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
    this.config = config;
  }

  getConfig() {
    return this.config;
  }
}

module.exports = new SMTPConfig();