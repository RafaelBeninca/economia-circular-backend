# API de Economia Circular

Versão hospedada: https://economia-circular-iota.vercel.app/

API para controlar os resíduos gerados na produção: registra os materiais, seus tipos e as entradas e saídas de cada um, mantendo o saldo e o preço agregado, para quem gerencia os resíduos da produção.

Projeto Final da disciplina de Backend (Engenharia de Software, SATC). **Etapa 1: arquitetura do backend.**

## Índice

- [Integrantes](#integrantes)
- [O problema](#o-problema)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Entidades](#entidades)
- [Rotas](#rotas)
- [Como executar](#como-executar)
- [Situação do projeto](#situação-do-projeto)
- [Documentação](#documentação)

## Integrantes

| Nome | GitHub |
|---|---|
| Gustavo de Rezende Biava | [@GustavoBiava](https://github.com/GustavoBiava) e [@GustavoBiavaProcer](https://github.com/GustavoBiavaProcer) |
| Lucas Siqueira Sosa | [@LucasSosa](https://github.com/lucassosa) |
| Rafael Avila Benincá | [@RafaelBeninca](https://github.com/RafaelBeninca) |

## O problema

**Tema sorteado:** Sustentabilidade e Meio Ambiente

Os resíduos gerados na produção não têm gestão, onde ninguém sabe ao certo a quantidade que sobra de cada material, o valor que esse resíduo carrega nem para onde ele vai. Sem esse controle, o que poderia ser reaproveitado ou vendido se perde. O sistema registra cada material com sua unidade de medida e seu preço, e cada entrada e saída de resíduo, mantendo o saldo de cada material confiável e rastreável.

**Quem usa o sistema:**

| Quem | O que faz no sistema |
|---|---|
| Operador de produção | Cadastra tipos de materiais e materiais, e registra as entradas e saídas de resíduos |

**Regras de negócio.** O que o sistema precisa garantir ou impedir. O que só confere formato (campo obrigatório, número positivo) é validação do DTO, não regra de negócio.

| # | Regra | Onde está no código | Rota que usa |
|---|---|---|---|
| R1 | A saída de um material não pode ser maior que o saldo dele (a soma de todas as suas movimentações) | `MovimentacaoResiduoService` | `POST /movimentacoesResiduos` |
| R2 | Uma movimentação de saída precisa ter quantidade negativa e uma de entrada, quantidade positiva | `MovimentacaoResiduoService` | `POST /movimentacoesResiduos` |
| R3 | Não pode existir mais de um material com o mesmo nome e a mesma unidade de medida | `MaterialService` | `POST /materiais` |

**Fora do escopo:** logística de transporte de resíduos e gerenciamento de destinos homologados.

## Tecnologias

| O quê | Qual |
|---|---|
| Linguagem | Java 25 |
| Framework | Spring Boot 3.5 (Web, Validation, Data JPA) |
| Banco de dados | PostgreSQL 16, em Docker |
| Migrations | Flyway |
| Documentação da API | springdoc-openapi (Swagger UI) |

## Arquitetura

A API é organizada em camadas. Uma requisição entra pelo Controller, passa pelo Service, que aplica as regras de negócio, e chega ao banco pelo Repository; a resposta faz o caminho de volta. O Mapper converte DTO em entidade e entidade em DTO.

**Mapa da estrutura.** Uma linha por entidade. Em cada célula, a classe e a situação.

| Entidade | Migration | Model | Repository | DTOs | Mapper | Service | Controller |
|---|---|---|---|---|---|---|---|
| TipoMaterial | `V1__criar_tipos_materiais.sql`, pronta | `TipoMaterial`, pronta | `TipoMaterialRepository`, pronto | `TipoMaterialRequestDTO`, `TipoMaterialResponseDTO`, prontos | `TipoMaterialMapper`, implementado | `TipoMaterialService`, implementado | `TipoMaterialController`, implementado |
| Material | `V3__criar_materiais.sql`, pronta (enum em `V2__criar_tipos_unidades_medidas.sql`) | `Material`, pronta | `MaterialRepository`, pronto | `MaterialRequestDTO`, `MaterialResponseDTO`, prontos | `MaterialMapper`, implementado | `MaterialService`, implementado | `MaterialController`, implementado |
| MovimentacaoResiduo | `V5__criar_movimentacoes_residuos.sql`, pronta (enum em `V4__criar_tipos_movimentacoes_residuos.sql`) | `MovimentacaoResiduo`, pronta | `MovimentacaoResiduoRepository`, pronto | `MovimentacaoResiduoRequestDTO`, `MovimentacaoResiduoResponseDTO`, prontos | `MovimentacaoResiduoMapper`, implementado | `MovimentacaoResiduoService`, implementado | `MovimentacaoResiduoController`, implementado |

## Entidades

| Entidade | O que representa | Como se relaciona |
|---|---|---|
| TipoMaterial | A categoria de um material (por exemplo, Metal ou Biológico) | Classifica vários materiais |
| Material | Um resíduo controlado, com unidade de medida e preço por unidade | Pertence a um tipo de material e aparece em várias movimentações |
| MovimentacaoResiduo | Uma entrada ou saída de um material | Pertence a um material |

Atributos, tipos e o diagrama das tabelas estão em [docs/modelo-de-dominio.md](docs/modelo-de-dominio.md).

## Rotas

### As que já funcionam

| Verbo | Caminho | O que faz | Regra | Sucesso | Erros |
|---|---|---|---|---------|---|
| `GET` | `/tiposMateriais` | Lista os tipos de materiais | Nenhuma | `200`   | Nenhum |
| `GET` | `/tiposMateriais/{id}` | Busca um tipo de material | Nenhuma | `200`   | `404` |
| `POST` | `/tiposMateriais` | Cadastra um tipo de material | Nenhuma | `201`   | `400` |
| `DELETE` | `/tiposMateriais/{id}` | Remove um tipo de material | Nenhuma | `204` | `400`, `404` |
| `GET` | `/materiais` | Lista os materiais | Nenhuma | `200`   | Nenhum |
| `GET` | `/materiais/{id}` | Busca um material | Nenhuma | `200`   | `404` |
| `POST` | `/materiais` | Cadastra um material | R3 | `201`   | `400`, `404` |
| `DELETE` | `/materiais/{id}` | Remove um material | Nenhuma | `204` | `400`, `404` |
| `GET` | `/movimentacoesResiduos` | Lista as movimentações | Nenhuma | `200`   | Nenhum |
| `GET` | `/movimentacoesResiduos/{id}` | Busca uma movimentação | Nenhuma | `200`   | `404` |
| `POST` | `/movimentacoesResiduos` | Registra uma entrada ou saída de resíduo | R1 e R2 | `201`   | `400`, `404` |
| `DELETE` | `/movimentacoesResiduos/{id}` | Remove uma movimentação | Nenhuma | `204` | `404` |

Exemplo de requisição:

```http
POST /movimentacoesResiduos
Content-Type: application/json

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

### Erros

Todo erro sai no mesmo formato. Este é o `400` de uma regra de negócio violada (R1):

```json
{
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "Saída de 15.0 excede o saldo disponível de 10.0 do material!",
  "caminho": "/movimentacoesResiduos",
  "timestamp": "2026-10-14T19:30:00",
  "campos": []
}
```

Um campo inválido também devolve `400`, com a lista `campos` dizendo qual campo corrigir. Um id que não existe devolve `404`.

### As planejadas

Estão previstas, mas ainda não respondem.

| Recurso | O que vai fazer |
|---|---|
| Não há | Atualização (`PUT`) não faz parte desta etapa |

O contrato completo, com todas as rotas e os DTOs, está em [docs/contrato-da-api.md](docs/contrato-da-api.md).

## Como executar

Pré-requisitos: JDK 25, Docker Desktop aberto e Git.

```bash
git clone https://github.com/RafaelBeninca/economia-circular-backend.git
cd economia-circular-backend

docker compose up -d          # sobe o PostgreSQL na porta 5437
./mvnw spring-boot:run        # Windows: .\mvnw.cmd spring-boot:run
```

Com a API no ar:

| Endereço | O que é |
|---|---|
| <http://localhost:8080/swagger-ui.html> | Swagger UI: as rotas, com **Try it out** para enviar requisições |
| <http://localhost:8080/v3/api-docs> | O contrato OpenAPI em JSON |

Para testar as rotas, use o Swagger UI ou o **Postman**. No Postman, importe todas as rotas de uma vez: **Import** → **Link** → `http://localhost:8080/v3/api-docs`.

Para parar: `Ctrl+C` na API e `docker compose stop` no banco. Para apagar o banco e rodar as migrations do zero: `docker compose down -v` e suba de novo.

## Situação do projeto

| Parte | Situação |
|---|---|
| Desenho | Completo: problema e regras neste README, modelo e contrato em `docs/` |
| Estrutura | As 3 entidades têm migration, entidade, Repository, DTOs, Mapper, Service e Controller |
| API e regras | As rotas `POST`, `GET`, `GET /{id}` e `DELETE /{id}` das 3 entidades funcionam; R1, R2 e R3 estão implementadas |

**Ainda não funciona:** nada planejado nesta etapa está pendente. A atualização (`PUT`) não foi implementada.

## Documentação

| Documento | O que tem |
|---|---|
| [Modelo de domínio](docs/modelo-de-dominio.md) | Entidades, relacionamentos, diagrama das tabelas, migrations |
| [Contrato da API](docs/contrato-da-api.md) | Todas as rotas, os DTOs, exemplos de JSON e erros |
| [Autoavaliação](docs/autoavaliacao.md) | Os critérios da revisão do código, marcados pelo grupo |