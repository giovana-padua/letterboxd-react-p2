import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiPost } from '../services/api';

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

  const token = params.token || searchParams.get('token') || '';

  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function redefinir(e) {
    e.preventDefault();

    setMensagem('');
    setErro('');

    if (!token) {
      setErro('Token de recuperação não encontrado.');
      return;
    }

    if (senha.length < 6) {
      const faltam = 6 - senha.length;
      setErro(`A senha precisa ter pelo menos 6 caracteres. ${faltam === 1 ? 'Falta 1 caractere.' : `Faltam ${faltam} caracteres.`}`);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não são iguais.');
      return;
    }

    try {
      setCarregando(true);

      const dados = await apiPost('/redefinir-senha', {
        token,
        senha
      });

      if (dados.mensagem) {
        setMensagem(dados.mensagem);
        setTimeout(() => navigate('/login'), 1200);
        return;
      }

      setErro(dados.erro || 'Não foi possível redefinir a senha.');
    } catch (e) {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container">
      <h1>Redefinir senha</h1>

      <form className="form" onSubmit={redefinir}>
        <input
          type="password"
          placeholder="Nova senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirmar nova senha"
          value={confirmarSenha}
          onChange={e => setConfirmarSenha(e.target.value)}
          required
        />

        <button disabled={carregando}>
          {carregando ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>

      {mensagem && <p className="alert sucesso">{mensagem}</p>}
      {erro && <p className="alert erro">{erro}</p>}
    </main>
  );
}
