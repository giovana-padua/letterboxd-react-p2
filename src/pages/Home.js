import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardMidia from '../components/CardMidia';
import CarrosselMidia from '../components/CarrosselMidia';
import { apiGet } from '../services/api';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get('q') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || 'todos');
  const [resultados, setResultados] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [home, setHome] = useState(null);
  const [carregandoHome, setCarregandoHome] = useState(true);
  const [carregandoBusca, setCarregandoBusca] = useState(false);

  useEffect(() => {
    carregarHome();
  }, []);

  useEffect(() => {
    const termoUrl = searchParams.get('q') || '';
    const tipoUrl = searchParams.get('tipo') || 'todos';

    setBusca(termoUrl);
    setTipo(tipoUrl);

    if (termoUrl.trim()) {
      executarPesquisa(termoUrl, tipoUrl);
    } else {
      setResultados([]);
      setMensagem('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  async function carregarHome() {
    try {
      setCarregandoHome(true);
      const dados = await apiGet('/home');
      setHome(dados);
    } catch (erro) {
      setMensagem('Não foi possível carregar os destaques agora. Verifique se o backend está rodando.');
    } finally {
      setCarregandoHome(false);
    }
  }

  async function executarPesquisa(termo, tipoBusca) {
    const texto = String(termo || '').trim();
    if (!texto) return;

    try {
      setCarregandoBusca(true);
      setMensagem('Pesquisando...');
      setResultados([]);

      const rota = tipoBusca === 'todos'
        ? `/buscar-geral?q=${encodeURIComponent(texto)}`
        : `/buscar?tipo=${tipoBusca}&q=${encodeURIComponent(texto)}`;

      const dados = await apiGet(rota);
      setResultados(dados.resultados || []);
      setMensagem(dados.resultados?.length ? '' : (dados.erro || 'Nenhum resultado encontrado.'));
    } catch (erro) {
      setMensagem('Erro ao pesquisar. Verifique se o backend está rodando.');
    } finally {
      setCarregandoBusca(false);
    }
  }

  function pesquisar(e) {
    e.preventDefault();
    const texto = busca.trim();
    if (!texto) return;
    setSearchParams({ q: texto, tipo });
  }

  const destaquePrincipal = useMemo(() => {
    return home?.filmesFavoritosDia?.[0]
      || home?.seriesFavoritasDia?.[0]
      || home?.filmesFavoritosMes?.[0]
      || null;
  }, [home]);

  const temBusca = searchParams.get('q');

  return (
    <main className="pagina-home home-clean">
      <section
        className="home-clean-hero"
        style={{
          backgroundImage: destaquePrincipal?.backdrop
            ? `linear-gradient(180deg, rgba(11,17,23,.62), rgba(11,17,23,.94)), url(${destaquePrincipal.backdrop})`
            : undefined
        }}
      >
        <div className="container-lb home-clean-hero-inner">
          <div className="home-clean-copy">
            <span className="lb-eyebrow">Filmes · Séries · Documentários · Música</span>
            <h1>Filmes e Músicas</h1>
            <p>Avalie mídias, escreva resenhas e relacione músicas com filmes, séries e documentários.</p>
          </div>

          <form className="home-clean-search" onSubmit={pesquisar}>
            <span className="home-search-label">Buscar</span>
            <input
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Filme, série, álbum, música, artista..."
              required
            />
            <select value={tipo} onChange={e => setTipo(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="filme">Filme</option>
              <option value="serie">Série</option>
              <option value="documentario">Documentário</option>
              <option value="album">Álbum / EP</option>
              <option value="musica">Música</option>
              <option value="artista">Cantor / Banda</option>
            </select>
            <button type="submit" disabled={carregandoBusca}>⌕</button>
          </form>
        </div>
      </section>

      <section className="container-lb home-clean-content">
        {mensagem && <div className="lm-alert mb-4">{mensagem}</div>}

        {resultados.length > 0 && (
          <section className="home-clean-results">
            <div className="home-section-title">
              <h2>Resultados para “{searchParams.get('q')}”</h2>
              <span>{resultados.length} resultado(s)</span>
            </div>
            <div className="home-results-grid">
              {resultados.map(item => (
                <CardMidia midia={item} key={`${item.tipo}-${item.id}`} />
              ))}
            </div>
          </section>
        )}

        {carregandoHome && (
          <div className="d-flex align-items-center gap-3 lm-alert">
            <div className="lb-spinner" role="status" />
            <span>Carregando destaques...</span>
          </div>
        )}

        {home && !temBusca && (
          <div className="home-clean-carrosseis">
            <CarrosselMidia titulo="Filmes populares do dia" itens={home.filmesFavoritosDia} />
            <CarrosselMidia titulo="Séries populares do dia" itens={home.seriesFavoritasDia} />
            <CarrosselMidia titulo="Filmes populares do mês" itens={home.filmesFavoritosMes} />
            <CarrosselMidia titulo="Séries populares do mês" itens={home.seriesFavoritasMes} />
            <CarrosselMidia titulo="Filmes populares do ano" itens={home.filmesFavoritosAno} />
            <CarrosselMidia titulo="Séries populares do ano" itens={home.seriesFavoritasAno} />
            <CarrosselMidia titulo="Indicados ao Oscar" itens={home.indicadosOscar} />
            <CarrosselMidia titulo="Indicados ao Globo de Ouro" itens={home.indicadosGloboOuro} />
            <CarrosselMidia titulo="Top músicas BR" itens={home.top50Brasil} />
            <CarrosselMidia titulo="Top músicas Mundo" itens={home.top50Global} />
            <CarrosselMidia titulo="Top álbuns Mundo" itens={home.topHits} />
            <CarrosselMidia titulo="Álbuns indicados ao Grammy" itens={home.albunsGrammy} />
          </div>
        )}

        {home && temBusca && (
          <div className="home-search-more">
            <button type="button" onClick={() => setSearchParams({})}>Limpar busca e ver destaques</button>
          </div>
        )}
      </section>
    </main>
  );
}
