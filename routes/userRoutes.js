const express = require('express');
const router = express.Router();
const db = require('./db');
const axios = require('axios');

const ADMIN_KEY = 'chave-admin-123';

router.post('/login', (req, res) => {
  const { telefone, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE telefone = ? AND senha = ?', [telefone, senha], (err, row) => {
    if (err) return res.status(500).json({ erro: err.message });
    if (!row) return res.status(401).json({ erro: 'Credenciais inválidas' });
    res.json({ sucesso: true, nome: row.nome });
  });
});

router.post('/gerar-teste', async (req, res) => {
  const { telefone, metodo, tempo, token_telegram, id_telegram } = req.body;

  try {
    const resposta = await axios.post('https://revenda.pixbot.link', { minutes: tempo }, {
      headers: {
        Authorization: 'M1W02Hb5kXLMN5nA',
        'Content-Type': 'application/json'
      }
    });

    const dados = resposta.data;

    if (metodo === 'telegram') {
      await axios.post(`https://api.telegram.org/bot${token_telegram}/sendMessage`, {
        chat_id: id_telegram,
        text: `🔐 Teste criado!
Usuário: ${dados.username}
Senha: ${dados.password}
Duração: ${tempo} minutos
Painel: ${dados.panel_url}`
      });
    }

    res.json({ sucesso: true, dados });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao gerar teste' });
  }
});

// ROTAS ADMIN
router.get('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(401).json({ erro: 'Não autorizado' });

  db.all('SELECT telefone, nome FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

router.post('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(401).json({ erro: 'Não autorizado' });

  const { telefone, senha, nome } = req.body;
  db.run(
    'INSERT INTO usuarios (telefone, senha, nome) VALUES (?, ?, ?)',
    [telefone, senha, nome],
    function (err) {
      if (err) return res.status(500).json({ erro: err.message });
      res.json({ sucesso: true });
    }
  );
});

router.delete('/admin/usuarios/:telefone', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(401).json({ erro: 'Não autorizado' });

  db.run('DELETE FROM usuarios WHERE telefone = ?', [req.params.telefone], function (err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

module.exports = router;