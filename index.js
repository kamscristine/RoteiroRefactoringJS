const { readFileSync } = require('fs');

// Função para formatar valores monetários
function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor / 100);
}

// Classe Repositorio para encapsular o acesso ao arquivo de peças
class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync('./pecas.json'));
  }

  // Método para obter uma peça a partir de uma apresentação
  getPeca(apre) {
    return this.pecas[apre.id];
  }
}

// Classe que modulariza os cálculos da fatura
class ServicoCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }

  // Função para calcular os créditos de uma apresentação
  calcularCredito(apre) {
    let creditos = 0;
    let peca = this.repo.getPeca(apre);

    creditos += Math.max(apre.audiencia - 30, 0);
    if (peca.tipo === "comedia") {
      creditos += Math.floor(apre.audiencia / 5);
    }

    return creditos;
  }

  // Função para calcular o total de créditos acumulados
  calcularTotalCreditos(apresentacoes) {
    let creditos = 0;
    for (let apre of apresentacoes) {
      creditos += this.calcularCredito(apre);
    }
    return creditos;
  }

  // Função para calcular o total da apresentação
  calcularTotalApresentacao(apre) {
    let peca = this.repo.getPeca(apre);
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
  calcularTotalFatura(apresentacoes) {
    let totalFatura = 0;
    for (let apre of apresentacoes) {
      totalFatura += this.calcularTotalApresentacao(apre);
    }
    return totalFatura;
  }
}

// Função para gerar a fatura em string formatada
function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;

  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${calc.repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${apre.audiencia} assentos)\n`;
  }

  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;

  return faturaStr;
}

// Lendo o arquivo JSON com as faturas
const faturas = JSON.parse(readFileSync('./faturas.json'));

// Criando o objeto do repositório e da classe de cálculo
const calc = new ServicoCalculoFatura(new Repositorio());

// Gerando a fatura em string formatada
const faturaStr = gerarFaturaStr(faturas, calc);

// Exibindo a fatura no formato de string
console.log(faturaStr);
