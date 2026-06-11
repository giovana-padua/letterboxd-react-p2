const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const { ehModerador, exigirModerador } = require('../middleware/moderator');
const { Usuario, SolicitacaoModerador } = require('../models');

router.post('/moderacao/solicitar', autenticar, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id).select('nome email tipo');
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
  if (ehModerador(usuario)) return res.status(400).json({ erro: 'Você já é moderador.' });

  const pendente = await SolicitacaoModerador.findOne({ usuarioId: req.usuario.id, status: 'pendente' });
  if (pendente) return res.status(400).json({ erro: 'Você já possui uma solicitação pendente.' });

  await SolicitacaoModerador.create({ usuarioId: req.usuario.id, nome: usuario.nome, email: usuario.email, status: 'pendente' });
  res.json({ mensagem: 'Solicitação enviada. Aguarde a aprovação de um moderador.' });
});

router.get('/moderacao/solicitacoes', autenticar, exigirModerador, async (req, res) => {
  const solicitacoes = await SolicitacaoModerador.find({ status: 'pendente' }).sort({ criadaEm: -1 });
  res.json({ solicitacoes });
});

router.post('/moderacao/solicitacoes/:id/aprovar', autenticar, exigirModerador, async (req, res) => {
  const solicitacao = await SolicitacaoModerador.findById(req.params.id);
  if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada.' });
  await Usuario.updateOne({ _id: solicitacao.usuarioId }, { $set: { tipo: 'moderador' } });
  solicitacao.status = 'aprovada';
  solicitacao.respondidaEm = new Date();
  solicitacao.respondidaPor = req.usuario.id;
  await solicitacao.save();
  res.json({ mensagem: 'Usuário promovido a moderador.' });
});

router.post('/moderacao/solicitacoes/:id/recusar', autenticar, exigirModerador, async (req, res) => {
  const solicitacao = await SolicitacaoModerador.findById(req.params.id);
  if (!solicitacao) return res.status(404).json({ erro: 'Solicitação não encontrada.' });
  solicitacao.status = 'recusada';
  solicitacao.respondidaEm = new Date();
  solicitacao.respondidaPor = req.usuario.id;
  await solicitacao.save();
  res.json({ mensagem: 'Solicitação recusada.' });
});

router.post('/setup/promover-usuarios-existentes', async (req, res) => {
  const resultado = await Usuario.updateMany({}, { $set: { tipo: 'moderador' } });
  res.json({ mensagem: 'Usuários existentes promovidos a moderadores.', alterados: resultado.modifiedCount });
});

module.exports = router;
