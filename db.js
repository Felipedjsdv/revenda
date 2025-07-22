const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone TEXT UNIQUE,
    senha TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS testes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telefone TEXT,
    codigo TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

module.exports = db;
