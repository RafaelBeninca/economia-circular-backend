import assert from "node:assert/strict";
import { test } from "node:test";
import { criarClienteApi, ErroApi } from "../src/api/client.ts";
import { rotas } from "../src/api/rotas.ts";
import { ehErroDTO, ehMaterialComSaldo } from "../src/api/validacao.ts";
import { prepararMaterial, prepararTipo, camposCadastroDaApi, reunirTipos } from "../src/cadastros/preparacao.ts";
import { gravacaoIncerta } from "../src/formularios/movimentacao.ts";

// CAMADA: Teste dos cadastros
// RESPONSABILIDADE: conferir DTO, preenchimento, mensagens e preservação de tipos confirmados.
// REGRAS: o servidor controlado não comprova a execução de R3 no Java.
const tipos = [{ id: 31, nome: "Metal" }];
const valido = { nome: " Sucata ", precoPorUnidade: " 12,50 ", unidadeMedida: "QUILO", tipoMaterialId: "31" };
test("cadastro envia o contrato sem saldo, sem arredondamento e com nome aparado", () => {
  assert.deepEqual(prepararMaterial(valido, tipos), { campos: {}, corpo: {
    nome: "Sucata", precoPorUnidade: 12.5, unidadeMedida: "QUILO", tipoMaterialId: 31,
  } });
  assert.equal(prepararMaterial({ ...valido, precoPorUnidade: ".0012345" }, tipos).corpo.precoPorUnidade, 0.0012345);
  for (const unidadeMedida of ["QUILO", "METRO", "PECA", "UNIDADE"])
    assert.equal(prepararMaterial({ ...valido, unidadeMedida }, tipos).corpo.unidadeMedida, unidadeMedida);
});
test("preço segue @Positive e rejeita valores ambíguos ou não finitos", () => {
  for (const precoPorUnidade of ["", " ", "0", "0,0", "-1", "+1", "1.000,50", "1,000.50", "1 000", "1e3", "Infinity", "NaN", "9".repeat(400)]) {
    const preparado = prepararMaterial({ ...valido, precoPorUnidade }, tipos);
    assert.equal(preparado.corpo, undefined, precoPorUnidade);
    assert.ok(preparado.campos.precoPorUnidade, precoPorUnidade);
  }
});
test("nome respeita preenchimento e limite das entidades, sem conferir duplicidade", () => {
  for (const nome of ["", " \n ", "x".repeat(256)]) {
    assert.ok(prepararTipo(nome).campos.nome);
    assert.ok(prepararMaterial({ ...valido, nome }, tipos).campos.nome);
  }
  assert.equal(prepararTipo(" x ").corpo.nome, "x");
  assert.ok(prepararTipo("x".repeat(255)).corpo);
  assert.ok(prepararMaterial({ ...valido, nome: "x".repeat(255) }, tipos).corpo);
  assert.ok(prepararMaterial({ ...valido, nome: "Metal" }, tipos).corpo);
});
test("unidade e ID precisam corresponder às opções carregadas", () => {
  assert.ok(prepararMaterial({ ...valido, unidadeMedida: "kg" }, tipos).campos.unidadeMedida);
  for (const tipoMaterialId of ["", "0", "-31", "31.0", "31e0", "32", "9007199254740993"])
    assert.ok(prepararMaterial({ ...valido, tipoMaterialId }, tipos).campos.tipoMaterialId, tipoMaterialId);
  assert.ok(prepararMaterial(valido, []).campos.tipoMaterialId);
});
test("novo tipo confirmado fica disponível mesmo com consulta antiga e nome repetido não deduplica IDs", () => {
  const confirmado = { id: 32, nome: "Metal" };
  assert.deepEqual(reunirTipos(tipos, [confirmado]), [...tipos, confirmado]);
  assert.deepEqual(reunirTipos([{ id: 32, nome: "Antigo" }], [confirmado]), [confirmado]);
  assert.deepEqual(reunirTipos([], [confirmado]), [confirmado]);
  assert.ok(prepararMaterial({ ...valido, tipoMaterialId: "32" }, reunirTipos(tipos, [confirmado])).corpo);
});
test("ErroDTO mantém mensagens dos quatro campos e falhas incertas impedem nova tentativa automática", () => {
  const campos = Object.entries({ nome: "Nome obrigatório", precoPorUnidade: "Preço positivo", unidadeMedida: "Escolha unidade", tipoMaterialId: "Escolha tipo" }).map(([campo, mensagem]) => ({ campo, mensagem }));
  assert.deepEqual(camposCadastroDaApi(new ErroApi("Corrija", "http", 400, { campos })), Object.fromEntries(campos.map((item) => [item.campo, item.mensagem])));
  assert.deepEqual(camposCadastroDaApi(new Error("Falha")), {});
  assert.deepEqual(camposCadastroDaApi(new ErroApi("R3", "http", 400, { campos: [] })), {});
  assert.equal(gravacaoIncerta(new ErroApi("R3", "http", 400)), false);
  assert.equal(gravacaoIncerta(new ErroApi("Perdida", "resposta", 201)), true);
  assert.equal(gravacaoIncerta(new ErroApi("Indisponível", "http", 503)), true);
});
test("R3 vem do transporte central com corpo e ErroDTO preservados nos bastidores", async () => {
  const pedidos = [], registros = [];
  const erro = { status: 400, erro: "Bad Request", mensagem: "Já existe um material com esse nome e unidade de medida!", caminho: "/materiais", timestamp: "2026-10-15T12:00:00", campos: [] };
  const cliente = criarClienteApi({ baseUrl: "http://fixture.invalid", reconhecerErro: ehErroDTO, aoConcluir: (item) => registros.push(item), transporte: async (url, opcoes) => {
    pedidos.push({ url, ...opcoes });
    return new Response(JSON.stringify(erro), { status: 400 });
  } });
  const corpo = prepararMaterial(valido, tipos).corpo;
  await assert.rejects(cliente(rotas.criarMaterial, { corpo, validar: ehMaterialComSaldo }), (causa) => causa instanceof ErroApi && causa.message === erro.mensagem && !gravacaoIncerta(causa));
  assert.equal(pedidos.length, 1);
  assert.equal(pedidos[0].method, "POST");
  assert.deepEqual(JSON.parse(pedidos[0].body), corpo);
  assert.equal(registros[0].status, 400);
  assert.deepEqual(registros[0].corpoRecebido, erro);
});
