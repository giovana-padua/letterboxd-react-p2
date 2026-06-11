import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';

export default function Login() {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    setMensagem('');

    if (!identificador.trim() || !senha) {
      setMensagem('Informe e-mail/nome de usuário e senha.');
      return;
    }

    try {
      setCarregando(true);

      const dados = await apiPost('/login', {
        identificador: identificador.trim(),
        email: identificador.trim(),
        senha
      });

      if (dados.token) {
        localStorage.setItem('token', dados.token);
        localStorage.setItem('usuario', JSON.stringify(dados.usuario));

        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('auth-change'));

        navigate('/');
        return;
      }

      setMensagem(dados.erro || 'Não foi possível entrar. Verifique seus dados.');
    } catch (erro) {
      setMensagem('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container">
      <h1>Entrar</h1>

      <form className="form" onSubmit={entrar}>
        <input
          type="text"
          placeholder="E-mail ou nome de usuário"
          value={identificador}
          onChange={e => setIdentificador(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />

        <button disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>
        Não tem conta?{' '}
        <Link className="auth-link" to="/cadastro">
          Cadastre-se
        </Link>
      </p>

      <p>
        <Link className="auth-link" to="/recuperar-senha">
          Esqueci minha senha
        </Link>
      </p>

      {mensagem && <p className="alert erro">{mensagem}</p>}
    </main>
  );
}
