import { useEffect, useId, useRef, useState } from "react";
import { ambiente } from "../ambiente";
import { api } from "../api";
import type { RegistroRequisicao } from "../api/client";
import { observarRequisicoes } from "../api/eventos";
import type { MaterialComSaldoResponseDTO } from "../api/tipos";
import { BlocoJson } from "../components/BlocoJson";
import { quantidade, unidades } from "../formatacao";
import { classificarFalha, prepararCenario, type FalhaLaboratorio, type RegraLaboratorio } from "./cenarios";

// CAMADA: Laboratório didático
// RESPONSABILIDADE: tornar RequestDTO e rejeição de regra observáveis com POST explícito.
// REGRAS: não simular erros; não repetir nem desfazer gravações; conferir resultados incertos.
// SITUAÇÃO: recolhido por padrão, sem HTTP em demo; Java real ainda exige validação
export function LaboratorioRegras({ material, aoConferir, aoExecutar }: {
  material: MaterialComSaldoResponseDTO;
  aoConferir: (aviso: string) => void;
  aoExecutar?: (enviando: boolean) => void;
}) {
  const id = useId();
  const [regra, setRegra] = useState<RegraLaboratorio>("R1");
  const [cenario, setCenario] = useState(() => prepararCenario("R1", material));
  const [resultado, setResultado] = useState<(FalhaLaboratorio & { idCriado?: number }) | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [conferenciaSolicitada, setConferenciaSolicitada] = useState(false);
  const emEnvio = useRef(false);
  const tentativaExecutada = useRef(false);
  useEffect(() => () => { if (emEnvio.current) aoExecutar?.(false); }, [aoExecutar]);
  const materialAoConferir = useRef<MaterialComSaldoResponseDTO | null>(null);
  const demo = ambiente.modo === "demo";
  const precisaConferir = resultado?.tipo === "incerta";
  // O pai pode desmontar ao consultar e preservar o aviso na página. Se mantiver
  // o componente, só um novo snapshot libera outra preparação.
  const conferido = conferenciaSolicitada && materialAoConferir.current !== material;
  const bloqueado = Boolean(precisaConferir && !conferido);
  const selecaoPendente = regra !== cenario.regra;
  const dadosMudaram = material !== cenario.material && (
    material.id !== cenario.material.id || material.saldo !== cenario.material.saldo ||
    material.nome !== cenario.material.nome || material.precoPorUnidade !== cenario.material.precoPorUnidade ||
    material.unidadeMedida !== cenario.material.unidadeMedida || material.tipoMaterial.id !== cenario.material.tipoMaterial.id
  );

  function preparar() {
    if (emEnvio.current || bloqueado) return;
    tentativaExecutada.current = false;
    setCenario(prepararCenario(regra, material));
    setResultado(null);
    setConferenciaSolicitada(false);
    materialAoConferir.current = null;
  }
  async function executar() {
    if (emEnvio.current || tentativaExecutada.current || resultado || demo || ambiente.erro || selecaoPendente || dadosMudaram || !cenario.corpo || cenario.impedimento) return;
    tentativaExecutada.current = true;
    emEnvio.current = true;
    setEnviando(true);
    aoExecutar?.(true);
    // A API tipada devolve o DTO, enquanto o evento central conserva status e
    // corpo bruto (inclusive em resposta de contrato inválido). Observamos só
    // este POST, sem introduzir outro transporte ou alterar o cliente central.
    const observado: { atual?: RegistroRequisicao } = {};
    const corpoEnviado = JSON.stringify(cenario.corpo);
    const deixarDeObservar = observarRequisicoes((registro) => {
      if (registro.rota.metodo === "POST" && registro.rota.caminho === cenario.caminho && JSON.stringify(registro.corpoEnviado) === corpoEnviado)
        observado.atual = registro;
    });
    // cenario é um snapshot: recolher o details não cancela o POST já enviado.
    try {
      const resposta = cenario.regra === "R3"
        ? await api.criarMaterial(cenario.corpo)
        : await api.criarMovimentacao(cenario.corpo);
      const idCriado = resposta?.id;
      setResultado({ tipo: "incerta", status: observado.atual?.status ?? null, corpo: observado.atual ? observado.atual.corpoRecebido : resposta,
        mensagem: `A API aceitou a tentativa que deveria falhar${idCriado ? ` e retornou o ID ${idCriado}` : ""}. Pode ter criado um registro. Confira os dados e os bastidores; nenhuma exclusão será feita automaticamente.`, idCriado });
    } catch (causa) {
      const falha = classificarFalha(cenario.regra, causa);
      const corpoReal = observado.atual ? observado.atual.corpoRecebido : falha.corpo;
      const idRecebido = corpoReal !== null && typeof corpoReal === "object" && "id" in corpoReal && typeof corpoReal.id === "number" && Number.isSafeInteger(corpoReal.id) && corpoReal.id > 0 ? corpoReal.id : undefined;
      const idCriado = observado.atual?.status && observado.atual.status >= 200 && observado.atual.status < 300 ? idRecebido : undefined;
      setResultado({ ...falha, corpo: corpoReal, status: observado.atual?.status ?? falha.status, idCriado,
        mensagem: idCriado ? `${falha.mensagem} O corpo recebido contém o ID ${idCriado}; confira os dados, pois o POST pode ter gravado.` : falha.mensagem });
    } finally {
      emEnvio.current = false;
      setEnviando(false);
      deixarDeObservar();
      aoExecutar?.(false);
    }
  }
  function conferir() {
    if (!resultado || emEnvio.current) return;
    materialAoConferir.current = material;
    setConferenciaSolicitada(true);
    aoConferir(`Laboratório ${cenario.regra}: ${resultado.idCriado ? `a API aceitou a tentativa e retornou o ID ${resultado.idCriado}` : "o resultado da tentativa pode ter sido persistido"}. Confira saldo e extrato${cenario.regra === "R3" ? " e a lista de materiais no painel" : ""} antes de preparar outra tentativa. Nenhuma exclusão foi realizada.`);
  }

  return <details className="ec-rule-lab">
    <summary><span>Laboratório de regras</span><span className="ec-rule-lab-tag">R1 · R2 · R3</span></summary>
    <div className="ec-rule-lab-content">
      <p className="ec-rule-lab-intro">Prepare uma tentativa deliberadamente inválida e observe a resposta real da API. A requisição só sai ao executar. Uma aceitação inesperada pode criar um registro.</p>
      {demo && <p className="ec-rule-lab-notice" id={`${id}-demo`}>Dados de exemplo: você pode explorar os cenários e o JSON. Executar exige o modo API; nenhum erro ou pedido HTTP será simulado.</p>}
      <div className="ec-rule-lab-prepare">
        <label htmlFor={`${id}-regra`}>Cenário
          <select id={`${id}-regra`} value={regra} disabled={enviando || bloqueado} onChange={(evento) => setRegra(evento.target.value as RegraLaboratorio)}>
            <option value="R1">R1 · Saída maior que o saldo</option>
            <option value="R2">R2 · Entrada com sinal negativo</option>
            <option value="R3">R3 · Material duplicado</option>
          </select>
        </label>
        <button type="button" className="ec-button ec-button-secondary" disabled={enviando || bloqueado} onClick={preparar}>Preparar cenário</button>
      </div>
      {selecaoPendente && <p className="ec-rule-lab-notice">Use Preparar cenário para trocar o corpo exibido para {regra}.</p>}
      <section className="ec-rule-lab-scenario" aria-label={`Cenário preparado ${cenario.regra}`}>
        <h3>{cenario.regra} · Tentativa preparada</h3>
        <p>{cenario.explicacao}</p>
        <p>Material: <strong>{cenario.material.nome}</strong> · saldo na preparação: {quantidade(cenario.material.saldo)} {unidades[cenario.material.unidadeMedida]}.</p>
        <code className="ec-rule-lab-route">POST {cenario.caminho}</code>
        <p>Esperado: <strong>HTTP 400</strong>, sem erros de campo, com a mensagem de regra: <q>{cenario.esperado}</q></p>
        <BlocoJson titulo="RequestDTO preparado" valor={cenario.corpo ?? undefined} />
      </section>
      {dadosMudaram && <p className="ec-rule-lab-notice">Os dados consultados mudaram. Prepare o cenário novamente para revisar o corpo antes de executar.</p>}
      {cenario.impedimento && <p className="ec-rule-lab-notice">{cenario.impedimento}</p>}
      {ambiente.erro && <p className="ec-rule-lab-notice">{ambiente.erro}</p>}
      {!demo && !resultado && <p className="ec-rule-lab-notice">A tentativa usa a API configurada e pode gravar dados se for aceita. Este laboratório não cria um ambiente isolado automaticamente.</p>}
      {!resultado && <button type="button" className="ec-button ec-button-secondary" onClick={executar} disabled={demo || enviando || selecaoPendente || dadosMudaram || Boolean(cenario.impedimento) || Boolean(ambiente.erro)} aria-describedby={demo ? `${id}-demo` : undefined}>{enviando ? "Executando tentativa…" : "Executar tentativa"}</button>}
      <div aria-live="polite" aria-atomic="true">
        {enviando && <p>Pedido enviado. Recolher o laboratório não cancela a gravação.</p>}
        {resultado && <section className={`ec-rule-lab-result ${resultado.tipo === "regra" ? "ec-rule-lab-result-rule" : "ec-rule-lab-result-warning"}`}>
          <h3>{resultado.tipo === "regra" ? `${cenario.regra} demonstrada pela resposta da API` : resultado.tipo === "dto" ? "O DTO foi rejeitado; a regra não foi demonstrada" : resultado.tipo === "incerta" ? "Confira os dados antes de outra tentativa" : "A resposta não demonstrou a regra esperada"}</h3>
          <p>{resultado.mensagem}</p>
          <p>{resultado.status !== null ? `Status recebido: HTTP ${resultado.status}.` : "O status não está disponível neste resultado; consulte o pedido nos bastidores."}</p>
          <BlocoJson titulo="Corpo real disponível na resposta" valor={resultado.corpo} />
          {resultado.corpo === undefined && <p>Este erro não contém um ErroDTO. O corpo e o status observados pelo transporte ficam nos bastidores, quando disponíveis.</p>}
          {precisaConferir && <>
            <p>Novos envios ficam bloqueados até uma nova consulta dos dados. Não há repetição automática do POST.</p>
            <button type="button" className="ec-button ec-button-secondary" onClick={conferir}>Conferir dados</button>
            {conferenciaSolicitada && <p>{conferido ? "Nova consulta recebida. Revise os dados e use Preparar cenário se quiser outra tentativa." : "Aguardando uma nova consulta do material. Se a consulta falhar, recupere-a antes de continuar."}</p>}
          </>}
          {!bloqueado && <p>Para outra tentativa, escolha um cenário e use Preparar cenário. O resultado só é limpo nessa preparação explícita.</p>}
        </section>}
      </div>
      <p className="ec-rule-lab-footnote">Somente HTTP 400 com ErroDTO, campos vazios e a mensagem correspondente comprova a rejeição esperada. A explicação do Service vem do código; não é rastreamento da execução. Histórico de rede disponível em Bastidores.</p>
    </div>
  </details>;
}
