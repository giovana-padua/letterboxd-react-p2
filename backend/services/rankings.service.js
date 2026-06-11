const rankings = require('../data/rankings');
const { aplicarFallbackImagem } = require('../utils/images');
const { mensagemErroApi } = require('../utils/api');
const { textoNormalizado, slugManual } = require('../utils/text');
const { ehIdDeezerValido, deezerBuscaMusicas, deezerBuscaAlbuns, deezerBuscaArtistas, detalhesDeezer } = require('./deezer.service');

function rankingManualPorId(tipo, id) {
  const listas = [
    ...(rankings.topMusicasBR || []),
    ...(rankings.topMusicasMundo || []),
    ...(rankings.topAlbunsMundo || []),
    ...(rankings.albunsGrammy || [])
  ];
  return listas.find(item => item.tipo === tipo && String(item.id) === String(id)) || null;
}

function rankingManualDetalhes(req, tipo, id) {
  const item = rankingManualPorId(tipo, id);
  if (!item) return null;

  const termo = encodeURIComponent(`${item.titulo || ''} ${item.artista || ''}`.trim());
  const deezerUrl = `https://www.deezer.com/search/${termo}`;

  return aplicarFallbackImagem(req, {
    ...item,
    id,
    tipo,
    ano: item.ano || '',
    album: item.album || '',
    descricao: item.descricao || `${item.titulo}${item.artista ? ` — ${item.artista}` : ''}. Item do ranking manual.`,
    deezerUrl,
    link: deezerUrl,
    previewUrl: '',
    plataformas: [{ nome: 'Deezer', tipo: 'Busca', logo: '', link: deezerUrl }],
    faixas: item.faixas || []
  });
}

function listaManualComImagens(req, lista) {
  return (lista || []).map(item => aplicarFallbackImagem(req, item));
}

async function resolverItemManualNoDeezer(req, item) {
  if (!item) return null;

  try {
    const termo = `${item.titulo || ''} ${item.artista || ''}`.trim();

    if (item.tipo === 'musica') {
      const resultados = await deezerBuscaMusicas(termo);
      if (resultados[0]) return aplicarFallbackImagem(req, { ...resultados[0], origem: 'deezer', idManual: item.id });
    }

    if (item.tipo === 'album') {
      const resultados = await deezerBuscaAlbuns(termo);
      if (resultados[0]) return aplicarFallbackImagem(req, { ...resultados[0], origem: 'deezer', idManual: item.id });
    }

    if (item.tipo === 'artista') {
      const resultados = await deezerBuscaArtistas(item.artista || item.titulo || '');
      if (resultados[0]) return aplicarFallbackImagem(req, { ...resultados[0], origem: 'deezer', idManual: item.id });
    }
  } catch (erro) {
    console.log('Deezer indisponível para item manual:', item.titulo, '-', mensagemErroApi(erro));
  }

  return rankingManualDetalhes(req, item.tipo, item.id);
}

async function rankingMusicasDeezer(req, lista) {
  const resultados = [];
  const vistos = new Set();

  for (const item of (lista || [])) {
    const resolvido = await resolverItemManualNoDeezer(req, item);
    if (resolvido && !vistos.has(`${resolvido.tipo}-${resolvido.id}`)) {
      vistos.add(`${resolvido.tipo}-${resolvido.id}`);
      resultados.push(resolvido);
    }
  }

  return resultados;
}

async function rankingAlbunsDeezer(req, lista) {
  return rankingMusicasDeezer(req, lista);
}

async function rankingManualDetalhesDeezer(req, tipo, id) {
  const manual = rankingManualPorId(tipo, id);
  if (!manual) return null;

  const resolvido = await resolverItemManualNoDeezer(req, manual);
  if (resolvido && ehIdDeezerValido(resolvido.id)) {
    try {
      return aplicarFallbackImagem(req, await detalhesDeezer(tipo, resolvido.id));
    } catch (erro) {
      console.log('Não foi possível carregar detalhes completos da Deezer:', manual.titulo, '-', mensagemErroApi(erro));
      return resolvido;
    }
  }

  return resolvido || rankingManualDetalhes(req, tipo, id);
}

function todasMidiasManuais() {
  return [
    ...(rankings.topMusicasBR || []),
    ...(rankings.topMusicasMundo || []),
    ...(rankings.topAlbunsMundo || []),
    ...(rankings.albunsGrammy || [])
  ];
}

function buscarRankingsManuais(req, termo) {
  const normalizado = textoNormalizado(termo);
  const resposta = { musicas: [], albuns: [], artistas: [] };
  const artistasVistos = new Set();

  todasMidiasManuais().forEach(item => {
    const texto = textoNormalizado(`${item.titulo || ''} ${item.artista || ''}`);
    if (!texto.includes(normalizado)) return;
    const formatado = aplicarFallbackImagem(req, item);
    if (item.tipo === 'musica') resposta.musicas.push(formatado);
    if (item.tipo === 'album') resposta.albuns.push(formatado);
    if (item.artista) {
      const slug = slugManual(item.artista);
      if (!artistasVistos.has(slug)) {
        artistasVistos.add(slug);
        resposta.artistas.push(aplicarFallbackImagem(req, {
          id: slug,
          tipo: 'artista',
          titulo: item.artista,
          artista: item.artista,
          imagem: '',
          origem: 'ranking-manual'
        }));
      }
    }
  });

  return resposta;
}

module.exports = {
  rankings,
  listaManualComImagens,
  rankingMusicasDeezer,
  rankingAlbunsDeezer,
  rankingManualDetalhesDeezer,
  buscarRankingsManuais
};
