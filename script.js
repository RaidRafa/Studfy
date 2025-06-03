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
            <i class="bi bi-trash-fill btn-delete" id="btnEdit" style="cursor: pointer; margin-left: -415px; background-color:rgb(160, 48, 48);"></i>
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

  if (!container) return;
  if (!usuario_id) {
    console.error("Usuário não autenticado.");
    return;
  }

  fetch(`http://localhost:3000/rotina?usuario_id=${usuario_id}`)
  .then(res => res.json())
  .then(rotinas => {
    container.innerHTML = "";

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

      // Clicar fora dos ícones redireciona para Tarefas
      novoCard.addEventListener("click", (event) => {
        const isEditIcon = event.target.classList.contains("btn-edit");
        const isDeleteIcon = event.target.classList.contains("btn-delete");

        if (!isEditIcon && !isDeleteIcon) {
          localStorage.setItem("rotinaId", rotina.id);
          localStorage.setItem("nomeMateria", rotina.nome_materia);
          window.location.href = "Tarefas.html";
        }
      });

      container.appendChild(novoCard);
    });

    deletarMateria();
    editarMateria();
  })
  .catch(err => {
    console.error("Erro ao carregar rotinas:", err);
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
  const btnform = document.getElementById("bntEnviarTarefa");

  if (btnform) {
    btnform.addEventListener("click", function (event) {
      event.preventDefault();

      const tituloTarefa = document.getElementById("nomeTarefa").value.trim();
      const descricaoTarefa = document.getElementById("descriçãoTarefa").value.trim();
      const dataEntrega = document.getElementById("dataEntrega").value;
      const nota = parseFloat(document.getElementById("nota").value) || 0;
      const notificacao = document.getElementById("notificação").checked;

      const usuario_id = localStorage.getItem("usuarioId");
      const rotina_id = localStorage.getItem("rotinaId");
      const nomeMateria = localStorage.getItem("nomeMateria");

      if (!tituloTarefa || !dataEntrega || !usuario_id || !rotina_id) {
        alert("Preencha todos os campos obrigatórios.");
        return;
      }

      fetch("http://localhost:3000/tarefa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tituloTarefa,
          nome_materia: nomeMateria,
          descricao: descricaoTarefa,
          data_entrega: dataEntrega,
          nota: nota,
          notificar: notificacao,
          rotina_id: rotina_id,
          usuario_id: usuario_id
        })
      })
        .then(res => res.json())
        .then(data => {
          alert("Tarefa registrada com sucesso!");
          console.log("Tarefa adicionada:", data);
          

          const novoCard = document.createElement("div");
            novoCard.className = "tarefa-card";
            novoCard.dataset.id = data.id;

            novoCard.innerHTML = `
              <div class="info-card">
                <div>
                  <span><strong>${tituloTarefa}</strong></span><br>
                  <span><em>${descricaoTarefa}</em></span><br>
                  <span>Data de entrega: ${dataEntrega}</span><br>
                  <span>Nota: ${nota}</span><br>
                  <span>Notificar: ${notificacao ? "Sim" : "Não"}</span>
                </div>
              </div>
            `;

            document.getElementById("tarefasContainer").appendChild(novoCard);

          const form = document.getElementById("formTarefa");
          form.style.display = "none";

          if (typeof carregarTarefas === "function") {
            carregarTarefas(); // atualiza lista se a função existir
          }
        })
    });
  }
}


function criarTarefa(){
  const btnCriarTarefa = document.getElementById("criarTarefa");
  if(btnCriarTarefa) {
    btnCriarTarefa.addEventListener("click", function() {
      const form = document.getElementById("formTarefa");
      form.style.display = "flex";
    });
  }
}

function fecharCardTarefa(){
  const btnFecharCard = document.getElementById("btnFecharCard");
  if(btnFecharCard){
    btnFecharCard.addEventListener("click", function() {
      const form = document.getElementById("formTarefa");
      form.style.display = "none";
    });
  }
}

function carregarTarefas() {
  const container = document.getElementById("tarefasContainer");
  const rotina_id = localStorage.getItem("rotinaId");

  if (!container || !rotina_id) return;

  fetch(`http://localhost:3000/tarefas?rotina_id=${rotina_id}`)
    .then(res => res.json())
    .then(tarefas => {
      container.innerHTML = "";

      tarefas.forEach(tarefa => {
        const li = document.createElement("div");
        li.classList.add("card-tarefa")
        li.innerHTML = `
          <strong>${tarefa.titulo}</strong><br>
          ${tarefa.descricao ? `<em>${tarefa.descricao}</em><br>` : ""}
          Data de entrega: ${tarefa.data_entrega}<br>
          Nota: ${tarefa.nota ?? "-"}<br>
          Notificar: ${tarefa.notificar ? "Sim" : "Não"}
          <hr>
        `;
        container.appendChild(li);
      });
    })
    .catch(err => {
      console.error("Erro ao carregar tarefas:", err);
    });
}

if (window.location.pathname.includes("Tarefas.html")) {
  carregarTarefas();
}



// Inicializar funções
fecharCardTarefa();
criarTarefa();
deletarMateria();
carregarRotinas();
editarMateria();
closeCardMateria();
criarMatéria();
adicionarTarefa();
login();
cadastrar();
criarRotina();
