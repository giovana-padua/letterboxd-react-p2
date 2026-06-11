const express = require('express');
const router = express.Router();
const { mensagemErroApi, executarComFallback } = require('../utils/api');
const { aplicarFallbackImagem } = require('../utils/images');
const { buscarTmdb } = require('../services/tmdb.service');
const { deezerBuscaMusicas, deezerBuscaAlbuns, deezerBuscaArtistas } = require('../services/deezer.service');
const { buscarRankingsManuais } = require('../services/rankings.service');
const { removerDuplicadosPorTipoEId } = require('../services/search.service');

router.get('/buscar-geral', async (req, res) => {
  const termo = String(req.query.q || '').trim();
  if (!termo) return res.json({ resultados: [], erro: 'Digite um termo para buscar.' });

  try {
    const [filmes, series, documentarios, musicasDeezer, albunsDeezer, artistasDeezer] = await Promise.all([
      executarComFallback(() => buscarTmdb('filme', termo), []),
      executarComFallback(() => buscarTmdb('serie', termo), []),
      executarComFallback(() => buscarTmdb('documentario', termo), []),
      executarComFallback(() => deezerBuscaMusicas(termo), []),
      executarComFallback(() => deezerBuscaAlbuns(termo), []),
      executarComFallback(() => deezerBuscaArtistas(termo), [])
    ]);

    const manuais = buscarRankingsManuais(req, termo);
    const resultados = removerDuplicadosPorTipoEId([
      ...filmes, ...series, ...documentarios, ...musicasDeezer, ...albunsDeezer, ...artistasDeezer,
      ...manuais.musicas, ...manuais.albuns, ...manuais.artistas
    ]).map(item => aplicarFallbackImagem(req, item));

    res.json({ resultados });
  } catch (erro) {
    console.log('Erro busca geral:', mensagemErroApi(erro));
    res.status(500).json({ resultados: [], erro: 'Erro ao realizar busca geral.' });
  }
});

router.get('/buscar', async (req, res) => {
  const { tipo, q } = req.query;
  const termo = String(q || '').trim();
  if (tipo === 'todos') return res.redirect(307, `/buscar-geral?q=${encodeURIComponent(termo)}`);
  if (!termo) return res.json({ resultados: [], erro: 'Digite um termo para buscar.' });

  try {
    if (tipo === 'album') return res.json({ resultados: await deezerBuscaAlbuns(termo) });
    if (tipo === 'musica') return res.json({ resultados: await deezerBuscaMusicas(termo) });
    if (tipo === 'artista') return res.json({ resultados: await deezerBuscaArtistas(termo) });
    res.json({ resultados: await buscarTmdb(tipo, termo) });
  } catch (erro) {
    console.log('Erro busca:', mensagemErroApi(erro));
    res.json({ resultados: [], erro: ['album', 'musica', 'artista'].includes(tipo) ? 'Erro ao buscar na Deezer.' : 'Erro ao buscar na API externa.' });
  }
});

module.exports = router;
