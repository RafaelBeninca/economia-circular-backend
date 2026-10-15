import type {
  ErroDTO,
  MaterialComSaldoResponseDTO,
  MaterialResponseDTO,
  MovimentacaoResiduoResponseDTO,
  TipoMaterialResponseDTO,
} from "./tipos";

// CAMADA: Contrato
// RESPONSABILIDADE: reconhecer o formato recebido antes de renderizar dados externos.
// REGRAS: valida estrutura de resposta; não replica as regras R1, R2 ou R3.
// SITUAÇÃO: implementada
const objeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;
const numero = (valor: unknown): valor is number =>
  typeof valor === "number" && Number.isFinite(valor);
const id = (valor: unknown) =>
  numero(valor) && Number.isSafeInteger(valor) && valor > 0;
export const ehTipoMaterial = (
  valor: unknown,
): valor is TipoMaterialResponseDTO =>
  objeto(valor) && id(valor.id) && typeof valor.nome === "string";
const ehMaterial = (valor: unknown): valor is MaterialResponseDTO =>
  objeto(valor) &&
  id(valor.id) &&
  typeof valor.nome === "string" &&
  numero(valor.precoPorUnidade) &&
  ["UNIDADE", "PECA", "METRO", "QUILO"].includes(String(valor.unidadeMedida)) &&
  ehTipoMaterial(valor.tipoMaterial);
export const ehMaterialComSaldo = (
  valor: unknown,
): valor is MaterialComSaldoResponseDTO =>
  ehMaterial(valor) && "saldo" in valor && numero(valor.saldo);
export const ehMovimentacao = (
  valor: unknown,
): valor is MovimentacaoResiduoResponseDTO =>
  objeto(valor) &&
  id(valor.id) &&
  ehMaterial(valor.material) &&
  ["ENTRADA", "SAIDA"].includes(String(valor.tipoMovimentacaoResiduo)) &&
  numero(valor.quantidade) &&
  typeof valor.descricao === "string" &&
  typeof valor.criadoEm === "string" &&
  Number.isFinite(Date.parse(valor.criadoEm));
export const listaDe =
  <T>(validar: (valor: unknown) => valor is T) =>
  (valor: unknown): valor is T[] =>
    Array.isArray(valor) && valor.every(validar);
export const ehErroDTO = (valor: unknown): valor is ErroDTO =>
  objeto(valor) &&
  numero(valor.status) &&
  typeof valor.erro === "string" &&
  typeof valor.mensagem === "string" &&
  typeof valor.caminho === "string" &&
  typeof valor.timestamp === "string" &&
  Array.isArray(valor.campos) &&
  valor.campos.every(
    (campo) =>
      objeto(campo) &&
      typeof campo.campo === "string" &&
      typeof campo.mensagem === "string",
  );
