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

// Classe que modulariza os cálculos da fatura
class ServicoCalculoFatura {

  // Função para calcular os créditos de uma apresentação
  calcularCredito(pecas, apre) {
    let creditos = 0;
    let peca = getPeca(pecas, apre);

    creditos += Math.max(apre.audiencia - 30, 0);
    if (peca.tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }

    return creditos;
  }

  // Função para calcular o total de créditos acumulados
  calcularTotalCreditos(pecas, apresentacoes) {
    let creditos = 0;
    for (let apre of apresentacoes) {
      creditos += this.calcularCredito(pecas, apre);
    }
    return creditos;
  }

  // Função para calcular o total da apresentação
  calcularTotalApresentacao(pecas, apre) {
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

  // Função para calcular o valor total da fatura
  calcularTotalFatura(pecas, apresentacoes) {
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(pecas, apre);
    }
    return totalFatura;
  }
}

// Função para gerar a fatura em string formatada
function gerarFaturaStr(fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;

  return faturaStr;
}

/*
function gerarFaturaHTML(fatura, pecas) {
  let faturaHTML = `<html>\n<p> Fatura ${fatura.cliente} </p>\n<ul>\n`;

  for (let apre of fatura.apresentacoes) {
    faturaHTML += `<li>  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>\n`;
  }

  faturaHTML += `</ul>\n<p> Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaHTML += `<p> Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n</html>`;

  return faturaHTML;
}
*/

// Lendo os arquivos JSON com faturas e peças
const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));

// Criando o objeto da classe ServicoCalculoFatura
const calc = new ServicoCalculoFatura();

// Gerando a fatura em string formatada usando o objeto 'calc'
const faturaStr = gerarFaturaStr(faturas, pecas, calc);

// Exibindo a fatura no formato de string
console.log(faturaStr);
