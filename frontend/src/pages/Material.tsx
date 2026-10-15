import { Link, useParams } from "react-router-dom";
import { EstadoVazio } from "../components/EstadoVazio";
import { Icone } from "../components/Icone";
import { materiais, movimentacoesDe } from "../demo/dados";
import { dataHora, moeda, quantidade, unidades } from "../formatacao";

// CAMADA: Página
// RESPONSABILIDADE: destacar o saldo de um material e apresentar seu extrato.
// REGRAS: sinais de entrada/saída são apresentados por rótulo, além da cor.
// SITUAÇÃO: extrato ilustrativo; formulários e integração serão etapas posteriores
export function Material() {
  const { id } = useParams();
  const material = materiais.find((item) => String(item.id) === id);
  if (!material)
    return (
      <EstadoVazio
        titulo="Material não encontrado"
        acao={
          <Link className="ec-button ec-button-primary" to="/">
            Voltar ao painel
          </Link>
        }
      >
        Escolha um dos materiais disponíveis no painel de demonstração.
      </EstadoVazio>
    );
  const movimentacoes = movimentacoesDe(material);
  return (
    <>
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
          <span className="ec-positive-label">
            <span />
            Disponível para reaproveitamento
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
          <strong>Você está explorando um exemplo.</strong> Os registros abaixo
          são ilustrativos. Entradas e saídas serão habilitadas ao integrar a
          API.
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
              disabled
              aria-describedby="registro-pendente"
            >
              <Icone nome="entrada" width="17" height="17" />
              Registrar entrada
            </button>
            <button
              className="ec-button ec-button-secondary"
              disabled
              aria-describedby="registro-pendente"
            >
              <Icone nome="saida" width="17" height="17" />
              Registrar saída
            </button>
          </div>
        </div>
        <span id="registro-pendente" className="ec-sr-only">
          Registro indisponível nesta demonstração. A integração com a API ainda
          será implementada.
        </span>
        <div className="ec-movement-list">
          {movimentacoes.map((movimentacao) => (
            <article className="ec-movement" key={movimentacao.id}>
              <span
                className={`ec-movement-icon ${movimentacao.tipo === "ENTRADA" ? "ec-movement-in" : "ec-movement-out"}`}
              >
                <Icone
                  nome={movimentacao.tipo === "ENTRADA" ? "entrada" : "saida"}
                />
              </span>
              <div className="ec-movement-description">
                <h3>{movimentacao.descricao}</h3>
                <span
                  className={
                    movimentacao.tipo === "ENTRADA"
                      ? "ec-text-success"
                      : "ec-text-error"
                  }
                >
                  {movimentacao.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                </span>
                <span className="ec-movement-separator">·</span>
                <time dateTime={movimentacao.criadoEm}>
                  {dataHora(movimentacao.criadoEm)}
                </time>
              </div>
              <strong className="ec-numeric ec-movement-quantity">
                {movimentacao.tipo === "ENTRADA" ? "+" : "−"}
                {quantidade(Math.abs(movimentacao.quantidade))}{" "}
                <span className="ec-unit">
                  {unidades[material.unidadeMedida]}
                </span>
              </strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
