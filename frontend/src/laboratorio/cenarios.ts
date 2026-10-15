import { ErroApi } from "../api/client.ts";
import type { MaterialComSaldoResponseDTO, MaterialRequestDTO, MovimentacaoResiduoRequestDTO } from "../api/tipos";

// CAMADA: Laboratório didático
// RESPONSABILIDADE: preparar violações deliberadas e reconhecer respostas das regras Java.
// REGRAS: isto não valida movimentações normais; somente a API decide R1, R2 e R3.
// SITUAÇÃO: funções independentes de React para conferir limites e classificações
export type RegraLaboratorio = "R1" | "R2" | "R3";
interface CenarioBase {
  material: MaterialComSaldoResponseDTO;
  explicacao: string;
  impedimento: string | null;
  esperado: string;
}
export type CenarioLaboratorio = CenarioBase & (
  { regra: "R1" | "R2"; caminho: "/movimentacoesResiduos"; corpo: MovimentacaoResiduoRequestDTO | null } |
  { regra: "R3"; caminho: "/materiais"; corpo: MaterialRequestDTO }
);

// Somar 1 não aumenta todo Double (por exemplo, acima de 2^53). Usamos margem
// relativa e, perto do limite, o próximo valor representável. MAX_VALUE não tem
// sucessor finito: nesse caso é honesto impedir a demonstração, em vez de enviar null.
export function moduloMaiorQueSaldo(saldo: number): number | null {
  if (!Number.isFinite(saldo)) return null;
  if (saldo < 1) return 1;
  const margem = saldo + Math.max(1, saldo * 0.01);
  if (Number.isFinite(margem) && margem > saldo) return margem;
  const bits = new DataView(new ArrayBuffer(8));
  bits.setFloat64(0, saldo);
  bits.setBigUint64(0, bits.getBigUint64(0) + 1n);
  const proximo = bits.getFloat64(0);
  return Number.isFinite(proximo) && proximo > saldo ? proximo : null;
}

export function prepararCenario(regra: RegraLaboratorio, origem: MaterialComSaldoResponseDTO): CenarioLaboratorio {
  const material = structuredClone(origem);
  if (regra === "R3") return {
    regra, material, caminho: "/materiais",
    explicacao: "Reenviar o nome e a unidade deste material tenta criar um cadastro duplicado. Tipo e preço são copiados, mas não fazem parte da chave da R3.",
    esperado: "Já existe um material com esse nome e unidade de medida!",
    impedimento: !material.nome.trim() || !Number.isFinite(material.precoPorUnidade) || material.precoPorUnidade <= 0
      ? "Este cadastro não tem nome e preço positivo compatíveis com o RequestDTO. A tentativa não alcançaria a R3; escolha outro material."
      : null,
    corpo: { nome: material.nome, unidadeMedida: material.unidadeMedida, precoPorUnidade: material.precoPorUnidade, tipoMaterialId: material.tipoMaterial.id },
  };
  const modulo = regra === "R1" ? moduloMaiorQueSaldo(material.saldo) : 1;
  return {
    regra, material, caminho: "/movimentacoesResiduos",
    explicacao: regra === "R1"
      ? "A saída tem sinal negativo correto para passar pela R2, mas seu módulo excede o saldo consultado. O saldo pode mudar entre esta preparação e o POST: a API usa o valor do banco."
      : "A entrada leva quantidade -1. É um número diferente de zero, aceito pelo DTO, mas o Service deve recusar o sinal pela R2 antes de gravar.",
    esperado: regra === "R1" ? "Saída de … excede o saldo disponível de … do material!" : "Saída deve ter quantidade negativa e entrada, positiva!",
    impedimento: modulo === null ? "Não há quantidade finita maior que este saldo representável no JSON. Escolha outro material para demonstrar a R1." : null,
    corpo: modulo === null ? null : {
      materialId: material.id, movimentacaoResiduo: regra === "R1" ? "SAIDA" : "ENTRADA",
      quantidade: -modulo, descricao: `Laboratório ${regra}: tentativa deliberadamente inválida`,
    },
  };
}

export interface FalhaLaboratorio {
  tipo: "regra" | "dto" | "outra" | "incerta";
  mensagem: string;
  status: number | null;
  corpo: unknown;
}
const numeroJava = "[-+]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][-+]?[0-9]+)?";
const mensagemR1 = new RegExp(`^Saída de (${numeroJava}) excede o saldo disponível de (${numeroJava}) do material!$`);
export function classificarFalha(regra: RegraLaboratorio, causa: unknown): FalhaLaboratorio {
  const erro = causa instanceof ErroApi ? causa : null;
  const mensagem = causa instanceof Error ? causa.message : "Falha inesperada ao executar a tentativa.";
  const base = { mensagem, status: erro?.status ?? null, corpo: erro?.detalhes ?? undefined };
  if (!erro || ["rede", "tempo", "cancelamento", "resposta"].includes(erro.categoria) || (erro.status !== null && erro.status >= 500))
    return { ...base, tipo: "incerta" };
  if (erro.categoria !== "http" || erro.status !== 400 || !erro.detalhes || erro.detalhes.status !== 400)
    return { ...base, tipo: "outra" };
  if (erro.detalhes.campos.length > 0) return { ...base, tipo: "dto" };
  const recebida = erro.detalhes.mensagem;
  const numeros = mensagemR1.exec(recebida);
  const corresponde = regra === "R1"
    ? numeros !== null && Number.isFinite(Number(numeros[1])) && Number(numeros[1]) > 0 && Number.isFinite(Number(numeros[2])) && Number(numeros[1]) > Number(numeros[2])
    : regra === "R2" ? recebida === "Saída deve ter quantidade negativa e entrada, positiva!"
    : recebida === "Já existe um material com esse nome e unidade de medida!";
  return { ...base, tipo: corresponde ? "regra" : "outra" };
}
