export default function AlbumInfoCard({ titulo, subtitulo, imagem, ano, duracao, tipo }) {
  return (
    <div className="album-info-card-clean">
      {imagem && <img src={imagem} alt={titulo} />}
      <div>
        <span className="lb-eyebrow">{tipo}</span>
        <strong>{titulo}</strong>
        {subtitulo && <small>{subtitulo}</small>}
        <div className="album-info-meta-clean">
          {ano && <span>{ano}</span>}
          {duracao && <span>{duracao}</span>}
        </div>
      </div>
    </div>
  );
}
