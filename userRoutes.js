const express = require('express');
const router = express.Router();
const db = require('./db');

const ADMIN_KEY = 'chave-admin-123';

// Login de usuário
router.post('/login', (req, res) => {
  const { telefone, senha } = req.body;
  db.get(
    'SELECT * FROM usuarios WHERE telefone = ? AND senha = ?',
    [telefone, senha],
    (err, row) => {
      if (err) return res.status(500).json({ erro: 'Erro no servidor' });
      if (!row) return res.status(401).json({ erro: 'Credenciais inválidas' });
      res.json({ sucesso: true, usuario: row });
    }
  );
});

// Rotas administrativas protegidas
router.get('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.status(403).json({ erro: 'Não autorizado' });
  db.all('SELECT telefone, nome FROM usuarios', (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao listar' });
    res.json(rows);
  });
});

router.post('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.status(403).json({ erro: 'Não autorizado' });
  const { telefone, senha, nome } = req.body;
  db.run(
    'INSERT INTO usuarios (telefone, senha, nome) VALUES (?, ?, ?)',
    [telefone, senha, nome],
    (err) => {
      if (err) return res.status(500).json({ erro: 'Erro ao cadastrar' });
      res.json({ sucesso: true });
    }
  );
});

router.delete('/admin/usuarios/:telefone', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY) return res.status(403).json({ erro: 'Não autorizado' });
  db.run(
    'DELETE FROM usuarios WHERE telefone = ?',
    [req.params.telefone],
    (err) => {
      if (err) return res.status(500).json({ erro: 'Erro ao excluir' });
      res.json({ sucesso: true });
    }
  );
});

module.exports = router;
