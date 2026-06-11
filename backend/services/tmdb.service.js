const axios = require('axios');

async function tmdbTendencias(categoria, tipo) {
  const chave = process.env.TMDB_API_KEY;
  if (!chave) return [];

  const resp = await axios.get(`https://api.themoviedb.org/3/trending/${categoria}/day`, {
    params: { api_key: chave, language: 'pt-BR' }
  });

  return normalizarTmdb(resp.data.results || [], tipo).slice(0, 18);
}

async function tmdbPopularesPeriodo(categoria, tipo, periodo) {
  const chave = process.env.TMDB_API_KEY;
  if (!chave) return [];

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ultimoDiaMes = new Date(ano, hoje.getMonth() + 1, 0).getDate();

  const params = {
    api_key: chave,
    language: 'pt-BR',
    sort_by: 'popularity.desc',
    include_adult: false
  };

  if (categoria === 'movie') {
    params['primary_release_date.gte'] = periodo === 'mes' ? `${ano}-${mes}-01` : `${ano}-01-01`;
    params['primary_release_date.lte'] = periodo === 'mes' ? `${ano}-${mes}-${ultimoDiaMes}` : `${ano}-12-31`;
  } else {
    params['first_air_date.gte'] = periodo === 'mes' ? `${ano}-${mes}-01` : `${ano}-01-01`;
    params['first_air_date.lte'] = periodo === 'mes' ? `${ano}-${mes}-${ultimoDiaMes}` : `${ano}-12-31`;
  }

  const resp = await axios.get(`https://api.themoviedb.org/3/discover/${categoria}`, { params });
  return normalizarTmdb(resp.data.results || [], tipo).slice(0, 18);
}

const LISTAS_OSCAR = {
  2026: [
    'One Battle After Another',
    'Bugonia',
    'F1',
    'Frankenstein',
    'Hamnet',
    'Marty Supreme',
    'Sentimental Value',
    'Sinners',
    'The Secret Agent',
    'Train Dreams'
  ],
  2025: [
    'Anora',
    'The Brutalist',
    'A Complete Unknown',
    'Conclave',
    'Dune: Part Two',
    'Emilia Pérez',
    'I\'m Still Here',
    'Nickel Boys',
    'The Substance',
    'Wicked'
  ],
  2024: [
    'Oppenheimer',
    'Poor Things',
    'Anatomy of a Fall',
    'The Holdovers',
    'Killers of the Flower Moon',
    'Maestro',
    'Barbie',
    'The Zone of Interest',
    'Past Lives',
    'American Fiction'
  ]
};

const LISTAS_GLOBO_OURO = {
  2026: [
    { categoria: 'movie', tipo: 'filme', titulo: 'Hamnet' },
    { categoria: 'movie', tipo: 'filme', titulo: 'One Battle After Another' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Frankenstein' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Sinners' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Sentimental Value' },
    { categoria: 'movie', tipo: 'filme', titulo: 'The Secret Agent' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The Pitt' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The Studio' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Adolescence' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The White Lotus' }
  ],
  2025: [
    { categoria: 'movie', tipo: 'filme', titulo: 'The Brutalist' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Emilia Pérez' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Conclave' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Anora' },
    { categoria: 'movie', tipo: 'filme', titulo: 'The Substance' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Wicked' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Shōgun' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Hacks' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Baby Reindeer' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The Bear' }
  ],
  2024: [
    { categoria: 'movie', tipo: 'filme', titulo: 'Oppenheimer' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Barbie' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Poor Things' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Anatomy of a Fall' },
    { categoria: 'movie', tipo: 'filme', titulo: 'Killers of the Flower Moon' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Succession' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The Bear' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Beef' },
    { categoria: 'tv', tipo: 'serie', titulo: 'Only Murders in the Building' },
    { categoria: 'tv', tipo: 'serie', titulo: 'The Crown' }
  ]
};

function anoMaisRecenteDaLista(listas) {
  return Math.max(...Object.keys(listas).map(Number));
}

function calcularAnoDisponivelPremiacao(tipoPremiacao, hoje = new Date()) {
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;

  if (tipoPremiacao === 'oscar') {
    // A cerimônia do Oscar normalmente ocorre entre fevereiro e março.
    // Antes de março, usamos a última lista completa disponível.
    return mesAtual < 3 ? anoAtual - 1 : anoAtual;
  }

  if (tipoPremiacao === 'globo-ouro') {
    // O Globo de Ouro normalmente ocorre em janeiro.
    // Durante janeiro, caso a lista do ano ainda não esteja cadastrada,
    // a função de fallback abaixo usa o ano anterior.
    return anoAtual;
  }

  return anoAtual;
}

function obterListaPorAnoDisponivel(listas, tipoPremiacao) {
  let ano = calcularAnoDisponivelPremiacao(tipoPremiacao);
  const anoMaisRecente = anoMaisRecenteDaLista(listas);

  if (ano > anoMaisRecente) {
    ano = anoMaisRecente;
  }

  while (ano >= 2020) {
    if (listas[ano]?.length) {
      return { ano, itens: listas[ano] };
    }
    ano -= 1;
  }

  return { ano: anoMaisRecente, itens: listas[anoMaisRecente] || [] };
}

async function tmdbListaCuradaOscar() {
  const { ano, itens } = obterListaPorAnoDisponivel(LISTAS_OSCAR, 'oscar');

  const resultados = await Promise.all(
    itens.map(titulo => tmdbBuscarPrimeiro('movie', 'filme', titulo))
  );

  return resultados
    .filter(Boolean)
    .map(item => ({ ...item, premiacao: 'Oscar', anoPremiacao: ano }))
    .slice(0, 18);
}

async function tmdbListaCuradaGloboOuro() {
  const { ano, itens } = obterListaPorAnoDisponivel(LISTAS_GLOBO_OURO, 'globo-ouro');

  const resultados = await Promise.all(
    itens.map(item => tmdbBuscarPrimeiro(item.categoria, item.tipo, item.titulo))
  );

  return resultados
    .filter(Boolean)
    .map(item => ({ ...item, premiacao: 'Globo de Ouro', anoPremiacao: ano }))
    .slice(0, 18);
}

async function tmdbBuscarPrimeiro(categoria, tipo, titulo) {
  const chave = process.env.TMDB_API_KEY;
  if (!chave) return null;

  const resp = await axios.get(`https://api.themoviedb.org/3/search/${categoria}`, {
    params: { api_key: chave, language: 'pt-BR', query: titulo, include_adult: false }
  });

  return normalizarTmdb(resp.data.results || [], tipo)[0] || null;
}

function normalizarTmdb(lista, tipo) {
  return lista
    .filter(item => item.poster_path)
    .map(item => ({
      id: item.id,
      tipo,
      titulo: item.title || item.name,
      ano: (item.release_date || item.first_air_date || '').slice(0, 4),
      imagem: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
      backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
      descricao: item.overview || '',
      avaliacaoTmdb: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
      votosTmdb: item.vote_count || 0,
      popularidade: item.popularity || 0,
      genreIds: item.genre_ids || []
    }));
}

async function buscarTmdb(tipo, q) {
  const chave = process.env.TMDB_API_KEY;
  if (!chave) return [];

  const endpoint = tipo === 'serie' ? 'tv' : 'movie';
  const resp = await axios.get(`https://api.themoviedb.org/3/search/${endpoint}`, {
    params: { api_key: chave, language: 'pt-BR', query: q, include_adult: false }
  });

  let lista = normalizarTmdb(resp.data.results || [], tipo);
  if (tipo === 'documentario') lista = lista.filter(item => item.genreIds?.includes(99));
  return lista.slice(0, 18);
}

async function detalhesTmdb(tipo, id) {
  const chave = process.env.TMDB_API_KEY;
  if (!chave) throw new Error('TMDB_API_KEY não configurada.');

  const endpoint = tipo === 'serie' ? 'tv' : 'movie';
  const resp = await axios.get(`https://api.themoviedb.org/3/${endpoint}/${id}`, {
    params: { api_key: chave, language: 'pt-BR', append_to_response: 'credits,videos,watch/providers' }
  });

  const item = resp.data;
  const trailer = (item.videos?.results || []).find(video => video.site === 'YouTube' && video.type === 'Trailer');
  const diretores = endpoint === 'movie'
    ? (item.credits?.crew || []).filter(pessoa => pessoa.job === 'Director').map(pessoa => pessoa.name)
    : (item.created_by || []).map(pessoa => pessoa.name);

  return {
    id: item.id,
    tipo,
    titulo: item.title || item.name,
    subtitulo: item.tagline || '',
    ano: (item.release_date || item.first_air_date || '').slice(0, 4),
    duracao: item.runtime || item.episode_run_time?.[0] || null,
    imagem: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
    backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : '',
    descricao: item.overview || '',
    generos: (item.genres || []).map(g => g.name),
    elenco: (item.credits?.cast || []).slice(0, 12).map(pessoa => pessoa.name),
    diretores,
    avaliacaoTmdb: item.vote_average ? Number(item.vote_average.toFixed(1)) : null,
    votosTmdb: item.vote_count || 0,
    trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : '',
    plataformas: normalizarPlataformasTmdb(item['watch/providers']?.results?.BR)
  };
}

function normalizarPlataformasTmdb(br) {
  if (!br) return [];
  const baseImagem = 'https://image.tmdb.org/t/p/w92';
  const grupos = [
    { chave: 'flatrate', tipo: 'Streaming' },
    { chave: 'rent', tipo: 'Aluguel' },
    { chave: 'buy', tipo: 'Compra' }
  ];
  const plataformas = [];

  grupos.forEach(grupo => {
    (br[grupo.chave] || []).forEach(item => {
      const nome = item.provider_name;
      const jaExiste = plataformas.some(p => p.nome === nome && p.tipo === grupo.tipo);
      if (!jaExiste) {
        plataformas.push({ nome, tipo: grupo.tipo, logo: item.logo_path ? `${baseImagem}${item.logo_path}` : '', link: br.link || '' });
      }
    });
  });

  return plataformas;
}

module.exports = {
  tmdbTendencias,
  tmdbPopularesPeriodo,
  tmdbListaCuradaOscar,
  tmdbListaCuradaGloboOuro,
  normalizarTmdb,
  buscarTmdb,
  detalhesTmdb
};
