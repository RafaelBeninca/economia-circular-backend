import { useEffect, useRef, useState, type FormEvent } from "react";
import { ambiente } from "../ambiente";
import { api } from "../api";
import type { MaterialComSaldoResponseDTO, MovimentacaoResiduoResponseDTO, TipoMovimentacaoResiduo } from "../api/tipos";
import { quantidade, unidades } from "../formatacao";
import { Icone } from "../components/Icone";
import { camposDaApi, gravacaoIncerta, prepararMovimentacao, type CamposMovimentacao } from "./movimentacao";

// CAMADA: Formulário
// RESPONSABILIDADE: registrar uma entrada ou saída e preservar o preenchimento em falhas.
// REGRAS: envio único, sem repetição automática; somente a API confirma a gravação.
// SITUAÇÃO: implementada; no modo demo permite explorar sem gravar nem emitir HTTP
export function FormularioMovimentacao({ material, tipo, aoFechar, aoConfirmar }: {
  material: MaterialComSaldoResponseDTO;
  tipo: TipoMovimentacaoResiduo;
  aoFechar: () => void;
  aoConfirmar: (registro: MovimentacaoResiduoResponseDTO) => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const campoQuantidade = useRef<HTMLInputElement>(null);
  const campoDescricao = useRef<HTMLTextAreaElement>(null);
  const resumoErro = useRef<HTMLDivElement>(null);
  const emEnvio = useRef(false);
  const montado = useRef(true);
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [campos, setCampos] = useState<CamposMovimentacao>({});
  const [erro, setErro] = useState<string | null>(null);
  const [incerta, setIncerta] = useState(false);
  const entrada = tipo === "ENTRADA";
  const demo = ambiente.modo === "demo";

  useEffect(() => {
    montado.current = true;
    const elemento = dialogo.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.documentElement.style.overflow;
    elemento?.showModal();
    campoQuantidade.current?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => {
      montado.current = false;
      elemento?.close();
      document.documentElement.style.overflow = overflowAnterior;
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected)
        focoAnterior.focus();
    };
  }, []);
  useEffect(() => {
    if (erro) resumoErro.current?.focus();
  }, [erro]);

  function fechar() {
    if (!emEnvio.current) aoFechar();
  }
  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (emEnvio.current || incerta || demo) return;
    const preparado = prepararMovimentacao(material.id, tipo, valor, descricao);
    setCampos(preparado.campos);
    setErro(null);
    if (!preparado.corpo) {
      if (preparado.campos.quantidade) campoQuantidade.current?.focus();
      else campoDescricao.current?.focus();
      return;
    }
    emEnvio.current = true;
    setEnviando(true);
    let registro: MovimentacaoResiduoResponseDTO;
    try {
      registro = await api.criarMovimentacao(preparado.corpo);
    } catch (causa) {
      if (montado.current) {
        setCampos(camposDaApi(causa));
        setErro(causa instanceof Error ? causa.message : "Não foi possível confirmar o registro.");
        setIncerta(gravacaoIncerta(causa));
      }
      return;
    } finally {
      emEnvio.current = false;
      if (montado.current) setEnviando(false);
    }
    // A confirmação do POST é independente de uma eventual falha no GET seguinte.
    if (montado.current) aoConfirmar(registro);
  }

  return (
    <dialog ref={dialogo} className="ec-movement-dialog" aria-labelledby="movimento-titulo"
      aria-describedby="movimento-contexto"
      onCancel={(evento) => { evento.preventDefault(); fechar(); }}
      onClick={(evento) => { if (evento.target === evento.currentTarget) {
        const area = evento.currentTarget.getBoundingClientRect();
        if (evento.clientX < area.left || evento.clientX > area.right || evento.clientY < area.top || evento.clientY > area.bottom) fechar();
      } }}>
      <form onSubmit={enviar} noValidate aria-busy={enviando}>
        <header className="ec-movement-dialog-header">
          <span className={`ec-movement-icon ${entrada ? "ec-movement-in" : "ec-movement-out"}`}>
            <Icone nome={entrada ? "entrada" : "saida"} />
          </span>
          <button type="button" className="ec-icon-button" aria-label="Fechar formulário" disabled={enviando} onClick={fechar}><Icone nome="fechar" /></button>
        </header>
        <span className="ec-eyebrow">MOVIMENTAR MATERIAL</span>
        <h2 id="movimento-titulo">Registrar {entrada ? "entrada" : "saída"}</h2>
        <p id="movimento-contexto" className="ec-form-context">{material.nome} · saldo consultado de <strong>{quantidade(material.saldo)} {unidades[material.unidadeMedida]}</strong></p>
        {demo && <p className="ec-form-notice">Prévia com dados de exemplo. Você pode explorar os campos; para registrar, use o modo API. Nenhum dado será salvo nesta prévia.</p>}
        {erro && <div className="ec-form-error" role="alert" tabIndex={-1} ref={resumoErro}>
          <strong>{incerta ? "Confira o extrato antes de tentar de novo" : "O registro não foi concluído"}</strong>
          <p>{erro}</p>
          {incerta && <p>A solicitação pode ter sido gravada. Feche este formulário e use Atualizar extrato para conferir antes de abrir um novo registro.</p>}
        </div>}
        <div className="ec-form-field">
          <label htmlFor="movimento-quantidade">Quantidade ({unidades[material.unidadeMedida]}) <span>obrigatório</span></label>
          <input id="movimento-quantidade" name="quantidade" ref={campoQuantidade} type="text" inputMode="decimal" autoComplete="off" required
            placeholder="Ex.: 15,5" value={valor} disabled={enviando || incerta}
            aria-invalid={Boolean(campos.quantidade)} aria-describedby={`quantidade-ajuda${campos.quantidade ? " quantidade-erro" : ""}`}
            onChange={(evento) => { setValor(evento.target.value); setCampos((atual) => ({ ...atual, quantidade: undefined })); }} />
          <p id="quantidade-ajuda" className="ec-field-help">Informe um valor positivo, sem separador de milhar. {entrada ? "Essa quantidade será adicionada ao estoque." : "Essa quantidade será retirada do estoque. A disponibilidade será conferida ao registrar."}</p>
          {campos.quantidade && <p id="quantidade-erro" className="ec-field-error">{campos.quantidade}</p>}
        </div>
        <div className="ec-form-field">
          <label htmlFor="movimento-descricao">Motivo da movimentação <span>obrigatório</span></label>
          <textarea id="movimento-descricao" name="descricao" ref={campoDescricao} rows={3} required maxLength={255}
            placeholder={entrada ? "Ex.: Sobra da produção de hoje" : "Ex.: Destinação para reaproveitamento"}
            value={descricao} disabled={enviando || incerta} aria-invalid={Boolean(campos.descricao)}
            aria-describedby={campos.descricao ? "descricao-erro" : undefined}
            onChange={(evento) => { setDescricao(evento.target.value); setCampos((atual) => ({ ...atual, descricao: undefined })); }} />
          {campos.descricao && <p id="descricao-erro" className="ec-field-error">{campos.descricao}</p>}
          <p className="ec-field-help">Até 255 caracteres.</p>
        </div>
        <p className="ec-form-progress" role="status">{enviando ? "Registrando. Aguarde a confirmação antes de sair." : ""}</p>
        <footer className="ec-form-actions">
          <button type="button" className="ec-button ec-button-secondary" onClick={fechar} disabled={enviando}>{incerta ? "Fechar e conferir extrato" : "Cancelar"}</button>
          {!incerta && <button type="submit" className="ec-button ec-button-primary" disabled={enviando || demo} aria-describedby={demo ? "demo-registro-ajuda" : undefined}>{enviando ? "Registrando…" : `Confirmar ${entrada ? "entrada" : "saída"}`}</button>}
        </footer>
        {demo && <p id="demo-registro-ajuda" className="ec-field-help">O registro fica disponível quando a fonte de dados é a API.</p>}
      </form>
    </dialog>
  );
}
