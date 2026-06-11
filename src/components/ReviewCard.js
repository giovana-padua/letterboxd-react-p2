import { Link } from 'react-router-dom';

export default function ReviewCard({ avaliacao }) {
  const linkMidia = avaliacao?.tipo && avaliacao?.midiaId
    ? `/detalhes/${avaliacao.tipo}/${avaliacao.midiaId}`
    : null;

  const conteudoMidia = (
    <>
      <div className="review-card-poster">
        {avaliacao.imagem ? (
          <img src={avaliacao.imagem} alt={avaliacao.titulo} />
        ) : (
          <div className="poster-vazio">Sem imagem</div>
        )}
      </div>
      <h3>{avaliacao.titulo || avaliacao.midiaId}</h3>
    </>
  );

  return (
    <article className="review-card review-card-clean">
      {linkMidia ? (
        <Link className="review-card-midia-link" to={linkMidia}>
          {conteudoMidia}
        </Link>
      ) : conteudoMidia}

      <div className="card-meta review-card-meta">
        <span className={`badge badge-${avaliacao.tipo}`}>{formatarTipo(avaliacao.tipo)}</span>
        <span>Nota: {avaliacao.nota}/10</span>
      </div>

      {avaliacao.resenha && <p className="review-card-texto">{avaliacao.resenha}</p>}

      {avaliacao.musicaRelacionada?.titulo && (
        <div className="musica-relacionada-card review-musica-card">
          {avaliacao.musicaRelacionada.imagem && (
            <img src={avaliacao.musicaRelacionada.imagem} alt={avaliacao.musicaRelacionada.titulo} />
          )}
          <div>
            <strong>{avaliacao.musicaRelacionada.titulo}</strong>
            {avaliacao.musicaRelacionada.artista && <small>{avaliacao.musicaRelacionada.artista}</small>}
            {avaliacao.musicaRelacionada.motivo && <p>{avaliacao.musicaRelacionada.motivo}</p>}
            {avaliacao.musicaRelacionada.link && (
              <a href={avaliacao.musicaRelacionada.link} target="_blank" rel="noreferrer">Ouvir música</a>
            )}
          </div>
        </div>
      )}
    </article>
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

  return mapa[tipo] || tipo || 'Mídia';
}
