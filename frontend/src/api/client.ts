import type { ErroDTO } from "./tipos";
import type { RotaApi } from "./rotas";

// CAMADA: Cliente HTTP
// RESPONSABILIDADE: enviar toda requisição, tratar falhas e registrar o resultado.
// REGRAS: falhas HTTP, de rede, de contrato e cancelamentos são casos distintos.
// SITUAÇÃO: implementada, com transporte injetável para verificação independente do Java
export type CategoriaErro =
  "http" | "rede" | "tempo" | "cancelamento" | "resposta" | "requisicao";
export class ErroApi extends Error {
  categoria: CategoriaErro;
  status: number | null;
  detalhes: ErroDTO | null;
  constructor(
    mensagem: string,
    categoria: CategoriaErro,
    status: number | null = null,
    detalhes: ErroDTO | null = null,
  ) {
    super(mensagem);
    this.name = "ErroApi";
    this.categoria = categoria;
    this.status = status;
    this.detalhes = detalhes;
  }
}

export interface RegistroRequisicao {
  id: string;
  instante: string;
  rota: RotaApi;
  url: string;
  corpoEnviado: unknown;
  corpoRecebido: unknown;
  status: number | null;
  duracaoMs: number;
  resultado: "sucesso" | "erro" | "cancelada";
  mensagemErro: string | null;
}
interface OpcoesRequisicao<T> {
  corpo?: unknown;
  consulta?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  validar?: (valor: unknown) => valor is T;
}
interface OpcoesCliente {
  baseUrl: string;
  tempoLimiteMs?: number;
  transporte?: typeof fetch;
  aoConcluir?: (registro: RegistroRequisicao) => void;
  reconhecerErro?: (valor: unknown) => valor is ErroDTO;
}

export function criarClienteApi({
  baseUrl,
  tempoLimiteMs = 15000,
  transporte = globalThis.fetch,
  aoConcluir,
  reconhecerErro,
}: OpcoesCliente) {
  const base = new URL(baseUrl);
  if (
    !["http:", "https:"].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new Error(
      "O endereço da API precisa ser HTTP(S), sem credenciais, consulta ou fragmento.",
    );
  if (!Number.isFinite(tempoLimiteMs) || tempoLimiteMs <= 0)
    throw new Error("O tempo limite precisa ser positivo.");
  base.pathname = base.pathname.replace(/\/+$/, "") + "/";

  return async function requisitar<T>(
    rota: RotaApi,
    opcoes: OpcoesRequisicao<T> = {},
  ): Promise<T> {
    const url = new URL(rota.caminho.replace(/^\//, ""), base);
    for (const [chave, valor] of Object.entries(opcoes.consulta ?? {}))
      if (valor !== undefined) url.searchParams.set(chave, String(valor));
    const controle = new AbortController();
    const cancelar = () => controle.abort();
    opcoes.signal?.addEventListener("abort", cancelar, { once: true });
    if (opcoes.signal?.aborted) cancelar();
    let expirou = false;
    const limite = setTimeout(() => {
      expirou = true;
      controle.abort();
    }, tempoLimiteMs);
    const inicio = performance.now();
    const registro: RegistroRequisicao = {
      id: crypto.randomUUID(),
      instante: new Date().toISOString(),
      rota,
      url: url.toString(),
      corpoEnviado: undefined,
      corpoRecebido: undefined,
      status: null,
      duracaoMs: 0,
      resultado: "erro",
      mensagemErro: null,
    };
    try {
      let corpoSerializado: string | undefined;
      try {
        corpoSerializado =
          opcoes.corpo !== undefined ? JSON.stringify(opcoes.corpo) : undefined;
        if (opcoes.corpo !== undefined && corpoSerializado === undefined)
          throw new Error();
        registro.corpoEnviado =
          corpoSerializado === undefined
            ? undefined
            : JSON.parse(corpoSerializado);
      } catch {
        throw new ErroApi(
          "Os dados da solicitação não puderam ser convertidos para JSON.",
          "requisicao",
        );
      }
      const resposta = await transporte(url.toString(), {
        method: rota.metodo,
        headers: {
          Accept: "application/json",
          ...(opcoes.corpo !== undefined
            ? { "Content-Type": "application/json" }
            : {}),
        },
        body: corpoSerializado,
        credentials: "omit",
        signal: controle.signal,
      });
      registro.status = resposta.status;
      const texto = resposta.status === 204 ? "" : await resposta.text();
      let jsonValido = false;
      if (texto) {
        try {
          registro.corpoRecebido = JSON.parse(texto);
          jsonValido = true;
        } catch {
          registro.corpoRecebido = texto;
        }
      }
      if (!resposta.ok) {
        const detalhes = reconhecerErro?.(registro.corpoRecebido)
          ? (registro.corpoRecebido as ErroDTO)
          : null;
        throw new ErroApi(
          detalhes?.mensagem ??
            `A API não conseguiu concluir a solicitação (HTTP ${resposta.status}).`,
          "http",
          resposta.status,
          detalhes,
        );
      }
      if (
        resposta.status !== 204 &&
        (!jsonValido ||
          (opcoes.validar && !opcoes.validar(registro.corpoRecebido)))
      )
        throw new ErroApi(
          "A API devolveu uma resposta em formato inesperado.",
          "resposta",
          resposta.status,
        );
      registro.resultado = "sucesso";
      return (
        resposta.status === 204 ? undefined : registro.corpoRecebido
      ) as T;
    } catch (causa) {
      const erro = controle.signal.aborted
        ? new ErroApi(
            expirou
              ? "A API demorou para responder. Tente novamente."
              : "A consulta foi cancelada.",
            expirou ? "tempo" : "cancelamento",
            registro.status,
          )
        : causa instanceof ErroApi
          ? causa
          : new ErroApi(
              "Não foi possível acessar a API. Confira se o servidor está disponível e permite o acesso deste endereço.",
              "rede",
              registro.status,
            );
      registro.resultado =
        erro.categoria === "cancelamento" ? "cancelada" : "erro";
      registro.mensagemErro = erro.message;
      throw erro;
    } finally {
      clearTimeout(limite);
      opcoes.signal?.removeEventListener("abort", cancelar);
      registro.duracaoMs = Math.round(performance.now() - inicio);
      // Uma falha na exibição dos bastidores não pode mudar o resultado HTTP.
      try {
        aoConcluir?.(structuredClone(registro));
      } catch {
        /* O transporte já terminou; observadores são independentes. */
      }
    }
  };
}
