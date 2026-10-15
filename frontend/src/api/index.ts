import { ambiente } from "../ambiente";
import { criarClienteApi } from "./client";
import { publicarRequisicao } from "./eventos";
import { comId, rotas } from "./rotas";
import {
  ehErroDTO,
  ehMaterialComSaldo,
  ehMovimentacao,
  ehTipoMaterial,
  listaDe,
} from "./validacao";
import type {
  MaterialComSaldoResponseDTO,
  MaterialRequestDTO,
  MaterialUpdateRequestDTO,
  MovimentacaoResiduoRequestDTO,
  MovimentacaoResiduoResponseDTO,
  TipoMaterialRequestDTO,
  TipoMaterialResponseDTO,
  TipoMaterialUpdateRequestDTO,
} from "./tipos";

// CAMADA: API
// RESPONSABILIDADE: oferecer operações tipadas sobre as rotas existentes.
// REGRAS: toda operação passa pelo cliente central; nenhum fetch vive nas telas.
// SITUAÇÃO: implementada; formulários de movimentação usam a operação de criação
const cliente = ambiente.apiUrl
  ? criarClienteApi({
      baseUrl: ambiente.apiUrl,
      reconhecerErro: ehErroDTO,
      aoConcluir: publicarRequisicao,
    })
  : null;
function clienteAtivo() {
  if (!cliente)
    throw new Error(
      ambiente.erro ?? "A consulta à API não está habilitada neste ambiente.",
    );
  return cliente;
}
export const api = {
  listarTipos: (signal?: AbortSignal) =>
    clienteAtivo()<TipoMaterialResponseDTO[]>(rotas.listarTipos, {
      signal,
      validar: listaDe(ehTipoMaterial),
    }),
  buscarTipo: (id: number, signal?: AbortSignal) =>
    clienteAtivo()<TipoMaterialResponseDTO>(comId(rotas.buscarTipo, id), {
      signal,
      validar: ehTipoMaterial,
    }),
  criarTipo: (corpo: TipoMaterialRequestDTO) =>
    clienteAtivo()<TipoMaterialResponseDTO>(rotas.criarTipo, {
      corpo,
      validar: ehTipoMaterial,
    }),
  atualizarTipo: (id: number, corpo: TipoMaterialUpdateRequestDTO) =>
    clienteAtivo()<TipoMaterialResponseDTO>(comId(rotas.atualizarTipo, id), {
      corpo,
      validar: ehTipoMaterial,
    }),
  removerTipo: (id: number) =>
    clienteAtivo()<void>(comId(rotas.removerTipo, id)),
  listarMateriais: (signal?: AbortSignal) =>
    clienteAtivo()<MaterialComSaldoResponseDTO[]>(rotas.listarMateriais, {
      signal,
      validar: listaDe(ehMaterialComSaldo),
    }),
  buscarMaterial: (id: number, signal?: AbortSignal) =>
    clienteAtivo()<MaterialComSaldoResponseDTO>(
      comId(rotas.buscarMaterial, id),
      { signal, validar: ehMaterialComSaldo },
    ),
  criarMaterial: (corpo: MaterialRequestDTO) =>
    clienteAtivo()<MaterialComSaldoResponseDTO>(rotas.criarMaterial, {
      corpo,
      validar: ehMaterialComSaldo,
    }),
  atualizarMaterial: (id: number, corpo: MaterialUpdateRequestDTO) =>
    clienteAtivo()<MaterialComSaldoResponseDTO>(
      comId(rotas.atualizarMaterial, id),
      { corpo, validar: ehMaterialComSaldo },
    ),
  removerMaterial: (id: number) =>
    clienteAtivo()<void>(comId(rotas.removerMaterial, id)),
  listarMovimentacoes: (materialId?: number, signal?: AbortSignal) =>
    clienteAtivo()<MovimentacaoResiduoResponseDTO[]>(
      rotas.listarMovimentacoes,
      { signal, consulta: { materialId }, validar: listaDe(ehMovimentacao) },
    ),
  buscarMovimentacao: (id: number, signal?: AbortSignal) =>
    clienteAtivo()<MovimentacaoResiduoResponseDTO>(
      comId(rotas.buscarMovimentacao, id),
      { signal, validar: ehMovimentacao },
    ),
  criarMovimentacao: (corpo: MovimentacaoResiduoRequestDTO) =>
    clienteAtivo()<MovimentacaoResiduoResponseDTO>(rotas.criarMovimentacao, {
      corpo,
      validar: ehMovimentacao,
    }),
  removerMovimentacao: (id: number) =>
    clienteAtivo()<void>(comId(rotas.removerMovimentacao, id)),
};
