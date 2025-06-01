function cadastrar() {
  const bntCadastrar = document.getElementById("singUp");

  if (bntCadastrar) {
    bntCadastrar.addEventListener("click", function (event) {
      event.preventDefault();

      const usuario = document.getElementById("User").value.trim();
      const email = document.getElementById("Mail").value.trim();
      const senha = document.getElementById("Pass").value.trim();

      if (!usuario || !email || !senha) {
        alert("Preencha todos os campos!");
        return;
      }

      fetch("http://localhost:3000/Cadastrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, email, senha })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.mensagem);

          if (data.mensagem === "Usuário cadastrado com sucesso!") {
            window.location.href = "Login.html";
          }
        })
        .catch(err => {
          console.error("Erro no envio:", err);
          alert("Erro de conexão com o servidor.");
        });
    });
  }
}

function login() {
  const btnLogin = document.getElementById("btnLogin");

  if (btnLogin) {
    btnLogin.addEventListener("click", function (event) {
      event.preventDefault();

      const usuario = document.getElementById("userL").value.trim();
      const senha = document.getElementById("senhaL").value.trim();

      if (!usuario || !senha) {
        alert("Preencha todos os campos!");
        return;
      }

      const API_BASE = "https://Studfy.up.railway.app";

      fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ usuario, senha })
      })
        .then(res => res.json())
        .then(data => {
          alert(data.mensagem);

          if (data.mensagem === "Login realizado com sucesso!") {
            localStorage.setItem("usuarioId", data.id);
            window.location.href = 'home.html';
          }
        })
        .catch(err => {
          console.error("Erro ao fazer login:", err);
          alert("Erro de conexão com o servidor.");
        });
    });
  }
}

function criarRotina() {
  const btnCriar = document.getElementById("CRotina");
  if (btnCriar) {
    btnCriar.addEventListener("click", function () {
      const criar = document.getElementById("Matéria");
      criar.style.display = "flex";
    });
  }
}

function criarMatéria() {
  const btnCriarMateria = document.getElementById("bntConfirm");
  if (btnCriarMateria) {
    btnCriarMateria.addEventListener("click", function (event) {
      const nomeMateria = document.getElementById("nomeMateria").value;
      const rotina = document.getElementById("diaSemana").value;
      // Aqui você pode implementar o envio da rotina para o backend, se quiser.
    });
  }
}

// Inicializar funções
login();
cadastrar();
criarRotina();
