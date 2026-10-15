import { useEffect, useRef } from "react";
import { ambiente } from "../ambiente";
import { Icone } from "../components/Icone";
import { BlocoJson } from "../components/BlocoJson";
import { useBastidores } from "./BastidoresProvider";

// CAMADA: Bastidores
// RESPONSABILIDADE: mostrar método, rota, duração e corpos das requisições reais.
// REGRAS: as camadas são explicações declaradas do código; não indicam execução.
// SITUAÇÃO: histórico em memória, limitado às últimas 50 requisições concluídas
export function GavetaBastidores({
  aberta,
  aoFechar,
}: {
  aberta: boolean;
  aoFechar: () => void;
}) {
  const { registros, limpar } = useBastidores();
  const dialogo = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const elemento = dialogo.current;
    if (!elemento) return;
    if (aberta && !elemento.open) elemento.showModal();
    if (!aberta && elemento.open) elemento.close();
    if (aberta) document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [aberta]);

  return (
    <dialog
      ref={dialogo}
      className="ec-drawer ec-drawer-requests"
      aria-labelledby="bastidores-titulo"
      onClose={aoFechar}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) aoFechar();
      }}
    >
      <div className="ec-drawer-content">
        <header className="ec-drawer-header">
          <div>
            <span className="ec-eyebrow">POR DENTRO DO SISTEMA</span>
            <h2 id="bastidores-titulo">Bastidores</h2>
          </div>
          <button
            className="ec-icon-button"
            aria-label="Fechar bastidores"
            onClick={aoFechar}
          >
            <Icone nome="fechar" />
          </button>
        </header>
        {registros.length === 0 ? (
          <>
            <div className="ec-drawer-empty">
              <span className="ec-empty-icon">
                <Icone nome="codigo" width="30" height="30" />
              </span>
              <h3>Nenhuma requisição por enquanto</h3>
              <p>
                {ambiente.modo === "demo"
                  ? "Esta prévia usa dados de exemplo. A navegação e os filtros acontecem no navegador, sem consultar o estoque real."
                  : "As próximas consultas à API aparecerão aqui assim que forem concluídas. O botão Atualizar saldos faz uma nova consulta."}
              </p>
            </div>
            <div className="ec-explanation">
              <Icone nome="info" />
              <p>
                Aqui aparecem os resultados HTTP reais. A descrição das camadas
                é uma explicação do código, não um rastreamento da execução no
                servidor.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="ec-requests-toolbar">
              <p>
                {registros.length}{" "}
                {registros.length === 1
                  ? "requisição nesta visita"
                  : "requisições nesta visita"}
              </p>
              <button
                className="ec-button ec-button-secondary"
                onClick={limpar}
              >
                Limpar histórico
              </button>
            </div>
            <p className="ec-requests-help">
              Abra uma consulta para comparar o que foi enviado com o que a API
              respondeu. Consultas interrompidas ao navegar podem aparecer como
              canceladas.
            </p>
            <div className="ec-requests-list">
              {registros.map((registro) => (
                <details className="ec-request" key={registro.id}>
                  <summary>
                    <span className="ec-request-method">
                      {registro.rota.metodo}
                    </span>
                    <span className="ec-request-path">
                      {new URL(registro.url).pathname}
                      {new URL(registro.url).search}
                    </span>
                    <span
                      className={`ec-request-status ec-request-status-${registro.resultado}`}
                    >
                      {registro.status ??
                        (registro.resultado === "cancelada"
                          ? "Cancelada"
                          : "Sem resposta")}
                    </span>
                    <span className="ec-request-duration">
                      {registro.duracaoMs} ms
                    </span>
                    <Icone
                      nome="chevron"
                      className="ec-request-expand"
                      width="13"
                      height="13"
                    />
                  </summary>
                  <div className="ec-request-content">
                    <h3>{registro.rota.resumo}</h3>
                    <p className="ec-request-url">{registro.url}</p>
                    <time dateTime={registro.instante}>
                      {new Date(registro.instante).toLocaleTimeString("pt-BR")}
                    </time>
                    {registro.mensagemErro && (
                      <p className="ec-request-error">
                        {registro.mensagemErro}
                      </p>
                    )}
                    <div className="ec-json-pair">
                      <BlocoJson
                        titulo="Requisição · corpo enviado"
                        valor={registro.corpoEnviado}
                      />
                      <BlocoJson
                        titulo="Resposta · corpo recebido"
                        valor={registro.corpoRecebido}
                      />
                    </div>
                    <section className="ec-request-layers">
                      <h4>Caminho descrito no código</h4>
                      <p>
                        Metadados declarados pelo projeto. Não comprovam que
                        estas camadas foram executadas nesta requisição.
                      </p>
                      <ol>
                        {registro.rota.camadas.map((camada) => (
                          <li key={camada}>{camada}</li>
                        ))}
                      </ol>
                      {registro.rota.regras.length > 0 && (
                        <>
                          <h4>Regras previstas nesta operação</h4>
                          <ul>
                            {registro.rota.regras.map((regra) => (
                              <li key={regra}>{regra}</li>
                            ))}
                          </ul>
                        </>
                      )}
                    </section>
                  </div>
                </details>
              ))}
            </div>
            <p className="ec-requests-help">
              Histórico apenas nesta visita, limitado às 50 consultas mais
              recentes.
            </p>
          </>
        )}
      </div>
    </dialog>
  );
}
