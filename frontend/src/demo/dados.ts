import type {
  MaterialComSaldoResponseDTO,
  MovimentacaoResiduoResponseDTO,
} from "../api/tipos";

// CAMADA: Demonstração
// RESPONSABILIDADE: fornecer dados ilustrativos para revisar a estrutura visual.
// REGRAS: estes dados não representam uma resposta da API e não são persistidos.
// SITUAÇÃO: fonte de demonstração explícita e separada das consultas HTTP

export const materiais: MaterialComSaldoResponseDTO[] = [
  {
    id: 1,
    nome: "Sucata de alumínio",
    unidadeMedida: "QUILO",
    precoPorUnidade: 8.5,
    saldo: 1480,
    tipoMaterial: { id: 1, nome: "Metal" },
  },
  {
    id: 2,
    nome: "Retalhos de aço",
    unidadeMedida: "QUILO",
    precoPorUnidade: 2.8,
    saldo: 2340,
    tipoMaterial: { id: 1, nome: "Metal" },
  },
  {
    id: 3,
    nome: "Polietileno",
    unidadeMedida: "QUILO",
    precoPorUnidade: 4.2,
    saldo: 420,
    tipoMaterial: { id: 2, nome: "Plástico" },
  },
  {
    id: 4,
    nome: "Retalhos de PVC",
    unidadeMedida: "QUILO",
    precoPorUnidade: 3.6,
    saldo: 180,
    tipoMaterial: { id: 2, nome: "Plástico" },
  },
  {
    id: 5,
    nome: "Sobras de pinus",
    unidadeMedida: "METRO",
    precoPorUnidade: 12,
    saldo: 64,
    tipoMaterial: { id: 3, nome: "Madeira" },
  },
  {
    id: 6,
    nome: "Aparas de MDF",
    unidadeMedida: "PECA",
    precoPorUnidade: 8,
    saldo: 35,
    tipoMaterial: { id: 3, nome: "Madeira" },
  },
];

// Mantém o extrato ilustrativo consistente com o saldo exibido em cada material.
export function movimentacoesDe(
  material: MaterialComSaldoResponseDTO,
): MovimentacaoResiduoResponseDTO[] {
  const segundaEntrada = Math.round(material.saldo * 0.4);
  return [
    {
      id: 3,
      material: {
        id: material.id,
        nome: material.nome,
        unidadeMedida: material.unidadeMedida,
        precoPorUnidade: material.precoPorUnidade,
        tipoMaterial: material.tipoMaterial,
      },
      tipoMovimentacaoResiduo: "SAIDA" as const,
      quantidade: -20,
      descricao: "Destinação para reaproveitamento",
      criadoEm: "2026-10-15T14:23:11",
    },
    {
      id: 2,
      material: {
        id: material.id,
        nome: material.nome,
        unidadeMedida: material.unidadeMedida,
        precoPorUnidade: material.precoPorUnidade,
        tipoMaterial: material.tipoMaterial,
      },
      tipoMovimentacaoResiduo: "ENTRADA" as const,
      quantidade: segundaEntrada + 20,
      descricao: "Sobra da produção da manhã",
      criadoEm: "2026-10-15T09:10:47",
    },
    {
      id: 1,
      material: {
        id: material.id,
        nome: material.nome,
        unidadeMedida: material.unidadeMedida,
        precoPorUnidade: material.precoPorUnidade,
        tipoMaterial: material.tipoMaterial,
      },
      tipoMovimentacaoResiduo: "ENTRADA" as const,
      quantidade: material.saldo - segundaEntrada,
      descricao: "Registro inicial de estoque",
      criadoEm: "2026-10-14T16:35:00",
    },
  ];
}
