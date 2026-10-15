// CAMADA: Contrato
// RESPONSABILIDADE: representar os DTOs Java sem confundir entidades com JSON.
// REGRAS: saldo só existe no material de /materiais; criadoEm só entra na resposta.
// SITUAÇÃO: tipos conferidos com os DTOs e o contrato do backend
export type TipoUnidadeMedida = "UNIDADE" | "PECA" | "METRO" | "QUILO";
export type TipoMovimentacaoResiduo = "ENTRADA" | "SAIDA";

export interface TipoMaterialRequestDTO {
  nome: string;
}
export interface TipoMaterialUpdateRequestDTO {
  nome: string;
}
export interface TipoMaterialResponseDTO {
  id: number;
  nome: string;
}
export interface MaterialRequestDTO {
  nome: string;
  precoPorUnidade: number;
  unidadeMedida: TipoUnidadeMedida;
  tipoMaterialId: number;
}
export interface MaterialUpdateRequestDTO {
  nome: string;
  precoPorUnidade: number;
}
export interface MaterialResponseDTO {
  id: number;
  nome: string;
  unidadeMedida: TipoUnidadeMedida;
  precoPorUnidade: number;
  tipoMaterial: TipoMaterialResponseDTO;
}
export interface MaterialComSaldoResponseDTO extends MaterialResponseDTO {
  saldo: number;
}
export interface MovimentacaoResiduoRequestDTO {
  materialId: number;
  movimentacaoResiduo: TipoMovimentacaoResiduo;
  quantidade: number;
  descricao: string;
}
export interface MovimentacaoResiduoResponseDTO {
  id: number;
  material: MaterialResponseDTO;
  tipoMovimentacaoResiduo: TipoMovimentacaoResiduo;
  quantidade: number;
  descricao: string;
  // LocalDateTime: ISO-8601 sem fuso. A apresentação não converte para UTC.
  criadoEm: string;
}
export interface CampoErroDTO {
  campo: string;
  mensagem: string;
}
export interface ErroDTO {
  status: number;
  erro: string;
  mensagem: string;
  caminho: string;
  timestamp: string;
  campos: CampoErroDTO[];
}
