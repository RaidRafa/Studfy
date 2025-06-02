let modoEdicao = false;
let idCardEmEdicao = null;

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


      fetch(`http://localhost:3000/Login`, {
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

function closeCardMateria(){
  const btnFecharCard = document.getElementById("fecharCard");

  if(btnFecharCard) {
    btnFecharCard.addEventListener("click", function() {
      const materia = document.getElementById("Matéria");
      materia.style.display = "none";
    });
  }
}

function criarMatéria() {
  const btnCriarMateria = document.getElementById("bntConfirm");

  if (btnCriarMateria) {
    btnCriarMateria.addEventListener("click", function (event) {
      event.preventDefault();

      const nomeMateria = document.getElementById("nomeMateria").value;
      const rotina = document.getElementById("diaSemana").value;
      const container = document.getElementById("cardsContainer");

      if (!nomeMateria || !rotina) {
        alert("Preencha todos os campos!");
        return;
      }

      const usuario_id = localStorage.getItem("usuarioId");

      // EDIÇÃO
      if (modoEdicao && idCardEmEdicao) {
        const cardEditado = idCardEmEdicao;
        const idRotina = cardEditado.dataset.id;

        cardEditado.querySelector(".nome").innerHTML = `<strong>${nomeMateria}</strong>`;
        cardEditado.querySelector(".dia").textContent = rotina;

        fetch(`http://localhost:3000/rotina/${idRotina}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            nome_materia: nomeMateria,
            dia: rotina
          })
        })
          .then(res => res.json())
          .then(data => {
            console.log("Rotina atualizada:", data);
          })
          .catch(error => {
            console.error("Erro ao atualizar:", error);
          });

        modoEdicao = false;
        idCardEmEdicao = null;

        document.getElementById("Matéria").style.display = "none";
        document.getElementById("nomeMateria").value = "";
        document.getElementById("diaSemana").value = "segunda";

        return;
      }

      // CRIAÇÃO NOVA
      fetch("http://localhost:3000/rotina", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome_materia: nomeMateria,
          dia: rotina,
          usuario_id: usuario_id
        })
      })
        .then(res => res.json())
        .then(data => {
          const novoCard = document.createElement("div");
          novoCard.className = "card-horizontal";
          novoCard.dataset.id = data.id;
          novoCard.innerHTML = `
            <div class="card-info">
              <span class="nome"><strong>${nomeMateria}</strong></span>
              <span class="dia">${rotina}</span>
            </div>
            <i class="bi bi-pencil-fill btn-edit" style="cursor: pointer;"></i>
            <i class="bi bi-trash-fill btn-delete" style="cursor: pointer; margin-left: -415px;"></i>
          `;
          container.appendChild(novoCard);

          deletarMateria();
          
          editarMateria(); // reativa o evento nos ícones

          // Limpa e fecha formulário
          document.getElementById("Matéria").style.display = "none";
          document.getElementById("nomeMateria").value = "";
          document.getElementById("diaSemana").value = "segunda";
        })
        .catch(error => {
          console.error("Erro ao criar rotina:", error);
        });
    });
  }
}
 

function editarMateria() {
  const botoesEditar = document.querySelectorAll(".btn-edit");

  botoesEditar.forEach((btn) => {
    // Remove event listeners duplicados
    const novoBtn = btn.cloneNode(true);
    btn.replaceWith(novoBtn);
  });

  // Reatribui os eventos após a substituição
  document.querySelectorAll(".btn-edit").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".card-horizontal");
      const nome = card.querySelector(".nome").textContent;
      const dia = card.querySelector(".dia").textContent;

      document.getElementById("nomeMateria").value = nome;
      document.getElementById("diaSemana").value = dia.toLowerCase();

      // Mostra o formulário
      document.getElementById("Matéria").style.display = "flex";

      // Ativa modo de edição
      modoEdicao = true;
      idCardEmEdicao = card;
    });
  });
}


function carregarRotinas() {
  const container = document.getElementById("cardsContainer");
  const usuario_id = localStorage.getItem("usuarioId");

  if (!usuario_id) {
    console.error("Usuário não autenticado.");
    return;
  }

  fetch(`http://localhost:3000/rotina?usuario_id=${usuario_id}`)
    .then(res => res.json())
    .then(rotinas => {
      container.innerHTML = ""; // limpa antes de carregar

      rotinas.forEach(rotina => {
        const novoCard = document.createElement("div");
        novoCard.className = "card-horizontal";
        novoCard.dataset.id = rotina.id;
        novoCard.innerHTML = `
          <div class="card-info">
            <span class="nome"><strong>${rotina.nome_materia}</strong></span>
            <span class="dia">${rotina.dia}</span>
          </div>
          <i class="bi bi-pencil-fill btn-edit" style="cursor: pointer;"></i>
          <i class="bi bi-trash-fill btn-delete" style="cursor: pointer; margin-left: -415px;"></i>
        `;

        container.appendChild(novoCard);
      });
      deletarMateria();

      editarMateria(); // ativa eventos nos ícones
    })
    .catch(err => {
      console.error("Erro ao carregar rotinas:", err);
    });

    document.querySelectorAll(".card-horizontal").forEach(card => {
    card.addEventListener("click", () => {
    const idRotina = card.dataset.id;
    const nomeMateria = card.querySelector(".nome").textContent;
    
    localStorage.setItem("rotinaId", idRotina);
    localStorage.setItem("nomeMateria", nomeMateria);
    window.location.href = "tarefas.html";
  });
});
}

function deletarMateria() {
  const botoesDeletar = document.querySelectorAll(".btn-delete");

  botoesDeletar.forEach((btn) => {
    const novoBtn = btn.cloneNode(true);
    btn.replaceWith(novoBtn);
  });

  document.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = btn.closest(".card-horizontal");
      const idRotina = card.dataset.id;

      const confirmar = confirm("Tem certeza que deseja excluir esta rotina?");
      if (!confirmar) return;

      fetch(`http://localhost:3000/rotina/${idRotina}`, {
        method: "DELETE"
      })
        .then(res => res.json())
        .then(data => {
          console.log(data.mensagem);
          card.remove();
        })
        .catch(err => {
          console.error("Erro ao excluir rotina:", err);
        });
    });
  });
}

function adicionarTarefa() {
  const form = document.getElementById("formTarefa");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const rotina_id = localStorage.getItem("rotinaId");
    const usuario_id = localStorage.getItem("usuarioId");

    const titulo = document.getElementById("tituloTarefa").value.trim();
    const descricao = document.getElementById("descricaoTarefa").value.trim();
    const data_entrega = document.getElementById("dataEntrega").value;
    const nota = parseFloat(document.getElementById("notaTarefa").value) || 0;
    const notificar = document.getElementById("notificar").checked;

    fetch("http://localhost:3000/tarefas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo,
        descricao,
        data_entrega,
        nota,
        notificar,
        rotina_id,
        usuario_id
      })
    })
    .then(res => res.json())
    .then(() => {
      form.reset();
      carregarTarefas(); // recarrega a lista
    });
  });
}


// Inicializar funções
deletarMateria();
carregarRotinas();
editarMateria();
closeCardMateria();
criarMatéria();
login();
cadastrar();
criarRotina();
