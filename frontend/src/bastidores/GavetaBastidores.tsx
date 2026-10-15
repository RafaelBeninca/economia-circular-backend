import { useEffect, useRef } from "react";
import { Icone } from "../components/Icone";

// CAMADA: Bastidores
// RESPONSABILIDADE: reservar a gaveta didática sem simular requisições inexistentes.
// SITUAÇÃO: estrutura visual; captura de HTTP será implementada na integração
export function GavetaBastidores({
  aberta,
  aoFechar,
}: {
  aberta: boolean;
  aoFechar: () => void;
}) {
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
      className="ec-drawer"
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
        <div className="ec-drawer-empty">
          <span className="ec-empty-icon">
            <Icone nome="codigo" width="30" height="30" />
          </span>
          <h3>Nenhuma requisição por enquanto</h3>
          <p>
            Esta prévia usa dados de exemplo. Ao conectar a API, cada ação
            aparecerá aqui com o que foi enviado e o que voltou.
          </p>
        </div>
        <div className="ec-explanation">
          <Icone nome="info" />
          <p>
            A navegação e os filtros desta demonstração acontecem no navegador.
            Eles não consultam nem alteram o estoque real.
          </p>
        </div>
        <div className="ec-drawer-note">
          <span className="ec-eyebrow">NA PRÓXIMA ETAPA</span>
          <h3>O caminho dos seus dados, à vista.</h3>
          <p>
            Método, rota, resposta e tempo de cada requisição. Tudo no contexto
            da ação que você acabou de fazer.
          </p>
        </div>
      </div>
    </dialog>
  );
}
