const axios = require('axios');

function ehIdDeezerValido(id) {
  return /^\d+$/.test(String(id || ''));
}

async function deezerBuscar(endpoint, params = {}) {
  const resp = await axios.get(`https://api.deezer.com/${endpoint}`, { params });
  return resp.data;
}

async function deezerBuscaMusicas(q) {
  const data = await deezerBuscar('search', { q, limit: 18 });
  return normalizarDeezerMusicas(data.data || []);
}

async function deezerBuscaAlbuns(q) {
  const data = await deezerBuscar('search/album', { q, limit: 18 });
  return normalizarDeezerAlbuns(data.data || []);
}

async function deezerBuscaArtistas(q) {
  const data = await deezerBuscar('search/artist', { q, limit: 18 });
  return normalizarDeezerArtistas(data.data || []);
}

function normalizarDeezerMusicas(items) {
  return (items || [])
    .filter(item => item?.id)
    .map(item => ({
      id: String(item.id),
      tipo: 'musica',
      titulo: item.title || item.title_short || 'Música sem título',
      artista: item.artist?.name || '',
      album: item.album?.title || '',
      ano: '',
      duracao: item.duration ? Math.round(item.duration / 60) : null,
      imagem: item.album?.cover_big || item.album?.cover_medium || item.album?.cover || '',
      backdrop: item.album?.cover_xl || item.album?.cover_big || item.album?.cover_medium || '',
      previewUrl: item.preview || '',
      deezerUrl: item.link || '',
      link: item.link || '',
      popularidade: item.rank || 0,
      plataformas: [{ nome: 'Deezer', tipo: 'Preview/Streaming', logo: '', link: item.link || '' }]
    }));
}

function normalizarDeezerAlbuns(items) {
  return (items || [])
    .filter(item => item?.id)
    .map(item => ({
      id: String(item.id),
      tipo: 'album',
      titulo: item.title || 'Álbum sem título',
      artista: item.artist?.name || '',
      ano: (item.release_date || '').slice(0, 4),
      imagem: item.cover_big || item.cover_medium || item.cover || '',
      backdrop: item.cover_xl || item.cover_big || item.cover_medium || '',
      deezerUrl: item.link || '',
      link: item.link || '',
      totalFaixas: item.nb_tracks || 0,
      plataformas: [{ nome: 'Deezer', tipo: 'Preview/Streaming', logo: '', link: item.link || '' }]
    }));
}

function normalizarDeezerArtistas(items) {
  return (items || [])
    .filter(item => item?.id)
    .map(item => ({
      id: String(item.id),
      tipo: 'artista',
      titulo: item.name || 'Artista sem nome',
      artista: item.name || '',
      ano: '',
      imagem: item.picture_big || item.picture_medium || item.picture || '',
      backdrop: item.picture_xl || item.picture_big || item.picture_medium || '',
      deezerUrl: item.link || '',
      link: item.link || '',
      popularidade: item.nb_fan || 0,
      plataformas: [{ nome: 'Deezer', tipo: 'Perfil', logo: '', link: item.link || '' }]
    }));
}

async function detalhesDeezer(tipo, id) {
  if (!ehIdDeezerValido(id)) throw new Error('ID inválido para Deezer.');

  if (tipo === 'musica') {
    const item = await deezerBuscar(`track/${id}`);
    return {
      id: String(item.id),
      tipo: 'musica',
      titulo: item.title || item.title_short || 'Música sem título',
      artista: item.artist?.name || '',
      album: item.album?.title || '',
      ano: (item.release_date || '').slice(0, 4),
      duracao: item.duration ? Math.round(item.duration / 60) : null,
      imagem: item.album?.cover_big || item.album?.cover_medium || item.album?.cover || '',
      backdrop: item.album?.cover_xl || item.album?.cover_big || item.album?.cover_medium || '',
      descricao: `Faixa ${item.artist?.name ? `de ${item.artist.name}` : ''}${item.album?.title ? ` do álbum ${item.album.title}` : ''}.`,
      previewUrl: item.preview || '',
      deezerUrl: item.link || '',
      link: item.link || '',
      popularidade: item.rank || 0,
      plataformas: [{ nome: 'Deezer', tipo: 'Preview/Streaming', logo: '', link: item.link || '' }]
    };
  }

  if (tipo === 'album') {
    const item = await deezerBuscar(`album/${id}`);
    return {
      id: String(item.id),
      tipo: 'album',
      titulo: item.title || 'Álbum sem título',
      artista: item.artist?.name || '',
      ano: (item.release_date || '').slice(0, 4),
      imagem: item.cover_big || item.cover_medium || item.cover || '',
      backdrop: item.cover_xl || item.cover_big || item.cover_medium || '',
      descricao: `${item.record_type === 'single' ? 'Single/EP' : 'Álbum'} com ${item.nb_tracks || 0} faixa(s).`,
      generos: (item.genres?.data || []).map(g => g.name),
      previewUrl: '',
      deezerUrl: item.link || '',
      link: item.link || '',
      totalFaixas: item.nb_tracks || 0,
      faixas: (item.tracks?.data || []).slice(0, 30).map(faixa => ({
        id: String(faixa.id),
        nome: faixa.title || faixa.title_short,
        deezerUrl: faixa.link || '',
        link: faixa.link || '',
        previewUrl: faixa.preview || '',
        duracao: faixa.duration ? Math.round(faixa.duration / 60) : null
      })),
      plataformas: [{ nome: 'Deezer', tipo: 'Preview/Streaming', logo: '', link: item.link || '' }]
    };
  }

  const artista = await deezerBuscar(`artist/${id}`);
  const [top, albuns] = await Promise.all([
    deezerBuscar(`artist/${id}/top`, { limit: 10 }).catch(() => ({ data: [] })),
    deezerBuscar(`artist/${id}/albums`, { limit: 12 }).catch(() => ({ data: [] }))
  ]);

  return {
    id: String(artista.id),
    tipo: 'artista',
    titulo: artista.name || 'Artista sem nome',
    artista: artista.name || '',
    imagem: artista.picture_big || artista.picture_medium || artista.picture || '',
    backdrop: artista.picture_xl || artista.picture_big || artista.picture_medium || '',
    descricao: `Artista na Deezer${artista.nb_fan ? ` com ${Number(artista.nb_fan).toLocaleString('pt-BR')} fãs` : ''}.`,
    deezerUrl: artista.link || '',
    link: artista.link || '',
    popularidade: artista.nb_fan || 0,
    seguidores: artista.nb_fan || 0,
    faixas: (top.data || []).slice(0, 10).map(faixa => ({
      id: String(faixa.id),
      nome: faixa.title || faixa.title_short,
      deezerUrl: faixa.link || '',
      link: faixa.link || '',
      previewUrl: faixa.preview || '',
      duracao: faixa.duration ? Math.round(faixa.duration / 60) : null
    })),
    albuns: normalizarDeezerAlbuns(albuns.data || []),
    plataformas: [{ nome: 'Deezer', tipo: 'Perfil', logo: '', link: artista.link || '' }]
  };
}

module.exports = {
  ehIdDeezerValido,
  deezerBuscaMusicas,
  deezerBuscaAlbuns,
  deezerBuscaArtistas,
  detalhesDeezer,
  normalizarDeezerAlbuns
};
