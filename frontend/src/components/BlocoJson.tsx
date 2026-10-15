// CAMADA: Componente didático
// RESPONSABILIDADE: mostrar o corpo recebido sem interpretar HTML ou alterar dados.
// SITUAÇÃO: implementada
export function BlocoJson({
  titulo,
  valor,
}: {
  titulo: string;
  valor: unknown;
}) {
  return (
    <section className="ec-json-block">
      <h4>{titulo}</h4>
      <pre>
        <code>
          {valor === undefined
            ? "Sem corpo."
            : typeof valor === "string"
              ? valor
              : JSON.stringify(valor, null, 2)}
        </code>
      </pre>
    </section>
  );
}
