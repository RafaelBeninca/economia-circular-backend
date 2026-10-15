import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { BastidoresProvider } from "./bastidores/BastidoresProvider";
import "./design-system/index.css";
import "./app.css";
import "./integracao.css";

// CAMADA: Inicialização
// RESPONSABILIDADE: montar o React e habilitar a navegação entre as duas telas.
// SITUAÇÃO: implementada
const root = document.getElementById("root");
if (!root)
  throw new Error("O ponto de montagem do frontend não foi encontrado.");

createRoot(root).render(
  <StrictMode>
    <BastidoresProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BastidoresProvider>
  </StrictMode>,
);
