# Desafio QA — VLAB

Projeto de auditoria de qualidade em um sistema de autenticação e coleta de dados desenvolvido intencionalmente com bugs para avaliar habilidades de QA.

**Candidato**: Wallace Leão  
**Data de entrega**: 28/04/2026  
**Stack**: Node.js · Express · HTML/JS · Cypress 13

---

## Sumário

- [Como executar o sistema](#como-executar-o-sistema)
- [Como rodar os testes](#como-rodar-os-testes)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Resultados dos testes](#resultados-dos-testes)
- [Bugs encontrados](#bugs-encontrados)
- [Decisões técnicas](#decisões-técnicas)

---

## Como executar o sistema

### Pré-requisitos

- Node.js 18 ou superior
- npm
- Docker e Docker Compose

### Método 1 — Node.js direto

```bash
# 1. Clonar o repositório
git clone https://github.com/wallacinhochan/desafio-qa-vlab.git
cd desafio-qa-vlab

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor
npm start
```

Acesse em: **http://localhost:3000**

### Método 2 — Docker (só o sistema)

```bash
docker compose up app
```

### Método 3 — Docker + Cypress (sistema + testes automaticamente)

```bash
docker compose up
```

> O serviço `cypress` aguarda o healthcheck do `app` — os testes só iniciam quando `GET /health` retornar 200.  
> Screenshots de falhas ficam em `cypress/screenshots/`.

Para parar:

```bash
docker compose down
```

### Verificar se o servidor está rodando

```bash
curl http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "2026-04-27T10:00:00.000Z",
  "uptime": 123.45
}
```

### Usuários de teste

| Usuário | Senha    | Role  |
|---------|----------|-------|
| admin   | admin123 | admin |
| user    | user123  | user  |
| teste   | 123456   | user  |

> ⚠️ O sistema usa armazenamento em memória. Reiniciar o servidor restaura todos os dados e senhas originais.

---

## Como rodar os testes

### Pré-requisito: servidor rodando

```bash
npm start
```

### Modo headless (CI / terminal)

```bash
npm test
# ou
npx cypress run
```

### Modo interativo (acompanhar execução)

```bash
npm run test:open
# ou
npx cypress open
```

### Rodar um arquivo específico

```bash
npx cypress run --spec cypress/e2e/login.cy.js
npx cypress run --spec cypress/e2e/security.cy.js
npx cypress run --spec cypress/e2e/api.cy.js
```

### CI/CD

O projeto possui um workflow de GitHub Actions em `.github/workflows/cypress.yml` que executa toda a suite automaticamente a cada push ou pull request na branch `main`, usando Docker Compose.

---

## Estrutura do projeto

```
desafio-qa-vlab/
├── .github/
│   └── workflows/
│       └── cypress.yml        # CI/CD — roda Cypress via Docker no GitHub Actions
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js        # 15 testes — autenticação + acessibilidade
│   │   ├── register.cy.js     # 5 testes — registro de usuários
│   │   ├── coleta.cy.js       # 20 testes — módulo de coleta de dados
│   │   ├── security.cy.js     # 12 testes — segurança e controle de acesso
│   │   ├── api.cy.js          # 12 testes — endpoints e health check
│   │   └── pages/
│   │       ├── LoginPage.js   # Page Object — autenticação
│   │       └── ColetaPage.js  # Page Object — coleta de dados
│   ├── fixtures/
│   │   └── users.json         # Dados de teste centralizados
│   └── support/
│       ├── commands.js        # cy.login(), cy.logout(), cy.register()
│       └── e2e.js
├── features/
│   ├── login.feature          # 7 cenários BDD
│   ├── registro.feature       # 7 cenários BDD
│   ├── coleta.feature         # 11 cenários BDD
│   └── seguranca.feature      # 9 cenários BDD
├── BUGS_REPORT.md             # 55 bugs documentados — relatório principal
├── BDD_CENARIOS.md            # Cenários BDD em formato markdown legível
├── CASOS_DE_TESTE.md          # 10 casos de teste formais (Pré-cond/Passos/Esperado)
├── REGRESSION_CHECKLIST.md    # Checklist de 57 pontos críticos para release
├── public/                    # Frontend HTML/JS/CSS
├── server.js                  # Backend Node.js/Express
├── cypress.config.js
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Resultados dos testes

### Resumo da execução (via Docker Compose)

| Arquivo           | Testes | Passando | Falhando* |
|-------------------|--------|----------|-----------|
| api.cy.js         | 12     | 11       | 1         |
| coleta.cy.js      | 20     | 20       | 0         |
| login.cy.js       | 15     | 13       | 2         |
| register.cy.js    | 5      | 5        | 0         |
| security.cy.js    | 12     | 5        | 7         |
| **Total**         | **64** | **55**   | **9**    |

> \* As falhas são **intencionais** — cada uma confirma e reproduz automaticamente um bug documentado. Quando o bug for corrigido no código, o teste passará automaticamente.

### Bugs confirmados automaticamente pelos testes

| Teste que falha | Bug confirmado |
|---|---|
| `BUG #32 — Backdoor ?admin=true` | Dashboard acessível sem autenticação |
| `BUG #33 — /api/user?userId=1` | IDOR: expõe dados de qualquer usuário sem login |
| `BUG #16 — Histórico expõe outros usuários` | IDOR no histórico de coletas |
| `BUG #24 — Reset sem autenticação` | Troca senha de qualquer conta sem verificação |
| `BUG #26 — Mensagens diferentes no reset` | Enumeração de usuários via reset de senha |
| `BUG #15 — Senha no response da API` | API retorna senha em texto puro |
| `BUG #21 — Senha no localStorage` | Credenciais expostas no navegador |
| `BUG #22 — Logout não limpa localStorage` | Sessão persiste após logout |

---

## Bugs encontrados

| Métrica | Valor |
|---|---|
| **Total de bugs documentados** | **57** |
| Bugs críticos | 14 |
| Bugs de alta severidade | 24 |
| Bugs de média severidade | 13 |
| Bugs de baixa severidade | 6 |

> Bugs #1–#55 identificados por teste manual exploratório e análise estática de código.  
> Bugs #56–#57 identificados por auditoria de requisitos (máscara CPF e regra de anomalia 25%).

Documentação completa: [`BUGS_REPORT.md`](./BUGS_REPORT.md)

### Distribuição por categoria

| Categoria | Quantidade |
|---|---|
| Segurança | 28 |
| Lógica / Validação | 28 |
| UX / Boas Práticas | 14 |

### Top 5 bugs mais críticos

1. **BUG #31** — Login aceita senha incorreta em ~10% das tentativas por `Math.random()` na validação
2. **BUG #32** — Backdoor `?admin=true` permite acesso ao dashboard sem autenticação
3. **BUG #24** — Reset de senha funciona sem autenticação — qualquer conta pode ser comprometida
4. **BUG #21** — Senha armazenada em texto puro no `localStorage` do navegador
5. **BUG #16** — IDOR: histórico de coletas expõe dados de todos os usuários

Documentação completa: [`BUGS_REPORT.md`](./BUGS_REPORT.md) e [`Relatorio_Complementar_Bugs_QA_VLAB.md`](./Relatorio_Complementar_Bugs_QA_VLAB.md)

---

## Decisões técnicas

### Por que os testes de bugs "falham"

Os testes `BUG #N` são testes de **regressão com falha esperada** — eles provam que o bug existe reproduzindo-o automaticamente:

- Testes que **passam** → funcionalidade correta
- Testes `BUG #N` que **falham** → bug confirmado e reproduzível

Quando o bug for corrigido no código, o teste passará automaticamente.

### Por que SQL Injection não foi testado

O sistema usa armazenamento em memória (array JavaScript), sem banco de dados relacional. SQL Injection não se aplica a esse contexto — reconhecer isso antes de testar demonstra entendimento da tecnologia.

### `cy.session()` nos testes de API

`cy.request()` não compartilha cookies com `cy.visit()` automaticamente. Foi usado `cy.session()` para persistir o cookie de sessão entre chamadas de API, garantindo testes estáveis sem depender da UI para autenticar.

### Page Object Pattern

Implementado em `LoginPage.js` e `ColetaPage.js`. Seletores e ações encapsulados — se um seletor mudar no HTML, apenas o Page Object precisa ser atualizado.

### Esperas dinâmicas

Usa `should('be.visible')` e asserções dinâmicas do Cypress em vez de `cy.wait()` estático. Esperas fixas tornam testes frágeis ("flaky") em ambientes com variações de velocidade.

---

## Cenários BDD

34 cenários no formato Gherkin em `features/`, e versão markdown legível em [`BDD_CENARIOS.md`](./BDD_CENARIOS.md):

| Feature | Cenários |
|---|---|
| login.feature | 7 — credenciais válidas, inválidas, campos vazios, XSS, sem auth |
| registro.feature | 7 — registro válido, duplicata, email inválido, senha fraca |
| coleta.feature | 11 — coleta válida, validações, IDOR, upload |
| seguranca.feature | 9 — backdoor, IDOR, exposição de senha, enumeração, session fixation |

---

*Desafio QA — VLAB · Seleção 2026*