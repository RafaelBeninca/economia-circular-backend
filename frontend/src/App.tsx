import { useEffect, useState } from "react";
import { ambiente } from "./ambiente";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { GavetaBastidores } from "./bastidores/GavetaBastidores";
import { BotaoTema } from "./components/BotaoTema";
import { EstadoVazio } from "./components/EstadoVazio";
import { Icone } from "./components/Icone";
import { Material } from "./pages/Material";
import { PainelSaldos } from "./pages/PainelSaldos";

// CAMADA: Aplicação
// RESPONSABILIDADE: reunir navegação, tema e a estrutura comum das duas telas.
// SITUAÇÃO: consultas integradas e origem dos dados identificada na interface
export function App() {
  const [bastidoresAbertos, setBastidoresAbertos] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="ec-shell">
      <a className="ec-skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <aside className="ec-sidebar">
        <Link
          className="ec-brand"
          to="/"
          aria-label="Economia Circular, início"
        >
          <span className="ec-brand-mark">
            <Icone nome="ciclo" width="25" height="25" />
          </span>
          <span>
            economia
            <span className="ec-brand-second">
              circular<span className="ec-brand-period">.</span>
            </span>
          </span>
        </Link>
        <div className="ec-sidebar-section">ESPAÇO DE TRABALHO</div>
        <nav aria-label="Navegação principal">
          <NavLink className="ec-nav-link" to="/">
            <Icone nome="painel" />
            <span>Painel de saldos</span>
            <Icone nome="chevron" width="15" height="15" />
          </NavLink>
        </nav>
        <div className="ec-sidebar-bottom">
          <div className="ec-sidebar-message">
            <Icone nome="folha" width="28" height="28" />
            <h2>
              Do resíduo
              <br />
              ao recurso.
            </h2>
            <p>
              Mais clareza sobre o que sobra. Mais valor para o que vem depois.
            </p>
          </div>
          <div className="ec-sidebar-footer">
            <span className="ec-small-mark">EC</span>
            <div>
              Economia Circular<small>Controle de resíduos</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="ec-main">
        <header className="ec-topbar">
          <div className="ec-breadcrumb">
            <span>Estoque</span>
            <Icone nome="chevron" width="13" height="13" />
            <span>{pathname === "/" ? "Visão geral" : "Material"}</span>
          </div>
          <div className="ec-topbar-actions">
            <span
              className={`ec-demo-badge ${ambiente.modo === "api" ? "ec-source-api" : ""}`}
            >
              <span />
              {ambiente.modo === "demo" ? "Dados de exemplo" : "Dados da API"}
            </span>
            <BotaoTema />
            <span className="ec-topbar-divider" />
            <button
              className="ec-button ec-button-secondary ec-backstage-button"
              onClick={() => setBastidoresAbertos(true)}
            >
              <Icone nome="codigo" />
              <span>Bastidores</span>
            </button>
          </div>
        </header>
        <main id="conteudo" className="ec-content" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<PainelSaldos />} />
            <Route path="/materiais/:id" element={<Material />} />
            <Route
              path="*"
              element={
                <EstadoVazio
                  titulo="Esta página não foi encontrada"
                  acao={
                    <Link className="ec-button ec-button-primary" to="/">
                      Voltar ao painel
                    </Link>
                  }
                >
                  Use o painel para encontrar um material e consultar seu
                  extrato.
                </EstadoVazio>
              }
            />
          </Routes>
          <footer className="ec-page-footer">
            <span>
              Economia Circular <span aria-hidden="true">·</span> Cada sobra tem
              valor.
            </span>
            <span>
              {ambiente.modo === "demo"
                ? "Prévia com dados ilustrativos"
                : "Consulta ao estoque pela API"}
            </span>
          </footer>
        </main>
      </div>
      <GavetaBastidores
        aberta={bastidoresAbertos}
        aoFechar={() => setBastidoresAbertos(false)}
      />
    </div>
  );
}
