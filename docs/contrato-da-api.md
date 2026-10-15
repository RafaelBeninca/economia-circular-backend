# Contrato da API

> O contrato é o que o cliente da API enxerga: rotas, JSON e status.

## Convenções

| Item | Valor |
|---|---|
| Endereço base | `http://localhost:8080` |
| Formato | JSON, na requisição e na resposta |
| Datas | Não se aplica: nenhuma entidade tem campo de data |
| Erros | Sempre no formato `ErroDTO` (ver [Erros](#erros)) |
| Documentação viva | `http://localhost:8080/swagger-ui.html` |

## Rotas

Coluna **Funciona**: `sim` para as rotas que já respondem nesta etapa.

### Tipos de materiais

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---|---|---|
| `GET` | `/tiposMateriais` | Lista os tipos de materiais | Nenhuma | lista de `TipoMaterialResponseDTO` | `200` | Nenhum | sim |
| `GET` | `/tiposMateriais/{id}` | Busca um tipo de material | Nenhuma | `TipoMaterialResponseDTO` | `200` | `404` | sim |
| `POST` | `/tiposMateriais` | Cadastra um tipo de material | `TipoMaterialRequestDTO` | `TipoMaterialResponseDTO` | `201` | `400` | sim |

### Materiais

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---------|---|---|
| `GET` | `/materiais` | Lista os materiais | Nenhuma | lista de `MaterialResponseDTO` | `200`   | Nenhum | sim |
| `GET` | `/materiais/{id}` | Busca um material | Nenhuma | `MaterialResponseDTO` | `200`   | `404` | sim |
| `POST` | `/materiais` | Cadastra um material | `MaterialRequestDTO` | `MaterialResponseDTO` | `201`   | `400`, `404` | sim |

### Movimentações de resíduos

| Verbo | Caminho | O que faz | Entrada | Saída | Sucesso | Erros | Funciona |
|---|---|---|---|---|---------|---|---|
| `GET` | `/movimentacoesResiduos` | Lista as movimentações | Nenhuma | lista de `MovimentacaoResiduoResponseDTO` | `200`   | Nenhum | sim |
| `GET` | `/movimentacoesResiduos/{id}` | Busca uma movimentação | Nenhuma | `MovimentacaoResiduoResponseDTO` | `200`   | `404` | sim |
| `POST` | `/movimentacoesResiduos` | Registra uma entrada ou saída de resíduo | `MovimentacaoResiduoRequestDTO` | `MovimentacaoResiduoResponseDTO` | `201`   | `400`, `404` | sim |

### Rotas que não são CRUD

Não há rotas fora do CRUD.

## Rotas origem das regras de negócio

| Verbo | Caminho | O que faz | Regra | Sucesso | Erros |
|---|---|---|---|---------|---|
| `POST` | `/movimentacoesResiduos` | Registra a movimentação e valida saldo e sinal | R1 e R2 | `201`   | `400`, `404` |
| `POST` | `/materiais` | Cadastra o material e impede duplicidade de nome e unidade | R3 | `201`   | `400`, `404` |

## DTOs

O que entra não é igual ao que sai: o cliente não envia `id`.

| DTO | Direção | Campos | Validações |
|---|---|---|---|
| `TipoMaterialRequestDTO` | entrada | `nome` | obrigatório (`@NotBlank`) |
| `TipoMaterialResponseDTO` | saída | `id`, `nome` | Nenhuma |
| `MaterialRequestDTO` | entrada | `nome`, `precoPorUnidade`, `unidadeMedida`, `tipoMaterialId` | todos obrigatórios; `nome` com `@NotBlank`; `precoPorUnidade` com `@Positive` |
| `MaterialResponseDTO` | saída | `id`, `nome`, `unidadeMedida`, `precoPorUnidade`, `tipoMaterial` (`TipoMaterialResponseDTO`) | Nenhuma |
| `MovimentacaoResiduoRequestDTO` | entrada | `materialId`, `movimentacaoResiduo`, `quantidade`, `descricao` | todos obrigatórios; `descricao` com `@NotBlank`; `quantidade` diferente de zero |
| `MovimentacaoResiduoResponseDTO` | saída | `id`, `material` (`MaterialResponseDTO`), `tipoMovimentacaoResiduo`, `quantidade`, `descricao` | Nenhuma |

Valores aceitos: `unidadeMedida` em `UNIDADE`, `PECA`, `METRO`, `QUILO`; `movimentacaoResiduo` em `ENTRADA`, `SAIDA`.

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

Resposta, `201 OK`:

```json
{
  "id": 1,
  "nome": "Sucata de alumínio",
  "unidadeMedida": "QUILO",
  "precoPorUnidade": 8.5,
  "tipoMaterial": {
    "id": 1,
    "nome": "Metal"
  }
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
  "descricao": "Saída referente à venda do material para terceiros"
}
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