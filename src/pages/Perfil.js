import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CardMidia from '../components/CardMidia';
import ReviewCard from '../components/ReviewCard';
import { apiGet, apiPost, apiPut } from '../services/api';

export default function Perfil() {
  const [dados, setDados] = useState(null);
  const [preview, setPreview] = useState('');
  const [fotoBase64, setFotoBase64] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('info');

  function carregar() {
    apiGet('/perfil').then(d => {
      setDados(d);
      setPreview(d?.usuario?.foto || '');
      setFotoBase64('');
      if (d?.usuario) {
        const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
        localStorage.setItem('usuario', JSON.stringify({ ...usuarioLocal, ...d.usuario }));
      }
    });
  }

  useEffect(() => { carregar(); }, []);

  function escolherFoto(e) {
    const arquivo = e.target.files?.[0];
    setMensagem('');
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      setMensagem('Selecione um arquivo de imagem.');
      setTipoMensagem('danger');
      return;
    }
    if (arquivo.size > 2 * 1024 * 1024) {
      setMensagem('A imagem deve ter até 2MB.');
      setTipoMensagem('danger');
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      setPreview(leitor.result);
      setFotoBase64(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvarFoto(e) {
    e.preventDefault();
    if (!fotoBase64) {
      setMensagem('Escolha uma nova imagem antes de salvar.');
      setTipoMensagem('warning');
      return;
    }
    const resp = await apiPut('/perfil/foto', { foto: fotoBase64 });
    setMensagem(resp.mensagem || resp.erro);
    setTipoMensagem(resp.mensagem ? 'success' : 'danger');
    if (resp.mensagem) {
      const usuarioLocal = JSON.parse(localStorage.getItem('usuario') || '{}');
      localStorage.setItem('usuario', JSON.stringify({ ...usuarioLocal, foto: fotoBase64 }));
      window.dispatchEvent(new Event('storage'));
    }
    carregar();
  }

  async function solicitarModeracao() {
    const resp = await apiPost('/moderacao/solicitar', {});
    setMensagem(resp.mensagem || resp.erro);
    setTipoMensagem(resp.mensagem ? 'success' : 'danger');
    carregar();
  }

  async function responderSolicitacao(id, acao) {
    const resp = await apiPost(`/moderacao/solicitacoes/${id}/${acao}`, {});
    setMensagem(resp.mensagem || resp.erro);
    setTipoMensagem(resp.mensagem ? 'success' : 'danger');
    carregar();
  }

  const usuario = dados?.usuario;
  const favoritos = dados?.favoritos || [];
  const avaliacoes = dados?.avaliacoes || [];
  const solicitacaoModerador = dados?.solicitacaoModerador;
  const solicitacoesPendentesModerador = dados?.solicitacoesPendentesModerador || [];
  const ehModerador = usuario?.tipo === 'moderador' || usuario?.tipo === 'admin';

  return (
    <main className="container-lb perfil-page">
      <section className="perfil-hero-v2">
        <div>
          {preview ? <img className="profile-photo" src={preview} alt="Foto de perfil" /> : <div className="profile-photo profile-placeholder">👤</div>}
        </div>
        <div>
          <span className="lb-eyebrow">Meu perfil</span>
          <h1>{usuario?.nome || 'Usuário'}</h1>
          <p className="texto-suave">{usuario?.email}</p>
          <div className="perfil-contadores">
            <span><strong>{dados?.totalAvaliacoes ?? 0}</strong> resenhas</span>
            <span><strong>{dados?.totalFavoritos ?? 0}</strong> favoritos</span>
            <span><strong>{dados?.mediaNotas ?? 0}</strong> média das notas</span>
          </div>
        </div>
      </section>

      <section className="painel perfil-section">
        <h2>Foto de perfil</h2>
        <p className="texto-suave">Escolha um arquivo de imagem do seu computador. Tamanho máximo: 2MB.</p>
        <form onSubmit={salvarFoto} className="row g-3 align-items-end">
          <div className="col-12 col-sm">
            <label className="form-label texto-suave">Arquivo de imagem</label>
            <input type="file" accept="image/*" onChange={escolherFoto} className="form-control lm-input" />
          </div>
          <div className="col-12 col-sm-auto">
            <button type="submit" className="btn lm-btn-buscar w-100">Salvar foto</button>
          </div>
        </form>
        {mensagem && <div className={`alert lm-alert alert-${tipoMensagem} mt-3`} role="alert">{mensagem}</div>}
      </section>

      <section className="painel perfil-section">
        <div className="section-title-row">
          <h2>Conta</h2>
        </div>
        <p className="texto-suave">Tipo da conta: <strong>{ehModerador ? 'Moderador/Admin' : 'Usuário'}</strong></p>
        {!ehModerador && (
          <div className="moderacao-solicitar-box">
            {solicitacaoModerador?.status === 'pendente' ? (
              <p className="lm-alert">Sua solicitação para moderação está pendente.</p>
            ) : solicitacaoModerador?.status === 'aprovada' ? (
              <p className="lm-alert">Sua solicitação foi aprovada. Faça login novamente para atualizar o menu.</p>
            ) : (
              <button type="button" className="btn lm-btn-buscar" onClick={solicitarModeracao}>
                Solicitar ser moderador
              </button>
            )}
          </div>
        )}
      </section>

      {ehModerador && (
        <section className="painel perfil-section painel-moderacao">
          <div className="section-title-row">
            <h2>Painel de moderação</h2>
          </div>
          {solicitacoesPendentesModerador.length ? (
            <div className="moderacao-lista">
              {solicitacoesPendentesModerador.map(solicitacao => (
                <div className="moderacao-item" key={solicitacao._id}>
                  <div>
                    <strong>{solicitacao.nome}</strong>
                    <small>{solicitacao.email}</small>
                  </div>
                  <div className="moderacao-acoes">
                    <button type="button" onClick={() => responderSolicitacao(solicitacao._id, 'aprovar')}>Aprovar</button>
                    <button type="button" className="btn-recusar" onClick={() => responderSolicitacao(solicitacao._id, 'recusar')}>Recusar</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="texto-suave">Não há solicitações pendentes.</p>
          )}
        </section>
      )}

      <section className="painel perfil-section">
        <div className="section-title-row">
          <h2>Suas estatísticas</h2>
        </div>
        <div className="perfil-stats-grid">
          <div><strong>{dados?.totalAvaliacoes ?? 0}</strong><span>Resenhas feitas</span></div>
          <div><strong>{dados?.totalFavoritos ?? 0}</strong><span>Favoritos salvos</span></div>
          <div><strong>{dados?.mediaNotas ?? 0}</strong><span>Média das notas</span></div>
          {(dados?.porTipo || []).map(item => (
            <div key={item._id}><strong>{item.total}</strong><span>{formatarTipo(item._id)}</span></div>
          ))}
        </div>
      </section>

      <section className="painel perfil-section">
        <div className="section-title-row">
          <h2>Favoritos recentes</h2>
          <Link to="/favoritos">Ver todos</Link>
        </div>
        {favoritos.length ? (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-3">
            {favoritos.map(item => (
              <div className="col" key={item._id}>
                <CardMidia midia={{ id: item.midiaId, tipo: item.tipo, titulo: item.titulo, imagem: item.imagem }} />
              </div>
            ))}
          </div>
        ) : <p className="texto-suave">Você ainda não adicionou favoritos.</p>}
      </section>

      <section className="painel perfil-section">
        <div className="section-title-row">
          <h2>Suas resenhas recentes</h2>
          <Link to="/minhas-avaliacoes">Ver todas</Link>
        </div>
        {avaliacoes.length ? (
          <div className="grid-resenhas-perfil">
            {avaliacoes.map(avaliacao => <ReviewCard key={avaliacao._id} avaliacao={avaliacao} />)}
          </div>
        ) : <p className="texto-suave">Você ainda não escreveu resenhas.</p>}
      </section>
    </main>
  );
}

function formatarTipo(tipo) {
  const mapa = { filme: 'Filmes', serie: 'Séries', documentario: 'Documentários', album: 'Álbuns/EPs', musica: 'Músicas', artista: 'Artistas' };
  return mapa[tipo] || tipo || 'Mídias';
}
