const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export async function apiGet(caminho) {
  return requisitar(caminho, { method: 'GET' });
}

export async function apiPost(caminho, dados) {
  return requisitar(caminho, {
    method: 'POST',
    body: JSON.stringify(dados)
  });
}

export async function apiDelete(caminho) {
  return requisitar(caminho, { method: 'DELETE' });
}

export async function apiPut(caminho, dados) {
  return requisitar(caminho, {
    method: 'PUT',
    body: JSON.stringify(dados)
  });
}

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(API_URL + caminho, {
    ...opcoes,
    headers: {
      ...montarHeaders(),
      ...(opcoes.headers || {})
    }
  });

  let dados = {};
  try {
    dados = await resposta.json();
  } catch (erro) {
    dados = {};
  }

  if (resposta.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('auth-change'));
  }

  return dados;
}

function montarHeaders() {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : ''
  };
}
