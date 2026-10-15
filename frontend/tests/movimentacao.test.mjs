import assert from "node:assert/strict";
import { test } from "node:test";
import { criarClienteApi, ErroApi } from "../src/api/client.ts";
import { rotas } from "../src/api/rotas.ts";
import { ehErroDTO, ehMovimentacao } from "../src/api/validacao.ts";
import { camposDaApi, gravacaoIncerta, prepararMovimentacao } from "../src/formularios/movimentacao.ts";
import { quantidade } from "../src/formatacao.ts";

// CAMADA: Teste do fluxo de movimentação
// RESPONSABILIDADE: conferir sinal, corpo enviado e classificação de falhas de escrita.
// REGRAS: respostas controladas não validam a implementação das regras Java.
test("entrada e saída aceitam decimais locais e enviam o contrato Java", () => {
  assert.deepEqual(prepararMovimentacao(17, "ENTRADA", " 15,50 ", " Sobra de produção ").corpo, {
    materialId: 17, movimentacaoResiduo: "ENTRADA", quantidade: 15.5, descricao: "Sobra de produção",
  });
  assert.equal(prepararMovimentacao(17, "SAIDA", "15.5", "Destinação").corpo.quantidade, -15.5);
  assert.equal(prepararMovimentacao(17, "ENTRADA", ",5", "Retorno").corpo.quantidade, 0.5);
});
test("zero, sinais, infinitos, notação científica e separadores ambíguos não viram POST", () => {
  for (const valor of ["", " ", "0", "0,00", "-15", "+15", "NaN", "Infinity", "1e3", "1.000,25", "1,000.25", "1 000", "1,2,3", "9".repeat(400)]) {
    const preparado = prepararMovimentacao(17, "ENTRADA", valor, "Motivo");
    assert.equal(preparado.corpo, undefined, valor);
    assert.ok(preparado.campos.quantidade, valor);
  }
  const preparado = prepararMovimentacao(17, "SAIDA", "2", "  \n  ");
  assert.equal(preparado.corpo, undefined);
  assert.ok(preparado.campos.descricao);
  assert.ok(prepararMovimentacao(17, "ENTRADA", "1", "x".repeat(256)).campos.descricao);
  assert.ok(prepararMovimentacao(17, "ENTRADA", "1", "x".repeat(255)).corpo);
});
test("quantidades fracionárias aceitas não são exibidas como zero", () => {
  assert.equal(quantidade(0.001), "0,001");
  assert.equal(quantidade(0.000000000001), "0,000000000001");
  assert.equal(quantidade(15.12345), "15,12345");
});
test("não arredonda o valor nem limita a saída ao saldo que pode estar desatualizado", () => {
  assert.equal(prepararMovimentacao(17, "SAIDA", "9999,12345", "Reaproveitamento").corpo.quantidade, -9999.12345);
  assert.throws(() => prepararMovimentacao(0, "SAIDA", "2", "Motivo"));
  assert.throws(() => prepararMovimentacao(17, "INVALIDO", "2", "Motivo"));
});
test("mapeia mensagens por campo sem perder o nome derivado do AssertTrue", () => {
  const erro = new ErroApi("Corrija os campos", "http", 400, { campos: [
    { campo: "quantidadeDiferenteDeZero", mensagem: "Quantidade não pode ser zero!" },
    { campo: "descricao", mensagem: "Descrição não pode ser vazia!" },
    { campo: "materialId", mensagem: "Outro problema" },
  ] });
  assert.deepEqual(camposDaApi(erro), { quantidade: "Quantidade não pode ser zero!", descricao: "Descrição não pode ser vazia!" });
  assert.deepEqual(camposDaApi(new Error("Rede")), {});
});
test("falhas após possível envio exigem conferir o extrato, sem repetição automática", () => {
  for (const categoria of ["rede", "tempo", "cancelamento", "resposta"])
    assert.equal(gravacaoIncerta(new ErroApi("Falha", categoria)), true);
  assert.equal(gravacaoIncerta(new ErroApi("Falha", "http", 503)), true);
  assert.equal(gravacaoIncerta(new Error("Falha inesperada")), true);
  assert.equal(gravacaoIncerta(new ErroApi("R1", "http", 400)), false);
  assert.equal(gravacaoIncerta(new ErroApi("Não existe", "http", 404)), false);
  assert.equal(gravacaoIncerta(new ErroApi("Não serializou", "requisicao")), false);
});
test("saída convertida atravessa o cliente único e registra POST e ErroDTO reais do transporte", async () => {
  const pedidos = [];
  const registros = [];
  const erro = { status: 400, erro: "Bad Request", mensagem: "Saída excede o saldo disponível!", caminho: "/movimentacoesResiduos", timestamp: "2026-10-15T12:00:00", campos: [] };
  const cliente = criarClienteApi({ baseUrl: "http://fixture.invalid", reconhecerErro: ehErroDTO,
    aoConcluir: (registro) => registros.push(registro),
    transporte: async (url, opcoes) => {
      pedidos.push({ url, ...opcoes });
      return new Response(JSON.stringify(erro), { status: 400 });
    },
  });
  const corpo = prepararMovimentacao(17, "SAIDA", "30,5", "Reaproveitamento").corpo;
  await assert.rejects(cliente(rotas.criarMovimentacao, { corpo, validar: ehMovimentacao }), (causa) => causa instanceof ErroApi && causa.message === erro.mensagem && !gravacaoIncerta(causa));
  assert.equal(pedidos.length, 1);
  assert.equal(pedidos[0].method, "POST");
  assert.deepEqual(JSON.parse(pedidos[0].body), { materialId: 17, movimentacaoResiduo: "SAIDA", quantidade: -30.5, descricao: "Reaproveitamento" });
  assert.equal(registros.length, 1);
  assert.equal(registros[0].status, 400);
  assert.deepEqual(registros[0].corpoEnviado, corpo);
  assert.deepEqual(registros[0].corpoRecebido, erro);
});
