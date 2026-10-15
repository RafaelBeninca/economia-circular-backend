# Economia Circular — frontend

Interface para acompanhar saldo e valor dos resíduos de produção. React, Vite e TypeScript, com componentes nativos e tokens CSS `--ec-*`.

## Executar

Requer Node.js 20.19+ na linha 20, ou 22.12+ nas linhas seguintes. O ambiente de desenvolvimento usado nesta etapa tem Node 24.

```bash
cd frontend
npm ci
npm run dev
```

Abra `http://127.0.0.1:5173`. O servidor usa porta fixa, compatível com as origens CORS já configuradas no backend.

```bash
npm run typecheck  # verifica o TypeScript
npm run build      # verifica os tipos e gera dist/
npm run preview    # serve o build localmente, com a porta de desenvolvimento livre
```

O frontend é independente: os comandos Maven do backend continuam funcionando sem instalar Node ou compilar esta pasta.

## Estado desta etapa

- Painel de saldos agrupado por tipo de material, com valor total, busca e filtro.
- Navegação para o material e seu extrato ilustrativo.
- Tema claro/escuro com preferência persistida no navegador.
- Gaveta de bastidores acessível por teclado, fechada por padrão.
- Layout responsivo e estados para buscas vazias, material inexistente e rota inexistente.

**Todos os dados são exemplos locais**, identificados na interface. Não há conexão com a API, requisições simuladas ou gravação de materiais e movimentações. Os botões de registro permanecem desabilitados com uma explicação até a implementação dos formulários e da integração.

## Organização

| Pasta                | Responsabilidade                                                 |
| -------------------- | ---------------------------------------------------------------- |
| `src/design-system/` | Tokens, base, layout, componentes CSS e utilitários; paleta teal |
| `src/components/`    | Componentes React compartilhados                                 |
| `src/pages/`         | Painel de saldos e detalhe do material                           |
| `src/demo/`          | Dados temporários, isolados para substituição pela integração    |
| `src/bastidores/`    | Estrutura da gaveta didática                                     |

Comentários de camada e responsabilidade acompanham os arquivos de código. Componentes consomem tokens semânticos; valores brutos de cor ficam em `design-system/tokens/`. O favicon usa a paleta do projeto.

## Próxima etapa

Implementar `api/client.ts`, `api/tipos.ts` e `api/rotas.ts`, usando o contrato em `../docs/contrato-da-api.md`. Toda requisição HTTP passará pelo cliente central, que medirá o tempo e notificará os bastidores. A lista de camadas por rota será declarada e identificada como explicação do código, não como rastreamento do servidor.

## Fontes

IBM Plex Sans e IBM Plex Mono são carregadas por links do Google Fonts e usam a licença SIL Open Font License. Sem acesso externo, a interface usa as fontes de sistema declaradas nos tokens.
