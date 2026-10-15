import type { MaterialRequestDTO, TipoMaterialRequestDTO, TipoMaterialResponseDTO, TipoUnidadeMedida } from "../api/tipos";
import { ErroApi } from "../api/client.ts";

// CAMADA: Formulário
// RESPONSABILIDADE: preparar o contrato de cadastro e identificar mensagens dos campos.
// REGRAS: validar preenchimento do DTO; R3 e a existência do tipo continuam no servidor.
// SITUAÇÃO: implementada sem arredondar preço ou antecipar duplicidades
export interface CamposCadastro {
  nome?: string;
  precoPorUnidade?: string;
  unidadeMedida?: string;
  tipoMaterialId?: string;
}
export const unidadesCadastro: { valor: TipoUnidadeMedida; nome: string }[] = [
  { valor: "QUILO", nome: "Quilo (kg)" },
  { valor: "METRO", nome: "Metro (m)" },
  { valor: "PECA", nome: "Peça" },
  { valor: "UNIDADE", nome: "Unidade" },
];
function validarNome(nome: string): string | undefined {
  if (!nome.trim()) return "Informe um nome.";
  if (nome.trim().length > 255) return "Use até 255 caracteres para o nome.";
}
export function prepararTipo(nome: string): { corpo?: TipoMaterialRequestDTO; campos: CamposCadastro } {
  const erro = validarNome(nome);
  return erro ? { campos: { nome: erro } } : { corpo: { nome: nome.trim() }, campos: {} };
}
export function prepararMaterial(dados: {
  nome: string; precoPorUnidade: string; unidadeMedida: string; tipoMaterialId: string;
}, tipos: readonly TipoMaterialResponseDTO[]): { corpo?: MaterialRequestDTO; campos: CamposCadastro } {
  const campos: CamposCadastro = {};
  const erroNome = validarNome(dados.nome);
  if (erroNome) campos.nome = erroNome;
  const texto = dados.precoPorUnidade.trim();
  // Um separador é decimal; agrupamentos de milhar, expoentes e sinais não são aceitos.
  const preco = /^(?:\d+(?:[.,]\d+)?|[.,]\d+)$/.test(texto) ? Number(texto.replace(",", ".")) : NaN;
  if (!Number.isFinite(preco) || preco <= 0)
    campos.precoPorUnidade = "Informe um preço maior que zero. Use vírgula ou ponto decimal, sem separador de milhar.";
  const unidade = unidadesCadastro.find((item) => item.valor === dados.unidadeMedida)?.valor;
  if (!unidade) campos.unidadeMedida = "Escolha uma unidade de medida.";
  const tipoId = /^\d+$/.test(dados.tipoMaterialId) ? Number(dados.tipoMaterialId) : NaN;
  if (!Number.isSafeInteger(tipoId) || tipoId <= 0 || !tipos.some((item) => item.id === tipoId))
    campos.tipoMaterialId = "Escolha um tipo da lista. Se necessário, cadastre um tipo primeiro.";
  if (Object.keys(campos).length || !unidade) return { campos };
  return { campos, corpo: {
    nome: dados.nome.trim(), precoPorUnidade: preco, unidadeMedida: unidade, tipoMaterialId: tipoId,
  } };
}
export function camposCadastroDaApi(erro: unknown): CamposCadastro {
  const campos: CamposCadastro = {};
  if (!(erro instanceof ErroApi)) return campos;
  for (const item of erro.detalhes?.campos ?? []) {
    if (item.campo === "nome" || item.campo === "precoPorUnidade" || item.campo === "unidadeMedida" || item.campo === "tipoMaterialId")
      campos[item.campo] = item.mensagem;
  }
  return campos;
}
// Respostas confirmadas de criação não desaparecem se uma consulta iniciada antes terminar depois.
export function reunirTipos(consultados: readonly TipoMaterialResponseDTO[], confirmados: readonly TipoMaterialResponseDTO[]) {
  return [...new Map([...consultados, ...confirmados].map((tipo) => [tipo.id, tipo])).values()];
}
