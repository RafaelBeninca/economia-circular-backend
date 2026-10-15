import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// CAMADA: Config
// RESPONSABILIDADE: compilar o frontend de forma independente do Maven.
// SITUAÇÃO: implementada
export default defineConfig({ plugins: [react()] });
