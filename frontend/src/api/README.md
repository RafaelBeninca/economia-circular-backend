# API: uma porta de entrada para HTTP

`client.ts` é o único arquivo do frontend que usa `fetch`. Ele preserva um caminho-base configurado, serializa DTOs, monta a consulta, aplica cancelamento e tempo limite, reconhece erros HTTP e publica o resultado para os bastidores. `204` não tem corpo JSON. Status HTTP e mensagem do `ErroDTO` são preservados; falhas sem resposta não recebem um status inventado.

`tipos.ts` espelha os DTOs Java. `validacao.ts` verifica a estrutura recebida em tempo de execução, porque tipos TypeScript não validam a rede. A validação não reimplementa R1, R2 ou R3.

`rotas.ts` declara as 14 rotas e as camadas conhecidas a partir do código. Os metadados são explicativos; erros de entrada podem ocorrer antes do Controller, e o frontend não pode afirmar que uma camada rodou.

`index.ts` oferece operações tipadas. `consultas.ts` escolhe entre API e demonstração; nunca usa exemplos como recuperação de uma falha HTTP. `configuracao.ts` valida configurações públicas sem depender de React ou Vite. `ambiente.ts`, um nível acima, lê essas variáveis no navegador.

`eventos.ts` liga o transporte à apresentação sem importar React no cliente. Falhas de observadores não mudam a resposta de uma requisição.

Para adicionar uma rota real, atualize contrato, tipos, validação, catálogo e operação. Componentes continuam usando a camada de consulta, sem chamar `fetch` diretamente.
