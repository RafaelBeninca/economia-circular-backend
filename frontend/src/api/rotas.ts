// CAMADA: Contrato didático
// RESPONSABILIDADE: centralizar as rotas e explicar os caminhos conhecidos no Java.
// REGRAS: as camadas são metadados declarados, nunca um rastreamento do servidor.
// SITUAÇÃO: catálogo das 14 rotas existentes, sem PUT para movimentações
export interface RotaApi {
  metodo: "GET" | "POST" | "PUT" | "DELETE";
  caminho: string;
  resumo: string;
  camadas: readonly string[];
  regras: readonly string[];
}

function rota(
  metodo: RotaApi["metodo"],
  caminho: string,
  resumo: string,
  entidade: string,
  operacao: string,
  regras: readonly string[] = [],
  repositorios?: string,
): RotaApi {
  return {
    metodo,
    caminho,
    resumo,
    regras,
    camadas: [
      `${entidade}Controller.${operacao}`,
      `${entidade}Service.${operacao}`,
      repositorios ?? `${entidade}Repository`,
      "PostgreSQL",
    ],
  };
}

export const rotas = {
  listarTipos: rota(
    "GET",
    "/tiposMateriais",
    "Listar tipos de materiais",
    "TipoMaterial",
    "listar",
  ),
  buscarTipo: rota(
    "GET",
    "/tiposMateriais/{id}",
    "Consultar um tipo de material",
    "TipoMaterial",
    "listarPorId",
  ),
  criarTipo: rota(
    "POST",
    "/tiposMateriais",
    "Cadastrar um tipo de material",
    "TipoMaterial",
    "criar",
  ),
  atualizarTipo: rota(
    "PUT",
    "/tiposMateriais/{id}",
    "Editar um tipo de material",
    "TipoMaterial",
    "atualizar",
  ),
  removerTipo: rota(
    "DELETE",
    "/tiposMateriais/{id}",
    "Remover um tipo de material",
    "TipoMaterial",
    "remover",
  ),
  listarMateriais: rota(
    "GET",
    "/materiais",
    "Listar materiais com saldo",
    "Material",
    "listar",
    [],
    "MaterialRepository + MovimentacaoResiduoRepository (soma agrupada)",
  ),
  buscarMaterial: rota(
    "GET",
    "/materiais/{id}",
    "Consultar um material com saldo",
    "Material",
    "listarPorId",
    [],
    "MaterialRepository + MovimentacaoResiduoRepository (soma por material)",
  ),
  criarMaterial: rota(
    "POST",
    "/materiais",
    "Cadastrar um material",
    "Material",
    "criar",
    ["R3: nome e unidade de medida não podem se repetir"],
    "TipoMaterialRepository + MaterialRepository",
  ),
  atualizarMaterial: rota(
    "PUT",
    "/materiais/{id}",
    "Editar um material",
    "Material",
    "atualizar",
    ["R3: nome e unidade de medida não podem se repetir"],
    "MaterialRepository + MovimentacaoResiduoRepository",
  ),
  removerMaterial: rota(
    "DELETE",
    "/materiais/{id}",
    "Remover um material",
    "Material",
    "remover",
  ),
  listarMovimentacoes: rota(
    "GET",
    "/movimentacoesResiduos",
    "Consultar movimentações, com filtro opcional por material",
    "MovimentacaoResiduo",
    "listar",
  ),
  buscarMovimentacao: rota(
    "GET",
    "/movimentacoesResiduos/{id}",
    "Consultar uma movimentação",
    "MovimentacaoResiduo",
    "listarPorId",
  ),
  criarMovimentacao: rota(
    "POST",
    "/movimentacoesResiduos",
    "Registrar uma entrada ou saída",
    "MovimentacaoResiduo",
    "criar",
    [
      "R2: entrada positiva e saída negativa",
      "R1: a saída não pode ultrapassar o saldo",
    ],
    "MaterialRepository + MovimentacaoResiduoRepository",
  ),
  removerMovimentacao: rota(
    "DELETE",
    "/movimentacoesResiduos/{id}",
    "Remover uma movimentação",
    "MovimentacaoResiduo",
    "remover",
  ),
} satisfies Record<string, RotaApi>;

export function comId(rotaBase: RotaApi, id: number): RotaApi {
  if (!Number.isSafeInteger(id) || id <= 0)
    throw new Error("O identificador precisa ser um número inteiro positivo.");
  return { ...rotaBase, caminho: rotaBase.caminho.replace("{id}", String(id)) };
}
