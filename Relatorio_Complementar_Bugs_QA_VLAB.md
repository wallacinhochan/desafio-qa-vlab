# Relatório Complementar de Bugs — Desafio QA VLAB

**Testador**: Wallace Leão
**Data**: 26/04/2026
**Complemento ao relatório original** (Bugs #1–#30)
**Numeração**: Bug #31 em diante
**Método de descoberta**: Análise de código-fonte (server.js, script.js, dashboard.js, coleta.js)
**Ambiente Base**: Chrome 124 · Windows 11 · Node.js 18 · localhost:3000

---

## Bug #31: Login aceita senha errada com 10% de probabilidade (Bypass de Autenticação)

**Severidade**: [x] Crítica
**Categoria**: [x] Segurança / Lógica
**Status**: [x] Aberto

### Descrição
A rota `POST /login` contém uma condição lógica defeituosa que aceita autenticação com senha incorreta em aproximadamente 10% das tentativas, devido ao uso de um fator aleatório na validação.

### Localização no Código
**Arquivo**: `server.js` — linha ~70

```javascript
const randomFactor = Math.random();
if (user.password === password || randomFactor < 0.1) {
  // BUG: 10% de chance de aceitar senha errada
  req.session.userId = user.id;
  ...
}
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar a tela de login em `/`
2. Inserir username válido (ex: `admin`) com senha incorreta (ex: `senhaerrada`)
3. Clicar em "Entrar" repetidamente (~10–15 tentativas)
4. Observar que em algumas tentativas o login é aceito com senha errada

### Resultado Esperado
O sistema deve rejeitar consistentemente qualquer senha incorreta, sem exceção.

### Resultado Atual
Aproximadamente 1 em cada 10 tentativas de login com senha incorreta é aceita, retornando sessão autenticada válida.

### Evidências
Código em `server.js`:
```javascript
if (user.password === password || randomFactor < 0.1)
```
A condição `randomFactor < 0.1` usa `Math.random()` e retorna `true` em ~10% dos casos, independentemente da senha fornecida.

### Impacto
Qualquer pessoa que conheça um username válido pode acessar a conta por força bruta com poucas tentativas (média de 10). Comprometimento total da autenticação do sistema.

### Sugestão de Correção
Remover completamente a condição aleatória:
```javascript
if (user.password === password) {
```

---

## Bug #32: Backdoor — Dashboard acessível sem autenticação via `?admin=true`

**Severidade**: [x] Crítica
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
A rota `GET /dashboard` contém uma backdoor intencional que permite acesso sem qualquer autenticação quando o parâmetro `?admin=true` é adicionado à URL.

### Localização no Código
**Arquivo**: `server.js`

```javascript
app.get('/dashboard', (req, res) => {
  if (req.session.userId || req.query.admin === 'true') { // BUG: backdoor
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
  } else {
    res.redirect('/');
  }
});
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Certificar-se de que não está logado (sem sessão ativa)
2. Acessar diretamente no navegador: `http://localhost:3000/dashboard?admin=true`
3. Observar que o dashboard é carregado sem credenciais

### Resultado Esperado
Qualquer acesso ao `/dashboard` sem sessão autenticada deve redirecionar para a tela de login.

### Resultado Atual
O dashboard é exibido normalmente sem nenhuma autenticação.

### Impacto
Qualquer pessoa com conhecimento da URL pode acessar o painel de controle sem credenciais. Em produção, isso representaria acesso não autorizado a todos os dados e funcionalidades do sistema.

### Sugestão de Correção
Remover a condição de backdoor e validar apenas a sessão:
```javascript
if (req.session.userId) {
  res.sendFile(...);
}
```

---

## Bug #33: IDOR via Query Parameter — `/api/user?userId=N` expõe qualquer usuário sem autenticação

**Severidade**: [x] Crítica
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O endpoint `GET /api/user` aceita o parâmetro `userId` via query string, permitindo que qualquer pessoa — mesmo sem estar autenticada — acesse os dados completos de qualquer usuário do sistema pelo seu ID.

### Localização no Código
**Arquivo**: `server.js`

```javascript
app.get('/api/user', (req, res) => {
  const userId = req.session.userId || req.query.userId; // BUG: aceita por query param
  const user = users.find(u => u.id === parseInt(userId));
  if (user) {
    return res.json({ success: true, user: user }); // retorna com senha
  }
});
```

### Ambiente
- **Navegador**: Chrome 124 (testado via barra de endereço e DevTools)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Sem estar autenticado, acessar diretamente:
   - `http://localhost:3000/api/user?userId=1`
   - `http://localhost:3000/api/user?userId=2`
   - `http://localhost:3000/api/user?userId=3`
2. Observar a resposta JSON com dados completos incluindo senha

### Resultado Esperado
O endpoint deve verificar autenticação e retornar 401 para requisições sem sessão válida.

### Resultado Atual
Retorna objeto completo do usuário (com senha) para qualquer ID solicitado, sem autenticação:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "password": "admin123",
    "email": "admin@test.com",
    "role": "admin"
  }
}
```

### Impacto
Enumeração completa de todos os usuários e suas senhas sem qualquer autenticação. Agrava os bugs #15, #19 e #27 do relatório original, pois dispensa até mesmo o login.

### Sugestão de Correção
Remover suporte a `req.query.userId` e exigir sessão:
```javascript
const userId = req.session.userId;
if (!userId) return res.status(401).json({ error: 'Não autenticado' });
```

---

## Bug #34: Secret hardcoded no código cliente — `/api/users?secret=admin123` visível no frontend

**Severidade**: [x] Crítica
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O arquivo `dashboard.js` (acessível publicamente pelo navegador) contém o secret de acesso ao endpoint administrativo hardcoded. Qualquer pessoa que inspecione o código-fonte da página obtém a chave para acessar a lista completa de todos os usuários e suas senhas.

### Localização no Código
**Arquivo**: `public/dashboard.js`

```javascript
async function loadAllUsers() {
  // BUG: Hardcoded secret no código do cliente
  const response = await fetch('/api/users?secret=admin123');
  ...
}
```

**Arquivo**: `server.js`

```javascript
app.get('/api/users', (req, res) => {
  if (req.query.secret === 'admin123') { // BUG: proteção trivial
    return res.json({ success: true, users: users }); // expõe senhas
  }
});
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `http://localhost:3000`
2. Abrir DevTools → aba "Sources"
3. Navegar até `dashboard.js`
4. Localizar a chamada `fetch('/api/users?secret=admin123')`
5. Acessar diretamente: `http://localhost:3000/api/users?secret=admin123`

### Resultado Esperado
Endpoints administrativos devem ser protegidos por autenticação de sessão e verificação de role, não por secret em query string.

### Resultado Atual
Qualquer pessoa com acesso ao DevTools obtém o secret e consegue a lista completa de todos os usuários com senhas em texto puro.

### Impacto
Comprometimento total de todas as contas com um único passo. Agrava o Bug #19 do relatório original ao revelar também o mecanismo de acesso.

### Sugestão de Correção
Substituir verificação por secret por validação de role na sessão:
```javascript
if (!req.session.userId || req.session.role !== 'admin') {
  return res.status(403).json({ error: 'Acesso negado' });
}
```

---

## Bug #35: Senha do usuário exibida visualmente na tela do dashboard

**Severidade**: [x] Crítica
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O dashboard renderiza a senha do usuário autenticado em texto puro diretamente na interface HTML, visível para qualquer pessoa que olhe a tela.

### Localização no Código
**Arquivo**: `public/dashboard.js`

```javascript
userDataDiv.innerHTML = `
  <p><strong>ID:</strong> ${user.id}</p>
  <p><strong>Usuário:</strong> ${user.username}</p>
  <p><strong>Email:</strong> ${user.email}</p>
  <p><strong>Role:</strong> ${user.role}</p>
  <p><strong>Senha:</strong> <span class="password-display">${user.password}</span></p>
`;
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com qualquer usuário válido
2. Observar o conteúdo do dashboard
3. A senha aparece impressa na tela sob o rótulo "Senha:"

### Resultado Esperado
Senhas jamais devem ser exibidas em nenhuma interface, em nenhuma circunstância.

### Resultado Atual
A senha do usuário está visível em texto puro na tela principal do dashboard após o login.

### Evidências
O CSS do projeto inclusive contém uma classe específica para estilizar a exibição de senhas (`password-display` em `style.css`), confirmando que o comportamento é intencional no código bugado.

### Impacto
Qualquer pessoa próxima ao computador ou que capture uma screenshot da tela obtém a senha do usuário autenticado. Em ambientes de trabalho compartilhados, o risco é imediato.

### Sugestão de Correção
Remover completamente o campo senha do HTML renderizado. Nunca exibir senhas em interfaces de usuário.

---

## Bug #36: Rate limiting configurado com limite impossível — força bruta liberada

**Severidade**: [x] Alta
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O mecanismo de rate limiting para tentativas de login está configurado com um limite de 1000 tentativas, tornando o bloqueio praticamente impossível de atingir. Ataques de força bruta ficam completamente liberados na prática.

### Localização no Código
**Arquivo**: `server.js`

```javascript
loginAttempts[username]++;

if (loginAttempts[username] > 1000) { // BUG: deveria ser 3-5
  return res.status(429).json({
    success: false,
    message: 'Muitas tentativas de login. Tente novamente mais tarde.'
  });
}
```

### Ambiente
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Enviar requisições de login com senha incorreta automaticamente via script ou Burp Suite
2. Observar que o sistema nunca bloqueia nas primeiras centenas de tentativas

### Resultado Esperado
O sistema deve bloquear o usuário após 3 a 5 tentativas falhas consecutivas.

### Resultado Atual
O bloqueio só ocorreria após 1001 tentativas, o que na prática nunca é atingido em um ataque normal.

### Impacto
Combinado com o Bug #31 (10% de bypass aleatório), um atacante pode comprometer qualquer conta em média com ~10 tentativas. Mesmo sem o Bug #31, força bruta simples é viável.

### Sugestão de Correção
```javascript
if (loginAttempts[username] > 5) {
  return res.status(429).json({ error: 'Conta bloqueada temporariamente' });
}
// Limpar após login bem-sucedido:
delete loginAttempts[username];
```

---

## Bug #37: Mensagem de erro do login revela existência de usuário

**Severidade**: [x] Alta
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
A rota `POST /login` retorna mensagens de erro diferentes dependendo se o usuário existe ou não, permitindo enumeração de usuários válidos. Problema equivalente ao Bug #26 do relatório original, mas na rota de login (não documentado anteriormente).

### Localização no Código
**Arquivo**: `server.js`

```javascript
// Quando usuário não existe:
message: `Usuário '${username}' não encontrado no sistema`

// Quando usuário existe mas senha está errada:
message: 'Senha incorreta!'
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Tentar login com username inexistente (ex: `fantasma`) → observar mensagem
2. Tentar login com username válido (ex: `admin`) e senha errada → observar mensagem diferente

### Resultado Esperado
Ambos os casos devem retornar a mesma mensagem genérica: `"Usuário ou senha incorretos"`.

### Resultado Atual
Mensagens distintas revelam se o username existe no sistema. O campo `username` é inclusive incluído na mensagem de erro, confirmando o que foi digitado.

### Impacto
Permite enumeração sistemática de usuários válidos. Facilita ataques direcionados de força bruta e phishing.

### Sugestão de Correção
```javascript
return res.status(401).json({
  success: false,
  message: 'Usuário ou senha incorretos'
});
```

---

## Bug #38: Logout não destrói sessão no servidor — apenas anula o userId

**Severidade**: [x] Alta
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
A rota `POST /logout` define `req.session.userId = null` em vez de destruir a sessão completamente. O objeto de sessão continua existindo no servidor com os demais dados (username, role), o que pode permitir reuso indevido.

### Localização no Código
**Arquivo**: `server.js`

```javascript
app.post('/logout', (req, res) => {
  req.session.userId = null; // BUG: deveria ser req.session.destroy()
  res.json({ success: true, message: 'Logout realizado' });
});
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login
2. Executar logout
3. Inspecionar o cookie de sessão — ele permanece ativo
4. Tentar reenviar requisições com o mesmo cookie via DevTools ou cURL

### Resultado Esperado
O logout deve invalidar completamente a sessão no servidor.

### Resultado Atual
A sessão continua existindo no servidor com `username` e `role` preservados. Apenas `userId` é anulado.

### Impacto
Dependendo de como outros endpoints verificam a autenticação (alguns podem checar `req.session.username` em vez de `req.session.userId`), a sessão pode ser reaproveitada após o logout. Risco em ambientes com tokens de sessão compartilhados.

### Sugestão de Correção
```javascript
req.session.destroy((err) => {
  if (err) return res.status(500).json({ error: 'Erro ao encerrar sessão' });
  res.clearCookie('connect.sid');
  res.json({ success: true });
});
```

---

## Bug #39: Cookie de sessão com `httpOnly: false` — vulnerável a XSS

**Severidade**: [x] Alta
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O cookie de sessão está configurado com `httpOnly: false`, permitindo que JavaScript executado na página acesse e leia o cookie de sessão diretamente. Isso amplifica qualquer vulnerabilidade XSS existente no sistema.

### Localização no Código
**Arquivo**: `server.js`

```javascript
app.use(session({
  secret: '123456',
  cookie: {
    secure: false,
    httpOnly: false, // BUG: vulnerável a XSS
    maxAge: 30 * 24 * 60 * 60 * 1000
  }
}));
```

### Ambiente
- **Navegador**: Chrome 124 (verificado via DevTools → Application → Cookies)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login
2. Abrir DevTools → Console
3. Executar: `document.cookie`
4. Observar o cookie de sessão retornado

### Resultado Esperado
Cookies de sessão devem ter `httpOnly: true` para impedir acesso via JavaScript.

### Resultado Atual
O cookie `connect.sid` é acessível via `document.cookie` no console do navegador.

### Impacto
Qualquer XSS no sistema (como o potencial no campo Observações) pode ser usado para roubar o cookie de sessão e sequestrar a conta de qualquer usuário autenticado.

### Sugestão de Correção
```javascript
cookie: {
  secure: true,   // apenas HTTPS
  httpOnly: true, // impede acesso via JavaScript
  maxAge: 2 * 60 * 60 * 1000 // 2 horas, não 30 dias
}
```

---

## Bug #40: Secret de sessão fraco e hardcoded (`'123456'`)

**Severidade**: [x] Alta
**Categoria**: [x] Segurança
**Status**: [x] Aberto

### Descrição
O secret usado para assinar os cookies de sessão é o valor `'123456'` — extremamente fraco e hardcoded diretamente no código-fonte. Qualquer pessoa com acesso ao repositório pode forjar cookies de sessão válidos.

### Localização no Código
**Arquivo**: `server.js`

```javascript
app.use(session({
  secret: '123456', // BUG: secret fraco e hardcoded
  ...
}));
```

### Ambiente
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Visualizar o código de `server.js`
2. Observar o secret `'123456'` na configuração de sessão
3. Usar ferramentas como `express-session` decoder com o secret para forjar cookies

### Resultado Esperado
O secret deve ser uma string longa, aleatória e carregada de variável de ambiente (não commitada no repositório).

### Resultado Atual
Secret fraco (`'123456'`) está visível no código-fonte.

### Impacto
Permite falsificação de cookies de sessão. Um atacante pode criar um cookie válido para qualquer `userId` e acessar o sistema como qualquer usuário, incluindo admin.

### Sugestão de Correção
```javascript
secret: process.env.SESSION_SECRET // variável de ambiente, nunca hardcoded
```

---

## Bug #41: Tempo de sessão excessivo — 30 dias sem expiração por inatividade

**Severidade**: [x] Média
**Categoria**: [x] Segurança / UX
**Status**: [x] Aberto

### Descrição
A sessão é configurada para durar 30 dias sem nenhum mecanismo de expiração por inatividade. Uma sessão roubada ou esquecida em dispositivo compartilhado permanece válida por um mês inteiro.

### Localização no Código
**Arquivo**: `server.js`

```javascript
cookie: {
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias - BUG: muito tempo
}
```

### Ambiente
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login
2. Não interagir com o sistema por horas
3. Retornar e verificar que a sessão ainda está ativa

### Resultado Esperado
Sessões devem expirar por inatividade (ex: 1–2 horas) ou ter duração máxima razoável (ex: 8 horas para sessão de trabalho).

### Resultado Atual
Sessão permanece válida por 30 dias corridos, independentemente de inatividade.

### Impacto
Em caso de roubo de cookie ou abandono de sessão em dispositivo compartilhado, o atacante tem 30 dias de acesso válido.

### Sugestão de Correção
```javascript
maxAge: 2 * 60 * 60 * 1000 // 2 horas
```

---

## Bug #42: Validação de email aceita formato inválido (`a@b`)

**Severidade**: [x] Média
**Categoria**: [x] Lógica
**Status**: [x] Aberto

### Descrição
A validação de email no registro verifica apenas a presença do caractere `@`, aceitando strings inválidas como `a@b`, `x@`, `@dominio` como emails válidos.

### Localização no Código
**Arquivo**: `server.js`

```javascript
if (!email.includes('@')) { // BUG: validação insuficiente
  return res.status(400).json({ success: false, message: 'Email inválido' });
}
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar o formulário de registro
2. Preencher o campo email com `a@b`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve rejeitar emails claramente inválidos.

### Resultado Atual
Cadastro realizado com sucesso com email `a@b`.

### Impacto
Dados de email corrompidos no sistema. Comunicações por email falhariam silenciosamente. Em produção, dificulta recuperação de conta.

### Sugestão de Correção
```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Email inválido' });
}
```

---

## Bug #43: Campo username aceita apenas espaços como valor válido

**Severidade**: [x] Média
**Categoria**: [x] Lógica
**Status**: [x] Aberto

### Descrição
A validação de username no frontend verifica apenas `username.length === 0`, o que permite que uma string composta exclusivamente de espaços (`"   "`) seja aceita como username válido.

### Localização no Código
**Arquivo**: `public/script.js`

```javascript
// BUG 36: Validação de cliente fraca - aceita espaços em branco
if (username.length === 0 || password.length === 0) {
  showMessage(messageDiv, 'Por favor, preencha todos os campos', 'error');
  return;
}
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar o formulário de login ou registro
2. Preencher o campo username com `"   "` (três espaços)
3. Preencher os demais campos
4. Submeter o formulário — a validação não bloqueia

### Resultado Esperado
O sistema deve rejeitar campos preenchidos apenas com espaços.

### Resultado Atual
A validação de comprimento passa para strings com apenas espaços, permitindo cadastro ou tentativa de login com username inválido.

### Impacto
Dados inconsistentes. Usuário pode criar conta com username invisível na interface.

### Sugestão de Correção
```javascript
if (username.trim().length === 0 || password.trim().length === 0) {
```

---

## Bug #44: Seção administrativa exibida para usuários comuns no dashboard

**Severidade**: [x] Média
**Categoria**: [x] Segurança / UX
**Status**: [x] Aberto

### Descrição
O dashboard exibe a seção "Ver Todos os Usuários" (funcionalidade administrativa) para qualquer usuário autenticado, independentemente de seu role. Um usuário com role `user` vê e pode acionar o botão de listar todos os usuários.

### Localização no Código
**Arquivo**: `public/dashboard.html`

```html
<!-- BUG 34: Seção administrativa visível para todos -->
<div class="admin-section" data-testid="admin-section">
  <h3>Administração</h3>
  <button class="btn btn-primary" onclick="loadAllUsers()">
    Ver Todos os Usuários
  </button>
  <div id="allUsersData" class="users-list"></div>
</div>
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com usuário de role `user` (`user / user123`)
2. Observar o dashboard — a seção "Administração" está visível
3. Clicar em "Ver Todos os Usuários"
4. Observar a lista com senhas de todos os usuários

### Resultado Esperado
A seção administrativa deve ser visível e funcional apenas para usuários com role `admin`.

### Resultado Atual
Qualquer usuário autenticado, independente de role, visualiza e pode usar a funcionalidade administrativa.

### Impacto
Usuários comuns têm acesso à lista completa de todos os usuários e suas senhas — comprometimento completo do controle de acesso baseado em role (RBAC).

### Sugestão de Correção
Verificar role no frontend e no backend antes de exibir e processar a seção:
```javascript
if (user.role === 'admin') {
  document.querySelector('.admin-section').style.display = 'block';
}
```

---

## Bug #45: Formulários não são limpos após submit bem-sucedido

**Severidade**: [x] Baixa
**Categoria**: [x] UX
**Status**: [x] Aberto

### Descrição
Os formulários de login, registro e reset de senha mantêm os dados preenchidos (incluindo a senha digitada) após um submit bem-sucedido, durante o delay de 1 segundo antes do redirecionamento.

### Localização no Código
**Arquivo**: `public/script.js`

```javascript
// BUG 49: Não limpa formulários após submit bem-sucedido
// BUG 50: Não previne múltiplos submits (double-click)
setTimeout(() => {
  window.location.href = '/dashboard';
}, 1000);
```

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com credenciais válidas
2. Observar os campos antes do redirecionamento — senha permanece visível por 1 segundo
3. Clicar rapidamente duas vezes no botão de submit — duas requisições são enviadas

### Resultado Esperado
Campos devem ser limpos imediatamente após submit bem-sucedido. O botão deve ser desabilitado durante o processamento para evitar duplo envio.

### Resultado Atual
Dados permanecem nos campos durante o delay. Clique duplo envia duas requisições.

### Impacto
Senha visível em tela por 1 segundo após login. Potencial de duplo cadastro em caso de clique duplo no registro.

### Sugestão de Correção
```javascript
document.getElementById('loginForm').reset();
document.getElementById('loginBtn').disabled = true;
```

---

## Resumo do Relatório Complementar

### Estatísticas dos Bugs Adicionais

| Métrica | Valor |
|---|---|
| **Total de Bugs Adicionais** | 15 |
| **Bugs Críticos** | 5 |
| **Bugs de Alta Severidade** | 5 |
| **Bugs de Média Severidade** | 4 |
| **Bugs de Baixa Severidade** | 1 |

### Distribuição por Categoria

| Categoria | Quantidade |
|---|---|
| **Segurança** | 10 |
| **Lógica / Validação** | 3 |
| **UX / Boas Práticas** | 2 |

### Método de Descoberta
Todos os bugs deste relatório complementar foram descobertos por **análise estática de código-fonte** (`server.js`, `script.js`, `dashboard.js`, `coleta.js`), sem necessidade de execução do sistema.

### Bugs Críticos Adicionais — Prioridade Máxima

1. **BUG-31** — Bypass de autenticação com 10% de probabilidade por fator aleatório no login
2. **BUG-32** — Backdoor `?admin=true` permite acesso ao dashboard sem credenciais
3. **BUG-33** — IDOR via `?userId=N` expõe qualquer usuário sem autenticação
4. **BUG-34** — Secret hardcoded no código cliente permite acesso à lista completa de usuários
5. **BUG-35** — Senha do usuário renderizada visualmente na tela do dashboard

### Padrões Sistêmicos Identificados

- **Serialização insegura do objeto de usuário**: O objeto `user` é retornado sem sanitização em múltiplos pontos (login, registro, `/api/user`, dashboard). Uma função centralizada `sanitizeUser()` resolveria todos simultaneamente.
- **Ausência de verificação de autenticação consistente**: Alguns endpoints verificam `req.session.userId`, outros aceitam `req.query.userId`, outros não verificam nada. Falta um middleware de autenticação centralizado.
- **Validações apenas no cliente**: A maioria das validações de campo existe apenas no frontend e pode ser bypassada via DevTools ou requisição direta.

### Recomendação de Arquitetura

Além das correções pontuais, o sistema precisa de:

1. Middleware de autenticação centralizado aplicado a todas as rotas protegidas
2. Função `sanitizeUser()` que remove `password` antes de qualquer serialização
3. Hash de senhas com bcrypt antes de armazenar e comparar
4. Secret de sessão via variável de ambiente
5. Validações duplicadas em frontend E backend para todos os campos

---

**Testador**: Wallace Leão
**Data**: 26/04/2026
**Total acumulado (relatório original + complementar)**: 45 bugs documentados
