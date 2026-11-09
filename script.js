//
// FASE 1: MODELAGEM DOS DADOS - CLASSE PRODUTO
//

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

    // GETTER E SETTER DO PREÇO

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

    // GETTER E SETTER DA QUANTIDADE

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

    // CALCULAR SUBTOTAL

    calcularSubtotal() {
        return this.preco * this.quantidade;
    }
}


//
// FASE 2: GERENCIAMENTO DE ESTADO
//

const listaDeProdutos = [];

const CHAVE_STORAGE = "sistema_estoque_produtos";

let indiceEdicao = null;


//
// FASE 3: SALVAR NO LOCALSTORAGE
//

function salvarNoLocalStorage() {

    const dadosParaSalvar = listaDeProdutos.map(produto => {

        return {
            nome: produto.nome,
            preco: produto.preco,
            quantidade: produto.quantidade
        };

    });

    localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(dadosParaSalvar)
    );
}


//
// FASE 4: CARREGAR DO LOCALSTORAGE
//

function carregarDoLocalStorage() {

    const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

    if (!dadosSalvos) {
        return;
    }

    try {

        const produtosSalvos = JSON.parse(dadosSalvos);

        produtosSalvos.forEach(produto => {

            const novoProduto = new Produto(
                produto.nome,
                produto.preco,
                produto.quantidade
            );

            listaDeProdutos.push(novoProduto);

        });

    } catch (erro) {

        console.error("Erro ao carregar os produtos:", erro);

        alert("Não foi possível carregar os produtos salvos.");
    }
}


//
// FASE 5: PEGAR ELEMENTOS DO HTML
//

const formProduto = document.getElementById("produto-form");

const btnLimparTudo = document.getElementById("limpar-tabela");

const totalEstoqueEl = document.getElementById("total-estoque");

const nomeEl = document.getElementById("nome");

const precoEl = document.getElementById("preco");

const quantidadeEl = document.getElementById("quantidade");

const btnPrincipal = document.querySelector(".btn-primary");

const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");

const textoBotaoOriginal = btnPrincipal.textContent.trim();

const campoBusca = document.getElementById("campo-busca");

const mensagemVazia = document.getElementById("mensagem-vazia");


//
// FASE 6: PREPARAR EDIÇÃO
//

function prepararEdicao(index) {

    const produto = listaDeProdutos[index];

    if (!produto) {
        alert("Produto não encontrado.");
        return;
    }

    nomeEl.value = produto.nome;

    precoEl.value = produto.preco;

    quantidadeEl.value = produto.quantidade;

    indiceEdicao = index;

    btnPrincipal.textContent = "Salvar Alterações";

    btnCancelarEdicao.hidden = false;

    formProduto.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    nomeEl.focus();
}


//
// FASE 7: CANCELAR EDIÇÃO
//

function cancelarEdicao() {

    indiceEdicao = null;

    formProduto.reset();

    btnPrincipal.textContent = textoBotaoOriginal;

    btnCancelarEdicao.hidden = true;
}


// Evento do botão cancelar edição

btnCancelarEdicao.addEventListener("click", function() {

    cancelarEdicao();

});


//
// FASE 8: VALIDAÇÃO E ENVIO DO FORMULÁRIO
//

formProduto.addEventListener("submit", function(event) {

    event.preventDefault();

    // SANITIZAÇÃO

    const nome = nomeEl.value.trim();

    const preco = Number(precoEl.value);

    const quantidade = Number(quantidadeEl.value);


    // VALIDAÇÃO DO NOME

    if (!nome) {

        alert("Por favor, informe um nome válido para o produto.");

        nomeEl.focus();

        return;
    }


    // VALIDAÇÃO DO PREÇO E QUANTIDADE

    if (
        precoEl.value.trim() === "" ||
        !Number.isFinite(preco) ||
        preco <= 0 ||
        quantidadeEl.value.trim() === "" ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
    ) {

        alert("O preço e a quantidade devem ser valores numéricos maiores que zero. A quantidade deve ser inteira.");

        return;
    }


    try {

        const novoProduto = new Produto(
            nome,
            preco,
            quantidade
        );


        // INCLUSÃO OU EDIÇÃO

        if (indiceEdicao === null) {

            listaDeProdutos.push(novoProduto);

        } else {

            if (!listaDeProdutos[indiceEdicao]) {

                alert("O produto selecionado não foi encontrado.");

                cancelarEdicao();

                return;
            }

            listaDeProdutos[indiceEdicao] = novoProduto;
        }


        // SALVAR

        salvarNoLocalStorage();


        // ATUALIZAR INTERFACE

        atualizarInterface();


        // RESTAURAR FORMULÁRIO

        cancelarEdicao();

    } catch (erro) {

        alert(erro.message);
    }

});


//
// FASE 9: REMOVER UM PRODUTO
//

function removerProduto(index) {

    if (!listaDeProdutos[index]) {

        alert("Produto não encontrado.");

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
}


//
// FASE 10: LIMPAR TODOS OS PRODUTOS
//

btnLimparTudo.addEventListener("click", function() {

    const confirmar = confirm(
        "Tem certeza que deseja remover todos os produtos?"
    );

    if (!confirmar) {
        return;
    }

    listaDeProdutos.length = 0;

    cancelarEdicao();

    localStorage.removeItem(CHAVE_STORAGE);

    atualizarInterface();

});


//
// FASE 11: FILTRAR PRODUTOS
//

function obterProdutosFiltrados() {

    const termoBusca = campoBusca.value
        .trim()
        .toLowerCase();

    const produtosFiltrados = listaDeProdutos

        .map((produto, index) => ({
            produto,
            index
        }))

        .filter(item => {

            return item.produto.nome
                .toLowerCase()
                .includes(termoBusca);

        });

    return produtosFiltrados;
}


//
// FASE 12: RENDERIZAR TABELA
//

function renderizarTabela() {

    const tabelaBody = document.querySelector(
        "#tabela-produtos tbody"
    );

    // LIMPAR TABELA

    tabelaBody.innerHTML = "";

    // OBTER PRODUTOS FILTRADOS

    const produtosFiltrados = obterProdutosFiltrados();


    // VERIFICAR SE EXISTEM PRODUTOS

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


    // PERCORRER PRODUTOS ENCONTRADOS

    produtosFiltrados.forEach(item => {

        const produto = item.produto;

        const index = item.index;

        const linha = document.createElement("tr");


        // CRIAR CÉLULAS

        const celulaNome = document.createElement("td");

        const celulaPreco = document.createElement("td");

        const celulaQuantidade = document.createElement("td");

        const celulaSubtotal = document.createElement("td");

        const celulaAcoes = document.createElement("td");


        // PREENCHER DADOS

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

        btnEditar.addEventListener("click", function() {

            prepararEdicao(index);

        });


        // BOTÃO REMOVER

        const btnRemover = document.createElement("button");

        btnRemover.textContent = "Remover";

        btnRemover.classList.add("btn-remover");

        btnRemover.addEventListener("click", function() {

            removerProduto(index);

        });


        // ADICIONAR BOTÕES

        celulaAcoes.appendChild(btnEditar);

        celulaAcoes.appendChild(btnRemover);

        celulaAcoes.classList.add("acoes");


        // MONTAR LINHA

        linha.appendChild(celulaNome);

        linha.appendChild(celulaPreco);

        linha.appendChild(celulaQuantidade);

        linha.appendChild(celulaSubtotal);

        linha.appendChild(celulaAcoes);


        // ADICIONAR NA TABELA

        tabelaBody.appendChild(linha);

    });

}


//
// FASE 13: ATUALIZAR INTERFACE
//

function atualizarInterface() {

    // CALCULAR TOTAL DO ESTOQUE

    const total = listaDeProdutos.reduce((acumulador, produto) => {

        return acumulador + produto.calcularSubtotal();

    }, 0);


    // MOSTRAR TOTAL FORMATADO

    totalEstoqueEl.textContent =
        `Total em estoque: ${total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`;


    // ATUALIZAR TABELA

    renderizarTabela();

}


//
// FASE 14: PESQUISAR PRODUTOS
//

campoBusca.addEventListener("input", function() {

    atualizarInterface();

});


//
// FASE 15: INICIAR O SISTEMA
//

// CARREGAR PRODUTOS SALVOS

carregarDoLocalStorage();


// MOSTRAR PRODUTOS NA TELA

atualizarInterface();
