// Seleciona os elementos principais do DOM
const cardContainer = document.querySelector(".card-container");
const campoBusca = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll(".filter-btn");

// Variáveis globais para armazenar os dados e o filtro atual
let dados = [];
let filtroAtual = "all";

// Função assíncrona para carregar os dados do arquivo data.json
async function carregarDados() {
    try {
        const resposta = await fetch("data.json"); // Faz a requisição para o arquivo JSON
        dados = await resposta.json();
        aplicarFiltros();
    } catch (error) {
        console.error("Falha ao buscar dados:", error);
        cardContainer.innerHTML = "<p>Não foi possível carregar os dados. Tente novamente mais tarde.</p>";
    }
}

// Função para aplicar os filtros de busca e de categoria
function aplicarFiltros() {
    const termoBusca = campoBusca.value.toLowerCase(); // Pega o valor da busca e converte para minúsculas

    // Filtra o array de dados com base no termo de busca e no filtro de botão selecionado
    const dadosFiltrados = dados.filter(dado => {
        // Verifica se o termo de busca corresponde ao nome, descrição ou tags do item
        const correspondeBusca = termoBusca === '' ||
            dado.nome.toLowerCase().includes(termoBusca) ||
            dado.descricao.toLowerCase().includes(termoBusca) ||
            dado.tags.some(tag => tag.toLowerCase().includes(termoBusca));

        // Verifica se a tag do item corresponde ao filtro do botão ativo
        const correspondeFiltro = filtroAtual === 'all' ||
            dado.tags.some(tag => tag.toLowerCase() === filtroAtual.toLowerCase());

        // Retorna verdadeiro apenas se ambas as condições (busca e filtro) forem atendidas
        return correspondeBusca && correspondeFiltro;
    });

    renderizarCards(dadosFiltrados); // Chama a função para renderizar os cards com os dados já filtrados
}

// Função para renderizar os cards na tela
function renderizarCards(dadosParaRenderizar) {
    cardContainer.innerHTML = ""; // Limpa os cards existentes antes de renderizar novos
    
    // Se não houver dados para renderizar, exibe uma mensagem
    if (dadosParaRenderizar.length === 0) {
        cardContainer.innerHTML = "<p class='no-results'>Nenhum resultado encontrado.</p>";
        return;
    }

    // Separa os dados em grupos
    const grupos = {
        guildaLine: [],
        players: [],
        campeonatos: []
    };

    dadosParaRenderizar.forEach(dado => {
        const tagsLower = dado.tags.map(t => t.toLowerCase());
        const isPlayer = tagsLower.includes('players') || tagsLower.includes('fundadores');
        const isCampeonato = tagsLower.includes('campeonatos');
        
        if (isCampeonato) {
            grupos.campeonatos.push(dado);
        } else if (isPlayer) {
            grupos.players.push(dado);
        } else {
            // Guilda e Lines ficam no primeiro grupo
            grupos.guildaLine.push(dado);
        }
    });

    // Função auxiliar para renderizar um grupo específico
    const renderizarGrupo = (lista, titulo) => {
        if (lista.length === 0) return;

        // Cria um container para a seção
        const sectionDiv = document.createElement('div');
        
        // Adiciona o título da seção
        const titleElem = document.createElement('h3');
        titleElem.classList.add('section-title');
        titleElem.textContent = titulo;
        sectionDiv.appendChild(titleElem);

        // Cria o grid para os cards
        const gridDiv = document.createElement('div');
        gridDiv.classList.add('card-grid');

        for (const dado of lista) {
        // Cria um novo elemento <article> para cada item de dado
        const article = document.createElement("article");
        article.classList.add("card");
        const tagsHtml = dado.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Verifica as tags para definir o estilo e categoria
        const tagsLower = dado.tags.map(t => t.toLowerCase());
        const isGuilda = tagsLower.includes('guilda');
        const isPlayer = tagsLower.includes('players') || tagsLower.includes('fundadores');
        const isCampeonato = tagsLower.includes('campeonatos');
        const isLine = tagsLower.includes('lines') || tagsLower.includes('line mobile');
        if (isCampeonato) {
            article.classList.add('card-campeonato');
        }

        // Lógica para definir a imagem e o estilo baseado na tag
        let imagemHtml = '';
        if (dado.imagem) {
            let classeEstilo = '';
            if (isGuilda) {
                classeEstilo = 'guilda-img';
            } else if (isLine) {
                classeEstilo = 'line-img';
            } else if (isPlayer) {
                classeEstilo = 'player-img';
            } else if (isCampeonato) {
                classeEstilo = 'campeonato-img';
            }

            imagemHtml = `
                <div class="card-image-container ${classeEstilo}">
                    <img src="${dado.imagem}" alt="Imagem de ${dado.nome}" class="card-image">
                </div>
            `;
        }

        // Lógica de conteúdo baseada na categoria
        let conteudoHtml = '';
        let footerHtml = '';

        if (isPlayer) {
            // Players: Nome, Nick, Descrição, Imagem (já tratada), Link, Tags
            conteudoHtml = `
                <h2>${dado.nick || dado.nome}</h2>
                <p class="player-name">${dado.nome}</p>
                <p>${dado.descricao}</p>
            `;
            footerHtml = `
                <div class="card-footer">
                    <div class="tags-container">${tagsHtml}</div>
                    ${dado.link ? `<a href="${dado.link}" target="_blank">Conheça-me</a>` : ''}
                </div>
            `;
        } else if (isCampeonato) {
            // Campeonatos: Nome, Ano, Descrição
            conteudoHtml = `
                <h2>${dado.nome}</h2>
                <p class="card-date">${dado.ano || dado.data_criacao}</p>
                <p>${dado.descricao}</p>
            `;
            // Footer para campeonatos (apenas tags)
            footerHtml = `
                <div class="card-footer">
                    <div class="tags-container">${tagsHtml}</div>
                </div>
            `;
        } else {
            // Guilda e Lines (Padrão)
            conteudoHtml = `
                <h2>${dado.nome}</h2>
                <p class="card-date">${dado.data_criacao}</p>
                <p>${dado.descricao}</p>
            `;
            
            // Exibe o link se existir (para Guilda e Lines)
            const showLink = dado.link;

            footerHtml = `
                <div class="card-footer">
                    <div class="tags-container">${tagsHtml}</div>
                    ${showLink ? `<a href="${dado.link}" target="_blank">Conheça-nos</a>` : ''}
                </div>
            `;
        }

        article.innerHTML = `
            ${imagemHtml}
            ${conteudoHtml}
            ${footerHtml}
        `;
            gridDiv.appendChild(article);
        }
        sectionDiv.appendChild(gridDiv);
        cardContainer.appendChild(sectionDiv);
    };

    // Renderiza os grupos na ordem desejada
    renderizarGrupo(grupos.guildaLine, "Guilda & Lines");
    renderizarGrupo(grupos.players, "Jogadores");
    renderizarGrupo(grupos.campeonatos, "Campeonatos");
}

// Adiciona um 'event listener' ao campo de busca que chama a função de filtro a cada tecla digitada
campoBusca.addEventListener('input', aplicarFiltros);

// Adiciona 'event listeners' para cada botão de filtro
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove a classe 'active' de todos os botões e a adiciona apenas ao clicado
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        // Atualiza o filtro atual com base no atributo 'data-filter' do botão
        filtroAtual = button.dataset.filter;
        aplicarFiltros(); // Reaplica os filtros
    });
});

// Evento que dispara a função inicial de carregamento dos dados quando o DOM está pronto
document.addEventListener('DOMContentLoaded', carregarDados);