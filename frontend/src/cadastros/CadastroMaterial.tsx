import { useEffect, useRef, useState, type FormEvent } from "react";
import { ambiente } from "../ambiente";
import { api } from "../api";
import type { MaterialComSaldoResponseDTO, TipoMaterialResponseDTO } from "../api/tipos";
import { Icone } from "../components/Icone";
import { materiais } from "../demo/dados";
import { gravacaoIncerta } from "../formularios/movimentacao";
import { camposCadastroDaApi, prepararMaterial, prepararTipo, reunirTipos, unidadesCadastro, type CamposCadastro } from "./preparacao";

// CAMADA: Cadastro
// RESPONSABILIDADE: cadastrar material e seu agrupador dentro de um único diálogo.
// REGRAS: R3 continua no servidor; POST confirmado nunca é repetido por falha de consulta.
// SITUAÇÃO: implementada; modo demo permite explorar sem gravar
export function CadastroMaterial({ aoFechar, aoCadastrar }: {
  aoFechar: () => void;
  aoCadastrar: (material: MaterialComSaldoResponseDTO) => void;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const campoNome = useRef<HTMLInputElement>(null);
  const campoTipoNome = useRef<HTMLInputElement>(null);
  const resumoErro = useRef<HTMLDivElement>(null);
  const montado = useRef(true);
  const emEnvio = useRef(false);
  const tiposConfirmados = useRef<TipoMaterialResponseDTO[]>([]);
  const [painel, setPainel] = useState<"material" | "tipo">("material");
  const [dados, setDados] = useState({ nome: "", precoPorUnidade: "", unidadeMedida: "", tipoMaterialId: "" });
  const [nomeTipo, setNomeTipo] = useState("");
  const [tipos, setTipos] = useState<TipoMaterialResponseDTO[]>(() => ambiente.modo === "demo"
    ? reunirTipos(materiais.map((material) => material.tipoMaterial), []) : []);
  const [consultando, setConsultando] = useState(ambiente.modo !== "demo");
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);
  const [consulta, setConsulta] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [incerta, setIncerta] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [campos, setCampos] = useState<CamposCadastro>({});
  const [confirmacaoTipo, setConfirmacaoTipo] = useState<string | null>(null);
  const demo = ambiente.modo === "demo";
  const bloqueado = enviando || incerta;

  useEffect(() => {
    montado.current = true;
    const elemento = dialogo.current;
    const focoAnterior = document.activeElement;
    const overflowAnterior = document.documentElement.style.overflow;
    elemento?.showModal();
    campoNome.current?.focus();
    document.documentElement.style.overflow = "hidden";
    return () => {
      montado.current = false;
      elemento?.close();
      document.documentElement.style.overflow = overflowAnterior;
      if (focoAnterior instanceof HTMLElement && focoAnterior.isConnected) focoAnterior.focus();
    };
  }, []);
  useEffect(() => {
    if (demo) return;
    const controle = new AbortController();
    let ativo = true;
    setConsultando(true);
    setErroConsulta(null);
    async function carregar() {
      try {
        const lista = await api.listarTipos(controle.signal);
        if (ativo) setTipos(reunirTipos(lista, tiposConfirmados.current));
      } catch (causa) {
        if (ativo) setErroConsulta(causa instanceof Error ? causa.message : "Não foi possível consultar os tipos.");
      } finally {
        if (ativo) setConsultando(false);
      }
    }
    void carregar();
    return () => { ativo = false; controle.abort(); };
  }, [consulta, demo]);
  useEffect(() => {
    if (painel === "tipo") campoTipoNome.current?.focus();
    else campoNome.current?.focus();
  }, [painel]);
  useEffect(() => { if (erro) resumoErro.current?.focus(); }, [erro]);

  function fechar() {
    if (!emEnvio.current) aoFechar();
  }
  function abrirPainel(proximo: "material" | "tipo") {
    if (emEnvio.current || incerta) return;
    setCampos({});
    setErro(null);
    setPainel(proximo);
  }
  function alterar(campo: keyof typeof dados, valor: string) {
    setDados((atual) => ({ ...atual, [campo]: valor }));
    setCampos((atual) => ({ ...atual, [campo]: undefined }));
  }
  function focarPrimeiroErro(novos: CamposCadastro) {
    const campo = Object.keys(novos)[0];
    dialogo.current?.querySelector<HTMLElement>(`[name="${campo}"]`)?.focus();
  }
  function registrarFalha(causa: unknown) {
    if (!montado.current) return;
    setCampos(camposCadastroDaApi(causa));
    setErro(causa instanceof Error ? causa.message : "Não foi possível confirmar o cadastro.");
    setIncerta(gravacaoIncerta(causa));
  }
  async function enviarMaterial(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (emEnvio.current || incerta || demo) return;
    const preparado = prepararMaterial(dados, tipos);
    setCampos(preparado.campos);
    setErro(null);
    if (!preparado.corpo) { focarPrimeiroErro(preparado.campos); return; }
    emEnvio.current = true;
    setEnviando(true);
    let material: MaterialComSaldoResponseDTO;
    try {
      material = await api.criarMaterial(preparado.corpo);
    } catch (causa) {
      registrarFalha(causa);
      return;
    } finally {
      emEnvio.current = false;
      if (montado.current) setEnviando(false);
    }
    // O pai recebe a confirmação antes de qualquer nova consulta de saldo ou navegação.
    if (montado.current) aoCadastrar(material);
  }
  async function enviarTipo(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (emEnvio.current || incerta || demo) return;
    const preparado = prepararTipo(nomeTipo);
    setCampos(preparado.campos);
    setErro(null);
    if (!preparado.corpo) { campoTipoNome.current?.focus(); return; }
    emEnvio.current = true;
    setEnviando(true);
    try {
      const tipo = await api.criarTipo(preparado.corpo);
      if (montado.current) {
        tiposConfirmados.current = reunirTipos(tiposConfirmados.current, [tipo]);
        setTipos((atuais) => reunirTipos(atuais, [tipo]));
        setDados((atual) => ({ ...atual, tipoMaterialId: String(tipo.id) }));
        setNomeTipo("");
        setCampos({});
        setConfirmacaoTipo(`Tipo “${tipo.nome}” cadastrado e selecionado. Os dados do material foram preservados.`);
        setPainel("material");
      }
    } catch (causa) {
      registrarFalha(causa);
    } finally {
      emEnvio.current = false;
      if (montado.current) setEnviando(false);
    }
  }
  const ajudaNome = campos.nome ? "cadastro-nome-erro" : undefined;
  return (
    <dialog ref={dialogo} className="ec-cadastro-dialog" aria-labelledby="cadastro-titulo" aria-describedby="cadastro-contexto"
      onCancel={(evento) => { evento.preventDefault(); fechar(); }}
      onClick={(evento) => { if (evento.target === evento.currentTarget) {
        const area = evento.currentTarget.getBoundingClientRect();
        if (evento.clientX < area.left || evento.clientX > area.right || evento.clientY < area.top || evento.clientY > area.bottom) fechar();
      } }}>
      <div className="ec-cadastro-body" aria-busy={enviando}>
        <header className="ec-cadastro-header">
          <span className="ec-cadastro-icon"><Icone nome="caixa" /></span>
          <button type="button" className="ec-icon-button" disabled={enviando} aria-label="Fechar cadastro" onClick={fechar}><Icone nome="fechar" /></button>
        </header>
        <span className="ec-eyebrow">ORGANIZAR O ESTOQUE</span>
        <h2 id="cadastro-titulo">{painel === "material" ? "Cadastrar material" : "Cadastrar tipo"}</h2>
        <p id="cadastro-contexto" className="ec-cadastro-context">{painel === "material" ? "Defina como o material será medido e valorizado. O saldo começa em zero e muda com as movimentações." : "Os tipos agrupam os materiais no painel. Ao salvar, este tipo será selecionado no material em preenchimento."}</p>
        <div className="ec-cadastro-panels" role="group" aria-label="Etapa do cadastro">
          <button type="button" aria-pressed={painel === "material"} disabled={bloqueado} onClick={() => abrirPainel("material")}>Material</button>
          <button type="button" aria-pressed={painel === "tipo"} disabled={bloqueado} onClick={() => abrirPainel("tipo")}>Novo tipo</button>
        </div>
        {demo && <p className="ec-cadastro-notice">Prévia com dados de exemplo. Explore os campos e os tipos disponíveis. Para salvar cadastros, use o modo API.</p>}
        {confirmacaoTipo && <p className="ec-cadastro-success" role="status">{confirmacaoTipo}</p>}
        {erro && <div className="ec-cadastro-error" role="alert" tabIndex={-1} ref={resumoErro}>
          <strong>{incerta ? "Confira os cadastros antes de tentar de novo" : "O cadastro não foi concluído"}</strong>
          <p>{erro}</p>
          {incerta && <p>A solicitação pode ter sido gravada. Feche este formulário e confira o painel e a lista de tipos antes de abrir um novo cadastro. O envio fica bloqueado nesta abertura para evitar repetição.</p>}
        </div>}
        {painel === "material" ? <form onSubmit={enviarMaterial} noValidate>
          <div className="ec-cadastro-field">
            <label htmlFor="cadastro-material-nome">Nome do material <span>obrigatório</span></label>
            <input id="cadastro-material-nome" name="nome" ref={campoNome} value={dados.nome} maxLength={255} required disabled={bloqueado} autoComplete="off" placeholder="Ex.: Retalhos de aço"
              aria-invalid={Boolean(campos.nome)} aria-describedby={ajudaNome} onChange={(evento) => alterar("nome", evento.target.value)} />
            {campos.nome && <p id="cadastro-nome-erro" className="ec-cadastro-field-error">{campos.nome}</p>}
          </div>
          <div className="ec-cadastro-grid">
            <div className="ec-cadastro-field">
              <label htmlFor="cadastro-preco">Preço por unidade (R$) <span>obrigatório</span></label>
              <input id="cadastro-preco" name="precoPorUnidade" value={dados.precoPorUnidade} type="text" inputMode="decimal" required disabled={bloqueado} autoComplete="off" placeholder="Ex.: 8,50"
                aria-invalid={Boolean(campos.precoPorUnidade)} aria-describedby={`cadastro-preco-ajuda${campos.precoPorUnidade ? " cadastro-preco-erro" : ""}`} onChange={(evento) => alterar("precoPorUnidade", evento.target.value)} />
              <p id="cadastro-preco-ajuda" className="ec-cadastro-help">Maior que zero, com vírgula ou ponto decimal, sem separador de milhar.</p>
              {campos.precoPorUnidade && <p id="cadastro-preco-erro" className="ec-cadastro-field-error">{campos.precoPorUnidade}</p>}
            </div>
            <div className="ec-cadastro-field">
              <label htmlFor="cadastro-unidade">Unidade de medida <span>obrigatório</span></label>
              <select id="cadastro-unidade" name="unidadeMedida" value={dados.unidadeMedida} required disabled={bloqueado} aria-invalid={Boolean(campos.unidadeMedida)} aria-describedby={campos.unidadeMedida ? "cadastro-unidade-erro" : undefined} onChange={(evento) => alterar("unidadeMedida", evento.target.value)}>
                <option value="" disabled>Escolha a unidade</option>
                {unidadesCadastro.map((unidade) => <option key={unidade.valor} value={unidade.valor}>{unidade.nome}</option>)}
              </select>
              {campos.unidadeMedida && <p id="cadastro-unidade-erro" className="ec-cadastro-field-error">{campos.unidadeMedida}</p>}
            </div>
          </div>
          <div className="ec-cadastro-field">
            <label htmlFor="cadastro-tipo">Tipo do material <span>obrigatório</span></label>
            <select id="cadastro-tipo" name="tipoMaterialId" value={dados.tipoMaterialId} required disabled={bloqueado || tipos.length === 0}
              aria-invalid={Boolean(campos.tipoMaterialId)} aria-describedby={`cadastro-tipo-ajuda${campos.tipoMaterialId ? " cadastro-tipo-erro" : ""}`} onChange={(evento) => alterar("tipoMaterialId", evento.target.value)}>
              <option value="" disabled>{consultando ? "Consultando tipos…" : "Escolha o tipo"}</option>
              {tipos.map((tipo) => <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>)}
            </select>
            <p id="cadastro-tipo-ajuda" className="ec-cadastro-help">O tipo organiza o agrupamento do painel.</p>
            {campos.tipoMaterialId && <p id="cadastro-tipo-erro" className="ec-cadastro-field-error">{campos.tipoMaterialId}</p>}
            {consultando && <p className="ec-cadastro-help" role="status">Consultando a lista de tipos…</p>}
            {erroConsulta && <div className="ec-cadastro-query-error" role="alert"><p>Não foi possível atualizar os tipos. {erroConsulta}</p><button type="button" className="ec-button ec-button-secondary" disabled={bloqueado || consultando} onClick={() => setConsulta((atual) => atual + 1)}>Tentar consultar novamente</button></div>}
            {!consultando && !erroConsulta && tipos.length === 0 && <p className="ec-cadastro-help">Ainda não há tipos cadastrados. Crie o primeiro para continuar.</p>}
            <button type="button" className="ec-cadastro-link" disabled={bloqueado} onClick={() => abrirPainel("tipo")}>{tipos.length === 0 && !erroConsulta && !consultando ? "Cadastrar primeiro tipo" : "Cadastrar outro tipo"}</button>
          </div>
          <p className="ec-cadastro-help ec-cadastro-rule">A API confere se já existe um material com o mesmo nome e unidade de medida.</p>
          <p className="ec-cadastro-progress" role="status">{enviando ? "Cadastrando material. Aguarde a confirmação antes de sair." : ""}</p>
          <footer className="ec-cadastro-actions">
            <button type="button" className="ec-button ec-button-secondary" disabled={enviando} onClick={fechar}>{incerta ? "Fechar e conferir cadastros" : "Cancelar"}</button>
            {!incerta && <button type="submit" className="ec-button ec-button-primary" disabled={enviando || demo || tipos.length === 0} aria-describedby={demo ? "cadastro-demo-ajuda" : undefined}>{enviando ? "Cadastrando…" : "Cadastrar material"}</button>}
          </footer>
        </form> : <form onSubmit={enviarTipo} noValidate>
          <div className="ec-cadastro-field">
            <label htmlFor="cadastro-tipo-nome">Nome do tipo <span>obrigatório</span></label>
            <input id="cadastro-tipo-nome" name="nome" ref={campoTipoNome} value={nomeTipo} maxLength={255} required disabled={bloqueado} autoComplete="off" placeholder="Ex.: Papel"
              aria-invalid={Boolean(campos.nome)} aria-describedby={ajudaNome} onChange={(evento) => { setNomeTipo(evento.target.value); setCampos((atual) => ({ ...atual, nome: undefined })); }} />
            {campos.nome && <p id="cadastro-nome-erro" className="ec-cadastro-field-error">{campos.nome}</p>}
            <p className="ec-cadastro-help">Até 255 caracteres. O preenchimento do material permanece guardado ao trocar de painel.</p>
          </div>
          <p className="ec-cadastro-progress" role="status">{enviando ? "Cadastrando tipo. Aguarde a confirmação antes de sair." : ""}</p>
          <footer className="ec-cadastro-actions">
            <button type="button" className="ec-button ec-button-secondary" disabled={enviando} onClick={incerta ? fechar : () => abrirPainel("material")}>{incerta ? "Fechar e conferir cadastros" : "Voltar ao material"}</button>
            {!incerta && <button type="submit" className="ec-button ec-button-primary" disabled={enviando || demo} aria-describedby={demo ? "cadastro-demo-ajuda" : undefined}>{enviando ? "Cadastrando…" : "Cadastrar tipo e selecionar"}</button>}
          </footer>
        </form>}
        {demo && <p id="cadastro-demo-ajuda" className="ec-cadastro-help">Nenhum dado é salvo nesta prévia. O cadastro fica disponível no modo API.</p>}
      </div>
    </dialog>
  );
}
