function normalizarTextoBusca(valor) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function escaparRegex(valor = '') {
  return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function textoNormalizado(valor) {
  return normalizarTextoBusca(valor);
}

function slugManual(valor) {
  return textoNormalizado(valor).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function normalizarEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function normalizarNome(nome = '') {
  return String(nome).trim();
}

function senhaValida(senha = '') {
  return String(senha).length >= 6;
}

function validarSenhaDetalhada(senha = '') {
  const valor = String(senha || '');
  const erros = [];

  if (!valor) erros.push('Informe uma senha.');

  if (valor.length < 6) {
    const faltam = 6 - valor.length;
    erros.push(`A senha precisa ter pelo menos 6 caracteres. ${faltam === 1 ? 'Falta 1 caractere.' : `Faltam ${faltam} caracteres.`}`);
  }

  return erros;
}

module.exports = {
  normalizarTextoBusca,
  escaparRegex,
  textoNormalizado,
  slugManual,
  normalizarEmail,
  normalizarNome,
  senhaValida,
  validarSenhaDetalhada
};
