const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ mensagem: 'API F&M funcionando.' }));

router.get('/placeholder/:tipo/:titulo.svg', (req, res) => {
  const tipo = String(req.params.tipo || 'Mídia').slice(0, 20);
  const titulo = String(req.params.titulo || 'Sem imagem').replace(/\.svg$/i, '').slice(0, 70);
  const iniciais = titulo.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || 'LM';
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#13202d"/><stop offset="100%" stop-color="#0bd95f"/></linearGradient></defs>
    <rect width="500" height="750" fill="#101820"/>
    <rect x="24" y="24" width="452" height="702" rx="32" fill="url(#g)" opacity="0.22" stroke="#2e4054"/>
    <text x="250" y="325" fill="#ffffff" font-family="Arial, sans-serif" font-size="96" font-weight="700" text-anchor="middle">${iniciais}</text>
    <text x="250" y="405" fill="#00ff66" font-family="Arial, sans-serif" font-size="24" font-weight="700" text-anchor="middle" letter-spacing="5">${tipo.toUpperCase()}</text>
    <foreignObject x="55" y="455" width="390" height="170"><div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:Arial,sans-serif;font-size:34px;font-weight:700;text-align:center;line-height:1.15;word-wrap:break-word;">${titulo}</div></foreignObject>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

module.exports = router;
