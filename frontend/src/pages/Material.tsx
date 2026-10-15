import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EstadoVazio } from "../components/EstadoVazio";
import { Icone } from "../components/Icone";
import { ambiente } from "../ambiente";
import { FormularioMovimentacao } from "../formularios/FormularioMovimentacao";
import type { MovimentacaoResiduoResponseDTO, TipoMovimentacaoResiduo } from "../api/tipos";
import { consultas, ehMaterialNaoEncontrado } from "../api/consultas";
import { useConsulta } from "../hooks/useConsulta";
import { EstadoConsulta } from "../components/EstadoConsulta";
import { dataHora, moeda, quantidade, unidades } from "../formatacao";

// CAMADA: Página
// RESPONSABILIDADE: destacar o saldo de um material e apresentar seu extrato.
// REGRAS: sinais de entrada/saída são apresentados por rótulo, além da cor.
// SITUAÇÃO: consulta e registro de entradas e saídas, com confirmação da API
export function Material() {
  const { id } = useParams();
  // Navegar para outro material descarta o formulário e avisos do anterior.
  return <PaginaMaterial key={id} id={id} />;
}
function PaginaMaterial({ id }: { id: string | undefined }) {
  const [tipoRegistro, setTipoRegistro] = useState<TipoMovimentacaoResiduo | null>(null);
  const [confirmacao, setConfirmacao] = useState<string | null>(null);
  const carregar = useCallback(
    (signal: AbortSignal) =>
      consultas.consultarMaterial(
        id && /^[1-9]\d*$/.test(id) ? Number(id) : NaN,
        signal,
      ),
    [id],
  );
  const { dados, carregando, erro, recarregar } = useConsulta(
    `material:${id}`,
    carregar,
  );
  const avisoConfirmacao = confirmacao ? (
    <div className="ec-movement-success" role="status">
      {confirmacao}
      {carregando && ' Atualizando saldo e extrato…'}
      {erro && ' A consulta do saldo e do extrato falhou. Tente consultar novamente; o registro já foi confirmado.'}
    </div>
  ) : null;
  function aoConfirmar(registro: MovimentacaoResiduoResponseDTO) {
    setTipoRegistro(null);
    setConfirmacao(`${registro.tipoMovimentacaoResiduo === "ENTRADA" ? "Entrada" : "Saída"} de ${quantidade(Math.abs(registro.quantidade))} ${unidades[registro.material.unidadeMedida]} registrada com sucesso.`);
    recarregar();
  }
  if (carregando)
    return <>{avisoConfirmacao}<EstadoConsulta carregando erro={null} aoTentarNovamente={recarregar} /></>;
  if (ehMaterialNaoEncontrado(erro))
    return (
      <>{avisoConfirmacao}<EstadoVazio
        titulo="Material não encontrado"
        acao={
          <Link className="ec-button ec-button-primary" to="/">
            Voltar ao painel
          </Link>
        }
      >
        Escolha um dos materiais disponíveis no painel de saldos.
      </EstadoVazio></>
    );
  if (erro || !dados)
    return (
      <>{avisoConfirmacao}<EstadoConsulta
        carregando={false}
        erro={erro}
        aoTentarNovamente={recarregar}
      /></>
    );
  const { material, movimentacoes } = dados;
  return (
    <>
      {avisoConfirmacao}
      <Link className="ec-back-link" to="/">
        <Icone nome="voltar" width="17" height="17" />
        Voltar ao painel
      </Link>
      <div className="ec-page-heading ec-detail-heading">
        <div>
          <span className="ec-eyebrow">
            {material.tipoMaterial.nome.toLocaleUpperCase("pt-BR")}{" "}
            <span aria-hidden="true">/</span> MAT-
            {String(material.id).padStart(3, "0")}
          </span>
          <h1>{material.nome}</h1>
          <p>O saldo de agora. O caminho até aqui.</p>
        </div>
        <span className="ec-heading-icon">
          <Icone nome="caixa" width="26" height="26" />
        </span>
      </div>
      <section className="ec-material-summary" aria-label="Resumo do material">
        <div className="ec-balance">
          <span className="ec-eyebrow">SALDO DISPONÍVEL</span>
          <h2>
            {quantidade(material.saldo)}{" "}
            <span>{unidades[material.unidadeMedida]}</span>
          </h2>
          <span
            className={`ec-positive-label ${material.saldo <= 0 ? "ec-empty-balance" : ""}`}
          >
            <span />
            {material.saldo > 0
              ? "Disponível para reaproveitamento"
              : "Sem saldo disponível"}
          </span>
        </div>
        <dl>
          <div>
            <dt>Valor em estoque</dt>
            <dd>{moeda(material.saldo * material.precoPorUnidade)}</dd>
          </div>
          <div>
            <dt>Preço por {unidades[material.unidadeMedida]}</dt>
            <dd>{moeda(material.precoPorUnidade)}</dd>
          </div>
        </dl>
      </section>
      <div className="ec-demo-notice">
        <Icone nome="info" />
        <p>
          <strong>
            {ambiente.modo === "demo"
              ? "Você está explorando um exemplo."
              : "Consulta ao estoque."}
          </strong>{" "}
          {ambiente.modo === "demo"
            ? "Os registros são ilustrativos. Explore os formulários sem gravar dados."
            : "Registre entradas e saídas para manter o estoque atualizado."}
        </p>
      </div>
      <section
        className="ec-inventory ec-statement"
        aria-labelledby="extrato-titulo"
      >
        <div className="ec-inventory-toolbar">
          <div>
            <h2 id="extrato-titulo">Extrato de movimentações</h2>
            <p>Da mais recente para a mais antiga.</p>
          </div>
          <div className="ec-movement-actions">
            <button
              className="ec-button ec-button-primary"
              onClick={() => setTipoRegistro("ENTRADA")}
            >
              <Icone nome="entrada" width="17" height="17" />
              Registrar entrada
            </button>
            <button
              className="ec-button ec-button-secondary"
              onClick={() => setTipoRegistro("SAIDA")}
            >
              <Icone nome="saida" width="17" height="17" />
              Registrar saída
            </button>
          </div>
        </div>
        <div className="ec-statement-refresh">
          <button className="ec-button ec-button-secondary" onClick={recarregar}>Atualizar extrato</button>
        </div>
        <div className="ec-movement-list">
          {movimentacoes.length === 0 && (
            <EstadoVazio titulo="Nenhuma movimentação registrada">
              O extrato aparecerá aqui após os primeiros registros deste
              material.
            </EstadoVazio>
          )}
          {movimentacoes.map((movimentacao) => (
            <article className="ec-movement" key={movimentacao.id}>
              <span
                className={`ec-movement-icon ${movimentacao.tipoMovimentacaoResiduo === "ENTRADA" ? "ec-movement-in" : "ec-movement-out"}`}
              >
                <Icone
                  nome={
                    movimentacao.tipoMovimentacaoResiduo === "ENTRADA"
                      ? "entrada"
                      : "saida"
                  }
                />
              </span>
              <div className="ec-movement-description">
                <h3>{movimentacao.descricao}</h3>
                <span
                  className={
                    movimentacao.tipoMovimentacaoResiduo === "ENTRADA"
                      ? "ec-text-success"
                      : "ec-text-error"
                  }
                >
                  {movimentacao.tipoMovimentacaoResiduo === "ENTRADA"
                    ? "Entrada"
                    : "Saída"}
                </span>
                <span className="ec-movement-separator">·</span>
                <time dateTime={movimentacao.criadoEm}>
                  {dataHora(movimentacao.criadoEm)}
                </time>
              </div>
              <strong className="ec-numeric ec-movement-quantity">
                {movimentacao.tipoMovimentacaoResiduo === "ENTRADA" ? "+" : "−"}
                {quantidade(Math.abs(movimentacao.quantidade))}{" "}
                <span className="ec-unit">
                  {unidades[material.unidadeMedida]}
                </span>
              </strong>
            </article>
          ))}
        </div>
      </section>
      {tipoRegistro && <FormularioMovimentacao material={material} tipo={tipoRegistro} aoFechar={() => setTipoRegistro(null)} aoConfirmar={aoConfirmar} />}
    </>
  );
}
