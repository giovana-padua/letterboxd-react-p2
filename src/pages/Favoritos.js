import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CardMidia from '../components/CardMidia';
import { apiGet, apiDelete } from '../services/api';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [mensagem, setMensagem] = useState('');

  function carregar() {
    apiGet('/favoritos').then(dados => setFavoritos(dados.favoritos || []));
  }

  useEffect(() => { carregar(); }, []);

  async function remover(id) {
    const resp = await apiDelete('/favoritos/' + id);
    setMensagem(resp.mensagem || resp.erro || 'Atualizado.');
    carregar();
  }

  return (
    <main className="container-lb favoritos-page">
      <section className="perfil-hero-v2 favoritos-hero">
        <div>
          <span className="lb-eyebrow">Minha lista</span>
          <h1>Favoritos</h1>
          <p className="texto-suave">Filmes, séries, álbuns, músicas e artistas que você salvou.</p>
        </div>
      </section>

      {mensagem && <div className="lm-alert">{mensagem}</div>}

      {favoritos.length ? (
        <section className="favoritos-grid favoritos-grid-clean">
          {favoritos.map(item => (
            <article className="favorito-card favorito-card-clean" key={item._id}>
              <CardMidia midia={{ id: item.midiaId, tipo: item.tipo, titulo: item.titulo, imagem: item.imagem }} />
              <div className="favorito-actions">
                <Link to={`/detalhes/${item.tipo}/${item.midiaId}`} state={{ midia: item }}>Ver detalhes</Link>
                <button type="button" onClick={() => remover(item._id)}>Remover</button>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="painel">
          <p className="texto-suave">Você ainda não adicionou nenhum favorito.</p>
        </section>
      )}
    </main>
  );
}
