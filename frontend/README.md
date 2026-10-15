# Economia Circular — frontend

Interface para acompanhar saldo e valor dos resíduos de produção. React, Vite e TypeScript, com componentes nativos e tokens CSS `--ec-*`.

## Executar

Requer Node.js 20.19+ na linha 20, ou 22.12+ nas linhas seguintes. Para executar os testes que importam TypeScript nativamente, use Node.js 24, disponível no ambiente atual.

```bash
cd frontend
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. O servidor usa porta fixa, compatível com as origens CORS locais do backend.

```bash
npm run typecheck  # verifica o TypeScript
npm test           # testa HTTP, configuração e preparação de movimentações com Node 24
npm run build      # verifica os tipos e gera dist/
npm run preview    # serve o build com a porta de desenvolvimento livre
```

O frontend é independente: os comandos Maven do backend continuam funcionando sem instalar Node ou compilar esta pasta.

## Fonte dos dados

Sem configuração, o modo é **demo**, identificado na interface e sem chamadas HTTP. Para consultar a API, copie `.env.example` para `.env.local` e configure:

```dotenv
VITE_MODO_DADOS=api
VITE_API_URL=http://localhost:8080
```

Reinicie o servidor Vite após mudar as variáveis. A API precisa estar disponível e permitir a origem do navegador por CORS. Em desenvolvimento, o endereço padrão da API é `http://localhost:8080`; em um build de produção no modo API, uma URL HTTPS explícita é obrigatória.

O modo API consulta `GET /materiais`, `GET /materiais/{id}` e `GET /movimentacoesResiduos?materialId=...` e registra movimentações com `POST /movimentacoesResiduos`. Busca e filtro por categoria continuam locais. Carregamento, resposta vazia, material inexistente e falhas têm estados próprios e opção de nova tentativa. Uma falha de rede **não** substitui o estoque por exemplos.

Todas as variáveis `VITE_*` usadas pelo cliente ficam públicas no JavaScript do build. Coloque apenas configuração pública, nunca senhas, tokens ou credenciais. Os arquivos `.env` e `.env.*` locais são ignorados; `.env.example` é versionado. Este comportamento de configuração é documentado pelo [Vite](https://vite.dev/guide/env-and-mode).

## Registrar entradas e saídas

Abra um material e escolha **Registrar entrada** ou **Registrar saída**. Informe uma quantidade positiva e o motivo (até 255 caracteres, conforme a coluna da entidade). Vírgula ou ponto representam decimais; não use separadores de milhar, sinais ou notação científica. Na saída, a interface transforma a quantidade em negativa ao montar o DTO. Não arredonda a quantidade enviada nem limita a saída com o saldo consultado: a API continua responsável por R1/R2. A formatação exibe frações pequenas sem convertê-las visualmente em zero.

O formulário verifica o preenchimento, impede envios simultâneos e preserva os valores quando a API devolve erro. Mensagens gerais e erros de quantidade/descrição do `ErroDTO` aparecem no formulário; o campo derivado `quantidadeDiferenteDeZero` também é associado à quantidade. O diálogo recebe foco ao abrir, retorna ao botão ao cancelar e aceita Escape quando não está enviando. Durante o envio, aguarde a resposta; não há cancelamento ou repetição automática do POST.

Depois da confirmação da API, o formulário fecha e a página consulta novamente saldo e extrato. Não soma localmente o saldo nem inventa uma linha de extrato. Uma falha nessa consulta mantém a confirmação do registro e permite repetir somente os GETs. Ao voltar ao painel, a lista é consultada novamente.

Se houver falha de rede, tempo limite, resposta inválida ou erro 5xx, a gravação pode ter ocorrido. O formulário impede novo envio naquela abertura e orienta fechá-lo e atualizar o extrato antes de tentar outro registro. Ainda não há chave de idempotência na API; a interface não garante deduplicação entre abas, sessões ou envios feitos após reabrir o formulário.

No modo **demo**, os formulários podem ser explorados, mas o botão de confirmação fica desabilitado. Nada é persistido ou acrescentado aos exemplos, e não surgem registros HTTP artificiais nos bastidores.

## Bastidores

O botão Bastidores abre as últimas 50 requisições concluídas nesta visita, com método, rota, status, tempo, corpo enviado e resposta. Cancelamento, tempo limite, falha de rede e erro HTTP são distinguidos. O histórico fica apenas em memória e pode ser limpo.

As camadas e regras listadas são **explicações declaradas a partir do código Java**, não evidência de que o servidor executou cada camada. Os dados de exemplo não geram registros HTTP artificiais.

## Organização

| Pasta                | Responsabilidade                                                        |
| -------------------- | ----------------------------------------------------------------------- |
| `src/api/`           | DTOs, catálogo de rotas, validação, configuração e cliente HTTP central |
| `src/hooks/`         | Estado de consultas, cancelamento e nova tentativa                      |
| `src/design-system/` | Tokens, base, layout, componentes CSS e utilitários; paleta teal        |
| `src/components/`    | Componentes React compartilhados                                        |
| `src/pages/`         | Painel de saldos e detalhe do material                                  |
| `src/formularios/`   | Diálogo e preparação do DTO de entrada/saída                             |
| `src/demo/`          | Exemplos usados somente pelo modo demo                                  |
| `src/bastidores/`    | Captura em memória e apresentação das requisições                       |
| `tests/`             | Testes do transporte HTTP, configuração e formato das respostas         |

Toda requisição passa por `src/api/client.ts`. O catálogo contém as 14 rotas existentes; o serviço já tem operações de leitura e escrita tipadas, com registro de movimentações disponível; os cadastros ainda serão implementados. O saldo vem da API; o valor em estoque é calculado na apresentação.

Comentários de camada e responsabilidade acompanham o código. Componentes consomem tokens semânticos; valores brutos de cor ficam em `design-system/tokens/`. O favicon usa a paleta do projeto.

## Validação e limites

Os testes automatizados iniciam um servidor HTTP controlado em porta aleatória e exercitam requisições reais do cliente. Eles verificam serialização, consulta, respostas JSON, `204`, erros `400`/`404`, resposta incompatível, indisponibilidade, tempo limite e cancelamento. **Não iniciam nem validam o Spring Boot, o PostgreSQL ou as regras de negócio Java.**

Os testes de movimentação verificam decimais, sinal do DTO, campos obrigatórios, limite de descrição, erros por campo, resultado incerto e o POST pelo cliente central. A revisão no navegador usa um servidor HTTP controlado, incluindo falha da consulta posterior à gravação. Isso não comprova as regras Java. A integração com o backend real continua pendente em um ambiente com Java 25. Cadastros e laboratório de regras serão etapas posteriores.

## Publicação futura na Vercel

A publicação foi adiada pelo usuário; nenhum projeto, domínio ou deploy foi criado. A estrutura permanece adequada a um frontend estático: diretório `frontend`, build `npm run build` e saída `dist`.

Na etapa de publicação, revisar a raiz do projeto, as variáveis por ambiente e o tratamento de links diretos como `/materiais/1`. Aplicações Vite com navegação SPA precisam desse tratamento, conforme a [documentação oficial da Vercel](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas).

O endereço da API será configurado por `VITE_API_URL`; o backend precisará estar publicado em HTTPS e liberar a origem escolhida no CORS. Um endereço `localhost` aponta para a máquina de quem abriu a página e não é o endereço de um backend publicado. Até essa infraestrutura existir, o modo demo permite uma prévia explicitamente ilustrativa, sem simular uma API disponível.

## Fontes

IBM Plex Sans e IBM Plex Mono são carregadas por links do Google Fonts e usam a licença SIL Open Font License. Sem acesso externo, a interface usa as fontes de sistema declaradas nos tokens.
