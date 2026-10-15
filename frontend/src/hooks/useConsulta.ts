import { useCallback, useEffect, useState } from "react";

// CAMADA: Estado de consulta
// RESPONSABILIDADE: tratar carregamento, falha, nova tentativa e troca de rota.
// REGRAS: resultados cancelados não substituem dados de outra consulta.
// SITUAÇÃO: implementada sem biblioteca de estado
export function useConsulta<T>(
  chave: string,
  carregar: (signal: AbortSignal) => Promise<T>,
) {
  const [tentativa, setTentativa] = useState(0);
  const [estado, setEstado] = useState<{
    chave: string;
    dados?: T;
    erro: Error | null;
    carregando: boolean;
  }>({ chave, erro: null, carregando: true });
  const recarregar = useCallback(() => setTentativa((atual) => atual + 1), []);
  useEffect(() => {
    const controle = new AbortController();
    setEstado({ chave, erro: null, carregando: true });
    carregar(controle.signal).then(
      (dados) => {
        if (!controle.signal.aborted)
          setEstado({ chave, dados, erro: null, carregando: false });
      },
      (causa: unknown) => {
        if (!controle.signal.aborted)
          setEstado({
            chave,
            erro:
              causa instanceof Error
                ? causa
                : new Error("Não foi possível concluir a consulta."),
            carregando: false,
          });
      },
    );
    return () => controle.abort();
  }, [chave, carregar, tentativa]);
  // Trocar /materiais/1 por /materiais/2 não deve pintar o material anterior.
  return {
    ...(estado.chave === chave
      ? estado
      : { erro: null, carregando: true, dados: undefined }),
    recarregar,
  };
}
