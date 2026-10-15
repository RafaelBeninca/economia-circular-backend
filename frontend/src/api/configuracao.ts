// CAMADA: Config
// RESPONSABILIDADE: distinguir demonstração de API e validar a configuração pública.
// REGRAS: produção com API exige URL HTTPS explícita; falhas não ativam o modo demo.
// SITUAÇÃO: implementada sem dependência do Vite, permitindo testes de configuração
export interface ConfiguracaoDados {
  modo: "demo" | "api";
  apiUrl: string | null;
  erro: string | null;
}
export function resolverConfiguracao(
  variaveis: { VITE_MODO_DADOS?: string; VITE_API_URL?: string },
  producao: boolean,
): ConfiguracaoDados {
  const modo = variaveis.VITE_MODO_DADOS?.trim() || "demo";
  if (modo !== "demo" && modo !== "api")
    return {
      modo: "api",
      apiUrl: null,
      erro: "O modo de dados configurado não é válido.",
    };
  if (modo === "demo") return { modo, apiUrl: null, erro: null };
  const endereco =
    variaveis.VITE_API_URL?.trim() || (producao ? "" : "http://localhost:8080");
  try {
    const url = new URL(endereco);
    if (
      !["http:", "https:"].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (producao && url.protocol !== "https:")
    )
      throw new Error();
    return { modo, apiUrl: url.toString().replace(/\/+$/, ""), erro: null };
  } catch {
    return {
      modo,
      apiUrl: null,
      erro: producao
        ? "O endereço HTTPS da API precisa ser configurado para este ambiente."
        : "O endereço da API configurado não é válido.",
    };
  }
}
