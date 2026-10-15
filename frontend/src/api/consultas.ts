import { ambiente } from "../ambiente";
import { materiais, movimentacoesDe } from "../demo/dados";
import { api } from "./index";
import { ErroApi } from "./client";

// CAMADA: Dados da interface
// RESPONSABILIDADE: escolher a fonte configurada, mantendo exemplos separados de HTTP.
// REGRAS: nenhum erro de rede ativa demonstração automaticamente.
// SITUAÇÃO: leituras conectadas; escrita ficará nos formulários posteriores
export class MaterialNaoEncontrado extends Error {
  constructor() {
    super("O material não foi encontrado.");
    this.name = "MaterialNaoEncontrado";
  }
}
export function ehMaterialNaoEncontrado(erro: Error | null) {
  return (
    erro instanceof MaterialNaoEncontrado ||
    (erro instanceof ErroApi && erro.status === 404)
  );
}
export const consultas = {
  async listarMateriais(signal?: AbortSignal) {
    return ambiente.modo === "demo" ? materiais : api.listarMateriais(signal);
  },
  async consultarMaterial(id: number, signal?: AbortSignal) {
    if (!Number.isSafeInteger(id) || id <= 0) throw new MaterialNaoEncontrado();
    if (ambiente.modo === "demo") {
      const material = materiais.find((item) => item.id === id);
      if (!material) throw new MaterialNaoEncontrado();
      return { material, movimentacoes: movimentacoesDe(material) };
    }
    const [material, movimentacoes] = await Promise.all([
      api.buscarMaterial(id, signal),
      api.listarMovimentacoes(id, signal),
    ]);
    return { material, movimentacoes };
  },
};
