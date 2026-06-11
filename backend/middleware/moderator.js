const { Usuario } = require('../models');

function ehModerador(usuario) {
  return usuario?.tipo === 'moderador';
}

async function exigirModerador(req, res, next) {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('tipo');
    if (!ehModerador(usuario)) {
      return res.status(403).json({ erro: 'Apenas moderadores podem realizar esta ação.' });
    }
    next();
  } catch (erro) {
    return res.status(500).json({ erro: 'Erro ao validar permissão de moderador.' });
  }
}

module.exports = { ehModerador, exigirModerador };
