const { readFileSync } = require('fs');

// Função para formatar valores monetários
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

// Função para obter uma peça a partir de uma apresentação
function getPeca(pecas, apre) {
  return pecas[apre.id];
}

// Função para calcular o total da apresentação
function calcularTotalApresentacao(pecas, apre) {
  let peca = getPeca(pecas, apre);
  let total = 0;

  switch (peca.tipo) {
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
        total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
      throw new Error(`Peça desconhecida: ${peca.tipo}`);
  }
  return total;
}

// Função para calcular os créditos de uma apresentação
function calcularCredito(pecas, apre) {
  let creditos = 0;
  let peca = getPeca(pecas, apre);

  creditos += Math.max(apre.audiencia - 30, 0);
  if (peca.tipo === "comedia") {
    creditos += Math.floor(apre.audiencia / 5);
  }

  return creditos;
}

// Função para calcular o total de créditos acumulados
function calcularTotalCreditos(pecas, apresentacoes) {
  let creditos = 0;
  for (let apre of apresentacoes) {
    creditos += calcularCredito(pecas, apre);
  }
  return creditos;
}

// Função para calcular o valor total da fatura
function calcularTotalFatura(pecas, apresentacoes) {
  let totalFatura = 0;
  for (let apre of apresentacoes) {
    totalFatura += calcularTotalApresentacao(pecas, apre);
  }
  return totalFatura;
}

// Função principal para gerar a fatura
function gerarFaturaStr(fatura, pecas) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;

  return faturaStr;
}

// Lendo os arquivos JSON com faturas e peças
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Gerando a fatura e exibindo
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
