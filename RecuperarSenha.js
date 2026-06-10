import { useState } from 'react';
import { apiPost } from '../services/api';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function enviar(e) {
    e.preventDefault();

    setMensagem('');
    setErro('');

    if (!email.trim()) {
      setErro('Informe o e-mail cadastrado.');
      return;
    }

    try {
      setCarregando(true);

      const dados = await apiPost('/recuperar-senha', {
        email: email.trim()
      });

      if (dados.mensagem) {
        setMensagem(dados.mensagem);
        return;
      }

      setErro(dados.erro || 'Não foi possível solicitar a recuperação de senha.');
    } catch (e) {
      setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="container">
      <h1>Recuperar senha</h1>

      <form className="form" onSubmit={enviar}>
        <input
          type="email"
          placeholder="Digite seu e-mail cadastrado"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />

        <button disabled={carregando}>
          {carregando ? 'Enviando...' : 'Enviar instruções'}
        </button>
      </form>

      {mensagem && <p className="alert sucesso">{mensagem}</p>}
      {erro && <p className="alert erro">{erro}</p>}
    </main>
  );
}
