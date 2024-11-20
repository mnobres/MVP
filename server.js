// server.js
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Importa os controladores
const authController = require('./controllers/authController');
const denunciaController = require('./controllers/denunciaController');

// Middleware
app.use(express.json());
app.use(cors());


// Rotas de autenticação
app.post('/api/register', authController.registro);  // Registro de usuário
app.post('/api/login', authController.login);        // Login de usuário

// Rotas para denúncias
app.post('/api/denuncias', denunciaController.criarDenuncia);  // Criar uma denúncia
app.get('/api/denuncias', denunciaController.listarDenuncias); // Listar todas as denúncias
app.put('/api/denuncias/:id/status', denunciaController.alterarStatus);
app.delete('/api/denuncias/:id', denunciaController.excluirDenuncia); // Excluir denúncia
// Rota para listar coordenadas
app.get('/api/denuncias/coordenadas', denunciaController.listarCoordenadas);
// Rota para obter a quantidade de denúncias por status
app.get('/api/denuncias/status', denunciaController.obterQuantidadePorStatus);



// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
