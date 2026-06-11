export function formatarTipo(tipo) {
  const mapa = {
    filme: 'Filme',
    serie: 'Série',
    documentario: 'Documentário',
    album: 'Álbum / EP',
    musica: 'Música',
    artista: 'Cantor / Banda'
  };

  return mapa[tipo] || tipo;
}
