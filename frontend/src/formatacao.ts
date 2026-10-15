// CAMADA: Apresentação
// RESPONSABILIDADE: formatar valores sem alterar o contrato ou as regras do backend.
// SITUAÇÃO: implementada
export const moeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    valor,
  );
export const quantidade = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 }).format(valor);
export const unidades = {
  QUILO: "kg",
  METRO: "m",
  PECA: "peças",
  UNIDADE: "un.",
};
export const dataHora = (valor: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));

// Ignorar acentos torna a busca em português previsível: "aco" encontra "aço".
export const normalizar = (valor: string) =>
  valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
