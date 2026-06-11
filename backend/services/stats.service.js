const { Usuario, Avaliacao } = require('../models');
const { normalizarTextoBusca, escaparRegex } = require('../utils/text');

async function estatisticasMidia(tipo, midiaId) {
  const avaliacoes = await Avaliacao.find({ tipo, midiaId: String(midiaId) })
    .sort({ criadaEm: -1 })
    .limit(8);

  const todas = await Avaliacao.find({ tipo, midiaId: String(midiaId) });
  const totalAvaliacoes = todas.length;
  const mediaUsuarios = totalAvaliacoes
    ? Number((todas.reduce((acc, item) => acc + Number(item.nota || 0), 0) / totalAvaliacoes).toFixed(1))
    : null;

  const idsUsuarios = [...new Set(avaliacoes.map(item => item.usuarioId).filter(Boolean))];
  const usuarios = await Usuario.find({ _id: { $in: idsUsuarios } }).select('nome foto tipo');
  const usuariosPorId = new Map(usuarios.map(usuario => [String(usuario._id), usuario]));

  return {
    mediaUsuarios,
    totalAvaliacoes,
    avaliacoes: avaliacoes.map(item => {
      const usuario = usuariosPorId.get(String(item.usuarioId));
      return {
        id: item._id,
        nota: item.nota,
        resenha: item.resenha,
        musicaRelacionada: item.musicaRelacionada || null,
        criadaEm: item.criadaEm,
        usuario: usuario ? {
          id: usuario._id,
          nome: usuario.nome,
          foto: usuario.foto || '',
          tipo: usuario.tipo || 'usuario'
        } : {
          id: item.usuarioId,
          nome: 'Usuário',
          foto: ''
        }
      };
    })
  };
}

async function anexarEstatisticas(lista) {
  return Promise.all((lista || []).map(async item => ({
    ...item,
    ...(await estatisticasMidia(item.tipo, item.id))
  })));
}

function chaveMusicaRelacionada(musica) {
  return `${normalizarTextoBusca(musica?.titulo)}|${normalizarTextoBusca(musica?.artista)}`;
}

async function musicasMaisIndicadasDaMidia(tipo, midiaId) {
  if (!['filme', 'serie', 'documentario'].includes(tipo)) return [];

  const avaliacoes = await Avaliacao.find({
    tipo,
    midiaId: String(midiaId),
    'musicaRelacionada.titulo': { $exists: true, $ne: '' }
  }).sort({ criadaEm: -1 }).limit(200);

  const mapa = new Map();

  avaliacoes.forEach(avaliacao => {
    const musica = avaliacao.musicaRelacionada || {};
    const chave = chaveMusicaRelacionada(musica);
    if (!chave || chave === '|') return;

    if (!mapa.has(chave)) {
      mapa.set(chave, {
        id: musica.deezerId || '',
        tipo: 'musica',
        titulo: musica.titulo || 'Música indicada',
        artista: musica.artista || '',
        link: musica.link || '',
        deezerUrl: musica.link || '',
        imagem: musica.imagem || '',
        motivo: musica.motivo || '',
        previewUrl: musica.previewUrl || '',
        totalIndicacoes: 0
      });
    }

    const atual = mapa.get(chave);
    atual.totalIndicacoes += 1;
    if (!atual.id && musica.deezerId) atual.id = musica.deezerId;
    if (!atual.imagem && musica.imagem) atual.imagem = musica.imagem;
    if (!atual.previewUrl && musica.previewUrl) atual.previewUrl = musica.previewUrl;
    if (!atual.link && musica.link) {
      atual.link = musica.link;
      atual.deezerUrl = musica.link;
    }
    if (!atual.motivo && musica.motivo) atual.motivo = musica.motivo;
  });

  return Array.from(mapa.values())
    .sort((a, b) => b.totalIndicacoes - a.totalIndicacoes)
    .slice(0, 8);
}

async function midiasMaisRelacionadasComMusica(midia) {
  if (!midia || !['musica', 'album'].includes(midia.tipo)) return [];

  const or = [];
  const adicionarTitulo = titulo => {
    const t = String(titulo || '').trim();
    if (t.length >= 2) or.push({ 'musicaRelacionada.titulo': new RegExp(`^${escaparRegex(t)}$`, 'i') });
  };

  if (midia.tipo === 'musica') adicionarTitulo(midia.titulo);
  if (midia.tipo === 'album') (midia.faixas || []).slice(0, 40).forEach(faixa => adicionarTitulo(faixa.nome || faixa.titulo));
  if (!or.length) return [];

  const avaliacoes = await Avaliacao.find({
    tipo: { $in: ['filme', 'serie', 'documentario'] },
    'musicaRelacionada.titulo': { $exists: true, $ne: '' },
    $or: or
  }).sort({ criadaEm: -1 }).limit(250);

  const artistaAtual = normalizarTextoBusca(midia.artista);
  const filtradas = avaliacoes.filter(avaliacao => {
    const artistaIndicado = normalizarTextoBusca(avaliacao.musicaRelacionada?.artista);
    if (!artistaAtual || !artistaIndicado) return true;
    return artistaIndicado.includes(artistaAtual) || artistaAtual.includes(artistaIndicado);
  });

  const mapa = new Map();

  filtradas.forEach(avaliacao => {
    const chave = `${avaliacao.tipo}-${avaliacao.midiaId}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        id: avaliacao.midiaId,
        tipo: avaliacao.tipo,
        titulo: avaliacao.titulo,
        imagem: avaliacao.imagem || '',
        totalIndicacoes: 0,
        musicas: []
      });
    }

    const item = mapa.get(chave);
    item.totalIndicacoes += 1;
    const musica = avaliacao.musicaRelacionada || {};
    if (musica.titulo && !item.musicas.some(m => normalizarTextoBusca(m.titulo) === normalizarTextoBusca(musica.titulo))) {
      item.musicas.push({ titulo: musica.titulo, artista: musica.artista || '' });
    }
  });

  return Array.from(mapa.values())
    .sort((a, b) => b.totalIndicacoes - a.totalIndicacoes)
    .slice(0, 8);
}

module.exports = {
  estatisticasMidia,
  anexarEstatisticas,
  musicasMaisIndicadasDaMidia,
  midiasMaisRelacionadasComMusica
};
