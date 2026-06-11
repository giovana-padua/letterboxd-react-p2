const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const { ehModerador } = require('../middleware/moderator');
const { Usuario, Avaliacao, Favorito, SolicitacaoModerador } = require('../models');

router.get('/perfil', autenticar, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id).select('-senha -resetToken -resetExpira');
  const solicitacaoModerador = await SolicitacaoModerador.findOne({ usuarioId: req.usuario.id }).sort({ criadaEm: -1 });
  const solicitacoesPendentesModerador = ehModerador(usuario)
    ? await SolicitacaoModerador.find({ status: 'pendente' }).sort({ criadaEm: -1 }).limit(30)
    : [];
  const avaliacoes = await Avaliacao.find({ usuarioId: req.usuario.id }).sort({ criadaEm: -1 }).limit(12);
  const favoritos = await Favorito.find({ usuarioId: req.usuario.id }).sort({ criadoEm: -1 }).limit(12);
  const totalAvaliacoes = await Avaliacao.countDocuments({ usuarioId: req.usuario.id });
  const totalFavoritos = await Favorito.countDocuments({ usuarioId: req.usuario.id });
  const somaNotas = avaliacoes.reduce((acc, item) => acc + Number(item.nota || 0), 0);
  const mediaNotas = avaliacoes.length ? Number((somaNotas / avaliacoes.length).toFixed(1)) : 0;
  const porTipo = await Avaliacao.aggregate([
    { $match: { usuarioId: req.usuario.id } },
    { $group: { _id: '$tipo', total: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ]);

  res.json({ usuario, solicitacaoModerador, solicitacoesPendentesModerador, totalAvaliacoes, totalFavoritos, mediaNotas, porTipo, favoritos, avaliacoes });
});

router.put('/perfil/foto', autenticar, async (req, res) => {
  const { foto } = req.body;
  if (!foto) return res.status(400).json({ erro: 'Envie uma imagem.' });
  if (!String(foto).startsWith('data:image/')) return res.status(400).json({ erro: 'O arquivo precisa ser uma imagem.' });
  await Usuario.updateOne({ _id: req.usuario.id }, { foto });
  res.json({ mensagem: 'Foto atualizada com sucesso.' });
});

router.get('/estatisticas', autenticar, async (req, res) => {
  const avaliacoes = await Avaliacao.find({ usuarioId: req.usuario.id });
  const totalAvaliacoes = avaliacoes.length;
  const totalFavoritos = await Favorito.countDocuments({ usuarioId: req.usuario.id });
  const soma = avaliacoes.reduce((acc, item) => acc + Number(item.nota || 0), 0);
  const mediaNotas = totalAvaliacoes ? (soma / totalAvaliacoes).toFixed(1) : 0;
  const porTipo = await Avaliacao.aggregate([
    { $match: { usuarioId: req.usuario.id } },
    { $group: { _id: '$tipo', total: { $sum: 1 } } }
  ]);
  res.json({ totalAvaliacoes, totalFavoritos, mediaNotas, porTipo });
});

module.exports = router;
