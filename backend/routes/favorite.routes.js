const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const { Favorito } = require('../models');

router.post('/favoritos', autenticar, async (req, res) => {
  const { midiaId, tipo, titulo, imagem } = req.body;
  if (!midiaId || !tipo || !titulo) return res.status(400).json({ erro: 'Dados incompletos.' });
  const existe = await Favorito.findOne({ usuarioId: req.usuario.id, midiaId, tipo });
  if (existe) return res.status(400).json({ erro: 'Este item já está nos favoritos.' });
  await Favorito.create({ usuarioId: req.usuario.id, midiaId, tipo, titulo, imagem });
  res.json({ mensagem: 'Favorito salvo.' });
});

router.get('/favoritos', autenticar, async (req, res) => {
  const favoritos = await Favorito.find({ usuarioId: req.usuario.id }).sort({ criadoEm: -1 });
  res.json({ favoritos });
});

router.delete('/favoritos/:id', autenticar, async (req, res) => {
  await Favorito.deleteOne({ _id: req.params.id, usuarioId: req.usuario.id });
  res.json({ mensagem: 'Favorito removido.' });
});

module.exports = router;
