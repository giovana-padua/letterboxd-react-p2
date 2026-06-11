const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');

  if (!token) return res.status(401).json({ erro: 'Token não enviado.' });

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET || 'letterboxd_music_dev_secret');
    next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido.' });
  }
}

module.exports = autenticar;
