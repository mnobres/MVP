//AUTHCONTROLLER.JS
const bcrypt = require('bcrypt');
const connection = require('../models/db');
const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH; // Armazene o hash da senha do administrador

// Função para registro de usuário comum
exports.registro = async (req, res) => {
  const { nome, email, telefone, senha } = req.body;

  if (!nome || !email || !telefone || !senha) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
  }

  const tipo = 'comum'; // Usuários são sempre comuns, o admin não se registra pelo app
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(senha, saltRounds);

  const query = 'INSERT INTO usuarios (nome, email, telefone, senha, tipo) VALUES (?, ?, ?, ?, ?)';

  try {
    await connection.execute(query, [nome, email, telefone, hashedPassword, tipo]);
    res.status(200).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    console.error('Erro ao registrar usuário:', err);
    res.status(500).json({ message: 'Erro ao registrar usuário', error: err });
  }
};

// Função de login
exports.login = async (req, res) => {
  const { email, senha } = req.body;
  const query = 'SELECT * FROM usuarios WHERE email = ?';

  try {
    const [user] = await connection.execute(query, [email]);

    if (user.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado!' });
    }

    // Verifica se a senha é válida
    const validPassword = await bcrypt.compare(senha, user[0].senha);

    if (!validPassword) {
      return res.status(400).json({ message: 'Senha incorreta!' });
    }

    // Verifica se o usuário é um administrador
    const isAdmin = user[0].tipo === 'admin';

    // Se o usuário for administrador, verifica a senha do admin
    if (isAdmin && !await bcrypt.compare(senha, adminPasswordHash)) {
      return res.status(403).json({ message: 'Acesso negado. Admins precisam de senha específica.' });
    }

    res.status(200).json({ message: 'Login bem-sucedido', tipo: user[0].tipo,
      usuario_id: user[0].id });
  } catch (err) {
    console.error('Erro ao fazer login:', err);
    res.status(500).json({ message: 'Erro ao fazer login', error: err });
  }
};
