const express = require('express');
const router = express.Router();
const { mensagemErroApi } = require('../utils/api');
const { aplicarFallbackImagem } = require('../utils/images');
const { ehIdDeezerValido, detalhesDeezer } = require('../services/deezer.service');
const { detalhesTmdb } = require('../services/tmdb.service');
const { rankingManualDetalhesDeezer } = require('../services/rankings.service');
const { estatisticasMidia, musicasMaisIndicadasDaMidia, midiasMaisRelacionadasComMusica } = require('../services/stats.service');

router.get('/detalhes/:tipo/:id', async (req, res) => {
  const { tipo, id } = req.params;

  try {
    let midia;
    if (tipo === 'album' || tipo === 'musica' || tipo === 'artista') {
      if (ehIdDeezerValido(id)) {
        midia = aplicarFallbackImagem(req, await detalhesDeezer(tipo, id));
      } else {
        midia = await rankingManualDetalhesDeezer(req, tipo, id);
        if (!midia) return res.status(404).json({ erro: 'Mídia manual não encontrada.' });
      }
    } else {
      midia = aplicarFallbackImagem(req, await detalhesTmdb(tipo, id));
    }

    const estatisticas = await estatisticasMidia(tipo, id);
    const musicasIndicadas = await musicasMaisIndicadasDaMidia(tipo, id);
    const midiasRelacionadas = await midiasMaisRelacionadasComMusica(midia);
    res.json({ midia: { ...midia, ...estatisticas, musicasIndicadas, midiasRelacionadas } });
  } catch (erro) {
    console.log('Erro detalhes:', mensagemErroApi(erro));
    const fallback = (tipo === 'album' || tipo === 'musica' || tipo === 'artista')
      ? await rankingManualDetalhesDeezer(req, tipo, id)
      : null;
    if (fallback) {
      const estatisticas = await estatisticasMidia(tipo, id);
      return res.json({ midia: { ...fallback, ...estatisticas, aviso: mensagemErroApi(erro) } });
    }
    res.status(500).json({ erro: 'Erro ao carregar detalhes da mídia.', detalhe: mensagemErroApi(erro) });
  }
});

module.exports = router;
