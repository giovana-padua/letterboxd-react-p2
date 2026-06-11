import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(() => JSON.parse(localStorage.getItem('usuario') || 'null'));
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaNav, setBuscaNav] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    function fecharAoClicarFora(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuAberto(false);
      }
    }

    function fecharComEsc(event) {
      if (event.key === 'Escape') setMenuAberto(false);
    }

    function atualizarUsuarioLocal() {
      setUsuario(JSON.parse(localStorage.getItem('usuario') || 'null'));
    }

    document.addEventListener('mousedown', fecharAoClicarFora);
    document.addEventListener('keydown', fecharComEsc);
    window.addEventListener('storage', atualizarUsuarioLocal);
    window.addEventListener('auth-change', atualizarUsuarioLocal);

    return () => {
      document.removeEventListener('mousedown', fecharAoClicarFora);
      document.removeEventListener('keydown', fecharComEsc);
      window.removeEventListener('storage', atualizarUsuarioLocal);
      window.removeEventListener('auth-change', atualizarUsuarioLocal);
    };
  }, []);

  function sair() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    setUsuario(null);
    setMenuAberto(false);

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth-change'));

    navigate('/login');
  }

  function pesquisarNavbar(e) {
    e.preventDefault();

    const termo = buscaNav.trim();
    if (!termo) return;

    navigate(`/?q=${encodeURIComponent(termo)}&tipo=todos`);
    setBuscaNav('');
  }

  const isActive = path => location.pathname === path ? 'active' : '';
  const inicial = usuario?.nome ? usuario.nome.substring(0, 1).toUpperCase() : 'F&M';

  return (
    <header className="lb-topbar-clean">
      <nav className="navbar navbar-expand-lg lm-navbar sticky-top">
        <div className="container-fluid lm-navbar-inner">
          <Link to="/" className="navbar-brand lm-logo lb-logo-clean d-flex align-items-center gap-2">
            <span className="lb-dots fm-logo-mark" aria-hidden="true">
              <i></i><i></i><i></i>
            </span>
            <span className="lm-logo-text">Filmes e Músicas</span>
          </Link>

          <form className="lb-navbar-search lb-navbar-search-mobile" onSubmit={pesquisarNavbar}>
            <input
              value={buscaNav}
              onChange={e => setBuscaNav(e.target.value)}
              placeholder="Buscar"
              aria-label="Buscar mídia"
            />
            <button type="submit" aria-label="Pesquisar">⌕</button>
          </form>

          <button
            className="navbar-toggler lm-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMain"
            aria-controls="navbarMain"
            aria-expanded="false"
            aria-label="Abrir menu"
          >
            <span className="navbar-toggler-icon lm-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarMain">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1 lb-nav-clean-list">
              <li className="nav-item">
                <Link to="/" className={`nav-link lm-nav-link ${isActive('/')}`}>
                  Início
                </Link>
              </li>

              {usuario && (
                <li className="nav-item">
                  <Link to="/favoritos" className={`nav-link lm-nav-link ${isActive('/favoritos')}`}>
                    Favoritos
                  </Link>
                </li>
              )}

              {usuario && (
                <li className="nav-item">
                  <Link to="/minhas-avaliacoes" className={`nav-link lm-nav-link ${isActive('/minhas-avaliacoes')}`}>
                    Resenhas
                  </Link>
                </li>
              )}

              {!usuario && (
                <li className="nav-item">
                  <Link to="/login" className={`nav-link lm-nav-link ${isActive('/login')}`}>
                    Entrar
                  </Link>
                </li>
              )}

              {!usuario && (
                <li className="nav-item">
                  <Link to="/cadastro" className={`nav-link lm-nav-link ${isActive('/cadastro')}`}>
                    Criar conta
                  </Link>
                </li>
              )}
            </ul>

            <form className="lb-navbar-search lb-navbar-search-desktop" onSubmit={pesquisarNavbar}>
              <input
                value={buscaNav}
                onChange={e => setBuscaNav(e.target.value)}
                placeholder="Buscar"
                aria-label="Buscar mídia"
              />
              <button type="submit" aria-label="Pesquisar">⌕</button>
            </form>

            {usuario && (
              <div className="nav-item dropdown lm-user-menu" ref={menuRef}>
                <button
                  className="lm-avatar-btn"
                  type="button"
                  onClick={() => setMenuAberto(!menuAberto)}
                  aria-expanded={menuAberto}
                  title="Menu do usuário"
                >
                  {usuario.foto ? <img src={usuario.foto} alt={usuario.nome} /> : <span>{inicial}</span>}
                </button>

                <ul className={`lm-dropdown-menu ${menuAberto ? 'show' : ''}`}>
                  <li className="dropdown-header">
                    {usuario.nome}<br />
                    <small>{usuario.tipo === 'moderador' || usuario.tipo === 'admin' ? 'Moderador/Admin' : 'Usuário'}</small>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/perfil" onClick={() => setMenuAberto(false)}>
                      Meu perfil
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/favoritos" onClick={() => setMenuAberto(false)}>
                      Favoritos
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/minhas-avaliacoes" onClick={() => setMenuAberto(false)}>
                      Resenhas
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item" type="button" onClick={sair}>
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
