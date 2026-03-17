const express = require('express');
const path = require('path');
const app = express();

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Rota raiz redireciona para index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Importar rotas do redis-manager
const redisManager = require('./redis-manager');
app.use(redisManager);

module.exports = app;
