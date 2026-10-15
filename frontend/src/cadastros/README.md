# Cadastros

`CadastroMaterial` apresenta material e novo tipo no mesmo diálogo. Recebe `aoFechar()` e `aoCadastrar(material: MaterialComSaldoResponseDTO)`. O pai importa `cadastros.css` e, após confirmação, decide a navegação e as consultas seguintes.

No modo API, os tipos vêm de `api.listarTipos`; a criação usa exclusivamente `api.criarTipo` e `api.criarMaterial`, passando pelo cliente central e pelos bastidores. Um tipo confirmado é adicionado à lista e selecionado imediatamente, preservando nome, preço e unidade do material. Uma consulta anterior não remove esse tipo e uma falha no GET não repete o POST.

`preparacao.ts` valida campos obrigatórios, nome até 255 caracteres conforme as entidades, as quatro unidades, ID carregado e preço finito maior que zero conforme `@Positive`. Vírgula ou ponto representam decimais; agrupamento de milhar não é aceito. Não arredonda o preço, não confere duplicidade e não replica R3. `ErroDTO` mantém a mensagem geral e os erros dos campos.

Durante POST, fechamento, Escape e outros envios ficam bloqueados. Falhas de resultado incerto preservam o preenchimento e bloqueiam novo envio nessa abertura; o usuário deve conferir os cadastros antes de tentar novamente. Não há idempotência garantida entre abas ou reaberturas. O modo demo deriva tipos dos materiais ilustrativos e permite explorar campos, sem HTTP nem gravação.

Os testes cobrem o contrato, preços, limites, IDs, mensagens, preservação de tipos confirmados e a resposta R3 através do transporte central. Não validam o backend Java real.
