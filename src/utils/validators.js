function validarDominio(dominio) {
  // Remove https:// ou http:// se existir
  dominio = dominio.replace(/^https?:\/\//, '');
  
  const dominioRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!dominioRegex.test(dominio)) {
    throw new Error('Domínio inválido');
  }
  return `https://${dominio}`;
}

function validarEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
  return true;
}

function validarSenha(senha) {
  if (senha.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres');
  }
  return true;
}

module.exports = {
  validarDominio,
  validarEmail,
  validarSenha
};