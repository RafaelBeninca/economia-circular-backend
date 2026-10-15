import assert from "node:assert/strict";
import { test } from "node:test";
import { resolverConfiguracao } from "../src/api/configuracao.ts";
import { comId, rotas } from "../src/api/rotas.ts";
import { ehMaterialComSaldo, ehMovimentacao } from "../src/api/validacao.ts";

// CAMADA: Teste de contrato e configuração
// RESPONSABILIDADE: impedir configuração ambígua e dados incompletos na interface.
test("demonstração é explícita e não exige uma URL de API", () => {
  assert.deepEqual(resolverConfiguracao({}, true), {
    modo: "demo",
    apiUrl: null,
    erro: null,
  });
});
test("API local tem padrão somente em desenvolvimento", () => {
  assert.equal(
    resolverConfiguracao({ VITE_MODO_DADOS: "api" }, false).apiUrl,
    "http://localhost:8080",
  );
  const producao = resolverConfiguracao({ VITE_MODO_DADOS: "api" }, true);
  assert.equal(producao.modo, "api");
  assert.equal(producao.apiUrl, null);
  assert.ok(producao.erro);
});
test("produção exige HTTPS e não aceita credenciais na URL", () => {
  for (const VITE_API_URL of [
    "http://api.example.com",
    "https://usuario:senha@api.example.com",
    "https://api.example.com?token=teste",
    "ftp://api.example.com",
  ]) {
    assert.ok(
      resolverConfiguracao({ VITE_MODO_DADOS: "api", VITE_API_URL }, true).erro,
    );
  }
  assert.deepEqual(
    resolverConfiguracao(
      {
        VITE_MODO_DADOS: "api",
        VITE_API_URL: " https://api.example.com/contexto/ ",
      },
      true,
    ),
    { modo: "api", apiUrl: "https://api.example.com/contexto", erro: null },
  );
});
test("modo inválido não vira demonstração silenciosamente", () => {
  assert.ok(resolverConfiguracao({ VITE_MODO_DADOS: "qualquer" }, false).erro);
  assert.equal(
    resolverConfiguracao({ VITE_MODO_DADOS: "qualquer" }, false).modo,
    "api",
  );
});
test("identificadores inválidos não montam uma rota para outro recurso", () => {
  for (const id of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => comId(rotas.buscarMaterial, id));
  assert.equal(comId(rotas.buscarMaterial, 12).caminho, "/materiais/12");
});
test("saldo é obrigatório no material principal e data na movimentação", () => {
  const material = {
    id: 1,
    nome: "Alumínio",
    unidadeMedida: "QUILO",
    precoPorUnidade: 0,
    tipoMaterial: { id: 1, nome: "Metal" },
  };
  assert.equal(ehMaterialComSaldo(material), false);
  assert.equal(ehMaterialComSaldo({ ...material, saldo: 0 }), true);
  assert.equal(ehMaterialComSaldo({ ...material, saldo: "10" }), false);
  const movimentacao = {
    id: 1,
    material,
    tipoMovimentacaoResiduo: "ENTRADA",
    quantidade: 10,
    descricao: "Exemplo",
    criadoEm: "2026-10-15T10:20:30.123456",
  };
  assert.equal(ehMovimentacao(movimentacao), true);
  assert.equal(ehMovimentacao({ ...movimentacao, criadoEm: null }), false);
});
