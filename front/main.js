$(document).ready(function () {
  carregarAcoes(); 
  $("#btnAdicionar").click(function () {
    adicionarAcao();
  });
});

function carregarAcoes() {
  fetch("http://127.0.0.1:5000/acoes")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar as ações da API.");
      }
      return response.json();
    })
    .then((data) => {
      // Limpar 
      $("#tabelaCorpo").empty();

      data.forEach((acao) => {
        $("#tabelaCorpo").append(`
          <tr>
            <td>${acao.tipo_acao}</td>
            <td>${acao.data_prevista}</td>
            <td>R$ ${acao.investimento.toFixed(2)}</td>
            <td><button class="btn btn-primary" onclick="abrirModalEdicao(${
              acao.id
            })"><i class="fas fa-edit"></i></button></td>
            <td><button class="btn btn-danger" onclick="excluirAcao(${
              acao.id
            })"><i class="fas fa-trash-alt"></i></button></td>
          </tr>
        `);
      });

      // Inicializar 
      if ($.fn.DataTable.isDataTable("#verbasTable")) {
        $("#verbasTable").DataTable().clear().destroy();
      }

      $("#verbasTable").DataTable({
        pageLength: 10, 
        lengthMenu: [5, 10, 25, 50, 75, 100], 
      });
    })
    .catch((error) => {
      console.error("Erro ao carregar as ações:", error);
    });
}

function adicionarAcao() {
  const acao = $("#acao").val();
  const dataPrevista = $("#dataPrevista").val();
  const investimentoPrevisto = parseFloat($("#investimentoPrevisto").val());

  if (acao === "" || dataPrevista === "" || isNaN(investimentoPrevisto)) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const dataAtual = new Date();
  const dataPrevistaDate = new Date(dataPrevista);
  const diferencaDias = Math.ceil(
    (dataPrevistaDate - dataAtual) / (1000 * 60 * 60 * 24)
  );

  if (diferencaDias < 10) {
    alert(
      "A data prevista deve ser pelo menos 10 dias após a data de cadastro."
    );
    return;
  }

  const novaAcao = {
    nome_acao: acao,
    data_prevista: dataPrevista,
    investimento: investimentoPrevisto,
  };

  fetch("http://127.0.0.1:5000/acoes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(novaAcao),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao adicionar ação.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Ação adicionada com sucesso:", data);
      carregarAcoes();
      $("#acaoForm")[0].reset();
    })
    .catch((error) => {
      console.error("Erro ao adicionar ação:", error);
    });
}

function abrirModalEdicao(id) {
  fetch(`http://127.0.0.1:5000/acoes/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao carregar a ação para edição.");
      }
      return response.json();
    })
    .then((data) => {
      $("#editarAcaoId").val(data.id);
      $("#editarAcaoNome").val(data.tipo_acao);
      $("#editarDataPrevista").val(data.data_prevista);
      $("#editarInvestimentoPrevisto").val(data.investimento);
      $("#editarModal").modal("show");
    })
    .catch((error) => {
      console.error("Erro ao carregar a ação para edição:", error);
    });
}

function salvarEdicao() {
  const id = $("#editarAcaoId").val();
  const dataPrevista = $("#editarDataPrevista").val();
  const investimentoPrevisto = parseFloat(
    $("#editarInvestimentoPrevisto").val()
  );

  if (dataPrevista === "" || isNaN(investimentoPrevisto)) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  const dataAtual = new Date();
  const dataPrevistaDate = new Date(dataPrevista);
  const diferencaDias = Math.ceil(
    (dataPrevistaDate - dataAtual) / (1000 * 60 * 60 * 24)
  );

  if (diferencaDias < 10) {
    $("#editarErrorMessage").show();
    return;
  } else {
    $("#editarErrorMessage").hide();
  }

  const acaoEditada = {
    data_prevista: dataPrevista,
    investimento: investimentoPrevisto,
  };

  fetch(`http://127.0.0.1:5000/acoes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(acaoEditada),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao editar ação.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Ação editada com sucesso:", data);
      $("#editarModal").modal("hide");
      carregarAcoes(); // Recarregar as ações após a edição
    })
    .catch((error) => {
      console.error("Erro ao editar ação:", error);
    });
}

function excluirAcao(id) {
  if (!confirm("Tem certeza que deseja excluir esta ação?")) {
    return;
  }

  fetch(`http://127.0.0.1:5000/acoes/${id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Erro ao excluir ação.");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Ação excluída com sucesso:", data);
      carregarAcoes(); // Recarregar as ações após a exclusão
    })
    .catch((error) => {
      console.error("Erro ao excluir ação:", error);
    });
}
