import { useState } from "react";
import { Icone } from "./Icone";

// CAMADA: Componente
// RESPONSABILIDADE: alternar o tema e lembrar a preferência neste navegador.
// SITUAÇÃO: implementada
export function BotaoTema() {
  const [escuro, setEscuro] = useState(() =>
    document.documentElement.classList.contains("dark-theme"),
  );
  function alternar() {
    const proximo = !escuro;
    document.documentElement.classList.toggle("dark-theme", proximo);
    setEscuro(proximo);
    // Armazenamento bloqueado não deve impedir o uso do tema nesta visita.
    try {
      localStorage.setItem("ec-tema", proximo ? "escuro" : "claro");
    } catch {
      /* Preferência apenas nesta sessão. */
    }
  }
  return (
    <button
      className="ec-icon-button"
      onClick={alternar}
      aria-label={escuro ? "Ativar tema claro" : "Ativar tema escuro"}
      title={escuro ? "Tema claro" : "Tema escuro"}
    >
      <Icone nome={escuro ? "sol" : "lua"} />
    </button>
  );
}
