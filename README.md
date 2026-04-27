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
git clone https://github.com/<seu-usuario>/Desafio-QA.git
cd Desafio-QA

# 2. Instalar dependências
npm install

# 3. Iniciar o servidor
npm start
```

Acesse em: **http://localhost:3000**

### Método 2 — Docker

# Sobe o sistema + roda os testes automaticamente
docker-compose up

# Só o sistema (sem rodar testes)
docker-compose up app

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
### Método 3 — Rodar testes Cypress com Docker

```bash
# Sobe o app e executa toda a suite Cypress
docker-compose up

# Os testes aguardam o healthcheck do servidor antes de iniciar
# Screenshots em caso de falha ficam em cypress/screenshots/
```

> O serviço `cypress` depende do healthcheck do `app` — os testes só iniciam quando `GET /health` retornar 200.

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

---

## Estrutura do projeto

```
Desafio-QA/
├── cypress/
│   ├── e2e/
│   │   ├── login.cy.js        # 14 testes — fluxo de autenticação
│   │   ├── register.cy.js     # 5 testes — registro de usuários
│   │   ├── coleta.cy.js       # 29 testes — módulo de coleta de dados
│   │   ├── security.cy.js     # 18 testes — segurança e controle de acesso
│   │   ├── api.cy.js          # 12 testes — endpoints e health check
│   │   └── pages/
│   │       └── LoginPage.js   # Page Object — login e autenticação
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
├── BUGS_REPORT.md             # 55 bugs documentados (relatório principal)
├── Relatorio_Complementar_Bugs_QA_VLAB.md  # 15 bugs adicionais por análise de código
├── REGRESSION_CHECKLIST.md    # Checklist de pontos críticos
├── public/                    # Frontend HTML/JS/CSS
├── server.js                  # Backend Node.js/Express
├── cypress.config.js
├── docker-compose.yml
└── package.json
```

---

## Resultados dos testes

### Resumo da execução

| Arquivo           | Testes | Passando | Falhando* |
|-------------------|--------|----------|-----------|
| login.cy.js       | 14     | 11       | 3         |
| register.cy.js    | 5      | 4        | 1         |
| coleta.cy.js      | 29     | 9        | 20        |
| security.cy.js    | 18     | 5        | 13        |
| api.cy.js         | 12     | 9        | 3         |
| **Total**         | **78** | **38**   | **40**    |

> *As falhas são **intencionais** — os testes estão corretos. Eles detectam e confirmam os bugs documentados no sistema. Um teste que falha aqui significa que o bug foi reproduzido automaticamente.

### Exemplos de bugs confirmados pelos testes

| Teste que falhou | Bug confirmado |
|---|---|
| `BUG #32 — Backdoor ?admin=true` | Dashboard acessível sem autenticação |
| `BUG #33 — /api/user?userId=1` | IDOR: expõe dados de qualquer usuário sem login |
| `BUG #16 — Histórico expõe outros usuários` | IDOR no histórico de coletas |
| `BUG #24 — Reset sem autenticação` | Troca senha de qualquer conta sem verificação |
| `BUG #15 — Senha no response` | API retorna senha em texto puro |

---

## Bugs encontrados

### Estatísticas gerais

| Métrica | Valor |
|---|---|
| Total de bugs documentados | **70** |
| Bugs críticos | 12 |
| Bugs de alta severidade | 22 |
| Bugs de média severidade | 28 |
| Bugs de baixa severidade | 8 |

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
5. **BUG #16** — IDOR: histórico de coletas expõe dados de todos os usuários para qualquer autenticado

Documentação completa em [`BUGS_REPORT.md`](./BUGS_REPORT.md) e [`Relatorio_Complementar_Bugs_QA_VLAB.md`](./Relatorio_Complementar_Bugs_QA_VLAB.md).

---

## Decisões técnicas

### Por que os testes de bugs "falham"

Os testes documentados como `BUG #N` são testes de **regressão com falha esperada** — eles provam que o bug existe reproduzindo-o automaticamente. A convenção adotada foi:

- Testes que **passam** → funcionalidade funcionando corretamente
- Testes `BUG #N` que **falham** → bug confirmado e reproduzível automaticamente

Essa abordagem permite que, quando o bug for corrigido no código, o teste passe automaticamente — garantindo que não haja regressão futura.

### Por que não foram feitos testes de SQL Injection

O sistema usa armazenamento em memória (array JavaScript), sem camada de banco de dados relacional. Testes de SQL Injection não se aplicam a esse contexto — mencionar isso demonstra entendimento da tecnologia antes de testar.

### Uso de `cy.session()` nos testes de API

`cy.request()` não compartilha cookies com `cy.visit()` automaticamente. Para testes que precisam de autenticação via API, foi usado `cy.session()` para persistir o cookie de sessão entre chamadas, garantindo testes estáveis.

### Page Object Pattern

Adotado no `LoginPage.js` para encapsular seletores e ações de autenticação. Isso garante que se um seletor mudar, apenas o Page Object precisa ser atualizado — todos os testes que o usam continuam funcionando sem modificação.

---

## Cenários BDD

Os cenários em formato Gherkin estão na pasta `features/` e cobrem:

- **login.feature** — 7 cenários: credenciais válidas, inválidas, campos vazios, XSS, acesso sem auth
- **registro.feature** — 7 cenários: registro válido, email inválido, senha fraca, duplicata
- **coleta.feature** — 11 cenários: coleta válida, validações de campos, IDOR, upload
- **seguranca.feature** — 9 cenários: backdoor, IDOR, exposição de senha, CSRF, session fixation

---

*Desafio QA — VLAB · Seleção 2026*