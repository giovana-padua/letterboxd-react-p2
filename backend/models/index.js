const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true, trim: true, unique: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  senha: { type: String, required: true },
  tipo: { type: String, default: 'usuario' },
  foto: String,
  resetToken: String,
  resetExpira: Date
});

const AvaliacaoSchema = new mongoose.Schema({
  usuarioId: String,
  midiaId: String,
  tipo: String,
  titulo: String,
  nota: Number,
  resenha: String,
  imagem: String,
  musicaRelacionada: {
    titulo: String,
    artista: String,
    link: String,
    imagem: String,
    motivo: String,
    deezerId: String,
    previewUrl: String,
    tipo: String
  },
  criadaEm: { type: Date, default: Date.now }
});

const FavoritoSchema = new mongoose.Schema({
  usuarioId: String,
  midiaId: String,
  tipo: String,
  titulo: String,
  imagem: String,
  criadoEm: { type: Date, default: Date.now }
});

const SolicitacaoModeradorSchema = new mongoose.Schema({
  usuarioId: { type: String, required: true },
  nome: String,
  email: String,
  status: { type: String, default: 'pendente' },
  criadaEm: { type: Date, default: Date.now },
  respondidaEm: Date,
  respondidaPor: String
});

module.exports = {
  Usuario: mongoose.models.Usuario || mongoose.model('Usuario', UsuarioSchema),
  Avaliacao: mongoose.models.Avaliacao || mongoose.model('Avaliacao', AvaliacaoSchema),
  Favorito: mongoose.models.Favorito || mongoose.model('Favorito', FavoritoSchema),
  SolicitacaoModerador: mongoose.models.SolicitacaoModerador || mongoose.model('SolicitacaoModerador', SolicitacaoModeradorSchema)
};
