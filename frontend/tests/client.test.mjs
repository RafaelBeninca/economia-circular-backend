import assert from "node:assert/strict";
import { createServer } from "node:http";
import { after, before, test } from "node:test";
import { criarClienteApi, ErroApi } from "../src/api/client.ts";
import { comId, rotas } from "../src/api/rotas.ts";
import {
  ehErroDTO,
  ehMaterialComSaldo,
  listaDe,
} from "../src/api/validacao.ts";

// CAMADA: Teste de integração do cliente
// RESPONSABILIDADE: exercitar HTTP real contra um servidor controlado, sem Java.
// REGRAS: o servidor abaixo é uma fixture; não valida o backend nem suas regras.
const material = {
  id: 7,
  nome: "Material de teste",
  unidadeMedida: "QUILO",
  precoPorUnidade: 8.5,
  tipoMaterial: { id: 4, nome: "Metal" },
  saldo: 0,
};
const requisicoes = [];
let servidor;
let baseUrl;
before(async () => {
  servidor = createServer(async (pedido, resposta) => {
    let texto = "";
    for await (const parte of pedido) texto += parte;
    const url = new URL(pedido.url, "http://localhost");
    requisicoes.push({
      metodo: pedido.method,
      url,
      headers: pedido.headers,
      texto,
    });
    const json = (status, corpo) => {
      resposta.writeHead(status, { "Content-Type": "application/json" });
      resposta.end(JSON.stringify(corpo));
    };
    if (url.pathname === "/api/materiais" && pedido.method === "GET")
      return json(200, [material]);
    if (url.pathname === "/api/materiais" && pedido.method === "POST")
      return json(201, material);
    if (url.pathname === "/api/materiais/7" && pedido.method === "DELETE") {
      resposta.writeHead(204);
      return resposta.end();
    }
    if (url.pathname === "/api/movimentacoesResiduos") return json(200, []);
    if (url.pathname === "/api/materiais/999")
      return json(404, {
        status: 404,
        erro: "Not Found",
        mensagem: "Material não encontrado!",
        caminho: url.pathname,
        timestamp: "2026-10-15T12:00:00",
        campos: [],
      });
    if (url.pathname === "/api/validacao")
      return json(400, {
        status: 400,
        erro: "Bad Request",
        mensagem: "Confira os campos",
        caminho: url.pathname,
        timestamp: "2026-10-15T12:00:00",
        campos: [{ campo: "nome", mensagem: "Nome não pode ser vazio!" }],
      });
    if (url.pathname === "/api/formato") return json(200, { inesperado: true });
    if (url.pathname === "/api/lento")
      return setTimeout(() => {
        if (!resposta.destroyed) json(200, []);
      }, 150);
    resposta.writeHead(url.pathname === "/api/json-invalido" ? 200 : 503, {
      "Content-Type": "text/html",
    });
    resposta.end("<h1>Resposta sem JSON</h1>");
  });
  await new Promise((resolve) => servidor.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${servidor.address().port}/api/`;
});
after(async () => {
  servidor.closeAllConnections();
  await new Promise((resolve) => servidor.close(resolve));
});

test("GET preserva o caminho-base e registra resposta e duração", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  const resultado = await consultar(rotas.listarMateriais, {
    validar: listaDe(ehMaterialComSaldo),
  });
  assert.deepEqual(resultado, [material]);
  assert.equal(requisicoes.at(-1).url.pathname, "/api/materiais");
  assert.equal(requisicoes.at(-1).headers.accept, "application/json");
  assert.equal(requisicoes.at(-1).headers["content-type"], undefined);
  assert.equal(registros.length, 1);
  assert.equal(registros[0].status, 200);
  assert.equal(registros[0].resultado, "sucesso");
  assert.ok(registros[0].duracaoMs >= 0);
  assert.deepEqual(registros[0].corpoRecebido, [material]);
});
test("consulta codifica parâmetros e não envia undefined", async () => {
  const consultar = criarClienteApi({ baseUrl });
  await consultar(rotas.listarMovimentacoes, {
    consulta: {
      materialId: 7,
      busca: "aço & cobre",
      ausente: undefined,
      zero: 0,
      ativo: false,
    },
  });
  const parametros = requisicoes.at(-1).url.searchParams;
  assert.equal(parametros.get("materialId"), "7");
  assert.equal(parametros.get("busca"), "aço & cobre");
  assert.equal(parametros.has("ausente"), false);
  assert.equal(parametros.get("zero"), "0");
  assert.equal(parametros.get("ativo"), "false");
});
test("POST envia o RequestDTO em JSON e recebe saldo zero", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  const corpo = {
    nome: "Material de teste",
    precoPorUnidade: 8.5,
    unidadeMedida: "QUILO",
    tipoMaterialId: 4,
  };
  assert.equal(
    (
      await consultar(rotas.criarMaterial, {
        corpo,
        validar: ehMaterialComSaldo,
      })
    ).saldo,
    0,
  );
  assert.equal(requisicoes.at(-1).headers["content-type"], "application/json");
  assert.deepEqual(JSON.parse(requisicoes.at(-1).texto), corpo);
  assert.deepEqual(registros[0].corpoEnviado, corpo);
  assert.equal(registros[0].status, 201);
});
test("DELETE 204 não tenta interpretar JSON vazio", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  assert.equal(await consultar(comId(rotas.removerMaterial, 7)), undefined);
  assert.equal(registros[0].status, 204);
  assert.equal(registros[0].corpoRecebido, undefined);
});
test("404 e 400 preservam a mensagem e os erros por campo", async () => {
  const consultar = criarClienteApi({ baseUrl, reconhecerErro: ehErroDTO });
  await assert.rejects(
    consultar(comId(rotas.buscarMaterial, 999)),
    (erro) =>
      erro instanceof ErroApi &&
      erro.categoria === "http" &&
      erro.status === 404 &&
      erro.message === "Material não encontrado!",
  );
  await assert.rejects(
    consultar(
      { ...rotas.criarMaterial, caminho: "/validacao" },
      { corpo: { nome: "" } },
    ),
    (erro) => erro.status === 400 && erro.detalhes.campos[0].campo === "nome",
  );
});
test("JSON incompatível e resposta sem JSON são falhas de contrato", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  for (const caminho of ["/formato", "/json-invalido"]) {
    await assert.rejects(
      consultar(
        { ...rotas.listarMateriais, caminho },
        { validar: listaDe(ehMaterialComSaldo) },
      ),
      (erro) => erro.categoria === "resposta" && erro.status === 200,
    );
  }
  assert.ok(registros.every((registro) => registro.resultado === "erro"));
});
test("erro HTML mantém status sem apresentar o HTML como mensagem", async () => {
  const consultar = criarClienteApi({ baseUrl });
  await assert.rejects(
    consultar({ ...rotas.listarMateriais, caminho: "/indisponivel" }),
    (erro) => erro.status === 503 && !erro.message.includes("<h1>"),
  );
});
test("falha de rede é distinta de erro HTTP", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    transporte: async () => {
      throw new TypeError("rede indisponível");
    },
    aoConcluir: (registro) => registros.push(registro),
  });
  await assert.rejects(
    consultar(rotas.listarMateriais),
    (erro) => erro.categoria === "rede" && erro.status === null,
  );
  assert.equal(registros[0].status, null);
  assert.equal(registros[0].resultado, "erro");
});
test("tempo limite interrompe uma resposta lenta", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    tempoLimiteMs: 25,
    aoConcluir: (registro) => registros.push(registro),
  });
  await assert.rejects(
    consultar({ ...rotas.listarMateriais, caminho: "/lento" }),
    (erro) => erro.categoria === "tempo",
  );
  assert.equal(registros[0].resultado, "erro");
});
test("cancelamento não aparece como tempo esgotado", async () => {
  const registros = [];
  const controle = new AbortController();
  controle.abort();
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  await assert.rejects(
    consultar(rotas.listarMateriais, { signal: controle.signal }),
    (erro) => erro.categoria === "cancelamento",
  );
  assert.equal(registros[0].resultado, "cancelada");
});
test("um observador com falha não interrompe a consulta", async () => {
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: () => {
      throw new Error("falha da interface");
    },
  });
  assert.deepEqual(await consultar(rotas.listarMateriais), [material]);
});
test("o histórico preserva os corpos mesmo se a interface alterar seus objetos", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  const corpo = {
    nome: "Nome enviado",
    precoPorUnidade: 8.5,
    unidadeMedida: "QUILO",
    tipoMaterialId: 4,
  };
  const promessa = consultar(rotas.criarMaterial, { corpo });
  corpo.nome = "Nome alterado durante a consulta";
  const recebido = await promessa;
  recebido.nome = "Nome alterado pela interface";
  assert.equal(registros[0].corpoEnviado.nome, "Nome enviado");
  assert.equal(registros[0].corpoRecebido.nome, material.nome);
  assert.equal(JSON.parse(requisicoes.at(-1).texto).nome, "Nome enviado");
});
test("dados não serializáveis não são confundidos com falha de rede", async () => {
  const registros = [];
  const corpo = {};
  corpo.referenciaCircular = corpo;
  const quantidadeAnterior = requisicoes.length;
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  await assert.rejects(
    consultar(rotas.criarMaterial, { corpo }),
    (erro) => erro.categoria === "requisicao" && erro.status === null,
  );
  assert.equal(requisicoes.length, quantidadeAnterior);
  assert.equal(registros[0].resultado, "erro");
});
test("JSON null não é registrado como ausência de corpo", async () => {
  const registros = [];
  const consultar = criarClienteApi({
    baseUrl,
    aoConcluir: (registro) => registros.push(registro),
  });
  await consultar(rotas.listarMateriais);
  await consultar(rotas.criarMaterial, { corpo: null });
  assert.equal(registros[0].corpoEnviado, undefined);
  assert.equal(registros[1].corpoEnviado, null);
  assert.equal(requisicoes.at(-1).texto, "null");
});
