require('dotenv').config();
const app = require('./app');
const { conectarBanco } = require('./config/database');

const PORT = process.env.PORT || 4000;

conectarBanco().then(() => {
  app.listen(PORT, () => console.log('API rodando na porta ' + PORT));
});
