import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { RegistroRequisicao } from "../api/client";
import { observarRequisicoes } from "../api/eventos";

// CAMADA: Bastidores
// RESPONSABILIDADE: guardar as últimas 50 requisições concluídas desta visita.
// REGRAS: dados de demonstração não geram eventos HTTP; histórico só fica em memória.
// SITUAÇÃO: captura implementada, sem biblioteca de estado
const Contexto = createContext<{
  registros: RegistroRequisicao[];
  limpar: () => void;
} | null>(null);
export function BastidoresProvider({ children }: { children: ReactNode }) {
  const [registros, setRegistros] = useState<RegistroRequisicao[]>([]);
  useEffect(
    () =>
      observarRequisicoes((registro) =>
        setRegistros((atuais) => [registro, ...atuais].slice(0, 50)),
      ),
    [],
  );
  return (
    <Contexto.Provider value={{ registros, limpar: () => setRegistros([]) }}>
      {children}
    </Contexto.Provider>
  );
}
export function useBastidores() {
  const contexto = useContext(Contexto);
  if (!contexto)
    throw new Error("Bastidores precisa estar dentro de BastidoresProvider.");
  return contexto;
}
