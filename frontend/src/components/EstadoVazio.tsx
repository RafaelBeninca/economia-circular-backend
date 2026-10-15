import type { ReactNode } from "react";
import { Icone } from "./Icone";

// CAMADA: Componente
// RESPONSABILIDADE: explicar a ausência de resultados e oferecer um próximo passo.
// SITUAÇÃO: implementada
export function EstadoVazio({
  titulo,
  children,
  acao,
}: {
  titulo: string;
  children: ReactNode;
  acao?: ReactNode;
}) {
  return (
    <div className="ec-empty">
      <span className="ec-empty-icon">
        <Icone nome="caixa" width="28" height="28" />
      </span>
      <h2>{titulo}</h2>
      <p>{children}</p>
      {acao}
    </div>
  );
}
