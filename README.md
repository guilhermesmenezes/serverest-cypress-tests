# serverest-cypress-tests

[![Cypress Tests CI/CD](https://github.com/guilhermesmenezes/serverest-cypress-tests/actions/workflows/cypress.yml/badge.svg)](https://github.com/guilhermesmenezes/serverest-cypress-tests/actions/workflows/cypress.yml)

Suíte de testes automatizados (E2E de frontend + API) para o projeto Serverest usando Cypress.

## 🛠️ Tecnologias

| Ferramenta | Uso |
|---|---|
| [Cypress 15](https://docs.cypress.io) | Runner de testes E2E e de API |
| [@faker-js/faker](https://fakerjs.dev) | Geração de dados dinâmicos e únicos por teste |
| [ajv](https://ajv.js.org) | Validação de contrato (JSON Schema) das respostas de API |
| [Mochawesome](https://github.com/adamgruber/mochawesome) | Relatórios HTML/JSON |
| [ESLint](https://eslint.org) (flat config) + eslint-plugin-cypress | Análise estática |
| [GitHub Actions](https://docs.github.com/actions) | Pipeline CI/CD (lint → test → report) |

## 🧭 Arquitetura

- **Page Objects** (`cypress/pages`) — encapsulam a interação com a UI.
- **Components** (`cypress/pages/components`) — trechos de UI reutilizados por mais de uma página (ex.: `AlertComponent`).
- **Service Objects** (`cypress/services`) — encapsulam as chamadas HTTP à API, sobre o cliente HTTP compartilhado (`cypress/support/httpClient.js`).
- **Custom Commands** (`cypress/support/commands.js`) — ações compartilhadas entre specs: `searchUsers` (busca + confirma status 200) e a limpeza de massa (`cleanupUserById`/`cleanupUserByEmail`).
- **Fixtures/Factory** (`cypress/fixtures/users.js`) — geram massa de teste única com faker.
- **Constantes** (`cypress/support/constants.js`) — mensagens e rotas centralizadas (sem strings mágicas espalhadas).
- **Schemas** (`cypress/support/schemas.js`) — validação de contrato das respostas: JSON Schemas, `assertSchema` (ajv) e `expectEnvelope` (status + schema numa chamada).

Estratégias de estabilidade: confirmação de persistência via API (sem depender só do auto-relato da tela), `cy.intercept` + `cy.wait` nos cenários de erro do frontend, `retries` no CI, dados únicos por teste e limpeza automática em `afterEach`.

## ✅ Cobertura de Testes

**API (`cypress/e2e/api/users.cy.js`)** — CRUD de `/usuarios` + cenários de erro:
criação (201), email duplicado (400), email inválido (400), corpo vazio (400), listagem, busca por ID, ID inexistente (400), atualização + confirmação, atualização com ID inexistente (upsert, 201), atualização com email duplicado (400), exclusão + confirmação, smoke de latência (SLA).

**Frontend (`cypress/e2e/frontend/register-user.cy.js`)** — cadastro de usuário:
cadastro válido com redirect e confirmação de persistência via API, cadastro de admin (nome e `administrador` confirmados no backend), email duplicado, e validações de campos obrigatórios (em conjunto e individualmente).

## 📋 Requisitos

- Node.js 20+ (exigido por cypress, eslint e @faker-js/faker)
- npm (o projeto versiona `package-lock.json`; o Cypress é instalado como dependência pelo `npm install`)

## 🚀 Instalação

```bash
# Clonar repositório
git clone <seu-repositorio>
cd serverest-cypress-tests

# Instalar dependências
npm install
```

## 🧪 Executando Testes Localmente

### Modo Interativo (Cypress UI)
```bash
npm run cypress:open
```

### Modo Headless (Terminal)
```bash
npm run cypress:run
```

## 📊 Relatórios e Artefatos

### Localmente

Após executar os testes, os seguintes artefatos são gerados automaticamente:

**Estrutura de diretórios:**
```
cypress/
├── reports/
│   ├── mochawesome/            # JSON por spec (gerado ao rodar os testes)
│   ├── mochawesome.json        # JSON mesclado (gerado por report:merge)
│   └── mochawesome-report.html # Relatório HTML único (gerado por report:generate)
├── videos/                     # Gravações de testes
└── screenshots/                # Screenshots de falhas
```

### Visualizar Relatório HTML Localmente

```bash
# 1. Executar os testes (gera os JSONs por spec)
npm run cypress:run

# 2. Mesclar os JSONs em um único arquivo
npm run report:merge

# 3. Gerar o HTML a partir do JSON mesclado
npm run report:generate

# 4. Abrir cypress/reports/mochawesome-report.html no navegador
# (o comando pra abrir depende do SO — "open" é só macOS)
start cypress/reports/mochawesome-report.html    # Windows
open cypress/reports/mochawesome-report.html     # macOS
xdg-open cypress/reports/mochawesome-report.html # Linux
```

## 🤖 CI/CD - GitHub Actions

Um único workflow (`.github/workflows/cypress.yml`) roda em todo push/PR para `main` ou `develop`, com 3 jobs em sequência:

```
lint  →  test (Chrome, Firefox, Edge em paralelo)  →  report (consolida os 3 + comenta no PR)
```

- **`lint`**: roda ESLint primeiro; se falhar, o pipeline para (fail-fast).
- **`test`**: executa a suíte completa nos 3 navegadores via `scripts/run-cypress.js` (roda o Cypress pela API programática, não o CLI puro — é o que permite detectar testes que só passaram após `retries` do `cypress.config.js`). Cada navegador sobe seu próprio relatório/vídeo/screenshot.
- **`report`**: baixa os 3 relatórios, gera um HTML consolidado único, e — se for PR — comenta automaticamente com os números reais de passed/failed e, se houver, a lista de testes que só passaram após retry.

### 📥 Acessando Relatórios

```
Actions → workflow mais recente → Artifacts
- cypress-consolidated-report   (relatório único dos 3 navegadores — comece por aqui)
- cypress-reports-{browser}     (relatório individual por navegador)
- cypress-videos-{browser}      (gravações de todas as execuções)
- cypress-screenshots-{browser} (apenas se houver falha)
```

Em PRs, o comentário automático já traz o resumo (total/passou/falhou/duração) sem precisar baixar nada.

## 📊 Scripts NPM

```bash
# Testes
npm run cypress:open              # Abre Cypress UI
npm run cypress:run               # Executa testes
npm run cypress:run:ci -- <browser>  # Usado pelo CI: node scripts/run-cypress.js <browser> (exige o navegador como argumento)
npm test                          # Alias de cypress:run

# Qualidade
npm run lint                      # ESLint

# Relatórios
npm run report:merge              # Mescla múltiplos JSONs em um
npm run report:generate           # Gera HTML do relatório
npm run report:clean              # Limpa todos os relatórios
```

## 📁 Estrutura do Projeto

```
serverest-cypress-tests/
├── cypress/
│   ├── e2e/                     # Testes E2E
│   │   ├── api/
│   │   │   └── users.cy.js
│   │   └── frontend/
│   │       └── register-user.cy.js
│   ├── fixtures/                # Dados de teste
│   │   └── users.js
│   ├── pages/                   # Page Objects
│   │   ├── RegisterPage.js
│   │   └── components/
│   │       └── AlertComponent.js
│   ├── services/                # Serviços API
│   │   └── UsersService.js
│   ├── support/                 # Configurações e utilitários
│   │   ├── commands.js          # Custom commands
│   │   ├── constants.js         # Mensagens e rotas
│   │   ├── httpClient.js        # Cliente HTTP compartilhado pelos Service Objects
│   │   ├── schemas.js           # JSON Schemas + asserção de contrato (ajv)
│   │   └── e2e.js
│   ├── reports/                 # Relatórios (gerado)
│   ├── videos/                  # Vídeos (gerado)
│   └── screenshots/             # Screenshots (gerado)
├── scripts/
│   └── run-cypress.js           # Roda o Cypress via API programática e detecta testes flaky
├── .github/
│   └── workflows/
│       └── cypress.yml          # Workflow CI/CD (lint → test → report)
├── cypress.config.js            # Configuração Cypress (retries, timeouts, reporter)
├── eslint.config.js             # Configuração ESLint
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Variáveis de Ambiente

`baseUrl` e `apiUrl` já têm fallback público hardcoded em `cypress.config.js` — o projeto roda sem nenhuma configuração adicional.

`apiUrl` é lido nos testes com `cy.env(['apiUrl'])` (assíncrono — não o `Cypress.env()` estático, que está deprecado e desligado via `allowCypressEnv: false`).

Ordem de resolução, do mais específico para o fallback:
1. `--env apiUrl=...` na linha de comando (override pontual)
2. `cypress.env.json` na raiz (override local, já no `.gitignore`), ex.: `{ "apiUrl": "http://localhost:3001" }`
3. Variáveis de ambiente `CYPRESS_BASE_URL` / `CYPRESS_API_URL` (usadas no CI e para overrides locais)
4. Fallback público hardcoded em `cypress.config.js`: `baseUrl` → `https://front.serverest.dev/`, `apiUrl` → `https://serverest.dev`

Para apontar para outro ambiente localmente:
```bash
CYPRESS_BASE_URL=http://localhost:3000 CYPRESS_API_URL=http://localhost:3001 npm run cypress:run
```

O workflow (`.github/workflows/cypress.yml`) já passa `CYPRESS_BASE_URL` e `CYPRESS_API_URL` como variáveis de ambiente para o step que executa os testes. Como essas URLs são públicas (API de demonstração do serverest.dev), elas não precisam ser GitHub Secrets — só usar Secrets quando o valor for sensível (ex.: um token de API real).

## 🐛 Troubleshooting

**Testes passam local mas falham no CI:** diferença de navegador (headless vs. local), timing (elemento demora mais no CI), ou dados de teste conflitantes — confira se o cleanup em `afterEach` está rodando. Para reproduzir localmente: `npx cypress run --browser chrome`.

**"Timed out waiting for element":** o projeto já define `defaultCommandTimeout: 10000` e `retries: { runMode: 2 }` em `cypress.config.js` para absorver janelas lentas da API pública. Se um comando específico ainda estourar, aumente pontualmente: `cy.get('[data-testid="element"]', { timeout: 15000 })`.

**Relatório Mochawesome não gerado:** `npm list mochawesome mochawesome-merge mochawesome-report-generator && npm install && npm run cypress:run:ci -- chrome`.

**Erro de rede / API não responde:** `curl https://serverest.dev/usuarios`. Se a API pública estiver fora do ar, os testes de API e o cadastro no frontend vão falhar — não é bug do projeto, é indisponibilidade do serverest.dev.

**ESLint falhando no CI:** rode `npm run lint` localmente antes do push — o job `lint` roda antes dos testes e bloqueia o pipeline se houver erro.

## 🤝 Contribuindo

1. Criar uma branch para sua feature: `git checkout -b feature/nova-feature`
2. Fazer commit: `git commit -m 'Add nova feature'`
3. Push para a branch: `git push origin feature/nova-feature`
4. Abrir um Pull Request
5. Aguardar testes rodarem automaticamente
6. Revisar relatórios nos artifacts

## 📝 Boas Práticas

- ✅ Sempre escrever testes para novas features
- ✅ Revisar vídeos de testes falhados
- ✅ Usar dados dinâmicos das fixtures
- ✅ Manter testes independentes
- ✅ Executar localmente antes de fazer push

## 📞 Suporte

Para dúvidas sobre os testes, consulte:
- 📚 [Documentação Cypress](https://docs.cypress.io)
- 📊 [Documentação Mochawesome](https://adamgruber.github.io/mochawesome/)
- 🛠️ [Issues do Projeto](../../issues)
