import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../services/api';

export default function Cadastro() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);

  function validarLocalmente() {
    const novosErros = {};

    if (!nome.trim()) {
      novosErros.nome = 'Informe um nome de usuário.';
    }

    if (!email.trim()) {
      novosErros.email = 'Informe um e-mail.';
    }

    if (!senha) {
      novosErros.senha = 'Informe uma senha.';
    } else if (senha.length < 6) {
      const faltam = 6 - senha.length;
      novosErros.senha = `A senha precisa ter pelo menos 6 caracteres. ${faltam === 1 ? 'Falta 1 caractere.' : `Faltam ${faltam} caracteres.`}`;
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function cadastrar(e) {
    e.preventDefault();

    setMensagem('');
    setErros({});

    if (!validarLocalmente()) {
      setMensagem('Corrija os campos destacados.');
      return;
    }

    try {
      setCarregando(true);

      const dados = await apiPost('/cadastro', {
        nome: nome.trim(),
        email: email.trim(),
        senha
      });

      if (dados.mensagem) {
        navigate('/login');
        return;
      }

      setMensagem(dados.erro || 'Não foi possível cadastrar.');
      setErros(dados.erros || {});
    } catch (erro) {
      setMensagem('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
    } finally {
      setCarregando(false);
    }
  }

  function atualizarNome(valor) {
    setNome(valor);
    setErros(atuais => ({ ...atuais, nome: '' }));
  }

  function atualizarEmail(valor) {
    setEmail(valor);
    setErros(atuais => ({ ...atuais, email: '' }));
  }

  function atualizarSenha(valor) {
    setSenha(valor);
    setErros(atuais => ({ ...atuais, senha: '' }));
  }

  return (
    <main className="container">
      <h1>Cadastro</h1>

      <form className="form" onSubmit={cadastrar} noValidate>
        <div className="campo-form">
          <input
            className={erros.nome ? 'input-erro' : ''}
            placeholder="Nome de usuário"
            value={nome}
            onChange={e => atualizarNome(e.target.value)}
            required
          />
          {erros.nome && <small className="campo-erro">{erros.nome}</small>}
        </div>

        <div className="campo-form">
          <input
            className={erros.email ? 'input-erro' : ''}
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => atualizarEmail(e.target.value)}
            required
          />
          {erros.email && <small className="campo-erro">{erros.email}</small>}
        </div>

        <div className="campo-form">
          <input
            className={erros.senha ? 'input-erro' : ''}
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => atualizarSenha(e.target.value)}
            required
          />
          {erros.senha && <small className="campo-erro">{erros.senha}</small>}
          {!erros.senha && (
            <small className="campo-ajuda">
              A senha deve ter no mínimo 6 caracteres.
            </small>
          )}
        </div>

        <button disabled={carregando}>
          {carregando ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      {mensagem && <p className="alert erro">{mensagem}</p>}
      {erros.geral && <p className="alert erro">{erros.geral}</p>}
    </main>
  );
}
