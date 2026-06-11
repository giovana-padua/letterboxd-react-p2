const express = require('express');
const router = express.Router();
const { mensagemErroApi } = require('../utils/api');
const { deezerBuscaAlbuns, deezerBuscaArtistas } = require('../services/deezer.service');

router.get('/deezer/teste', async (req, res) => {
  try {
    const resultados = await deezerBuscaAlbuns('Meteoro');
    res.json({ ok: true, api: 'Deezer', totalAlbuns: resultados.length, exemplo: resultados[0] || null });
  } catch (erro) {
    console.log('Erro teste Deezer:', erro.response?.data || erro.message);
    res.status(500).json({ ok: false, api: 'Deezer', erro: mensagemErroApi(erro), status: erro.response?.status || null, params: erro.config?.params || null });
  }
});

router.get('/deezer-status', async (req, res) => {
  try {
    const artistas = await deezerBuscaArtistas('Michael Jackson');
    res.json({ deezer: 'OK', artista: artistas[0]?.titulo || null });
  } catch (erro) {
    res.status(500).json({ deezer: 'ERRO', status: erro.response?.status || null, erro: erro.response?.data || erro.message });
  }
});

module.exports = router;
