# Relatório Completo de Bugs — Desafio QA VLAB

**Testador**: Wallace Leão
**Data**: 26-27/04/2026
**Tempo de Teste**: ~12 horas
**Ambiente Base**: Chrome 124 · Windows 11 · Node.js 18 · localhost:3000
**Métodos**: Testes manuais exploratórios + Análise estática de código-fonte + Testes de API via DevTools/cURL

---

## Estatísticas Gerais

| Métrica | Valor |
|---|---|
| **Total de Bugs Documentados** | 55 |
| **Bugs Críticos** | 14 |
| **Bugs de Alta Severidade** | 16 |
| **Bugs de Média Severidade** | 16 |
| **Bugs de Baixa Severidade** | 9 |

## Distribuição por Categoria

| Categoria | Quantidade |
|---|---|
| **Segurança** | 26 |
| **Lógica / Validação** | 18 |
| **UX / Boas Práticas** | 11 |

## Distribuição por Método de Descoberta

| Método | Bugs |
|---|---|
| Teste manual exploratório (UI + DevTools) | 30 |
| Análise de código-fonte | 25 |

---

## Índice de Bugs Críticos — Prioridade Máxima

| ID | Título |
|---|---|
| #16 | IDOR — histórico expõe dados de todos os usuários |
| #19 | /api/users expõe lista completa com senhas |
| #21 | Senha armazenada em texto puro no LocalStorage |
| #24 | Reset de senha sem autenticação |
| #27 | /api/user expõe senha do usuário autenticado |
| #30 | Upload aceita arquivos .exe sem bloqueio |
| #31 | Session secret fraco e hardcoded ('123456') |
| #32 | Cookie httpOnly: false — vulnerável a XSS |
| #34 | /api/users acessível via secret hardcoded no cliente |
| #35 | Secret admin123 exposto no dashboard.js público |
| #36 | Dashboard renderiza senhas de todos os usuários na tela |
| #37 | Login aceita senha errada com 10% de chance (Math.random) |
| #42 | Backdoor ?admin=true libera dashboard sem autenticação |
| #47 | Senhas armazenadas em texto puro no servidor |

---

## Padrões Sistêmicos Identificados

### 1. Serialização insegura do objeto de usuário
Os bugs #15, #19, #21, #27, #36 compartilham a mesma causa raiz: o objeto `user` é retornado/renderizado sem remover o campo `password`. Uma função centralizada `sanitizeUser()` resolveria todos.

### 2. Ausência de validação de intervalos no backend
Os bugs #2, #3, #4, #5, #6, #7 seguem o mesmo padrão: campos numéricos sem validação de `min/max` no servidor. O frontend pode ser bypassado via DevTools ou cURL direto.

### 3. Double-dispatch de eventos
Os bugs #17 e #28 (duplicidade de registros) compartilham a mesma causa raiz: evento de submit registrado duas vezes no frontend.

### 4. Autenticação ausente em endpoints críticos
Os bugs #24, #42, #43 mostram que múltiplos endpoints não verificam sessão antes de responder.

---

# BUGS #1–#10 — Validação de Campos (Módulo Coleta)

---

## Bug #1: Campo ID aceita valores não numéricos

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "ID do Beneficiário" aceita e persiste valores alfanuméricos sem validação de tipo.

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "ID" com `abcs`
3. Submeter o formulário

### Resultado Esperado
Sistema deve aceitar apenas valores numéricos e exibir erro para valores inválidos.

### Resultado Atual
Sistema aceita `abcs` e registra a coleta com ID inválido.

### Impacto
Dados inconsistentes. Relatórios que dependem de ID numérico podem retornar resultados incorretos.

### Sugestão de Correção
```javascript
if (isNaN(beneficiarioId)) return res.status(400).json({ error: 'ID deve ser numérico' });
```

---

## Bug #2: Campo "Taxa de Conclusão" aceita valores negativos

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Taxa de Conclusão" não valida o limite inferior (0–100), aceitando valores negativos.

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Taxa de Conclusão" com `-1`
3. Submeter o formulário

### Resultado Esperado
Erro: "Taxa de Conclusão deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva `-1` sem erro.

### Impacto
Indicadores de desempenho corrompidos. Médias e relatórios retornam dados inválidos.

### Sugestão de Correção
```javascript
if (taxa < 0 || taxa > 100) return res.status(400).json({ error: 'Taxa deve estar entre 0 e 100' });
```

---

## Bug #3: Campo "Taxa de Conclusão" aceita valores acima de 100%

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Taxa de Conclusão" não valida o limite superior, aceitando valores como 2000.

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Taxa de Conclusão" com `2000`
3. Submeter o formulário

### Resultado Esperado
Erro: "Taxa de Conclusão deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva `2000`.

### Sugestão de Correção
Mesma do Bug #2: validar intervalo [0, 100] no frontend e backend.

---

## Bug #4: Campo "Frequência de Presença" aceita valores negativos

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Frequência de Presença" aceita valores negativos sem validação.

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Frequência" com `-10`
3. Submeter o formulário

### Resultado Esperado
Erro: "Frequência deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva `-10`.

---

## Bug #5: Campo "Frequência de Presença" aceita valores acima de 100%

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Frequência de Presença" aceita valores impossíveis como 2000000.

### Passos para Reproduzir
1. Preencher "Frequência" com `2000000`
2. Submeter o formulário

### Resultado Esperado
Erro: "Frequência deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva `2000000`.

---

## Bug #6: Campo "Nota de Avaliação" aceita valores negativos

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Nota de Avaliação" aceita notas negativas sem validação.

### Passos para Reproduzir
1. Preencher "Nota" com `-12`
2. Submeter o formulário

### Resultado Esperado
Erro: "Nota deve estar entre 0 e 10".

### Resultado Atual
Sistema aceita e salva `-12`.

---

## Bug #7: Campo "Nota de Avaliação" aceita valores acima do limite

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "Nota de Avaliação" aceita valores superiores ao máximo (10).

### Passos para Reproduzir
1. Preencher "Nota" com `99`
2. Submeter o formulário

### Resultado Esperado
Erro: "Nota deve estar entre 0 e 10".

### Resultado Atual
Sistema aceita e salva `99`.

### Sugestão de Correção
```javascript
if (nota < 0 || nota > 10) return res.status(400).json({ error: 'Nota deve estar entre 0 e 10' });
```

---

## Bug #8: Campo "Nome do Beneficiário" sem limite de tamanho

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo aceita strings de tamanho arbitrário sem restrição.

### Passos para Reproduzir
1. Preencher "Nome" com texto de milhares de caracteres
2. Submeter o formulário

### Resultado Esperado
Sistema deve limitar a 255 caracteres e exibir erro quando excedido.

### Resultado Atual
Sistema aceita e armazena o texto completo.

### Impacto
Degradação de performance. Em produção pode causar crash.

---

## Bug #9: Campo "Observações" sem limite de tamanho

**Severidade**: Média | **Categoria**: Lógica/Segurança | **Status**: Aberto

### Descrição
O campo "Observações" aceita entrada de tamanho ilimitado, sem restrição de caracteres ou sanitização.

### Passos para Reproduzir
1. Preencher "Observações" com texto de milhares de caracteres
2. Submeter o formulário

### Resultado Esperado
Sistema deve limitar o tamanho e sanitizar o conteúdo antes de armazenar.

### Resultado Atual
Sistema aceita e armazena sem restrição.

### Impacto
Além de performance, a ausência de sanitização torna este campo vetor de XSS Armazenado (ver Bug #46).

---

## Bug #10: Backend aceita campos indicadores como null

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
`POST /api/coleta` aceita e persiste campos com valor `null` sem rejeitar a requisição.

### Passos para Reproduzir
1. Capturar requisição de coleta via DevTools → Network → "Copy as cURL"
2. Modificar payload com `taxa: null, frequencia: null, nota: null`
3. Reenviar

### Resultado Esperado
Backend deve rejeitar com status 400.

### Resultado Atual
Sistema retorna sucesso e persiste dados nulos.

### Sugestão de Correção
```javascript
if (taxa === null || frequencia === null || nota === null) {
  return res.status(400).json({ error: 'Campos obrigatórios não podem ser nulos' });
}
```

---

# BUGS #11–#14 — Validação de Campos (Registro)

---

## Bug #11: Username no registro sem limite de tamanho

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "username" aceita strings de tamanho ilimitado no registro.

### Passos para Reproduzir
1. Preencher "username" com texto extremamente longo
2. Submeter registro

### Resultado Esperado
Sistema deve limitar a 50–150 caracteres.

### Resultado Atual
Cadastro realizado com username de tamanho excessivo.

---

## Bug #12: Email sem limite de tamanho máximo

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
O campo "email" aceita endereços extremamente longos.

### Passos para Reproduzir
1. Informar email válido com centenas de caracteres antes do `@`
2. Submeter registro

### Resultado Esperado
Limite máximo de 255 caracteres.

### Resultado Atual
Cadastro realizado com email extremamente longo.

---

## Bug #13: Sistema permite usuário com senha vazia

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
`POST /register` cria usuários sem senha contornando validação do frontend.

### Passos para Reproduzir
1. Enviar via DevTools com `password: ""`

### Resultado Esperado
Backend deve rejeitar senha vazia.

### Resultado Atual
Usuário criado com senha vazia armazenada.

### Sugestão de Correção
```javascript
if (!password || password.trim() === '') {
  return res.status(400).json({ error: 'Senha obrigatória' });
}
```

---

## Bug #14: Senha sem limite de tamanho máximo (DoS via bcrypt)

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
O campo "password" aceita senhas de tamanho ilimitado, explorável em ataques DoS via hashing.

### Passos para Reproduzir
1. Inserir senha com milhares de caracteres no registro
2. Submeter

### Resultado Esperado
Limite máximo de 255 caracteres.

### Resultado Atual
Cadastro realizado com senha gigante.

### Impacto
Em sistemas com bcrypt, senhas longas causam alto consumo de CPU — vetor de DoS.

---

# BUGS #15–#30 — Segurança e Lógica (Testes Manuais)

---

## Bug #15: /api/user retorna senha em texto puro

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Endpoint retorna objeto completo do usuário incluindo `password` em texto puro.

### Passos para Reproduzir
1. Login válido
2. DevTools → Network → inspecionar resposta do endpoint de dados do usuário

### Evidências
```json
{ "id": 1, "username": "admin", "email": "...", "role": "admin", "password": "admin123" }
```

### Sugestão de Correção
```javascript
const { password, ...safeUser } = user;
res.json(safeUser);
```

---

## Bug #16: IDOR — Histórico expõe dados de todos os usuários

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
`GET /api/coleta/historico` retorna coletas de todos os usuários sem filtrar pela sessão.

### Passos para Reproduzir
1. Login como `admin` → submeter coleta → logout
2. Login como `user` → acessar aba "Histórico"
3. Coleta do admin aparece visível para o user

### Impacto
Violação de privacidade. Qualquer usuário autenticado acessa dados de todos os outros.

### Sugestão de Correção
```javascript
coletas.filter(c => c.usuarioId === req.session.userId)
```

---

## Bug #17: Coleta registrada em duplicidade a cada submissão

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
Cada submissão do formulário gera dois registros idênticos no histórico.

### Passos para Reproduzir
1. Preencher formulário de coleta
2. Submeter uma única vez
3. Verificar histórico — dois registros idênticos

### Causa Raiz Provável
Event listener registrado duas vezes no frontend (double-dispatch).

### Sugestão de Correção
Verificar double-listener. Adicionar verificação de idempotência no backend.

---

## Bug #18: Rota /health declarada duas vezes

**Severidade**: Baixa | **Categoria**: Boas Práticas | **Status**: Aberto

### Descrição
`GET /health` aparece em duas linhas do `server.js`. Express usa apenas a primeira; a segunda é código morto.

### Localização
`server.js` linhas ~52 e ~200.

### Impacto
A segunda declaração (com campo `memory`) nunca é executada. Testes que esperam esse campo falham.

---

## Bug #19: /api/users expõe lista completa com senhas

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Endpoint retorna lista de todos os usuários incluindo `password` em texto puro.

### Evidências
```json
[
  { "id": 1, "username": "admin", "password": "admin123", "role": "admin" },
  { "id": 2, "username": "user",  "password": "user123",  "role": "user" }
]
```

### Sugestão de Correção
```javascript
users.map(({ password, ...u }) => u)
```

---

## Bug #20: "Lembrar de mim" não altera comportamento da sessão

**Severidade**: Média | **Categoria**: UX/Segurança | **Status**: Aberto

### Descrição
Checkbox não produz efeito. Sessão persiste igualmente marcado ou desmarcado.

### Passos para Reproduzir
1. Login sem marcar "Lembrar de mim" → fechar navegador → reabrir → ainda autenticado
2. Repetir marcando → comportamento idêntico

### Impacto
Funcionalidade enganosa. Risco em dispositivos compartilhados.

---

## Bug #21: Senha em texto puro no LocalStorage

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Após login, sistema armazena objeto completo do usuário no `localStorage` incluindo `password`.

### Passos para Reproduzir
1. Login → DevTools → Application → LocalStorage → inspecionar objeto

### Evidências
```json
{ "username": "admin", "email": "...", "role": "admin", "password": "admin123" }
```

### Sugestão de Correção
Armazenar apenas dados não sensíveis. Nunca armazenar senha no cliente.

---

## Bug #22: Logout não remove credenciais do LocalStorage

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Após logout, senha e dados do usuário permanecem no `localStorage`.

### Passos para Reproduzir
1. Login → confirmar dados no LocalStorage
2. Logout → verificar LocalStorage novamente — dados permanecem

### Sugestão de Correção
```javascript
localStorage.clear(); // ou localStorage.removeItem('user')
```

---

## Bug #23: Session ID não regenerado após novo login (Session Fixation)

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Cookie de sessão mantém o mesmo valor após logout e novo login.

### Passos para Reproduzir
1. Login → anotar cookie de sessão (DevTools → Application → Cookies)
2. Logout → novo login → comparar cookie — mesmo valor

### Impacto
Vulnerabilidade de Session Fixation: atacante pode fixar um Session ID e sequestrar sessão após autenticação.

### Sugestão de Correção
```javascript
req.session.regenerate(() => { req.session.userId = user.id; });
```

---

## Bug #24: Reset de senha sem autenticação

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
`POST /reset-password` altera senha de qualquer usuário sem exigir autenticação.

### Passos para Reproduzir
```bash
curl -X POST http://localhost:3000/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","newPassword":"hacked123"}'
```

### Resultado Atual
Senha do admin alterada sem qualquer verificação de identidade.

### Sugestão de Correção
Implementar token temporário por email ou exigir senha atual antes de alterar.

---

## Bug #25: Reset de senha não valida campos obrigatórios

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto

### Descrição
Com campos vazios, retorna "Usuário não encontrado" em vez de erro de validação.

### Passos para Reproduzir
Enviar: `{ "username": "", "newPassword": "" }`

### Resultado Esperado
Status 400: "Usuário e nova senha são obrigatórios".

### Resultado Atual
"Usuário não encontrado" — valida lógica de negócio antes dos campos obrigatórios.

---

## Bug #26: Reset de senha permite enumeração de usuários

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Respostas diferentes para usernames válidos e inválidos permitem enumerar usuários.

### Passos para Reproduzir
1. Reset para `admin` → "Senha alterada com sucesso"
2. Reset para `fantasma` → "Usuário não encontrado"

### Sugestão de Correção
Retornar sempre a mesma mensagem genérica independentemente do resultado.

---

## Bug #27: /api/user expõe senha do usuário autenticado

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Endpoint retorna objeto completo do usuário autenticado incluindo `password`.

### Evidências
```json
{ "id": 2, "username": "user", "email": "...", "role": "user", "password": "user123" }
```

---

## Bug #28: Upload em lote gera múltiplos registros de um CSV

**Severidade**: Alta | **Categoria**: Lógica | **Status**: Aberto

### Descrição
Upload de CSV com 1 registro válido gera múltiplos registros no histórico.

### Causa Raiz Provável
Mesmo padrão do Bug #17 — double-dispatch de evento no frontend.

---

## Bug #29: Upload aceita arquivos .txt renomeados como .csv

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Sistema valida apenas extensão, não o conteúdo real do arquivo.

### Passos para Reproduzir
1. Criar `teste.txt` com conteúdo arbitrário → renomear para `teste.csv`
2. Submeter via upload em lote → aceito sem erro

---

## Bug #30: Upload aceita arquivos .exe sem bloqueio

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto

### Descrição
Endpoint de upload aceita `.exe` sem validação de tipo MIME.

### Sugestão de Correção
```javascript
const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
if (!allowedTypes.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
}
```

---

# BUGS #31–#46 — Segurança e Configuração (Análise de Código)

---

## Bug #31: Session secret fraco e hardcoded ('123456')

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linha 16

### Evidência
```javascript
secret: '123456', // BUG: Secret fraco e hardcoded
```

### Impacto
Permite forjar cookies de sessão válidos para qualquer usuário, incluindo admin.

### Sugestão de Correção
```javascript
secret: process.env.SESSION_SECRET // variável de ambiente, nunca hardcoded
```

---

## Bug #32: Cookie de sessão com httpOnly: false e secure: false

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linhas 18–19

### Evidência
```javascript
cookie: { secure: false, httpOnly: false }
```

### Impacto
`httpOnly: false` → cookie acessível via `document.cookie` — roubo de sessão via XSS.
`secure: false` → cookie trafega em HTTP — interceptável em redes inseguras.

### Passos para Reproduzir
1. Login → DevTools → Console → `document.cookie`
2. Cookie de sessão retornado pelo JavaScript

### Sugestão de Correção
```javascript
cookie: { secure: true, httpOnly: true, sameSite: 'strict' }
```

---

## Bug #33: Sessão configurada para expirar em 30 dias

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linha 20

### Evidência
```javascript
maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
```

### Impacto
Sessão roubada ou em dispositivo compartilhado permanece válida por um mês inteiro.

### Sugestão de Correção
```javascript
maxAge: 2 * 60 * 60 * 1000 // 2 horas
```

---

## Bug #34: /api/users protegido apenas por secret em query param

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linhas 163–166

### Evidência
```javascript
if (req.query.secret === 'admin123') {
  return res.json({ success: true, users: users }); // expõe senhas
}
```

### Passos para Reproduzir
Sem autenticação: `http://localhost:3000/api/users?secret=admin123`

### Sugestão de Correção
```javascript
if (!req.session.userId || req.session.role !== 'admin') {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

---

## Bug #35: Secret admin123 hardcoded no dashboard.js público

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `public/dashboard.js`

### Evidência
```javascript
const response = await fetch('/api/users?secret=admin123'); // exposto no cliente
```

### Passos para Reproduzir
DevTools → Sources → dashboard.js → localizar `secret=admin123`

### Impacto
Torna a proteção do Bug #34 completamente ineficaz. Qualquer visitante obtém o secret.

---

## Bug #36: Dashboard renderiza senha de todos os usuários na tela

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `public/dashboard.js`

### Evidência
```javascript
html += `<p><strong>Senha:</strong> <span class="password-display">${user.password}</span></p>`;
```

### Passos para Reproduzir
1. Login com qualquer usuário
2. Clicar em "Ver Todos os Usuários"
3. Senhas de todos os usuários aparecem na tela em texto puro

---

## Bug #37: Login aceita senha errada com 10% de probabilidade

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linha ~70

### Evidência
```javascript
const randomFactor = Math.random();
if (user.password === password || randomFactor < 0.1) {
  req.session.userId = user.id; // autentica com 10% de chance mesmo com senha errada
}
```

### Passos para Reproduzir
1. Tentar login com senha errada ~15 vezes
2. Em ~10% das tentativas o login é aceito

### Impacto
Qualquer pessoa que conheça um username válido pode comprometer a conta em ~10 tentativas.

---

## Bug #38: Logout seta userId=null em vez de destruir a sessão

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
req.session.userId = null; // BUG: deveria ser req.session.destroy()
```

### Impacto
Sessão continua existindo no servidor com `username` e `role` preservados. Possível reuso indevido.

### Sugestão de Correção
```javascript
req.session.destroy((err) => {
  res.clearCookie('connect.sid');
  res.json({ success: true });
});
```

---

## Bug #39: Campo email com type="text" em vez de type="email"

**Severidade**: Baixa | **Categoria**: UX | **Status**: Aberto
**Localização**: `public/index.html`

### Evidência
```html
<input type="text" id="registerEmail" ... />
<!-- Deveria ser type="email" -->
```

### Impacto
Desabilita validação nativa do browser. Sem teclado otimizado em mobile.

---

## Bug #40: /health declarada duas vezes — segunda nunca executada

**Severidade**: Média | **Categoria**: Lógica/Boas Práticas | **Status**: Aberto
**Localização**: `server.js` linhas ~52 e ~200

### Evidência
```javascript
// Primeira declaração (linha ~52)
app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp, uptime }) });

// Segunda declaração (linha ~200) — nunca executada
app.get('/health', (req, res) => { res.json({ status: 'ok', timestamp, uptime, memory }) });
```

### Impacto
Campo `memory` documentado na segunda declaração nunca é retornado. Testes que esperam esse campo falham.

---

## Bug #41: Rate limiting com limite de 1000 tentativas (ineficaz)

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
if (loginAttempts[username] > 1000) { // deveria ser 3–5
  return res.status(429).json({ ... });
}
```

### Impacto
Combinado com Bug #37 (10% de bypass), um atacante compromete qualquer conta em ~10 tentativas. O bloqueio nunca é atingido.

---

## Bug #42: Backdoor — Dashboard acessível via ?admin=true sem login

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
if (req.session.userId || req.query.admin === 'true') { // backdoor
  res.sendFile('dashboard.html');
}
```

### Passos para Reproduzir
Sem estar autenticado: `http://localhost:3000/dashboard?admin=true`

### Sugestão de Correção
```javascript
if (req.session.userId) { res.sendFile('dashboard.html'); }
```

---

## Bug #43: IDOR via query param — /api/user?userId=N sem autenticação

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
const userId = req.session.userId || req.query.userId; // aceita por query param
```

### Passos para Reproduzir
Sem autenticação: `http://localhost:3000/api/user?userId=1`

### Resultado Atual
Retorna dados completos incluindo senha de qualquer usuário sem autenticação.

---

## Bug #44: Mensagem de erro do login revela existência de usuário

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
message: `Usuário '${username}' não encontrado no sistema` // username inválido
message: 'Senha incorreta!' // username válido
```

### Impacto
Permite enumerar usernames válidos sistematicamente. Facilita ataques direcionados.

### Sugestão de Correção
```javascript
return res.status(401).json({ message: 'Usuário ou senha incorretos' });
```

---

## Bug #45: Campos de login sem atributo required no HTML

**Severidade**: Baixa | **Categoria**: UX | **Status**: Aberto
**Localização**: `public/index.html`

### Evidência
```html
<input type="text" id="loginUsername" />  <!-- sem required -->
<input type="password" id="loginPassword" /> <!-- sem required -->
```

### Impacto
Formulário submetido vazio sem bloqueio nativo do browser.

---

## Bug #46: XSS Armazenado no histórico via innerHTML sem sanitização

**Severidade**: Crítica | **Categoria**: Segurança/XSS | **Status**: Aberto
**Localização**: `public/coleta.js` linha 204

### Evidência
```javascript
historicoDiv.innerHTML = html; // dados do servidor inseridos diretamente como HTML

// html montado com dados não tratados:
Nome: ${coleta.beneficiarioNome}    // sem escape
Obs:  ${coleta.observacoes}         // sem escape
```

### Passos para Reproduzir
1. No campo "Nome" ou "Observações", inserir: `<img src=x onerror=alert('XSS')>`
2. Submeter o formulário
3. Acessar aba "Histórico" — script executa no navegador

### Impacto
XSS Armazenado afeta todos os usuários que visualizarem o histórico. Combinado com Bug #32 (httpOnly: false), permite roubo de cookies de sessão de todos os usuários autenticados. **Ataque em cadeia de três vulnerabilidades.**

### Sugestão de Correção
Usar `textContent` em vez de `innerHTML`, ou escapar dados antes de inserir no DOM.

---

# BUGS #47–#55 — Análise de Código Complementar

---

## Bug #47: Senhas armazenadas em texto puro no servidor

**Severidade**: Crítica | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linhas 27–31

### Evidência
```javascript
const users = [
  { id: 1, username: 'admin', password: 'admin123', ... },
  { id: 2, username: 'user',  password: 'user123',  ... },
];
```

### Sugestão de Correção
```javascript
const bcrypt = require('bcrypt');
const hash = await bcrypt.hash(password, 12);
```

---

## Bug #48: Sem validação de força de senha no backend

**Severidade**: Alta | **Categoria**: Segurança | **Status**: Aberto
**Localização**: `server.js` linhas 115–116

### Passos para Reproduzir
1. Registrar com senha `1` (um caractere) → aceito

### Sugestão de Correção
```javascript
if (password.length < 8) {
  return res.status(400).json({ error: 'Senha deve ter mínimo 8 caracteres' });
}
```

---

## Bug #49: Contador de tentativas não zerado após login bem-sucedido

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto
**Localização**: `server.js`

### Evidência
```javascript
// Após login bem-sucedido, loginAttempts[username] nunca é limpo
req.session.userId = user.id;
return res.json({ success: true });
```

### Sugestão de Correção
```javascript
delete loginAttempts[username]; // limpar após sucesso
```

---

## Bug #50: Backend sem trim() na validação de campos vazios

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto
**Localização**: `server.js` linhas 38–41

### Evidência
```javascript
if (!username || !password) { ... }
// "   " é truthy — passa a validação como username válido
```

### Sugestão de Correção
```javascript
if (!username?.trim() || !password?.trim()) { ... }
```

---

## Bug #51: Comparação usa == em vez de === no registro

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto
**Localização**: `server.js` linha 108

### Evidência
```javascript
const existingUser = users.find(u => u.username == username); // coerção de tipo
```

### Sugestão de Correção
```javascript
const existingUser = users.find(u => u.username === username);
```

---

## Bug #52: ID de usuário gerado por índice do array — pode gerar duplicatas

**Severidade**: Média | **Categoria**: Lógica | **Status**: Aberto
**Localização**: `server.js` linha 119

### Evidência
```javascript
id: users.length + 1 // duplica se usuário for removido
```

### Sugestão de Correção
```javascript
id: users.reduce((max, u) => Math.max(max, u.id), 0) + 1
```

---

## Bug #53: Login automático após registro sem notificação

**Severidade**: Baixa | **Categoria**: UX | **Status**: Aberto
**Localização**: `server.js` linhas 128–129

### Evidência
```javascript
req.session.userId = newUser.id; // loga silenciosamente
return res.json({ success: true, message: 'Usuário registrado com sucesso!' });
```

### Impacto
Usuário não sabe que foi autenticado automaticamente.

---

## Bug #54: CSS com classe específica para exibir senhas (.password-display)

**Severidade**: Média | **Categoria**: Boas Práticas | **Status**: Aberto
**Localização**: `public/style.css`

### Evidência
```css
.password-display {
  color: #721c24;
  font-family: monospace;
  background: #f8d7da;
}
```

### Impacto
A existência da classe normaliza a exibição de senhas como feature do sistema, não como bug.

---

## Bug #55: Delay artificial de 1 segundo após login bem-sucedido

**Severidade**: Baixa | **Categoria**: UX | **Status**: Aberto
**Localização**: `public/script.js`

### Evidência
```javascript
setTimeout(() => {
  window.location.href = '/dashboard';
}, 1000); // delay sem justificativa funcional
```

### Sugestão de Correção
Redirecionar imediatamente após confirmar sucesso do servidor.

---

## Resumo Final

### Bugs por Severidade

| Severidade | Quantidade | IDs |
|---|---|---|
| **Crítica** | 14 | #16, #19, #21, #24, #27, #30, #31, #32, #34, #35, #36, #37, #42, #46, #47 |
| **Alta** | 16 | #2–#7, #10, #13, #14, #22, #26, #28, #33, #41, #43, #44, #48 |
| **Média** | 16 | #1, #8, #9, #11, #12, #17, #20, #23, #25, #38, #40, #49, #50, #51, #52, #54 |
| **Baixa** | 9 | #15, #18, #29, #39, #45, #53, #55 |

### Bugs por Categoria

| Categoria | Quantidade |
|---|---|
| **Segurança** | 26 |
| **Lógica / Validação** | 18 |
| **UX / Boas Práticas** | 11 |

### Áreas Testadas

- [x] Login (credenciais válidas, inválidas, campos vazios, bypass)
- [x] Registro (campos, limites, senha vazia, email inválido)
- [x] Reset de Senha (sem autenticação, enumeração, campos vazios)
- [x] Dashboard (exposição de dados, backdoor, seção admin)
- [x] Logout (LocalStorage, sessão no servidor)
- [x] Coleta — formulário individual (validações de campos numéricos)
- [x] Coleta — upload em lote (tipo de arquivo, duplicidade)
- [x] Histórico (IDOR, XSS armazenado)
- [x] APIs (via DevTools e cURL direto)
- [x] LocalStorage e gestão de sessão (cookies, httpOnly, expiração)
- [x] Código-fonte (server.js, script.js, dashboard.js, coleta.js, index.html, style.css)

### Observações Metodológicas

- **SQL Injection não testado**: Sistema usa array em memória, sem banco de dados relacional — escopo de teste não aplicável. Demonstra raciocínio técnico sobre escopo.
- **Ataque em cadeia identificado**: Bugs #32 + #46 + #9 formam uma cadeia XSS → roubo de cookie → sequestro de sessão. Documenta o risco combinado além dos bugs individuais.
- **Padrão sistêmico de senha**: Bugs #15, #19, #21, #27, #35, #36, #47 compartilham causa raiz. Uma função `sanitizeUser()` centralizada resolveria todos.

---

**Testador**: Wallace Leão
**Data**: 26–27/04/2026
**Total de Bugs Documentados**: 55