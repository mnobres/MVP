//DENUNCIACONTROLLER.JS
const connection = require('../models/db'); // Importa a conexão com o banco de dados

// Função para criar uma denúncia
exports.criarDenuncia = async (req, res) => {
  // Exibe o conteúdo do corpo da requisição
  console.log(req.body); // Verifica o conteúdo da requisição

  const { usuarioId, descricao, rua, numero, bairro, cidade, estado, localizacao } = req.body;

  // Verifica se o usuarioId foi enviado
  if (!usuarioId) {
    return res.status(400).json({ message: 'ID do usuário é obrigatório.' });
  }

  const query = `
    INSERT INTO denuncias 
    (usuario_id, descricao, rua, numero, bairro, cidade, estado, localizacao, status, data_envio) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', NOW())`;

  try {
    const [result] = await connection.query(query, [usuarioId, descricao, rua, numero, bairro, cidade, estado, localizacao]);
    res.status(201).json({ message: "Denúncia registrada com sucesso", id: result.insertId });
  } catch (err) {
    console.error('Erro ao registrar denúncia:', err);
    res.status(500).json({ message: "Erro ao registrar denúncia", error: err });
  }
};




// Função para listar as denúncias
exports.listarDenuncias = async (req, res) => {
  const usuarioId = req.query.usuarioId; // Pega o ID do usuário da query
  const tipo = req.query.tipo; // Pega o tipo de usuário (admin ou comum)
  
  let query = 'SELECT * FROM denuncias WHERE 1=1';
  const params = [];

  // Se o usuário não for administrador, filtra as denúncias para esse usuário
  if (tipo !== 'administrador') {
    query += ' AND usuario_id = ?';
    params.push(usuarioId);
  }

  try {
    const [rows] = await connection.query(query, params);
    res.status(200).json(rows); // Retorna as denúncias para o front-end
  } catch (err) {
    console.error('Erro ao listar denúncias:', err);
    res.status(500).json({ message: 'Erro ao listar denúncias', error: err });
  }
};





// Função para alterar o status de uma denúncia (restrito a administradores)
exports.alterarStatus = async (req, res) => {
  const { id } = req.params;  // Pega o ID da denúncia
  const { status } = req.body;  // Pega o novo status do corpo da requisição

  // Atualiza o status da denúncia no banco de dados
  const query = 'UPDATE denuncias SET status = ? WHERE id = ?';

  try {
    // Executa a query para atualizar o status
    const [result] = await connection.query(query, [status, id]);

    if (result.affectedRows === 0) {
      // Caso a denúncia não seja encontrada
      return res.status(404).json({ message: 'Denúncia não encontrada' });
    }

    // Retorna sucesso se a atualização ocorrer
    res.status(200).json({ message: 'Status atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao alterar o status da denúncia:', err);
    res.status(500).json({ message: 'Erro ao atualizar o status', error: err.message });
  }
};








// Função para excluir uma denúncia (restrito a administradores)
exports.excluirDenuncia = async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  console.log('Email recebido para exclusão:', email);  // Verifique o email recebido

  // Verifica se o email do usuário corresponde ao de um administrador
  const [admin] = await connection.query('SELECT * FROM usuarios WHERE tipo = "admin" AND email = ?', [email]);

  if (admin.length === 0) {
    console.log('Acesso negado para o email:', email);  // Log para verificar a falha de acesso
    return res.status(403).json({ message: 'Acesso negado. Somente administradores podem excluir denúncias.' });
  }

  const query = 'DELETE FROM denuncias WHERE id = ?';

  try {
    const [result] = await connection.query(query, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Denúncia não encontrada' });
    }
    res.status(200).json({ message: 'Denúncia excluída com sucesso!' });
  } catch (err) {
    console.error('Erro ao excluir a denúncia:', err);
    res.status(500).json({ message: 'Erro ao excluir a denúncia', error: err });
  }
};

// Função para listar as coordenadas de todas as denúncias
exports.listarCoordenadas = async (req, res) => {
  const query = 'SELECT localizacao FROM denuncias WHERE localizacao IS NOT NULL';

  try {
    const [rows] = await connection.query(query);

    const coordenadas = rows.map(row => {
      const localizacao = row.localizacao;

      // Verifique o formato diretamente
      console.log('Localização:', localizacao);

      // Acesse a latitude e longitude manualmente
      const latMatch = localizacao.match(/Lat:\s*(-?\d+(\.\d+)?)/);
      const lngMatch = localizacao.match(/Lng:\s*(-?\d+(\.\d+)?)/);

      if (latMatch && lngMatch) {
        return {
          latitude: parseFloat(latMatch[1]), // Captura latitude
          longitude: parseFloat(lngMatch[1]) // Captura longitude
        };
      }

      return null; // Retorna null se não encontrar o formato correto
    }).filter(coord => coord !== null); // Filtra coordenadas inválidas

    res.status(200).json(coordenadas);
  } catch (err) {
    console.error('Erro ao listar coordenadas:', err);
    res.status(500).json({ message: 'Erro ao listar coordenadas', error: err });
  }
};

// Função para listar a quantidade de denúncias por status
exports.obterQuantidadePorStatus = async (req, res) => {
  const query = `
    SELECT status, COUNT(*) as quantidade
    FROM denuncias
    GROUP BY status
  `;

  try {
    const [rows] = await connection.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Erro ao obter quantidade de denúncias por status:', err);
    res.status(500).json({ message: 'Erro ao obter quantidade de denúncias por status', error: err });
  }
};


