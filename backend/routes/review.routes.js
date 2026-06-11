const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/auth');
const { exigirModerador } = require('../middleware/moderator');
const { Avaliacao } = require('../models');

router.delete('/avaliacoes/:id', autenticar, exigirModerador, async (req, res) => {
  const avaliacao = await Avaliacao.findById(req.params.id);
  if (!avaliacao) return res.status(404).json({ erro: 'Resenha não encontrada.' });
  await Avaliacao.deleteOne({ _id: req.params.id });
  res.json({ mensagem: 'Resenha excluída com sucesso.' });
});

router.post('/avaliacoes', autenticar, async (req, res) => {
  const { midiaId, tipo, titulo, nota, resenha, imagem, musicaRelacionada } = req.body;
  if (!midiaId || !tipo || !titulo || nota === undefined || !resenha) return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios.' });
  if (nota < 0 || nota > 10) return res.status(400).json({ erro: 'A nota deve ser entre 0 e 10.' });

  const tiposComMusicaRelacionada = ['filme', 'serie', 'documentario'];
  let musicaParaSalvar = null;

  if (tiposComMusicaRelacionada.includes(tipo) && musicaRelacionada) {
    const tituloMusica = String(musicaRelacionada.titulo || '').trim();
    const artistaMusica = String(musicaRelacionada.artista || '').trim();
    const linkMusica = String(musicaRelacionada.link || '').trim();
    const imagemMusica = String(musicaRelacionada.imagem || '').trim();
    const motivoMusica = String(musicaRelacionada.motivo || '').trim();
    const deezerIdMusica = String(musicaRelacionada.deezerId || '').trim();
    const tipoMusica = String(musicaRelacionada.tipo || 'musica').trim();
    const previewUrlMusica = String(musicaRelacionada.previewUrl || '').trim();

    if (tituloMusica || artistaMusica || linkMusica || motivoMusica) {
      musicaParaSalvar = { titulo: tituloMusica, artista: artistaMusica, link: linkMusica, imagem: imagemMusica, motivo: motivoMusica, deezerId: deezerIdMusica, previewUrl: previewUrlMusica, tipo: tipoMusica };
    }
  }

  const avaliacao = await Avaliacao.create({ usuarioId: req.usuario.id, midiaId, tipo, titulo, nota, resenha, imagem, musicaRelacionada: musicaParaSalvar });
  res.json({ mensagem: 'Avaliação salva com sucesso.', avaliacao });
});

router.get('/minhas-avaliacoes', autenticar, async (req, res) => {
  const avaliacoes = await Avaliacao.find({ usuarioId: req.usuario.id }).sort({ criadaEm: -1 });
  res.json({ avaliacoes });
});

module.exports = router;
