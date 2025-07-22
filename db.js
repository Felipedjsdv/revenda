const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

// Criação da tabela de usuários (se não existir)
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  telefone TEXT PRIMARY KEY,
  nome TEXT,
  senha TEXT
)`);

module.exports = db;
