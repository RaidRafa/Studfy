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
  host: "localhost",
  user: "root",
  password: "28092004", 
  database: "meubanco" 
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

db.query(`
  CREATE TABLE IF NOT EXISTS tarefa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255),
  descricao TEXT,
  data_entrega DATE,
  nota FLOAT,
  notificar BOOLEAN,
  rotina_id INT NOT NULL,
  usuario_id INT NOT NULL,
  FOREIGN KEY (rotina_id) REFERENCES rotina(id),
  FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);
`);



// Rota rotina
app.post("/rotina", (req, res) => {
  const {nome_materia, dia, usuario_id} = req.body;

  if(!nome_materia || !dia || !usuario_id){
    return res.status(400).json({ erro: "Campos obrigatórios não preenchidos." });
  }

  const query = `INSERT INTO rotina (nome_materia, dia, usuario_id) VALUES (?, ?, ?)`;
  db.query(query, [nome_materia, dia, usuario_id], (err, results) => {
    if(err){
      console.error("Erro ao inserir rotina:", err);
      return res.status(500).json({ erro: "Erro interno." });
    }
    res.status(201).json({ mensagem: "Rotina cadastrada com sucesso!", id: results.insertId });
  });
})

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

app.get("/rotina", (req, res) => {
  const {usuario_id} = req.query;

  if(!usuario_id) {
    return res.status(400).json({mensagem: "ID do usuário é obrigatório"});
  }

  const query = `SELECT * FROM rotina WHERE usuario_id = ?`;
  db.query(query, [usuario_id], (err, results) => {
    if(err) {
      console.error("Erro ao buscar rotinas:", err.message);
      return res.status(500).json({mensagem: "Erro ao buscar rotinas."});
    }

    res.status(200).json(results);
  })
})

app.put("/rotina/:id", (req, res) => { 
  const {id} = req.params;
  const { nome_materia, dia} = req.body;

  if(!nome_materia || !dia) {
    return res.status(400).json({ mensagem: "Campos obrigatórios não preenchidos." });
  }

  const query = `UPDATE rotina SET nome_materia = ?, dia = ? WHERE id = ?`;
  db.query(query, [nome_materia, dia, id], (err, result) => {
    if(err){
      console.error("Erro ao atualizar rotina:", err.message);
      return res.status(500).json({ mensagem: "Erro ao atualizar rotina." });
    }
    res.status(200).json({ mensagem: "Rotina atualizada com sucesso!" });
  });
});

app.delete("/rotina/:id", (req, res) => {
  const { id } = req.params;

  const query = `DELETE FROM rotina WHERE id = ?`;
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar rotina:", err.message);
      return res.status(500).json({ mensagem: "Erro ao deletar rotina." });
    }

    res.status(200).json({ mensagem: "Rotina deletada com sucesso!" });
  });
});

// Rota para tarefas
app.get("/tarefas", (req, res) => {
  const { rotina_id } = req.query;
  db.query(`SELECT * FROM tarefa WHERE rotina_id = ?`, [rotina_id], (err, results) => {
    if (err) return res.status(500).json({ erro: "Erro ao buscar tarefas" });
    res.status(200).json(results);
  });
});

app.post("/tarefa", (req, res) => {
  const { titulo, descricao, data_entrega, nota, notificar, rotina_id, usuario_id } = req.body;

  if (!titulo || !rotina_id || !usuario_id) {
    return res.status(400).json({ mensagem: "Campos obrigatórios faltando." });
  }

  const query = `
    INSERT INTO tarefa (titulo, descricao, data_entrega, nota, notificar, rotina_id, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [titulo, descricao, data_entrega, nota, notificar, rotina_id, usuario_id], (err, result) => {
    if (err) {
      console.error("Erro ao adicionar tarefa:", err);
      return res.status(500).json({ mensagem: "Erro ao adicionar tarefa" });
    }

    res.status(201).json({ mensagem: "Tarefa adicionada", id: result.insertId });
  });
});

app.delete("/tarefa/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM tarefa WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error("Erro ao excluir tarefa:", err.message);
      return res.status(500).json({ mensagem: "Erro ao excluir tarefa." });
    }

    res.status(200).json({ mensagem: "Tarefa deletada com sucesso!" });
  });
});


// Inicia o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
