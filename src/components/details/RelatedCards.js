import { Link } from 'react-router-dom';
import { formatarTipo } from '../../utils/formatters';

export function MiniMusicaSelecionadaCard({ musica }) {
  return (
    <div className="mini-musica-selecionada-card">
      <div className="mini-musica-capa">
        {musica?.imagem ? <img src={musica.imagem} alt={musica.titulo} /> : <span>{String(musica?.titulo || 'M').substring(0, 2).toUpperCase()}</span>}
      </div>
      <div>
        <strong>{musica?.titulo || 'Música'}</strong>
        {musica?.artista && <small>{musica.artista}</small>}
        {musica?.album && <em>{musica.album}</em>}
      </div>
    </div>
  );
}

export function RelacoesLaterais({ titulo, itens, tipo }) {
  return (
    <div className="relacoes-laterais-card">
      <h4>{titulo}</h4>
      <div className="relacoes-laterais-lista">
        {itens.slice(0, 4).map((item, index) => (
          <MiniRelacaoCard key={`${item.id || item.titulo}-${index}`} item={item} tipo={tipo === 'midias' ? 'midia' : 'musica'} compacto />
        ))}
      </div>
    </div>
  );
}

export function obterIdDeezerMusica(item) {
  if (!item) return '';

  const idDireto = item.id || item.midiaId || item.deezerId || item.deezer_id || item.trackId || item.track_id;
  if (idDireto && /^\d+$/.test(String(idDireto))) return String(idDireto);

  const url = String(item.link || item.deezerUrl || item.url || '');
  const encontrado = url.match(/(?:deezer\.page\.link\/|deezer\.com\/(?:[^/]+\/)?track\/)(\d+)/i);

  return encontrado?.[1] || '';
}

export function montarMidiaMusicaRelacionada(item, idMusica) {
  return {
    id: idMusica,
    tipo: 'musica',
    titulo: item.titulo || item.nome || 'Música',
    artista: item.artista || '',
    imagem: item.imagem || '',
    deezerUrl: item.deezerUrl || item.link || '',
    previewUrl: item.previewUrl || '',
    descricao: item.motivo || ''
  };
}

export function MiniRelacaoCard({ item, tipo, compacto = false }) {
  const imagem = item.imagem || '';
  const titulo = item.titulo || item.nome || 'Sem título';
  const subtitulo = tipo === 'midia'
    ? `${formatarTipo(item.tipo)}${item.totalIndicacoes ? ` · ${item.totalIndicacoes} indicação(ões)` : ''}`
    : `${item.artista || 'Artista não informado'}${item.totalIndicacoes ? ` · ${item.totalIndicacoes} indicação(ões)` : ''}`;

  const conteudo = (
    <>
      <div className="mini-relacao-img">
        {imagem ? <img src={imagem} alt={titulo} /> : <span>{titulo.substring(0, 2).toUpperCase()}</span>}
      </div>
      <div>
        <strong>{titulo}</strong>
        <small>{subtitulo}</small>
        {item.musicas?.length > 0 && (
          <em>{item.musicas.slice(0, 2).map(m => m.titulo).join(', ')}</em>
        )}
      </div>
    </>
  );

  if (tipo === 'midia' && item.id && item.tipo) {
    return <Link className={`mini-relacao-card ${compacto ? 'compacto' : ''}`} to={`/detalhes/${item.tipo}/${item.id}`}>{conteudo}</Link>;
  }

  const idMusica = obterIdDeezerMusica(item);
  if (tipo === 'musica' && idMusica) {
    return (
      <Link
        className={`mini-relacao-card ${compacto ? 'compacto' : ''}`}
        to={`/detalhes/musica/${idMusica}`}
        state={{ midia: montarMidiaMusicaRelacionada(item, idMusica) }}
      >
        {conteudo}
      </Link>
    );
  }

  if (item.link || item.deezerUrl) {
    return <a className={`mini-relacao-card ${compacto ? 'compacto' : ''}`} href={item.link || item.deezerUrl} target="_blank" rel="noreferrer">{conteudo}</a>;
  }

  return <div className={`mini-relacao-card ${compacto ? 'compacto' : ''}`}>{conteudo}</div>;
}
