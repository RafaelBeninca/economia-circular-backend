import { EstadoVazio } from "./EstadoVazio";

// CAMADA: Componente
// RESPONSABILIDADE: apresentar carregamento e falha sem esconder a origem dos dados.
// SITUAÇÃO: implementada
export function EstadoConsulta({
  carregando,
  erro,
  aoTentarNovamente,
}: {
  carregando: boolean;
  erro: Error | null;
  aoTentarNovamente: () => void;
}) {
  if (carregando)
    return (
      <div className="ec-loading" role="status">
        <span className="ec-loading-indicator" aria-hidden="true" />
        <p>Consultando os dados do estoque…</p>
      </div>
    );
  return (
    <EstadoVazio
      titulo="Não foi possível carregar os dados"
      acao={
        <button
          className="ec-button ec-button-primary"
          onClick={aoTentarNovamente}
        >
          Tentar novamente
        </button>
      }
    >
      {erro?.message ?? "A consulta não pôde ser concluída."}
    </EstadoVazio>
  );
}
