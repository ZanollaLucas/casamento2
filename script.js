// Função para gerar o QR Code
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

        // Exibir o QR Code na página
        const qrCodeImage = document.getElementById("qrCodeImage");
        qrCodeImage.src = `http://localhost:8080/pix/qrcode?path=${data.caminhoQRCode}`;
        qrCodeImage.alt = "QR Code do Pix gerado";

    } catch (error) {
        console.error("Erro:", error);
    }
}

// Função para buscar os presentes e gerar os cards
async function carregarPresentes() {
    try {
        const response = await fetch("http://localhost:8080/presente");
        
        if (!response.ok) {
            throw new Error("Erro ao carregar presentes");
        }

        const presentes = await response.json();
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
                <label for="quantidade${presente.id}">Quantidade:</label>
                <input type="number" id="quantidade${presente.id}" name="quantidade" value="1" min="1">
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
    const quantidade = document.getElementById(`quantidade${id}`).value;
    const valorTotal = valor * quantidade; // Calcula o valor total baseado na quantidade

    console.log(`Gerando PIX para o presente ID ${id} com valor total: R$ ${valorTotal.toFixed(2)}`);
    await gerarPix(valorTotal);
}

// Carregar presentes assim que a página for carregada
document.addEventListener("DOMContentLoaded", carregarPresentes);
