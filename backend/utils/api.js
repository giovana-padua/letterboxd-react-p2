function mensagemErroApi(erro) {
  return erro?.response?.data?.error?.message ||
    erro?.response?.data?.message ||
    erro?.response?.data?.error ||
    erro.message ||
    'Erro na API externa.';
}

async function executarComFallback(fn, fallback = []) {
  try {
    return await fn();
  } catch (erro) {
    console.log('Usando fallback:', mensagemErroApi(erro));
    return fallback;
  }
}

module.exports = { mensagemErroApi, executarComFallback };
