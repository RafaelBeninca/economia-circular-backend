import assert from "node:assert/strict";
import { test } from "node:test";
import { ErroApi, criarClienteApi } from "../src/api/client.ts";
import { ehErroDTO } from "../src/api/validacao.ts";
import { rotas } from "../src/api/rotas.ts";
import { classificarFalha, moduloMaiorQueSaldo, prepararCenario } from "../src/laboratorio/cenarios.ts";

// CAMADA: Testes didáticos
// RESPONSABILIDADE: impedir falsos sucessos e corpos que não alcançam a regra desejada.
// SITUAÇÃO: transporte controlado; não executa as regras Java
const material = { id: 17, nome: "Alumínio", saldo: 10, unidadeMedida: "QUILO", precoPorUnidade: 7.5, tipoMaterial: { id: 9, nome: "Metal" } };
const detalhe = (mensagem, campos = []) => ({ status: 400, erro: "Bad Request", mensagem, campos, caminho: "/movimentacoesResiduos", timestamp: "2026-10-15T12:00:00" });
const erro = (mensagem, campos = []) => new ErroApi(mensagem, "http", 400, detalhe(mensagem, campos));
test("R1 produz saída negativa estritamente maior que saldos pequenos e grandes, sem Infinity", () => {
  for (const saldo of [-Number.MAX_VALUE, -10, -0, 0, Number.MIN_VALUE, 0.1, 10, 2 ** 53, 1e200, Number.MAX_VALUE / 1.001]) {
    const valor = moduloMaiorQueSaldo(saldo);
    assert.ok(Number.isFinite(valor) && valor > 0 && valor > saldo, String(saldo));
    const cenario = prepararCenario("R1", { ...material, saldo });
    assert.equal(cenario.corpo.movimentacaoResiduo, "SAIDA");
    assert.ok(cenario.corpo.quantidade < 0 && saldo + cenario.corpo.quantidade < 0);
    assert.notEqual(JSON.parse(JSON.stringify(cenario.corpo)).quantidade, null);
  }
  for (const saldo of [Number.MAX_VALUE, Infinity, -Infinity, NaN]) {
    assert.equal(moduloMaiorQueSaldo(saldo), null);
    assert.equal(prepararCenario("R1", { ...material, saldo }).corpo, null);
  }
});
test("R2 não usa zero e R3 copia chave duplicada e campos sem saldo/id", () => {
  assert.deepEqual(prepararCenario("R2", material).corpo, { materialId: 17, movimentacaoResiduo: "ENTRADA", quantidade: -1, descricao: "Laboratório R2: tentativa deliberadamente inválida" });
  assert.deepEqual(prepararCenario("R3", material).corpo, { nome: "Alumínio", unidadeMedida: "QUILO", precoPorUnidade: 7.5, tipoMaterialId: 9 });
  assert.ok(prepararCenario("R3", { ...material, precoPorUnidade: 0 }).impedimento);
  const origem = structuredClone(material);
  const cenario = prepararCenario("R3", origem);
  origem.nome = "Outro";
  origem.tipoMaterial.nome = "Outro tipo";
  assert.equal(cenario.corpo.nome, "Alumínio");
  assert.equal(cenario.material.tipoMaterial.nome, "Metal");
});
test("apenas 400 real com mensagem da regra e campos vazios demonstra R1/R2/R3", () => {
  const mensagens = { R1: "Saída de 11.0 excede o saldo disponível de 10.0 do material!", R2: "Saída deve ter quantidade negativa e entrada, positiva!", R3: "Já existe um material com esse nome e unidade de medida!" };
  for (const regra of Object.keys(mensagens)) {
    const causa = erro(mensagens[regra]);
    const resultado = classificarFalha(regra, causa);
    assert.equal(resultado.tipo, "regra");
    assert.equal(resultado.status, 400);
    assert.equal(resultado.corpo, causa.detalhes);
    assert.equal(classificarFalha(regra, erro(mensagens[regra], [{ campo: "x", mensagem: "inválido" }])).tipo, "dto");
    const outra = regra === "R1" ? "R2" : "R1";
    assert.equal(classificarFalha(outra, causa).tipo, "outra");
  }
  assert.equal(classificarFalha("R1", erro("Saída de 1.1E100 excede o saldo disponível de 1.0E100 do material!")).tipo, "regra");
  for (const mensagem of ["Saída de NaN excede o saldo disponível de 10 do material!", "Saída de Infinity excede o saldo disponível de 10 do material!", "Saída de 2 excede o saldo disponível de 10 do material!", "Saída de 11 excede o saldo disponível de 10 do material! extra", "Corpo da requisição inválido: confira o JSON e os valores possíveis para os Enums"])
    assert.equal(classificarFalha("R1", erro(mensagem)).tipo, "outra");
});
test("falhas de DTO, 404, status divergente e incerteza não contam como regra", () => {
  const msg = "Saída deve ter quantidade negativa e entrada, positiva!";
  assert.equal(classificarFalha("R2", new ErroApi(msg, "http", 404, detalhe(msg))).tipo, "outra");
  assert.equal(classificarFalha("R2", new ErroApi(msg, "http", 400, { ...detalhe(msg), status: 404 })).tipo, "outra");
  assert.equal(classificarFalha("R2", new ErroApi(msg, "http", 400)).tipo, "outra");
  for (const categoria of ["rede", "tempo", "cancelamento", "resposta"])
    assert.equal(classificarFalha("R2", new ErroApi(msg, categoria, 400, detalhe(msg))).tipo, "incerta");
  assert.equal(classificarFalha("R2", new ErroApi(msg, "http", 503, detalhe(msg))).tipo, "incerta");
  assert.equal(classificarFalha("R2", new Error(msg)).tipo, "incerta");
  assert.equal(classificarFalha("R2", new ErroApi(msg, "requisicao")).tipo, "outra");
});
test("tentativa R2 atravessa cliente e preserva corpo/status do transporte", async () => {
  const recebido = detalhe("Saída deve ter quantidade negativa e entrada, positiva!");
  const registros = [];
  let enviado;
  const cliente = criarClienteApi({ baseUrl: "http://fixture.invalid", reconhecerErro: ehErroDTO, aoConcluir: (registro) => registros.push(registro), transporte: async (_url, opcoes) => {
    enviado = JSON.parse(opcoes.body);
    return new Response(JSON.stringify(recebido), { status: 400 });
  } });
  const cenario = prepararCenario("R2", material);
  await assert.rejects(cliente(rotas.criarMovimentacao, { corpo: cenario.corpo }), (causa) => {
    assert.equal(classificarFalha("R2", causa).tipo, "regra");
    assert.deepEqual(causa.detalhes, recebido);
    return true;
  });
  assert.deepEqual(enviado, cenario.corpo);
  assert.equal(registros.length, 1);
  assert.equal(registros[0].status, 400);
  assert.deepEqual(registros[0].corpoRecebido, recebido);
});
