const express = require('express');
const router = express.Router();
const { getCache, setCache } = require('../utils/cache');
const { executarComFallback } = require('../utils/api');
const { anexarEstatisticas } = require('../services/stats.service');
const { tmdbTendencias, tmdbPopularesPeriodo, tmdbListaCuradaOscar, tmdbListaCuradaGloboOuro } = require('../services/tmdb.service');
const { rankings, listaManualComImagens, rankingMusicasDeezer, rankingAlbunsDeezer } = require('../services/rankings.service');

router.get('/home', async (req, res) => {
  const cache = getCache('home');
  if (cache) return res.json(cache);

  const respostaBase = {
    filmesFavoritosDia: [], seriesFavoritasDia: [], filmesFavoritosMes: [], seriesFavoritasMes: [],
    filmesFavoritosAno: [], seriesFavoritasAno: [], top50Brasil: [], top50Global: [], topHits: [],
    indicadosOscar: [], indicadosGloboOuro: [], albunsGrammy: []
  };

  try {
    const [filmesFavoritosDia, seriesFavoritasDia, filmesFavoritosMes, seriesFavoritasMes, filmesFavoritosAno, seriesFavoritasAno, indicadosOscar, indicadosGloboOuro, top50Brasil, top50Global, topHits, albunsGrammy] = await Promise.all([
      executarComFallback(() => tmdbTendencias('movie', 'filme'), []),
      executarComFallback(() => tmdbTendencias('tv', 'serie'), []),
      executarComFallback(() => tmdbPopularesPeriodo('movie', 'filme', 'mes'), []),
      executarComFallback(() => tmdbPopularesPeriodo('tv', 'serie', 'mes'), []),
      executarComFallback(() => tmdbPopularesPeriodo('movie', 'filme', 'ano'), []),
      executarComFallback(() => tmdbPopularesPeriodo('tv', 'serie', 'ano'), []),
      executarComFallback(() => tmdbListaCuradaOscar(), []),
      executarComFallback(() => tmdbListaCuradaGloboOuro(), []),
      executarComFallback(() => rankingMusicasDeezer(req, rankings.topMusicasBR), listaManualComImagens(req, rankings.topMusicasBR)),
      executarComFallback(() => rankingMusicasDeezer(req, rankings.topMusicasMundo), listaManualComImagens(req, rankings.topMusicasMundo)),
      executarComFallback(() => rankingAlbunsDeezer(req, rankings.topAlbunsMundo), listaManualComImagens(req, rankings.topAlbunsMundo)),
      executarComFallback(() => rankingAlbunsDeezer(req, rankings.albunsGrammy || []), listaManualComImagens(req, rankings.albunsGrammy || []))
    ]);

    Object.assign(respostaBase, { filmesFavoritosDia, seriesFavoritasDia, filmesFavoritosMes, seriesFavoritasMes, filmesFavoritosAno, seriesFavoritasAno, indicadosOscar, indicadosGloboOuro, top50Brasil, top50Global, topHits, albunsGrammy });
  } catch (erro) {
    console.log('Home carregada com fallback:', erro.message);
  }

  const resposta = {
    filmesFavoritosDia: await anexarEstatisticas(respostaBase.filmesFavoritosDia),
    seriesFavoritasDia: await anexarEstatisticas(respostaBase.seriesFavoritasDia),
    filmesFavoritosMes: await anexarEstatisticas(respostaBase.filmesFavoritosMes),
    seriesFavoritasMes: await anexarEstatisticas(respostaBase.seriesFavoritasMes),
    filmesFavoritosAno: await anexarEstatisticas(respostaBase.filmesFavoritosAno),
    seriesFavoritasAno: await anexarEstatisticas(respostaBase.seriesFavoritasAno),
    top50Brasil: await anexarEstatisticas(respostaBase.top50Brasil),
    top50Global: await anexarEstatisticas(respostaBase.top50Global),
    topHits: await anexarEstatisticas(respostaBase.topHits),
    indicadosOscar: await anexarEstatisticas(respostaBase.indicadosOscar),
    indicadosGloboOuro: await anexarEstatisticas(respostaBase.indicadosGloboOuro),
    albunsGrammy: await anexarEstatisticas(respostaBase.albunsGrammy),
    aviso: 'Músicas e álbuns da Home foram resolvidos pela Deezer para mostrar capas, dados e preview quando disponível.'
  };

  setCache('home', resposta, 30);
  res.json(resposta);
});

module.exports = router;
