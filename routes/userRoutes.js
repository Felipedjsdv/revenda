const express = require('express');
const router = express.Router();
const db = require('../db');
const fetch = require('node-fetch');

const ADMIN_KEY = 'chave-admin-123';

// ROTAS EXISTENTES...

router.post('/registrar', (req, res) => {
  const { telefone, senha } = req.body;
  db.run('INSERT INTO usuarios (telefone, senha) VALUES (?, ?)', [telefone, senha], function(err) {
    if (err) return res.status(400).json({ erro: 'Usuário já existe ou erro.' });
    res.json({ sucesso: true, id: this.lastID });
  });
});

router.post('/login', (req, res) => {
  const { telefone, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE telefone = ? AND senha = ?', [telefone, senha], (err, row) => {
    if (err || !row) return res.status(401).json({ erro: 'Credenciais inválidas' });
    res.json({ sucesso: true, telefone: row.telefone });
  });
});

router.post('/teste', (req, res) => {
  const { telefone, codigo } = req.body;
  db.run('INSERT INTO testes (telefone, codigo) VALUES (?, ?)', [telefone, codigo], function(err) {
    if (err) return res.status(500).json({ erro: 'Erro ao salvar teste' });
    res.json({ sucesso: true, id: this.lastID });
  });
});

router.get('/testes/:telefone', (req, res) => {
  const telefone = req.params.telefone;
  db.all('SELECT * FROM testes WHERE telefone = ?', [telefone], (err, rows) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar testes' });
    res.json(rows);
  });
});

router.post('/gerar-teste-api', async (req, res) => {
  const { telefone, minutos } = req.body;

  try {
    const response = await fetch("https://revenda.pixbot.link", {
      method: "POST",
      headers: {
        "Authorization": "M1W02Hb5kXLMN5nA",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ minutes: minutos || 60 })
    });

    const data = await response.json();

    if (!data.code) return res.status(400).json({ erro: "Erro ao gerar teste na API." });

    db.run('INSERT INTO testes (telefone, codigo) VALUES (?, ?)', [telefone, data.code], function(err) {
      if (err) return res.status(500).json({ erro: "Erro ao salvar teste no banco." });
      res.json({ sucesso: true, codigo: data.code });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro de conexão com API Pixbot." });
  }
});

router.post('/enviar-telegram', async (req, res) => {
  const { chat_id, codigo } = req.body;
  const botToken = "8182944633:AAHBfIO5A1uUNL3NyPH90G3gjDK1tLVv-jk";

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const msg = `✅ Teste gerado com sucesso!\nCódigo: ${codigo}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chat_id,
        text: msg
      })
    });

    const data = await response.json();

    if (!data.ok) return res.status(400).json({ erro: "Erro ao enviar pelo Telegram" });
    res.json({ sucesso: true, resposta: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao conectar com Telegram API" });
  }
});

router.post('/enviar-whatsapp', async (req, res) => {
  const { telefone, codigo } = req.body;

  const url = "https://api.z-api.io/instances/3E48C372CF1FE0DD21419ACED72D02B7/token/547B75115F6872EE162C9D18/send-text";
  const msg = `✅ Teste gerado com sucesso!\nCódigo: ${codigo}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: telefone,
        message: msg
      })
    });

    const data = await response.json();
    if (!data || data.error) return res.status(400).json({ erro: "Erro ao enviar pelo WhatsApp" });
    res.json({ sucesso: true, resposta: data });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao conectar com API WhatsApp" });
  }
});

//
// ROTAS ADMINISTRATIVAS
//

// Listar usuários
router.get('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(403).json({ erro: 'Acesso negado' });

  db.all('SELECT telefone, nome FROM usuarios', [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// Adicionar novo usuário
router.post('/admin/usuarios', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(403).json({ erro: 'Acesso negado' });

  const { telefone, senha, nome } = req.body;
  db.run('INSERT INTO usuarios (telefone, senha, nome) VALUES (?, ?, ?)', [telefone, senha, nome], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// Atualizar senha ou nome
router.put('/admin/usuarios/:telefone', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(403).json({ erro: 'Acesso negado' });

  const { telefone } = req.params;
  const { senha, nome } = req.body;
  db.run('UPDATE usuarios SET senha = ?, nome = ? WHERE telefone = ?', [senha, nome, telefone], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

// Excluir usuário
router.delete('/admin/usuarios/:telefone', (req, res) => {
  if (req.headers.authorization !== ADMIN_KEY)
    return res.status(403).json({ erro: 'Acesso negado' });

  const { telefone } = req.params;
  db.run('DELETE FROM usuarios WHERE telefone = ?', [telefone], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ sucesso: true });
  });
});

module.exports = router;

