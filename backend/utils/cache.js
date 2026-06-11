const cacheMemoria = new Map();

function getCache(chave) {
  const item = cacheMemoria.get(chave);
  if (!item) return null;

  if (Date.now() > item.expiraEm) {
    cacheMemoria.delete(chave);
    return null;
  }

  return item.dados;
}

function setCache(chave, dados, minutos = 60) {
  cacheMemoria.set(chave, {
    dados,
    expiraEm: Date.now() + minutos * 60 * 1000
  });
}

module.exports = { getCache, setCache };
