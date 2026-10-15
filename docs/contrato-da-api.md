# Contrato da API

> O contrato é o que o cliente da API enxerga: rotas, JSON e status.

## Convenções

| Item | Valor |
|---|---|
| Endereço base | `http://localhost:8080` |
| Formato | JSON, na requisição e na resposta |
| Datas | Só `criadoEm`, em `MovimentacaoResiduoResponseDTO`. Formato ISO-8601 sem fuso (`2026-10-15T14:23:11`) |
| Erros | Sempre no formato `ErroDTO` (ver [Erros](#erros)) |
| Documentação viva | `http://localhost:8080/swagger-ui.html` |
| CORS | Liberado para `http://localhost:5173` e `http://127.0.0.1:5173` (o front em desenvolvimento). Ver `config/CorsConfig` |

## Rotas

Coluna **Funciona**: `sim` para as rotas que já respondem nesta etapa.

### Tipos de materiais

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---|---|---|
| `GET` | `/tiposMateriais` | Lista os tipos de materiais | Nenhuma | lista de `TipoMaterialResponseDTO` | `200` | Nenhum | sim |
| `GET` | `/tiposMateriais/{id}` | Busca um tipo de material | Nenhuma | `TipoMaterialResponseDTO` | `200` | `404` | sim |
| `POST` | `/tiposMateriais` | Cadastra um tipo de material | `TipoMaterialRequestDTO` | `TipoMaterialResponseDTO` | `201` | `400` | sim |
| `PUT` | `/tiposMateriais/{id}` | Edita o nome de um tipo de material | `TipoMaterialUpdateRequestDTO` | `TipoMaterialResponseDTO` | `200` | `400`, `404` | sim |
| `DELETE` | `/tiposMateriais/{id}` | Remove um tipo de material | Nenhuma | Nenhuma (sem corpo) | `204` | `400`, `404` | sim |

### Materiais

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---------|---|---|
| `GET` | `/materiais` | Lista os materiais, cada um com o saldo atual | Nenhuma | lista de `MaterialComSaldoResponseDTO` | `200`   | Nenhum | sim |
| `GET` | `/materiais/{id}` | Busca um material, com o saldo atual | Nenhuma | `MaterialComSaldoResponseDTO` | `200`   | `404` | sim |
| `POST` | `/materiais` | Cadastra um material | `MaterialRequestDTO` | `MaterialComSaldoResponseDTO` | `201`   | `400`, `404` | sim |
| `PUT` | `/materiais/{id}` | Edita o nome e o preço por unidade de um material | `MaterialUpdateRequestDTO` | `MaterialComSaldoResponseDTO` | `200` | `400`, `404` | sim |
| `DELETE` | `/materiais/{id}` | Remove um material | Nenhuma | Nenhuma (sem corpo) | `204` | `400`, `404` | sim |

### Movimentações de resíduos

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---------|---|---|
| `GET` | `/movimentacoesResiduos` | Lista as movimentações, da mais recente para a mais antiga | `?materialId=` (opcional) | lista de `MovimentacaoResiduoResponseDTO` | `200`   | `400` (filtro inválido) | sim |
| `GET` | `/movimentacoesResiduos/{id}` | Busca uma movimentação | Nenhuma | `MovimentacaoResiduoResponseDTO` | `200`   | `404` | sim |
| `POST` | `/movimentacoesResiduos` | Registra uma entrada ou saída de resíduo | `MovimentacaoResiduoRequestDTO` | `MovimentacaoResiduoResponseDTO` | `201`   | `400`, `404` | sim |
| `DELETE` | `/movimentacoesResiduos/{id}` | Remove uma movimentação | Nenhuma | Nenhuma (sem corpo) | `204` | `404` | sim |

### O filtro de movimentações

`GET /movimentacoesResiduos` aceita o parâmetro de consulta opcional `materialId`:

| Chamada | O que devolve |
|---|---|
| `GET /movimentacoesResiduos` | Todas as movimentações |
| `GET /movimentacoesResiduos?materialId=1` | Só as do material 1 -- o extrato dele |

`materialId` é **query param** (vem depois do `?`), diferente do `{id}` das outras rotas, que é **path param** (faz parte do caminho). Um `materialId` que não existe devolve lista vazia e `200`, não `404`: filtro sem resultado é lista vazia, não recurso inexistente.

As duas formas saem ordenadas por `criadoEm`, da movimentação mais recente para a mais antiga.

Um valor que não pode ser convertido para `Long`, como `?materialId=abc`, devolve `400` no formato `ErroDTO`, com o parâmetro identificado na lista `campos`.

### Rotas que não são CRUD

Não há rotas fora do CRUD.

## Rotas origem das regras de negócio

| Verbo | Caminho | O que faz | Regra | Sucesso | Erros |
|---|---|---|---|---------|---|
| `POST` | `/movimentacoesResiduos` | Registra a movimentação e valida saldo e sinal | R1 e R2 | `201`   | `400`, `404` |
| `POST` | `/materiais` | Cadastra o material e impede duplicidade de nome e unidade | R3 | `201`   | `400`, `404` |
| `PUT` | `/materiais/{id}` | Edita o nome e o preço e impede duplicidade de nome e unidade | R3 | `200`   | `400`, `404` |

## DTOs

O que entra não é igual ao que sai: o cliente não envia `id`.

| DTO | Direção | Campos | Validações |
|---|---|---|---|
| `TipoMaterialRequestDTO` | entrada | `nome` | obrigatório (`@NotBlank`) |
| `TipoMaterialUpdateRequestDTO` | entrada | `nome` | obrigatório (`@NotBlank`) |
| `TipoMaterialResponseDTO` | saída | `id`, `nome` | Nenhuma |
| `MaterialRequestDTO` | entrada | `nome`, `precoPorUnidade`, `unidadeMedida`, `tipoMaterialId` | todos obrigatórios; `nome` com `@NotBlank`; `precoPorUnidade` com `@Positive` |
| `MaterialUpdateRequestDTO` | entrada | `nome`, `precoPorUnidade` | ambos obrigatórios; `nome` com `@NotBlank`; `precoPorUnidade` com `@Positive` |
| `MaterialResponseDTO` | saída | `id`, `nome`, `unidadeMedida`, `precoPorUnidade`, `tipoMaterial` (`TipoMaterialResponseDTO`) | Nenhuma |
| `MaterialComSaldoResponseDTO` | saída | o mesmo do `MaterialResponseDTO`, mais `saldo` | Nenhuma |
| `MovimentacaoResiduoRequestDTO` | entrada | `materialId`, `movimentacaoResiduo`, `quantidade`, `descricao` | todos obrigatórios; `descricao` com `@NotBlank`; `quantidade` diferente de zero |
| `MovimentacaoResiduoResponseDTO` | saída | `id`, `material` (`MaterialResponseDTO`), `tipoMovimentacaoResiduo`, `quantidade`, `descricao`, `criadoEm` | Nenhuma |

Valores aceitos: `unidadeMedida` em `UNIDADE`, `PECA`, `METRO`, `QUILO`; `movimentacaoResiduo` em `ENTRADA`, `SAIDA`.

**Por que existem dois DTOs de saída para material.** O `saldo` é a soma das movimentações daquele material e só faz sentido quando o material é o recurso pedido, nas rotas de `/materiais` -- aí sai o `MaterialComSaldoResponseDTO`. Dentro de uma movimentação o material aparece como contexto, e continua sendo o `MaterialResponseDTO`: o objeto `material` aninhado mantém seus campos, enquanto a movimentação recebe o novo campo `criadoEm`, e a API não precisa somar o saldo de cada material de cada movimentação da lista.

**`criadoEm` é definido pela API**, com `@CreationTimestamp`: não entra no `MovimentacaoResiduoRequestDTO`. Mesmo que o cliente envie essa propriedade extra no JSON, ela não define a data gravada.

## Exemplos

Um par requisição/resposta por entidade.

### `POST /tiposMateriais`

Requisição:

```json
{
  "nome": "Metal"
}
```

Resposta, `201 Created`:

```json
{
  "id": 1,
  "nome": "Metal"
}
```

### `PUT /tiposMateriais/{id}`

Requisição (só o `nome` muda):

```json
{
  "nome": "Metal e ligas"
}
```

Resposta, `200 OK`:

```json
{
  "id": 1,
  "nome": "Metal e ligas"
}
```

### `POST /materiais`

Requisição:

```json
{
  "nome": "Sucata de alumínio",
  "precoPorUnidade": 8.5,
  "unidadeMedida": "QUILO",
  "tipoMaterialId": 1
}
```

Resposta, `201 OK` (material novo nasce com `saldo` zero):

```json
{
  "id": 1,
  "nome": "Sucata de alumínio",
  "unidadeMedida": "QUILO",
  "precoPorUnidade": 8.5,
  "tipoMaterial": {
    "id": 1,
    "nome": "Metal"
  },
  "saldo": 0.0
}
```

### `PUT /materiais/{id}`

Requisição (só o `nome` e o `precoPorUnidade` mudam):

```json
{
  "nome": "Sucata de alumínio limpa",
  "precoPorUnidade": 9.75
}
```

Resposta, `200 OK`:

```json
{
  "id": 1,
  "nome": "Sucata de alumínio limpa",
  "unidadeMedida": "QUILO",
  "precoPorUnidade": 9.75,
  "tipoMaterial": {
    "id": 1,
    "nome": "Metal"
  },
  "saldo": 10.0
}
```

### `POST /movimentacoesResiduos`

Requisição (saída, com quantidade negativa):

```json
{
  "materialId": 1,
  "movimentacaoResiduo": "SAIDA",
  "quantidade": -15,
  "descricao": "Saída referente à venda do material para terceiros"
}
```

Resposta, `201 OK`:

```json
{
  "id": 2,
  "material": {
    "id": 1,
    "nome": "Sucata de alumínio",
    "unidadeMedida": "QUILO",
    "precoPorUnidade": 8.5,
    "tipoMaterial": {
      "id": 1,
      "nome": "Metal"
    }
  },
  "tipoMovimentacaoResiduo": "SAIDA",
  "quantidade": -15,
  "descricao": "Saída referente à venda do material para terceiros",
  "criadoEm": "2026-10-15T14:23:11"
}
```

Repare que o `material` aninhado **não** traz `saldo`: dentro de uma movimentação ele é contexto, e usa o `MaterialResponseDTO`.

### `GET /movimentacoesResiduos?materialId=1`

O extrato de um material, da movimentação mais recente para a mais antiga. Resposta, `200 OK` (campo `material` omitido abaixo para encurtar; ele vem em cada item):

```json
[
  {
    "id": 2,
    "tipoMovimentacaoResiduo": "SAIDA",
    "quantidade": -15,
    "descricao": "Saída referente à venda do material para terceiros",
    "criadoEm": "2026-10-15T14:23:11"
  },
  {
    "id": 1,
    "tipoMovimentacaoResiduo": "ENTRADA",
    "quantidade": 25,
    "descricao": "Entrada referente à sobra da produção",
    "criadoEm": "2026-10-15T09:10:47"
  }
]
```

## Erros

Todo erro sai no mesmo formato. Este é o `404` de `GET /materiais/999`:

```json
{
  "status": 404,
  "erro": "Not Found",
  "mensagem": "Material não encontrado!",
  "caminho": "/materiais/999",
  "timestamp": "2026-10-14T19:30:00",
  "campos": []
}
```

No `400` de validação, a lista `campos` traz um item por campo inválido: `{"campo": "nome", "mensagem": "Nome não pode ser vazio!"}`.

| Status | Quando acontece neste projeto |
|---|---|
| `400` | JSON ilegível ou campo inválido no DTO de entrada |
| `404` | Id que não existe (na rota, ou `materialId` / `tipoMaterialId` no corpo) |
| `400` | Regra de negócio violada: a `mensagem` diz qual regra barrou o pedido |
| `400` | Apagar um tipo de material ou material que ainda é usado por outro registro (chave estrangeira) |