const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Login.html"));
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Conexão com o banco MySQL
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar com o MySQL:", err.message);
  } else {
    console.log("Conectado ao MySQL com sucesso!");
  }
});

// Criação das tabelas
db.query(`
  CREATE TABLE IF NOT EXISTS usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
  )
`);

db.query(`
  CREATE TABLE IF NOT EXISTS rotina (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_materia VARCHAR(255) NOT NULL,
    dia VARCHAR(255) NOT NULL,
    usuario_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuario(id)
  )
`);

// Rota de cadastro
app.post("/Cadastrar", (req, res) => {
  const { usuario, email, senha } = req.body;

  if (!usuario || !email || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" });
  }

  const sql = `INSERT INTO usuario (usuario, email, senha) VALUES (?, ?, ?)`;
  db.query(sql, [usuario, email, senha], (err, results) => {
    if (err) {
      console.error("Erro ao inserir no banco:", err.message);
      return res.status(500).json({ mensagem: "Erro ao cadastrar usuário" });
    }
    res.status(201).json({
      mensagem: "Usuário cadastrado com sucesso!",
      id: results.insertId,
    });
  });
});

// Rota de login
app.post("/login", (req, res) => {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ mensagem: "Preencha todos os campos" });
  }

  const sql = `SELECT * FROM usuario WHERE usuario = ? AND senha = ?`;
  db.query(sql, [usuario, senha], (err, results) => {
    if (err) {
      console.error("Erro no banco:", err.message);
      return res.status(500).json({ mensagem: "Erro interno" });
    }

    if (results.length === 0) {
      return res.status(401).json({ mensagem: "Usuário ou senha inválidos" });
    }

    res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      id: results[0].id,
    });
  });
});

// Rota para adicionar rotina
app.post("/rotina", (req, res) => {
  const { nome_materia, dia, usuario_id } = req.body;

  if (!nome_materia || !dia || !usuario_id) {
    return res.status(400).json({ mensagem: "Preencha todos os campos da rotina" });
  }

  const sql = `INSERT INTO rotina (nome_materia, dia, usuario_id) VALUES (?, ?, ?)`;
  db.query(sql, [nome_materia, dia, usuario_id], (err, results) => {
    if (err) {
      console.error("Erro ao inserir rotina:", err.message);
      return res.status(500).json({ mensagem: "Erro ao salvar rotina" });
    }

    res.status(201).json({ mensagem: "Rotina salva com sucesso!", id: results.insertId });
  });
});

// Inicia o servidor
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
