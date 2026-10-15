import { resolverConfiguracao } from "./api/configuracao";

// CAMADA: Config
// RESPONSABILIDADE: ler somente as variáveis públicas usadas no build do frontend.
// SITUAÇÃO: implementada; nenhum segredo deve ser colocado em uma variável VITE_*
export const ambiente = resolverConfiguracao(
  import.meta.env,
  import.meta.env.PROD,
);
