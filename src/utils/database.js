const { execSync } = require('child_process');
const { log } = require('./logger');

async function setupDatabase(dbName) {
  try {
    // Verificar se o PostgreSQL está instalado
    const postgresRunning = checkPostgresRunning();
    if (!postgresRunning) {
      await installPostgres();
    }

    // Criar banco de dados
    createDatabase(dbName);

    return true;
  } catch (error) {
    log.error(`Erro ao configurar banco de dados: ${error.message}`);
    throw error;
  }
}

function checkPostgresRunning() {
  try {
    execSync('docker ps | grep postgres');
    return true;
  } catch {
    return false;
  }
}

async function installPostgres() {
  const postgresStack = `
version: '3.7'
services:
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=${generatePassword()}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - db_network

volumes:
  postgres_data:

networks:
  db_network:
    external: true
`;

  execSync(`echo '${postgresStack}' > postgres.yaml`);
  execSync('docker stack deploy --prune --resolve-image always -c postgres.yaml postgres');
  
  // Aguardar PostgreSQL iniciar
  await waitForPostgres();
}

function createDatabase(dbName) {
  execSync(`docker exec postgres createdb -U postgres ${dbName}`);
}

function generatePassword() {
  return execSync('openssl rand -hex 16').toString().trim();
}

async function waitForPostgres() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      try {
        execSync('docker exec postgres pg_isready');
        clearInterval(checkInterval);
        resolve();
      } catch {
        // Continuar aguardando
      }
    }, 1000);
  });
}

module.exports = {
  setupDatabase
};