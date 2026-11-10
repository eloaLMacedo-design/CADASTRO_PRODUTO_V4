// ================================================
// FASE 1: MODELAGEM DOS DADOS - CLASSE PRODUTO
// ================================================

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode ficar em branco.");
        }

        this.nome = nome.trim();
        this.preco = preco;
        this.quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    set preco(novoPreco) {
        novoPreco = Number(novoPreco);

        if (!Number.isFinite(novoPreco) || novoPreco <= 0) {
            throw new Error("O preço deve ser maior que zero.");
        }

        this.#preco = novoPreco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    set quantidade(novaQuantidade) {
        novaQuantidade = Number(novaQuantidade);

        if (!Number.isInteger(novaQuantidade) || novaQuantidade <= 0) {
            throw new Error("A quantidade deve ser um número inteiro maior que zero.");
        }

        this.#quantidade = novaQuantidade;
    }

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}

// ================================================
// FASE 2: GERENCIAMENTO DE ESTADO
// ================================================

const listaDeProdutos = [];
const CHAVE_STORAGE = "sistema_estoque_produtos";
let indiceEdicao = null;

// ================================================
// FASE 3: PEGAR ELEMENTOS DO HTML
// ================================================

const formProduto = document.getElementById("produto-form");
const btnLimparTudo = document.getElementById("limpar-tabela");
const totalEstoqueEl = document.getElementById("total-estoque");
const nomeEl = document.getElementById("nome");
const precoEl = document.getElementById("preco");
const quantidadeEl = document.getElementById("quantidade");
const btnPrincipal = document.getElementById("btn-salvar");
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
const textoBotaoOriginal = btnPrincipal.textContent.trim();
const campoBusca = document.getElementById("campo-busca");
const mensagemVazia = document.getElementById("mensagem-vazia");
const sugestoesProdutos = document.getElementById("sugestoes-produtos");
const notificacao = document.getElementById("notificacao");

const modalConfirmacao = document.getElementById("modal-confirmacao");
const modalTitulo = document.getElementById("modal-titulo");
const modalMensagem = document.getElementById("modal-mensagem");
const modalConfirmar = document.getElementById("modal-confirmar");
const modalCancelar = document.getElementById("modal-cancelar");

const modalConceito = document.getElementById("modal-conceito");
const btnConceitoBootstrap = document.getElementById("btn-conceito-bootstrap");
const btnFecharConceito = document.getElementById("fechar-conceito");
const btnEntendiConceito = document.getElementById("entendi-conceito");

// ================================================
// FASE 4: MENSAGENS INLINE E NOTIFICAÇÕES
// ================================================

function mostrarErroCampo(campo, mensagem) {
    const elementoErro = document.getElementById(`erro-${campo}`);

    elementoErro.textContent = mensagem;
    document.getElementById(campo).classList.add("campo-invalido");
}

function limparErroCampo(campo) {
    const elementoErro = document.getElementById(`erro-${campo}`);

    elementoErro.textContent = "";
    document.getElementById(campo).classList.remove("campo-invalido");
}

function limparTodosErros() {
    ["nome", "preco", "quantidade"].forEach(limparErroCampo);
}

function mostrarNotificacao(mensagem, tipo = "sucesso") {
    notificacao.textContent = mensagem;
    notificacao.className = `notificacao ${tipo}`;
    notificacao.hidden = false;
}

function ocultarNotificacao() {
    notificacao.hidden = true;
    notificacao.textContent = "";
}

function validarFormulario() {
    limparTodosErros();
    let valido = true;

    if (!nomeEl.value.trim()) {
        mostrarErroCampo("nome", "Digite o nome do produto.");
        valido = false;
    }

    const preco = Number(precoEl.value);

    if (precoEl.value.trim() === "" || !Number.isFinite(preco) || preco <= 0) {
        mostrarErroCampo("preco", "Informe um preço maior que zero.");
        valido = false;
    }

    const quantidade = Number(quantidadeEl.value);

    if (quantidadeEl.value.trim() === "" || !Number.isInteger(quantidade) || quantidade <= 0) {
        mostrarErroCampo("quantidade", "Informe uma quantidade inteira maior que zero.");
        valido = false;
    }

    if (!valido) {
        mostrarNotificacao("Confira os campos destacados antes de continuar.", "erro");
    }

    return valido;
}

[nomeEl, precoEl, quantidadeEl].forEach(campo => {
    campo.addEventListener("input", () => {
        limparErroCampo(campo.id);
        ocultarNotificacao();
    });
});

// ================================================
// FASE 5: SALVAR E CARREGAR NO LOCALSTORAGE
// ================================================

function salvarNoLocalStorage() {
    const dadosParaSalvar = listaDeProdutos.map(produto => ({
        nome: produto.nome,
        preco: produto.preco,
        quantidade: produto.quantidade
    }));

    try {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dadosParaSalvar));
    } catch (erro) {
        console.error("Erro ao salvar os produtos:", erro);
        mostrarNotificacao("Não foi possível salvar os dados neste navegador.", "erro");
    }
}

function carregarDoLocalStorage() {
    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) return;

    try {
        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            throw new Error("Os dados salvos possuem um formato inválido.");
        }

        produtosSalvos.forEach(produto => {
            listaDeProdutos.push(
                new Produto(produto.nome, produto.preco, produto.quantidade)
            );
        });

    } catch (erro) {
        console.error("Erro ao carregar os produtos:", erro);
        mostrarNotificacao("Não foi possível carregar os produtos salvos. Verifique os dados do navegador.", "erro");
    }
}

// ================================================
// FASE 6: MODAL DE CONFIRMAÇÃO ASSÍNCRONO
// ================================================

function confirmarAcao(titulo, mensagem, textoConfirmar = "Confirmar") {
    return new Promise(resolve => {
        modalTitulo.textContent = titulo;
        modalMensagem.textContent = mensagem;
        modalConfirmar.textContent = textoConfirmar;

        modalConfirmacao.hidden = false;
        modalConfirmar.focus();

        function finalizar(resultado) {
            modalConfirmacao.hidden = true;

            modalConfirmar.removeEventListener("click", confirmar);
            modalCancelar.removeEventListener("click", cancelar);
            modalConfirmacao.removeEventListener("click", clicarFora);
            document.removeEventListener("keydown", teclaEsc);

            resolve(resultado);
        }

        function confirmar() {
            finalizar(true);
        }

        function cancelar() {
            finalizar(false);
        }

        function clicarFora(evento) {
            if (evento.target === modalConfirmacao) {
                cancelar();
            }
        }

        function teclaEsc(evento) {
            if (evento.key === "Escape" && !modalConfirmacao.hidden) {
                cancelar();
            }
        }

        modalConfirmar.addEventListener("click", confirmar);
        modalCancelar.addEventListener("click", cancelar);
        modalConfirmacao.addEventListener("click", clicarFora);
        document.addEventListener("keydown", teclaEsc);
    });
}

// ================================================
// FASE 7: PREPARAR E CANCELAR EDIÇÃO
// ================================================

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        mostrarNotificacao("Produto não encontrado.", "erro");
        return;
    }

    nomeEl.value = produto.nome;
    precoEl.value = produto.preco;
    quantidadeEl.value = produto.quantidade;

    indiceEdicao = index;

    btnPrincipal.textContent = "Salvar Alterações";
    btnCancelarEdicao.hidden = false;
    sugestoesProdutos.hidden = true;

    limparTodosErros();
    ocultarNotificacao();

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    nomeEl.focus();
}

function cancelarEdicao() {
    indiceEdicao = null;

    formProduto.reset();

    btnPrincipal.textContent = textoBotaoOriginal;
    btnCancelarEdicao.hidden = true;
    sugestoesProdutos.hidden = true;

    limparTodosErros();
}

btnCancelarEdicao.addEventListener("click", cancelarEdicao);

// ================================================
// FASE 8: SUGESTÕES DE PRODUTOS PARECIDOS
// ================================================

function normalizarNome(nome) {
    return nome.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function verificarProdutosParecidos() {
    const nomeDigitado = normalizarNome(nomeEl.value);

    sugestoesProdutos.innerHTML = "";
    sugestoesProdutos.hidden = true;

    if (nomeDigitado.length < 2) {
        return;
    }

    const encontrados = listaDeProdutos
        .map((produto, index) => ({
            produto,
            index
        }))
        .filter(item => {
            if (indiceEdicao === item.index) {
                return false;
            }

            const nomeCadastrado = normalizarNome(item.produto.nome);

            return nomeCadastrado.includes(nomeDigitado);
        });

    if (encontrados.length === 0) {
        return;
    }

    const titulo = document.createElement("p");

    titulo.className = "titulo-sugestao";
    titulo.textContent = "⚠️ Este produto já foi cadastrado!";

    sugestoesProdutos.appendChild(titulo);

    encontrados.forEach(item => {
        const botao = document.createElement("button");

        botao.type = "button";
        botao.className = "sugestao-item";

        const nomeProduto = document.createElement("strong");
        nomeProduto.textContent = item.produto.nome;

        const detalhes = document.createElement("small");

        detalhes.textContent = `${item.produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })} | ${item.produto.quantidade} unidades`;

        botao.append(nomeProduto, detalhes);

        botao.addEventListener("click", () => {
            prepararEdicao(item.index);
        });

        sugestoesProdutos.appendChild(botao);
    });

    sugestoesProdutos.hidden = false;
}

nomeEl.addEventListener("input", verificarProdutosParecidos);

// ================================================
// FASE 9: CADASTRAR E EDITAR PRODUTOS
// ================================================

formProduto.addEventListener("submit", evento => {
    evento.preventDefault();

    ocultarNotificacao();

    if (!validarFormulario()) {
        return;
    }

    try {
        const novoProduto = new Produto(
            nomeEl.value,
            precoEl.value,
            quantidadeEl.value
        );

        if (indiceEdicao === null) {
            listaDeProdutos.push(novoProduto);

            mostrarNotificacao(
                "Produto cadastrado com sucesso!",
                "sucesso"
            );

        } else {
            listaDeProdutos[indiceEdicao] = novoProduto;

            mostrarNotificacao(
                "Produto atualizado com sucesso!",
                "sucesso"
            );
        }

        salvarNoLocalStorage();
        atualizarInterface();
        cancelarEdicao();

    } catch (erro) {
        mostrarNotificacao(erro.message, "erro");
    }
});

// ================================================
// FASE 10: REMOVER UM PRODUTO COM MODAL
// ================================================

async function removerProduto(index) {
    const produto = listaDeProdutos[index];

    if (!produto) {
        mostrarNotificacao("Produto não encontrado.", "erro");
        return;
    }

    const confirmou = await confirmarAcao(
        "Remover produto",
        `Tem certeza de que deseja remover "${produto.nome}" do estoque?`,
        "Remover"
    );

    if (!confirmou) {
        return;
    }

    if (indiceEdicao === index) {
        cancelarEdicao();

    } else if (indiceEdicao !== null && indiceEdicao > index) {
        indiceEdicao--;
    }

    listaDeProdutos.splice(index, 1);

    salvarNoLocalStorage();
    atualizarInterface();

    mostrarNotificacao(
        "Produto removido com sucesso.",
        "sucesso"
    );
}

// ================================================
// FASE 11: LIMPAR TODOS OS PRODUTOS COM MODAL
// ================================================

btnLimparTudo.addEventListener("click", async () => {
    if (listaDeProdutos.length === 0) {
        mostrarNotificacao("O estoque já está vazio.", "erro");
        return;
    }

    const confirmou = await confirmarAcao(
        "Limpar todo o estoque",
        "Tem certeza de que deseja remover todos os produtos? Essa ação não poderá ser desfeita.",
        "Limpar tudo"
    );

    if (!confirmou) {
        return;
    }

    listaDeProdutos.length = 0;

    cancelarEdicao();

    localStorage.removeItem(CHAVE_STORAGE);

    atualizarInterface();

    mostrarNotificacao(
        "Todos os produtos foram removidos.",
        "sucesso"
    );
});

// ================================================
// FASE 12: FILTRAR E RENDERIZAR PRODUTOS
// ================================================

function obterProdutosFiltrados() {
    const termoBusca = normalizarNome(campoBusca.value);

    return listaDeProdutos
        .map((produto, index) => ({
            produto,
            index
        }))
        .filter(item =>
            normalizarNome(item.produto.nome).includes(termoBusca)
        );
}

function renderizarTabela() {
    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    tabelaBody.innerHTML = "";

    const produtosFiltrados = obterProdutosFiltrados();

    if (produtosFiltrados.length === 0) {
        mensagemVazia.hidden = false;

        if (listaDeProdutos.length === 0) {
            mensagemVazia.textContent =
                "Nenhum produto cadastrado ainda.";

        } else {
            mensagemVazia.textContent =
                "Nenhum produto encontrado com esse nome.";
        }

    } else {
        mensagemVazia.hidden = true;
    }

    produtosFiltrados.forEach(item => {
        const produto = item.produto;
        const index = item.index;

        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        const celulaPreco = document.createElement("td");
        const celulaQuantidade = document.createElement("td");
        const celulaSubtotal = document.createElement("td");
        const celulaAcoes = document.createElement("td");

        celulaNome.textContent = produto.nome;

        celulaPreco.textContent =
            produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        celulaQuantidade.textContent = produto.quantidade;

        celulaSubtotal.textContent =
            produto.calcularSubtotal().toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            });

        // BOTÃO EDITAR

        const btnEditar = document.createElement("button");

        btnEditar.textContent = "Editar";
        btnEditar.classList.add("btn-editar");

        btnEditar.addEventListener("click", () => {
            prepararEdicao(index);
        });

        // BOTÃO REMOVER

        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";
        btnRemover.classList.add("btn-remover");

        btnRemover.addEventListener("click", () => {
            removerProduto(index);
        });

        // ADICIONAR BOTÕES

        celulaAcoes.append(btnEditar, btnRemover);
        celulaAcoes.classList.add("acoes");

        // MONTAR LINHA

        linha.append(
            celulaNome,
            celulaPreco,
            celulaQuantidade,
            celulaSubtotal,
            celulaAcoes
        );

        tabelaBody.appendChild(linha);
    });
}

// ================================================
// FASE 13: ATUALIZAR INTERFACE
// ================================================

function atualizarInterface() {
    const total = listaDeProdutos.reduce(
        (acumulador, produto) => {
            return acumulador + produto.calcularSubtotal();
        },
        0
    );

    totalEstoqueEl.textContent =
        `Total em estoque: ${total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`;

    renderizarTabela();
}

// ================================================
// FASE 14: PESQUISAR PRODUTOS
// ================================================

campoBusca.addEventListener("input", () => {
    atualizarInterface();
});

// ================================================
// FASE 15: MODAL CONCEITO BOOTSTRAP
// ================================================

function fecharModalConceito() {
    modalConceito.hidden = true;
}

btnConceitoBootstrap.addEventListener("click", () => {
    modalConceito.hidden = false;
    btnEntendiConceito.focus();
});

btnFecharConceito.addEventListener("click", fecharModalConceito);

btnEntendiConceito.addEventListener("click", fecharModalConceito);

modalConceito.addEventListener("click", evento => {
    if (evento.target === modalConceito) {
        fecharModalConceito();
    }
});

document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modalConceito.hidden) {
        fecharModalConceito();
    }
});

// ================================================
// FASE 16: INICIAR O SISTEMA
// ================================================

carregarDoLocalStorage();
atualizarInterface();