# Formulários de movimentação

`FormularioMovimentacao.tsx` usa um diálogo nativo para entrada e saída. O material e o tipo vêm da página; o operador informa somente a quantidade positiva e o motivo. O modo demo permite explorar os campos sem salvar.

`movimentacao.ts` valida preenchimento e prepara o RequestDTO. Aceita vírgula ou ponto decimal, aplica o sinal da saída e preserva o valor numérico sem arredondar. Não decide disponibilidade nem replica R1/R2 no navegador. O limite de descrição acompanha os 255 caracteres da entidade e da coluna.

O formulário chama `api.criarMovimentacao`, que passa pelo cliente HTTP central e pelos bastidores. Uma referência impede envios simultâneos antes mesmo da atualização visual. A confirmação do POST fecha o formulário e a página consulta novamente saldo e extrato. Falhar nessa leitura não desfaz a confirmação nem repete o POST.

Mensagens do ErroDTO são preservadas e os campos reconhecidos recebem o erro associado, inclusive `quantidadeDiferenteDeZero` do AssertTrue Java. Em falhas de rede, tempo limite, resposta inválida ou 5xx, a gravação pode ter ocorrido: não há reenvio automático e aquela abertura deixa de aceitar nova confirmação. O operador deve conferir o extrato antes de abrir outro registro. Isso não substitui idempotência no servidor nem impede duplicações entre abas ou sessões.

O diálogo controla foco, Escape e rolagem. Durante o envio, fechar e cancelar ficam bloqueados; desmontar a página não cancela um POST já enviado. Os resultados continuam registrados pelo cliente central, mas uma página desmontada não recebe atualização de estado.

Os testes em `../../tests/movimentacao.test.mjs` conferem o contrato preparado, a classificação de falhas e a passagem pelo transporte. A revisão visual usa um servidor descartável externo ao repositório. Nenhuma dessas verificações valida o backend Java real.
