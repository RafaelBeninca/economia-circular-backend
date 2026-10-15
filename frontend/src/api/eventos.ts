import type { RegistroRequisicao } from "./client";

// CAMADA: Eventos
// RESPONSABILIDADE: ligar o cliente aos bastidores sem importar React no transporte.
// SITUAÇÃO: implementada; somente resultados reais de requisições são publicados
const observadores = new Set<(registro: RegistroRequisicao) => void>();
export function observarRequisicoes(
  observador: (registro: RegistroRequisicao) => void,
) {
  observadores.add(observador);
  return () => {
    observadores.delete(observador);
  };
}
export function publicarRequisicao(registro: RegistroRequisicao) {
  for (const observador of observadores) {
    try {
      observador(registro);
    } catch {
      /* Um observador não interrompe os demais. */
    }
  }
}
