import { useState } from "react";
import { Link } from "react-router-dom";
import { CadastroMaterial } from "../cadastros/CadastroMaterial";
import type { MaterialComSaldoResponseDTO } from "../api/tipos";
import { EstadoVazio } from "../components/EstadoVazio";
import { Icone } from "../components/Icone";
import { consultas } from "../api/consultas";
import { useConsulta } from "../hooks/useConsulta";
import { EstadoConsulta } from "../components/EstadoConsulta";
import { moeda, normalizar, quantidade, unidades } from "../formatacao";

// CAMADA: Página
// RESPONSABILIDADE: apresentar saldo e valor dos resíduos, agrupados por tipo.
// REGRAS: valor exibido = saldo × preço por unidade; o saldo e os cadastros confirmados vêm da API.
// SITUAÇÃO: consulta de saldos e cadastro discreto de materiais/tipos
const carregarMateriais = (signal: AbortSignal) =>
  consultas.listarMateriais(signal);

export function PainelSaldos() {
  // Atualizar exemplos é local; só o modo API gera uma requisição real.
  const [cadastroAberto, setCadastroAberto] = useState(false);
  const [cadastroConfirmado, setCadastroConfirmado] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const { dados, carregando, erro, recarregar } = useConsulta(
    "materiais",
    carregarMateriais,
  );
  const avisoCadastro = cadastroConfirmado ? (
    <div className="ec-movement-success" role="status">
      {cadastroConfirmado}
      {carregando && " Atualizando a lista de materiais…"}
      {erro && " A consulta da lista falhou. Tente consultar novamente; o cadastro já foi confirmado."}
    </div>
  ) : null;
  function aoCadastrar(material: MaterialComSaldoResponseDTO) {
    setCadastroAberto(false);
    setCadastroConfirmado(`Material “${material.nome}” cadastrado com sucesso.`);
    setBusca("");
    setCategoriaId("");
    // A confirmação pertence ao POST. A lista atualizada vem de outro GET.
    recarregar();
  }
  if (carregando || erro || !dados)
    return (
      <>
        {avisoCadastro}
        <EstadoConsulta
          carregando={carregando}
          erro={erro}
          aoTentarNovamente={recarregar}
        />
      </>
    );
  const materiais = dados;
  const categorias = [
    ...new Map(
      materiais.map((material) => [
        material.tipoMaterial.id,
        material.tipoMaterial,
      ]),
    ).values(),
  ];
  // Cores dependem da posição visual, não de ids fixos do banco.
  const corDaCategoria = (id: number) =>
    (categorias.findIndex((categoria) => categoria.id === id) % 3) + 1;
  const categoriaAtiva = categorias.some(
    (categoria) => String(categoria.id) === categoriaId,
  )
    ? categoriaId
    : "";
  const valorTotal = materiais.reduce(
    (total, material) => total + material.saldo * material.precoPorUnidade,
    0,
  );
  const visiveis = materiais.filter(
    (material) =>
      normalizar(material.nome).includes(normalizar(busca.trim())) &&
      (!categoriaAtiva || String(material.tipoMaterial.id) === categoriaAtiva),
  );
  const grupos = categorias
    .map((categoria) => ({
      ...categoria,
      materiais: visiveis.filter(
        (material) => material.tipoMaterial.id === categoria.id,
      ),
    }))
    .filter((grupo) => grupo.materiais.length > 0);
  const distribuicao = categorias.map((categoria) => ({
    ...categoria,
    valor: materiais
      .filter((material) => material.tipoMaterial.id === categoria.id)
      .reduce(
        (total, material) => total + material.saldo * material.precoPorUnidade,
        0,
      ),
  }));

  return (
    <>
      {avisoCadastro}
      <div className="ec-page-heading ec-stock-heading">
        <div>
          <span className="ec-eyebrow">VISÃO GERAL DO ESTOQUE</span>
          <h1>Painel de saldos</h1>
          <p>Saiba o que você tem. Encontre o valor de cada sobra.</p>
        </div>
        <div className="ec-page-actions">
          <button className="ec-button ec-button-secondary" onClick={() => setCadastroAberto(true)}>
            Novo material
          </button>
          <button
            className="ec-icon-button ec-refresh"
            onClick={recarregar}
            aria-label="Atualizar saldos"
            title="Atualizar saldos"
          >
            <Icone nome="ciclo" width="23" height="23" />
          </button>
        </div>
      </div>
      <section className="ec-overview" aria-labelledby="valor-estoque">
        <div className="ec-overview-value">
          <span className="ec-overview-label">
            <Icone nome="ciclo" />
            RECURSOS EM ESTOQUE
          </span>
          <h2 id="valor-estoque">
            <span className="ec-currency-symbol">R$</span>
            {moeda(valorTotal).replace(/^R\$\s*/, "")}
          </h2>
          <p>Valor estimado dos resíduos disponíveis</p>
          <span className="ec-overview-footnote">
            Saldo atual × preço por unidade
          </span>
          <Icone
            nome="ciclo"
            className="ec-overview-watermark"
            width="190"
            height="190"
          />
        </div>
        <div className="ec-overview-distribution">
          <div className="ec-distribution-top">
            <span>Um estoque, novas possibilidades.</span>
            <div>
              <strong>{materiais.length}</strong>{" "}
              {materiais.length === 1 ? "material" : "materiais"}{" "}
              <span>em</span> <strong>{categorias.length}</strong>{" "}
              {categorias.length === 1 ? "categoria" : "categorias"}
            </div>
          </div>
          <div className="ec-distribution-bar" aria-hidden="true">
            {distribuicao.map((categoria) => (
              <span
                key={categoria.id}
                className={`ec-category-color-${corDaCategoria(categoria.id)}`}
                style={{
                  width: `${valorTotal > 0 ? (categoria.valor / valorTotal) * 100 : 0}%`,
                }}
              />
            ))}
          </div>
          <div className="ec-distribution-legend">
            {distribuicao.map((categoria) => (
              <div key={categoria.id}>
                <span
                  className={`ec-category-dot ec-category-color-${corDaCategoria(categoria.id)}`}
                />
                <span>{categoria.nome}</span>
                <strong>{moeda(categoria.valor)}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="ec-inventory" aria-labelledby="materiais-titulo">
        <div className="ec-inventory-toolbar">
          <div>
            <h2 id="materiais-titulo">
              Materiais em estoque{" "}
              <span className="ec-count">{materiais.length}</span>
            </h2>
            <p>Escolha um material para acompanhar suas movimentações.</p>
          </div>
          <div className="ec-filters">
            <label className="ec-search">
              <Icone nome="busca" width="18" height="18" />
              <input
                aria-label="Buscar material"
                placeholder="Buscar material…"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar por categoria"
              value={categoriaAtiva}
              onChange={(evento) => setCategoriaId(evento.target.value)}
            >
              <option value="">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option value={categoria.id} key={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="ec-sr-only" role="status">
          {visiveis.length === 1
            ? "1 material encontrado."
            : `${visiveis.length} materiais encontrados.`}
        </p>
        {grupos.length === 0 ? (
          <EstadoVazio
            titulo={
              materiais.length
                ? "Nenhum material encontrado"
                : "Nenhum material cadastrado"
            }
            acao={
              materiais.length > 0 ? (
                <button
                  className="ec-button ec-button-secondary"
                  onClick={() => {
                    setBusca("");
                    setCategoriaId("");
                  }}
                >
                  Limpar filtros
                </button>
              ) : undefined
            }
          >
            {materiais.length
              ? "Tente outro nome ou escolha uma categoria diferente."
              : "Os materiais cadastrados aparecerão aqui com seus saldos."}
          </EstadoVazio>
        ) : (
          <div className="ec-material-groups">
            {grupos.map((grupo) => (
              <section
                className="ec-material-group"
                key={grupo.id}
                aria-labelledby={`grupo-${grupo.id}`}
              >
                <header className="ec-group-heading">
                  <div>
                    <span
                      className={`ec-category-dot ec-category-color-${corDaCategoria(grupo.id)}`}
                    />
                    <h3 id={`grupo-${grupo.id}`}>{grupo.nome}</h3>
                    <span>
                      {grupo.materiais.length}{" "}
                      {grupo.materiais.length === 1 ? "material" : "materiais"}
                    </span>
                  </div>
                  <strong>
                    {moeda(
                      grupo.materiais.reduce(
                        (total, material) =>
                          total + material.saldo * material.precoPorUnidade,
                        0,
                      ),
                    )}
                  </strong>
                </header>
                <table className="ec-stock-table">
                  <caption className="ec-sr-only">
                    Materiais da categoria {grupo.nome}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Material</th>
                      <th scope="col">Saldo disponível</th>
                      <th scope="col" className="ec-price-column">
                        Preço / unidade
                      </th>
                      <th scope="col">Valor em estoque</th>
                      <th scope="col">
                        <span className="ec-sr-only">Detalhes</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {grupo.materiais.map((material) => (
                      <tr key={material.id}>
                        <td>
                          <Link
                            className="ec-material-link"
                            to={`/materiais/${material.id}`}
                          >
                            <span className="ec-material-avatar">
                              <Icone nome="caixa" />
                            </span>
                            <span>
                              {material.nome}
                              <small>
                                MAT-{String(material.id).padStart(3, "0")}
                              </small>
                            </span>
                          </Link>
                        </td>
                        <td className="ec-numeric">
                          <strong>{quantidade(material.saldo)}</strong>{" "}
                          <span className="ec-unit">
                            {unidades[material.unidadeMedida]}
                          </span>
                        </td>
                        <td className="ec-numeric ec-price-column">
                          {moeda(material.precoPorUnidade)}
                          <span className="ec-unit">
                            {" "}
                            / {unidades[material.unidadeMedida]}
                          </span>
                        </td>
                        <td className="ec-numeric ec-stock-value">
                          {moeda(material.saldo * material.precoPorUnidade)}
                        </td>
                        <td>
                          <Icone nome="chevron" width="16" height="16" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        )}
        <div className="ec-inventory-note">
          <Icone nome="info" width="16" height="16" />
          <p>
            Os valores são estimativas com base no preço cadastrado de cada
            material.
          </p>
        </div>
      </section>
      {cadastroAberto && (
        <CadastroMaterial aoFechar={() => setCadastroAberto(false)} aoCadastrar={aoCadastrar} />
      )}
    </>
  );
}
