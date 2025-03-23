async function gerarPix(valorTotal) {
    const formData = new FormData();
    formData.append("valor", valorTotal);

    try {
        const response = await fetch("http://localhost:8080/pix/gerar", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Erro ao gerar PIX");
        }

        const data = await response.json();
        console.log("Código Pix:", data.codigoPix);
        console.log("Caminho do QR Code:", data.caminhoQRCode);

        // Obtém elementos do modal
        const qrCodeImage = document.getElementById("qrCodeImage");
        const codigoPixElement = document.getElementById("codigoPix");

        // Atualiza a imagem do QR Code
        qrCodeImage.src = `http://localhost:8080/pix/qrcode?path=${encodeURIComponent(data.caminhoQRCode)}`;
        qrCodeImage.alt = "QR Code do Pix gerado";

        // Atualiza o código Pix
        codigoPixElement.textContent = data.codigoPix;

        // Mostra o modal apenas quando a imagem é carregada
        qrCodeImage.onload = () => {
            document.getElementById("qrCodeModal").style.display = "flex";
        };

    } catch (error) {
        console.error("Erro:", error);
    }
}

// Função para copiar o código Pix ao clicar em qualquer parte do container
function copiarCodigoPix() {
    const codigoPixElement = document.getElementById("codigoPix");
    const codigoPix = codigoPixElement.textContent.trim(); // Remove espaços extras

    navigator.clipboard.writeText(codigoPix).then(() => {
        alert("Código Pix copiado!");
    }).catch(err => {
        console.error("Erro ao copiar código Pix:", err);
    });
}

// Adiciona o evento de clique ao container inteiro
document.getElementById("codigoPix").parentElement.addEventListener("click", copiarCodigoPix);

// Função para armazenar o presente selecionado para o envio posterior
let dadosCompra = {};

async function EnviarOK() {
    const { id, valor } = dadosCompra;
    const quantidadeInput = document.getElementById(`${id}`);
    if (!quantidadeInput) {
        console.error(`Erro: Input de quantidade para ID ${id} não encontrado.`);
        return;
    }

    const quantidade = parseInt(quantidadeInput.value, 10);
    const valorTotal = valor * quantidade;

    const dadosCompraPost = {
        nomeDonatario: "teste",
        presenteid: id,
        valorTotal: valorTotal,
        valorPresente: valor,
        quantidade: quantidade,
        dataHora: new Date()
    };

    try {
        const response = await fetch("http://localhost:8080/transacoes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dadosCompraPost)
        });

        if (!response.ok) throw new Error("Erro ao realizar a compra");

        const data = await response.json();
        console.log("Compra realizada:", data);
        alert("Compra realizada com sucesso!");

        // Limpar os valores após a compra
        window.comprando = null;
        window.qrCode = "";
        window.nomeComprador = "";
        fecharModal();
        
    } catch (error) {
        console.error("Erro ao realizar a compra:", error);
        alert("Ocorreu um erro ao processar a compra.");
    }
}

// Função para fechar o modal
function fecharModal() {
    document.getElementById("qrCodeModal").style.display = "none";
}

// Função para buscar os presentes e gerar os cards
async function carregarPresentes() {
    try {
       // const response = await fetch("http://localhost:8080/presente");

       // if (!response.ok) {
        //    throw new Error("Erro ao carregar presentes");
       // }

       // const presentes = await response.json();

       const presentes = [
        {
            id: 1,
            nome: "Jogo de Panelas",
            descricao: "Conjunto de panelas antiaderentes.",
            valor: 299.99,
            img: "https://via.placeholder.com/150"
        },
        {
            id: 2,
            nome: "Aparelho de Jantar",
            descricao: "Conjunto para 6 pessoas.",
            valor: 199.90,
            img: "https://via.placeholder.com/150"
        },
        {
            id: 3,
            nome: "Cafeteira Expresso",
            descricao: "Prepara café expresso rapidamente.",
            valor: 349.90,
            img: "https://via.placeholder.com/150"
        }
    ];

        const cardContainer = document.getElementById("cardContainer");

        presentes.forEach(presente => {
            // Criando o card do presente
            const card = document.createElement("div");
            card.classList.add("card");

            // Adicionando a quantidade e o botão "Gerar Pix"
            card.innerHTML = `
                <img src="${presente.img}" alt="${presente.nome}">
                <h3>${presente.nome}</h3>
                <p>${presente.descricao}</p>
                <p>R$ ${presente.valor.toFixed(2)}</p>
                <label for="${presente.id}">Quantidade:</label>
                <input type="number" id="${presente.id}" name="quantidade" value="1" min="1">
                <button onclick="gerarPixParaPresente(${presente.id}, ${presente.valor})">Gerar PIX</button>
            `;

            // Adicionando o card ao container
            cardContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Função para gerar o Pix para um presente específico com a quantidade
async function gerarPixParaPresente(id, valor) {
    const quantidadeInput = document.getElementById(`${id}`);
    if (!quantidadeInput) {
        console.error(`Erro: Input de quantidade para ID ${id} não encontrado.`);
        return;
    }

    const quantidade = parseInt(quantidadeInput.value, 10);
    if (isNaN(quantidade) || quantidade <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
    }

    const valorTotal = valor * quantidade;
    await gerarPix(valorTotal);

    // Armazena os dados do presente selecionado
    dadosCompra = { id, valor };

    // Espera o usuário clicar no botão "PIX Realizado"
    document.getElementById("pixRealizadoBtn").addEventListener("click", EnviarOK);
}

// Carregar presentes assim que a página for carregada
document.addEventListener("DOMContentLoaded", carregarPresentes);
