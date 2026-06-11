require('dotenv').config();
const app = require('./app');
const { conectarBanco } = require('./config/database');

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'production') {
  conectarBanco().then(() => {
    app.listen(PORT, () => console.log('API rodando na porta ' + PORT));
  });
}

module.exports = app;