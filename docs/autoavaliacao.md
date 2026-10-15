# Autoavaliação

Os 10 critérios que serão avaliados na revisão do código, descritos em `Aula 10-11/AVALIACAO.md`, no repositório da disciplina. Para cada um, a marca do grupo e onde está a evidência.

- ✅ atende
- ◐ atende em parte (diga o que falta)
- ❌ não atende

| Critério | Marca | Evidência                                                                                                                                                                                                            |
|---|-------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| P1 A API sobe seguindo o README | ✅    | `README.md`, seção “Como executar”: `docker compose up -d` sobe o PostgreSQL na porta `5437` e `./mvnw spring-boot:run` sobe a API. O Swagger UI abre em `http://localhost:8080/swagger-ui.html`                     |
| P2 Cada classe no pacote da sua camada | ✅    | `src/main/java/api/` (`controller`, `service`, `mapper`, `repository`, `model`, `dto`, `enums`)                                                                                                                      |
| P3 Migrations e `@Entity` de todas as tabelas, e a API sobe | ✅    | `db/migration/V1` a `V5` e `model/TipoMaterial`, `Material`, `MovimentacaoResiduo`                                                                                                                                   |
| P4 DTOs de entrada e de saída de todas as entidades | ✅    | `dto/`: `TipoMaterial`, `Material` e `MovimentacaoResiduo`, cada um com `RequestDTO` e `ResponseDTO`                                                                                                                 |
| P5 Repository, Mapper, Service e Controller de todas, com o comentário no topo, e o mapa da estrutura | ✅    | Classes em `repository/`, `mapper/`, `service/` e `controller/`, todas com o comentário `CAMADA`, `RESPONSABILIDADE` e `SITUAÇÃO`. Mapa da estrutura no `README.md`, seção `“Arquitetura”`                           |
| P6 API simples: `POST`, `GET` e `GET /{id}`, com `400` e `404` | ✅    | `TipoMaterialController`, `MaterialController` e `MovimentacaoResiduoController`                                                                                                                                     |
| P7 No mínimo 3 regras de negócio implementadas, com `400` quando violadas | ✅    | R1 e R2 em `MovimentacaoResiduoService` (`POST /movimentacoesResiduos`); R3 em `MaterialService` (`POST /materiais` e `PUT /materiais/{id}`)                                                                              |
| P8 As regras atendem ao problema e ao tema | ✅    | `README.md`, seção “O problema”: as regras garantem um saldo confiável por material (R1 e R2) e um catálogo sem duplicidade (R3), o que responde à falta de gestão dos resíduos da produção                          |
| P9 Código igual ao desenho | ✅    | `docs/modelo-de-dominio.md` e `docs/contrato-da-api.md`                                                                                                                                                              |
| P10 README completo e bem escrito | ✅    | `README.md`, conferido no GitHub: integrantes, problema, regras R1 a R3 com o local no código, mapa da estrutura, rotas, exemplos de requisição e erro, como executar e situação do projeto, sem trechos do template |

**Pontos que o grupo espera no projeto:** 5,0

A apresentação vale os outros 5,0 pontos: são 3 perguntas, feitas na Aula 11.