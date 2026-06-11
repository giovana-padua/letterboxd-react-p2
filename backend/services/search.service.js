function removerDuplicadosPorTipoEId(lista) {
  const mapa = new Map();
  (lista || []).forEach(item => {
    if (!item?.id || !item?.tipo) return;
    const chave = `${item.tipo}-${item.id}`;
    if (!mapa.has(chave)) mapa.set(chave, item);
  });
  return Array.from(mapa.values());
}

module.exports = { removerDuplicadosPorTipoEId };
