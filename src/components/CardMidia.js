import { Link } from 'react-router-dom';

export default function CardMidia({ midia, item }) {
  const dados = midia || item || {};

  const titulo = dados.titulo || dados.title || dados.name || dados.album || 'Título não informado';
  const imagem = dados.imagem || dados.poster || dados.poster_path || dados.image || dados.cover || '';
  const tipo = dados.tipo || dados.media_type || dados.type || 'midia';
  const ano = dados.ano || dados.year || dados.release_date?.substring(0, 4) || dados.first_air_date?.substring(0, 4) || '';
  const artista = dados.artista || dados.artist || dados.artists?.map?.(a => a.name).join(', ') || '';
  const mediaUsuarios = dados.mediaUsuarios;
  const totalAvaliacoes = dados.totalAvaliacoes || 0;
  const avaliacaoTmdb = dados.avaliacaoTmdb;

  const imagemFinal = imagem?.startsWith?.('http') || imagem?.startsWith?.('data:') || imagem?.startsWith?.('/placeholder') || imagem?.startsWith?.('/capas')
    ? imagem
    : imagem
    ? `https://image.tmdb.org/t/p/w500${imagem}`
    : '';

  const link = `/detalhes/${tipo}/${dados.id}`;

  return (
    <Link to={link} state={{ midia: dados }} className="card-midia card-letterboxd">
      <div className="poster-box">
        {imagemFinal ? (
          <img src={imagemFinal} alt={titulo} />
        ) : (
          <div className="poster-vazio">Sem imagem</div>
        )}

        <div className="poster-overlay">
          <span>Ver detalhes</span>
        </div>
      </div>

      <div className="card-meta-line">
        <span className="meta-item meta-view">●</span>
        <span>{totalAvaliacoes} avaliações</span>

        {mediaUsuarios !== null && mediaUsuarios !== undefined ? (
          <span className="meta-rating">★ {mediaUsuarios}</span>
        ) : avaliacaoTmdb ? (
          <span className="meta-rating">TMDb {avaliacaoTmdb}</span>
        ) : (
          <span className="meta-muted">Sem nota</span>
        )}
      </div>

      <div className="card-info">
        <h3>{titulo}</h3>
        <div className="card-info-row">
          <span className={`badge-tipo badge-${tipo}`}>{formatarTipo(tipo)}</span>
          {ano && <span>{ano}</span>}
        </div>
        {artista && <p className="texto-linha media-artist">{artista}</p>}
      </div>
    </Link>
  );
}

function formatarTipo(tipo) {
  const mapa = {
    filme: 'Filme',
    serie: 'Série',
    documentario: 'Doc',
    album: 'Álbum',
    musica: 'Música',
    artista: 'Artista'
  };

  return mapa[tipo] || tipo;
}
