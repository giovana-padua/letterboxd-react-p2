const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { Usuario } = require('../models');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-dev';

function normalizarEmail(email = '') {
  return String(email || '').trim().toLowerCase();
}

function normalizarNome(nome = '') {
  return String(nome || '').trim();
}

function escaparRegex(valor = '') {
  return String(valor).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function validarSenhaDetalhada(senha = '') {
  const valor = String(senha || '');
  const erros = [];

  if (!valor) {
    erros.push('Informe uma senha.');
  }

  if (valor.length < 6) {
    const faltam = 6 - valor.length;
    erros.push(`A senha precisa ter pelo menos 6 caracteres. ${faltam === 1 ? 'Falta 1 caractere.' : `Faltam ${faltam} caracteres.`}`);
  }

  return erros;
}

function dadosUsuarioSeguro(usuario) {
  return {
    id: usuario._id,
    nome: usuario.nome,
    email: usuario.email,
    tipo: usuario.tipo,
    foto: usuario.foto || ''
  };
}

router.post('/cadastro', async (req, res) => {
  try {
    const nome = normalizarNome(req.body.nome);
    const email = normalizarEmail(req.body.email);
    const senha = String(req.body.senha || '');

    const erros = {};

    if (!nome) erros.nome = 'Informe um nome de usuário.';
    if (!email) erros.email = 'Informe um e-mail.';

    const errosSenha = validarSenhaDetalhada(senha);
    if (errosSenha.length) erros.senha = errosSenha.join(' ');

    if (Object.keys(erros).length) {
      return res.status(400).json({
        erro: 'Corrija os campos destacados.',
        erros
      });
    }

    const usuarioComMesmoEmail = await Usuario.findOne({ email });
    if (usuarioComMesmoEmail) {
      erros.email = 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.';
    }

    const usuarioComMesmoNome = await Usuario.findOne({
      nome: { $regex: `^${escaparRegex(nome)}$`, $options: 'i' }
    });
    if (usuarioComMesmoNome) {
      erros.nome = 'Este nome de usuário já está cadastrado. Escolha outro nome.';
    }

    if (Object.keys(erros).length) {
      return res.status(400).json({
        erro: 'Não foi possível criar a conta.',
        erros
      });
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    await Usuario.create({
      nome,
      email,
      senha: senhaCriptografada,
      tipo: 'usuario'
    });

    res.json({ mensagem: 'Usuário cadastrado com sucesso.' });
  } catch (erro) {
    if (erro?.code === 11000) {
      const campo = Object.keys(erro.keyPattern || {})[0];
      const erros = {};

      if (campo === 'email') {
        erros.email = 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.';
      } else if (campo === 'nome') {
        erros.nome = 'Este nome de usuário já está cadastrado. Escolha outro nome.';
      } else {
        erros.geral = 'E-mail ou nome de usuário já cadastrado.';
      }

      return res.status(400).json({
        erro: 'Não foi possível criar a conta.',
        erros
      });
    }

    res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const identificador = String(req.body.identificador || req.body.email || '').trim();
    const senha = String(req.body.senha || '');

    if (!identificador || !senha) {
      return res.status(400).json({ erro: 'Informe e-mail/nome de usuário e senha.' });
    }

    const usuario = await Usuario.findOne({
      $or: [
        { email: normalizarEmail(identificador) },
        { nome: { $regex: `^${escaparRegex(identificador)}$`, $options: 'i' } }
      ]
    });

    if (!usuario) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Usuário ou senha inválidos.' });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        tipo: usuario.tipo
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: dadosUsuarioSeguro(usuario)
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao fazer login.' });
  }
});

router.post('/recuperar-senha', async (req, res) => {
  try {
    const email = normalizarEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ erro: 'Informe o e-mail cadastrado.' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ erro: 'Não existe usuário cadastrado com este e-mail.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    usuario.resetToken = token;
    usuario.resetTokenExpira = new Date(Date.now() + 1000 * 60 * 30);
    await usuario.save();

    res.json({
      mensagem: 'Solicitação criada. Use o link de redefinição exibido para testes locais.',
      token,
      link: `/redefinir-senha/${token}`
    });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao solicitar recuperação de senha.' });
  }
});

router.post('/redefinir-senha', async (req, res) => {
  try {
    const token = String(req.body.token || '').trim();
    const senha = String(req.body.senha || '');

    if (!token) {
      return res.status(400).json({ erro: 'Token de recuperação não informado.' });
    }

    const errosSenha = validarSenhaDetalhada(senha);
    if (errosSenha.length) {
      return res.status(400).json({
        erro: errosSenha.join(' '),
        erros: { senha: errosSenha.join(' ') }
      });
    }

    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExpira: { $gt: new Date() }
    });

    if (!usuario) {
      return res.status(400).json({ erro: 'Token inválido ou expirado.' });
    }

    usuario.senha = await bcrypt.hash(senha, 10);
    usuario.resetToken = '';
    usuario.resetTokenExpira = null;
    await usuario.save();

    res.json({ mensagem: 'Senha redefinida com sucesso.' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao redefinir senha.' });
  }
});

module.exports = router;
