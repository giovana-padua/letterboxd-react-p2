const mongoose = require('mongoose');

async function conectarBanco() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB conectado');
  } catch (erro) {
    console.log('Erro no MongoDB:', erro.message);
  }
}

module.exports = { conectarBanco };
