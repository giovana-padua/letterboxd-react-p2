import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost } from '../services/api';
import {
  AlbumInfoCard,
  formatarTipo,
  MiniMusicaSelecionadaCard,
  MiniRelacaoCard,
  montarMidiaMusicaRelacionada,
  obterIdDeezerMusica,
  PreviewPlayer,
  RelacoesLaterais
} from '../components/details';

export default function Detalhes() {
  const { tipo, id } = useParams();
  const location = useLocation();
  const midiaInicial = location.state?.midia || null;

  const [midia, setMidia] = useState(midiaInicial);
  const [carregando, setCarregando] = useState(true);
  const [nota, setNota] = useState(5);
  const [resenha, setResenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [buscaMusicaRelacionada, setBuscaMusicaRelacionada] = useState('');
  const [resultadosMusicaRelacionada, setResultadosMusicaRelacionada] = useState([]);
  const [musicaSelecionada, setMusicaSelecionada] = useState(null);
  const [carregandoMusicaRelacionada, setCarregandoMusicaRelacionada] = useState(false);
  const [musicaMotivo, setMusicaMotivo] = useState('');
  const [abaSelecionada, setAbaSelecionada] = useState(tipo === 'album' || tipo === 'artista' ? 'faixas' : 'info');
  const [faixaTocando, setFaixaTocando] = useState(null);

  useEffect(() => {
    carregarDetalhes();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, id]);

  async function carregarDetalhes() {
    setCarregando(true);
    setFaixaTocando(null);

    try {
      const dados = await apiGet(`/detalhes/${tipo}/${id}`);
      if (dados.midia) setMidia(dados.midia);
      if (dados.erro) setMensagem(dados.detalhe || dados.erro);
    } catch (erro) {
      setMensagem('Não foi possível carregar os detalhes agora. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  async function salvarAvaliacao(e) {
    e.preventDefault();
    if (!localStorage.getItem('token')) { setMensagem('Faça login para avaliar.'); return; }

    const musicaRelacionada = podeRelacionarMusica && musicaSelecionada ? {
      titulo: musicaSelecionada.titulo,
      artista: musicaSelecionada.artista,
      link: musicaSelecionada.deezerUrl || musicaSelecionada.link || '',
      imagem: musicaSelecionada.imagem || '',
      motivo: musicaMotivo,
      deezerId: musicaSelecionada.id,
      tipo: 'musica',
      previewUrl: musicaSelecionada.previewUrl || ''
    } : null;

    const dados = await apiPost('/avaliacoes', {
      midiaId: id,
      tipo,
      titulo: midia?.titulo || id,
      nota: Number(nota),
      resenha,
      imagem: midia?.imagem || '',
      musicaRelacionada
    });

    setMensagem(dados.mensagem || dados.erro);
    if (dados.mensagem) {
      setResenha('');
      setBuscaMusicaRelacionada('');
      setResultadosMusicaRelacionada([]);
      setMusicaSelecionada(null);
      setMusicaMotivo('');
      carregarDetalhes();
    }
  }

  async function favoritar() {
    if (!localStorage.getItem('token')) { setMensagem('Faça login para favoritar.'); return; }
    const dados = await apiPost('/favoritos', {
      midiaId: id,
      tipo,
      titulo: midia?.titulo || id,
      imagem: midia?.imagem || ''
    });
    setMensagem(dados.mensagem || dados.erro);
  }

  async function buscarMusicaRelacionada(e) {
    e?.preventDefault?.();
    const termo = buscaMusicaRelacionada.trim();
    if (!termo) {
      setMensagem('Digite o nome da música ou artista para buscar.');
      return;
    }

    try {
      setCarregandoMusicaRelacionada(true);
      const dados = await apiGet(`/buscar?tipo=musica&q=${encodeURIComponent(termo)}`);
      setResultadosMusicaRelacionada(dados.resultados || []);
      if (!dados.resultados?.length) setMensagem(dados.erro || 'Nenhuma música encontrada.');
    } catch (erro) {
      setMensagem('Não foi possível buscar músicas agora.');
    } finally {
      setCarregandoMusicaRelacionada(false);
    }
  }

  function selecionarMusicaRelacionada(musica) {
    setMusicaSelecionada(musica);
    setMensagem('Música adicionada à resenha.');
  }

  async function excluirResenha(idAvaliacao) {
    if (!window.confirm('Deseja excluir esta resenha?')) return;
    const dados = await apiDelete(`/avaliacoes/${idAvaliacao}`);
    setMensagem(dados.mensagem || dados.erro);
    if (dados.mensagem) carregarDetalhes();
  }

  const podeRelacionarMusica = tipo === 'filme' || tipo === 'serie' || tipo === 'documentario';
  const ehMusical = tipo === 'album' || tipo === 'musica' || tipo === 'artista';
  const plataformas = midia?.plataformas || [];
  const faixas = midia?.faixas || [];
  const albuns = midia?.albuns || [];
  const avaliacoes = midia?.avaliacoes || [];
  const usuarioAtual = JSON.parse(localStorage.getItem('usuario') || 'null');
  const usuarioModerador = usuarioAtual?.tipo === 'moderador' || usuarioAtual?.tipo === 'admin';
  const musicasIndicadas = midia?.musicasIndicadas || [];
  const midiasRelacionadas = midia?.midiasRelacionadas || [];

  const tabs = useMemo(() => {
    const lista = [];
    if (faixas.length) lista.push({ id: 'faixas', label: tipo === 'artista' ? 'Músicas populares' : 'Faixas' });
    if (albuns.length) lista.push({ id: 'albuns', label: 'Álbuns e EPs' });
    lista.push({ id: 'onde', label: ehMusical ? 'Onde ouvir' : 'Onde assistir' });
    lista.push({ id: 'resenhas', label: `Resenhas (${avaliacoes.length})` });
    return lista;
  }, [faixas.length, albuns.length, ehMusical, avaliacoes.length, tipo]);

  useEffect(() => {
    if (!tabs.some(tab => tab.id === abaSelecionada) && tabs.length) setAbaSelecionada(tabs[0].id);
  }, [tabs, abaSelecionada]);

  useEffect(() => {
    if ((tipo === 'album' || tipo === 'artista') && faixas.length > 0 && !faixaTocando) {
      const primeiraComPreview = faixas.find(faixa => faixa.previewUrl) || faixas[0];
      setFaixaTocando(primeiraComPreview);
    }
  }, [tipo, faixas, faixaTocando]);

  if (carregando && !midia) {
    return <main className="container-lb"><p className="lm-alert">Carregando detalhes...</p></main>;
  }

  return (
    <main className={`pagina-detalhes-v2 ${ehMusical ? 'pagina-detalhes-musical-clean' : ''}`}>
      <section
        className="detalhes-hero-v2"
        style={{ backgroundImage: midia?.backdrop ? `linear-gradient(90deg, rgba(8,16,24,.98), rgba(8,16,24,.78), rgba(8,16,24,.98)), url(${midia.backdrop})` : undefined }}
      >
        <div className="container-lb detalhes-v2-wrap">
          <Link className="lb-voltar-topo" to="/">← Início</Link>

          <div className="detalhes-v2-grid">
            <aside className="detalhes-poster-col">
              <div className="detalhes-poster-v2">
                {midia?.imagem ? <img src={midia.imagem} alt={midia.titulo} /> : <div className="poster-vazio">Sem imagem</div>}
              </div>

              <div className="detalhes-poster-actions">
                {midia?.deezerUrl && (
                  <a className="btn btn-success w-100 fw-bold" href={midia.deezerUrl} target="_blank" rel="noreferrer">
                    ♫ Ouvir na Deezer
                  </a>
                )}
                {midia?.trailer && (
                  <a className="btn btn-warning w-100 fw-bold" href={midia.trailer} target="_blank" rel="noreferrer">
                    ▶ Trailer
                  </a>
                )}
                <div className="detalhes-notas-card">
                  <span>{ehMusical ? 'Deezer' : 'TMDb'}</span>
                  <strong>{ehMusical ? (midia?.previewUrl || faixas.some(f => f.previewUrl) ? 'Preview' : '—') : (midia?.avaliacaoTmdb ? `${midia.avaliacaoTmdb}/10` : '—')}</strong>
                </div>
              </div>
            </aside>

            <section className="detalhes-info-v2">
              <span className="lb-eyebrow">{formatarTipo(tipo)}</span>
              <h1>{midia?.titulo || 'Detalhes da mídia'}</h1>

              <div className="detalhes-meta-v2">
                {midia?.ano && <span>Lançamento: {midia.ano}</span>}
                {midia?.duracao && <span>Duração: {midia.duracao} min</span>}
                {midia?.artista && <span>Artista: {midia.artista}</span>}
                {tipo === 'musica' && midia?.album && <span>Álbum: {midia.album}</span>}
                {midia?.diretores?.length > 0 && <span>Direção: {midia.diretores.join(', ')}</span>}
                {midia?.totalFaixas && <span>{midia.totalFaixas} faixas</span>}
                {midia?.seguidores && <span>{Number(midia.seguidores).toLocaleString('pt-BR')} fãs</span>}
              </div>

              {midia?.subtitulo && <p className="detalhes-tagline-v2">{midia.subtitulo}</p>}
              {midia?.descricao && <p className="detalhes-desc-v2">{midia.descricao}</p>}
              {midia?.aviso && <p className="lm-alert">{midia.aviso}</p>}

              {tipo === 'musica' && (midia?.album || midia?.imagem || midia?.ano || midia?.duracao) && (
                <AlbumInfoCard
                  titulo={midia?.album || midia?.titulo}
                  subtitulo={midia?.artista}
                  imagem={midia?.imagem}
                  ano={midia?.ano}
                  duracao={midia?.duracao}
                  tipo="Álbum da música"
                />
              )}

              {tipo === 'album' && (midia?.imagem || midia?.titulo || midia?.ano || midia?.totalFaixas) && (
                <AlbumInfoCard
                  titulo={midia?.titulo}
                  subtitulo={midia?.artista}
                  imagem={midia?.imagem}
                  ano={midia?.ano}
                  duracao={midia?.totalFaixas ? `${midia.totalFaixas} faixas` : ''}
                  tipo="Álbum"
                />
              )}

              {tipo === 'musica' && midia?.previewUrl && (
                <PreviewPlayer
                  titulo={midia?.titulo}
                  artista={midia?.artista}
                  imagem={midia?.imagem}
                  previewUrl={midia.previewUrl}
                  compacto
                />
              )}

              {midia?.generos?.length > 0 && (
                <div className="detalhes-chips-v2">
                  {midia.generos.map(genero => <span key={genero}>{genero}</span>)}
                </div>
              )}

              {midia?.elenco?.length > 0 && (
                <div className="detalhes-bloco-suave">
                  <h3>Elenco</h3>
                  <div className="detalhes-chips-v2 chips-muted">
                    {midia.elenco.map(nome => <span key={nome}>{nome}</span>)}
                  </div>
                </div>
              )}
            </section>

            <aside className="detalhes-rating-box-v2">
              <h3>Avaliações</h3>
              <div className="linha-destaque" />
              <p className="texto-suave mb-2">Média dos usuários</p>
              <strong className="rating-grande">{midia?.mediaUsuarios != null ? midia.mediaUsuarios : '—'}</strong>
              <p>{midia?.totalAvaliacoes || 0} avaliação(ões)</p>
              <button className="btn lm-btn-buscar w-100 mt-3" type="button" onClick={favoritar}>♥ Adicionar aos favoritos</button>
              {mensagem && <p className="lm-alert mt-3 mb-0">{mensagem}</p>}

              {ehMusical && midiasRelacionadas.length > 0 && (
                <RelacoesLaterais
                  titulo="Filmes e séries relacionados"
                  itens={midiasRelacionadas}
                  tipo="midias"
                />
              )}
            </aside>
          </div>
        </div>
      </section>

      <section className="container-lb detalhes-v2-body">
        {ehMusical && midiasRelacionadas.length > 0 && (
          <section className="relacoes-destaque-bloco">
            <div className="relacoes-titulo-linha">
              <h2>Filmes e séries relacionados</h2>
              <span>{midiasRelacionadas.length} relação(ões)</span>
            </div>
            <div className="relacoes-grid-horizontal">
              {midiasRelacionadas.map(item => (
                <MiniRelacaoCard key={`${item.tipo}-${item.id}`} item={item} tipo="midia" />
              ))}
            </div>
          </section>
        )}

        {tabs.length > 0 && (
          <nav className="detalhes-tabs-v2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={abaSelecionada === tab.id ? 'active' : ''}
                onClick={() => setAbaSelecionada(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {abaSelecionada === 'faixas' && faixas.length > 0 && (
          <div className="faixas-com-player-v2">
            <div className="lista-faixas-v2">
              {faixas.map((faixa, i) => (
                <div
                  className={`faixa-item-v2 ${faixaTocando?.id === faixa.id ? 'tocando' : ''}`}
                  key={faixa.id || `${faixa.nome}-${i}`}
                >
                  <Link to={faixa.id ? `/detalhes/musica/${faixa.id}` : '#'}>
                    <span>{i + 1}. {faixa.nome || faixa}</span>
                    {faixa.duracao && <small>{faixa.duracao} min</small>}
                  </Link>

                  {faixa.id && (
                    <button
                      type="button"
                      className="btn-ouvir-faixa-v2"
                      onClick={() => setFaixaTocando(faixa)}
                    >
                      ▶
                    </button>
                  )}
                </div>
              ))}
            </div>

            {faixaTocando && (
              <PreviewPlayer
                titulo={faixaTocando.nome}
                artista={midia?.artista}
                imagem={midia?.imagem}
                previewUrl={faixaTocando.previewUrl}
                avisoSemPreview="Preview indisponível para esta faixa."
              />
            )}
          </div>
        )}

        {abaSelecionada === 'albuns' && albuns.length > 0 && (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-6 g-3">
            {albuns.map(album => (
              <div className="col" key={album.id}>
                <Link to={`/detalhes/album/${album.id}`} state={{ midia: album }} className="album-mini-card">
                  {album.imagem && <img src={album.imagem} alt={album.titulo} />}
                  <strong>{album.titulo}</strong>
                  <small>{album.ano}</small>
                </Link>
              </div>
            ))}
          </div>
        )}

        {abaSelecionada === 'onde' && (
          <div className="onde-ouvir-wrap-v2">
            {plataformas.length > 0 ? (
              <div className="plataformas-grid-v2">
                {plataformas.map((p, i) => (
                  <a key={`${p.nome}-${i}`} href={p.link || '#'} target="_blank" rel="noreferrer" className="plataforma-card-v2">
                    {p.logo && <img src={p.logo} alt={p.nome} />}
                    <div>
                      <strong>{p.nome}</strong>
                      <span>{p.tipo}</span>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="texto-suave">Nenhuma plataforma encontrada para esta mídia.</p>
            )}
          </div>
        )}

        {abaSelecionada === 'resenhas' && (
          <div className="detalhes-resenhas-grid">
            <form className="painel review-form-v2" onSubmit={salvarAvaliacao}>
              <h2>Escrever resenha</h2>
              <label>Nota de 0 a 10</label>
              <input type="number" min="0" max="10" value={nota} onChange={e => setNota(e.target.value)} />
              <textarea placeholder="Escreva sua resenha" value={resenha} onChange={e => setResenha(e.target.value)} required />

              {podeRelacionarMusica && (
                <div className="musica-relacionada-form musica-relacionada-busca-form">
                  <h3>Música relacionada</h3>
                  <p className="texto-suave">
                    Opcional: pesquise na Deezer e selecione uma música que combine com esse {formatarTipo(tipo).toLowerCase()}.
                  </p>

                  <div className="musica-busca-inline">
                    <input
                      type="text"
                      placeholder="Digite música ou artista. Ex.: Beat It Michael Jackson"
                      value={buscaMusicaRelacionada}
                      onChange={e => setBuscaMusicaRelacionada(e.target.value)}
                    />
                    <button type="button" onClick={buscarMusicaRelacionada} disabled={carregandoMusicaRelacionada}>
                      {carregandoMusicaRelacionada ? 'Buscando...' : 'Buscar'}
                    </button>
                  </div>

                  {resultadosMusicaRelacionada.length > 0 && (
                    <div className="musicas-recomendadas-lista mt-3">
                      {resultadosMusicaRelacionada.slice(0, 5).map(musica => (
                        <button
                          type="button"
                          key={musica.id}
                          className={`musica-recomendada-card ${musicaSelecionada?.id === musica.id ? 'selecionada' : ''}`}
                          onClick={() => selecionarMusicaRelacionada(musica)}
                        >
                          <MiniMusicaSelecionadaCard musica={musica} />
                          <span className="musica-recomendada-acao">
                            {musicaSelecionada?.id === musica.id ? 'Selecionada' : 'Adicionar'}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {musicaSelecionada && (
                    <div className="musica-selecionada-box">
                      <span className="lb-eyebrow">Música selecionada</span>
                      <MiniMusicaSelecionadaCard musica={musicaSelecionada} />
                      <button type="button" className="btn-remover-musica" onClick={() => setMusicaSelecionada(null)}>
                        Remover música
                      </button>
                    </div>
                  )}

                  <label>Por que essa música combina?</label>
                  <textarea
                    placeholder="Explique a relação da música com a obra"
                    value={musicaMotivo}
                    onChange={e => setMusicaMotivo(e.target.value)}
                  />
                </div>
              )}

              <button>Salvar avaliação</button>
            </form>

            <section className="painel avaliacoes-publicas-v2">
              <h2>Resenhas de usuários</h2>
              {avaliacoes.length > 0 ? (
                <div className="lista-resenhas-v2">
                  {avaliacoes.map(avaliacao => (
                    <article key={avaliacao.id} className="resenha-card-v2">
                      <div className="resenha-user">
                        {avaliacao.usuario?.foto ? <img src={avaliacao.usuario.foto} alt={avaliacao.usuario.nome} /> : <span>{(avaliacao.usuario?.nome || 'U').substring(0, 1).toUpperCase()}</span>}
                        <div>
                          <strong>{avaliacao.usuario?.nome || 'Usuário'}</strong>
                          <small>★ {avaliacao.nota}/10</small>
                        </div>
                      </div>
                      <p>{avaliacao.resenha}</p>

                      {usuarioModerador && (
                        <button
                          type="button"
                          className="btn-excluir-resenha"
                          onClick={() => excluirResenha(avaliacao.id)}
                        >
                          Excluir resenha
                        </button>
                      )}

                      {avaliacao.musicaRelacionada?.titulo && (
                        <div className="musica-relacionada-card">
                          {avaliacao.musicaRelacionada.imagem && (
                            <img src={avaliacao.musicaRelacionada.imagem} alt={avaliacao.musicaRelacionada.titulo} />
                          )}
                          <div>
                            <span className="lb-eyebrow">Música relacionada</span>
                            <strong>{avaliacao.musicaRelacionada.titulo}</strong>
                            {avaliacao.musicaRelacionada.artista && <small>{avaliacao.musicaRelacionada.artista}</small>}
                            {avaliacao.musicaRelacionada.motivo && <p>{avaliacao.musicaRelacionada.motivo}</p>}
                            {obterIdDeezerMusica(avaliacao.musicaRelacionada) ? (
                              <Link
                                to={`/detalhes/musica/${obterIdDeezerMusica(avaliacao.musicaRelacionada)}`}
                                state={{ midia: montarMidiaMusicaRelacionada(avaliacao.musicaRelacionada, obterIdDeezerMusica(avaliacao.musicaRelacionada)) }}
                              >
                                Ver música
                              </Link>
                            ) : avaliacao.musicaRelacionada.link && (
                              <a href={avaliacao.musicaRelacionada.link} target="_blank" rel="noreferrer">Ouvir música</a>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="texto-suave">Ainda não há resenhas de usuários para esta mídia.</p>
              )}
            </section>

            {podeRelacionarMusica && (
              <aside className="painel musicas-recomendadas-v2">
                <h2>Músicas recomendadas</h2>
                {musicasIndicadas.length > 0 ? (
                  <div className="musicas-recomendadas-lista">
                    {musicasIndicadas.slice(0, 5).map((musica, index) => (
                      <MiniRelacaoCard
                        key={`${obterIdDeezerMusica(musica) || musica.titulo || musica.nome}-${index}`}
                        item={musica}
                        tipo="musica"
                        compacto
                      />
                    ))}
                  </div>
                ) : (
                  <p className="texto-suave">As 5 músicas mais relacionadas com esta mídia aparecerão aqui depois das indicações dos usuários.</p>
                )}
              </aside>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
