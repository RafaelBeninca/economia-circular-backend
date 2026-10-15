import type { MovimentacaoResiduoRequestDTO, TipoMovimentacaoResiduo } from "../api/tipos";
import { ErroApi } from "../api/client.ts";

// CAMADA: Formulário
// RESPONSABILIDADE: validar o preenchimento e adaptar o sinal exigido pelo contrato.
// REGRAS: o operador digita quantidade positiva; saldo e R1 continuam na API.
// SITUAÇÃO: implementada sem arredondamento ou limite de saldo no navegador
export interface CamposMovimentacao {
  quantidade?: string;
  descricao?: string;
}
export function prepararMovimentacao(
  materialId: number,
  tipo: TipoMovimentacaoResiduo,
  quantidade: string,
  descricao: string,
): { corpo?: MovimentacaoResiduoRequestDTO; campos: CamposMovimentacao } {
  const campos: CamposMovimentacao = {};
  const texto = quantidade.trim();
  // Vírgula e ponto são separadores decimais, nunca separadores de milhar.
  const valor = /^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(texto)
    ? Number(texto.replace(",", "."))
    : NaN;
  if (!Number.isFinite(valor) || valor <= 0)
    campos.quantidade = "Informe uma quantidade maior que zero, sem sinal. Use vírgula ou ponto para decimais, sem separador de milhar.";
  if (!descricao.trim()) campos.descricao = "Descreva o motivo desta movimentação.";
  else if (descricao.trim().length > 255)
    campos.descricao = "Use até 255 caracteres para o motivo da movimentação.";
  if (!Number.isSafeInteger(materialId) || materialId <= 0)
    throw new Error("Escolha um material válido antes de registrar.");
  if (tipo !== "ENTRADA" && tipo !== "SAIDA")
    throw new Error("Escolha entrada ou saída.");
  if (Object.keys(campos).length) return { campos };
  return {
    campos,
    corpo: {
      materialId,
      movimentacaoResiduo: tipo,
      quantidade: tipo === "SAIDA" ? -valor : valor,
      descricao: descricao.trim(),
    },
  };
}

export function camposDaApi(erro: unknown): CamposMovimentacao {
  const campos: CamposMovimentacao = {};
  if (!(erro instanceof ErroApi)) return campos;
  for (const campo of erro.detalhes?.campos ?? []) {
    // AssertTrue do DTO aparece com o nome da propriedade derivada pelo Java.
    if (campo.campo === "quantidade" || campo.campo === "quantidadeDiferenteDeZero")
      campos.quantidade = campo.mensagem;
    if (campo.campo === "descricao") campos.descricao = campo.mensagem;
  }
  return campos;
}

// Uma resposta perdida ou inválida não comprova que o POST deixou de gravar.
// Também não repetimos automaticamente um 5xx, que pode ocorrer após a gravação.
export function gravacaoIncerta(erro: unknown) {
  return !(erro instanceof ErroApi) ||
    erro.categoria === "rede" || erro.categoria === "tempo" ||
    erro.categoria === "cancelamento" || erro.categoria === "resposta" ||
    (erro.status !== null && erro.status >= 500);
}
