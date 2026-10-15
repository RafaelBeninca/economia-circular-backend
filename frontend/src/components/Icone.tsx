import type { SVGProps } from "react";

// CAMADA: Componente
// RESPONSABILIDADE: desenhar os ícones da interface sem uma biblioteca adicional.
// SITUAÇÃO: implementada
const desenhos = {
  ciclo: [
    "M4 10a8 8 0 0 1 13-6l3 3",
    "M20 2v5h-5",
    "M20 14a8 8 0 0 1-13 6l-3-3",
    "M4 22v-5h5",
  ],
  painel: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h7v7h-7z"],
  camadas: ["m12 3 10 5-10 5L2 8Z", "m2 12 10 5 10-5", "m2 16 10 5 10-5"],
  sol: [
    "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
    "M12 2v2",
    "M12 20v2",
    "M2 12h2",
    "M20 12h2",
    "m5 5 1.5 1.5",
    "m17.5 17.5 1.5 1.5",
    "m19 5-1.5 1.5",
    "m6.5 17.5-1.5 1.5",
  ],
  lua: ["M21 13a9 9 0 0 1-10-10A9 9 0 1 0 21 13Z"],
  codigo: ["m8 7-5 5 5 5", "m16 7 5 5-5 5", "m14 4-4 16"],
  busca: ["M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15", "m16 16 5 5"],
  direita: ["M4 12h16", "m14 6 6 6-6 6"],
  voltar: ["M20 12H4", "m10 6-6 6 6 6"],
  chevron: ["m9 5 7 7-7 7"],
  fechar: ["m6 6 12 12", "M18 6 6 18"],
  entrada: ["M12 3v18", "m5 14 7 7 7-7"],
  saida: ["M12 21V3", "m5 10 7-7 7 7"],
  folha: ["M20 3C9 1 3 6 4 13s10 9 14 2c2-4 1-8 2-12Z", "M5 20 16 9"],
  caixa: ["m12 3 9 5v9l-9 5-9-5V8Z", "m3 8 9 5 9-5", "M12 13v9", "m7 5 9 5"],
  info: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18", "M12 11v6", "M12 7h.01"],
} as const;

export type NomeIcone = keyof typeof desenhos;
export function Icone({
  nome,
  ...props
}: SVGProps<SVGSVGElement> & { nome: NomeIcone }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {desenhos[nome].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
