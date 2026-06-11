function baseUrl(req) {
  return `${req.protocol}://${req.get('host')}`;
}

function imagemPlaceholder(req, tipo, titulo) {
  return `${baseUrl(req)}/placeholder/${encodeURIComponent(tipo || 'midia')}/${encodeURIComponent(titulo || 'Sem imagem')}.svg`;
}

function aplicarFallbackImagem(req, item) {
  if (!item) return item;
  return {
    ...item,
    imagem: item.imagem || imagemPlaceholder(req, item.tipo, item.titulo),
    backdrop: item.backdrop || item.imagem || imagemPlaceholder(req, item.tipo, item.titulo)
  };
}

module.exports = { baseUrl, imagemPlaceholder, aplicarFallbackImagem };
