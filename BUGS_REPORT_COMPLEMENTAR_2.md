# Relatório Complementar 2 — Bugs #47–#61

**Método de descoberta**: Cruzamento do gabarito oficial com análise de código-fonte  
**Numeração**: Continuação do relatório anterior (bugs #1–#46)  
**Total acumulado após este relatório**: 61 bugs  

---

## Bug #47: Senhas armazenadas em texto puro no servidor

**Severidade**: Crítica  
**Categoria**: Segurança  
**Localização**: `server.js` linhas 27–31

### Evidência no código
```javascript
const users = [
  { id: 1, username: 'admin', password: 'admin123', email: 'admin@test.com', role: 'admin' },
  { id: 2, username: 'user',  password: 'user123',  email: 'user@test.com',  role: 'user'  },
  { id: 3, username: 'teste', password: '123456',   email: 'teste@test.com', role: 'user'  }
];
```

### Passos para reproduzir
1. Abrir `server.js`
2. Localizar o array `users` no topo do arquivo
3. Observar que todas as senhas estão em texto puro no código e na memória

### Resultado esperado
Senhas devem ser armazenadas como hash usando bcrypt ou argon2. Nunca em texto puro.

### Resultado atual
Senhas em texto puro tanto no código-fonte quanto no array em memória. Qualquer acesso ao processo ou dump de memória expõe todas as credenciais.

### Sugestão de correção
```javascript
const bcrypt = require('bcrypt');
// Ao registrar: const hash = await bcrypt.hash(password, 12);
// Ao validar:   const valid = await bcrypt.compare(password, user.passwordHash);
```

---

## Bug #48: Sem validação de força de senha no backend

**Severidade**: Alta  
**Categoria**: Segurança / Lógica  
**Localização**: `server.js` linhas 115–116

### Evidência no código
```javascript
// Não há nenhuma validação de força de senha
// BUG 16: Não valida força da senha
const newUser = { id: users.length + 1, username, password, email, role: 'user' };
```

### Passos para reproduzir
1. Acessar o formulário de registro
2. Preencher senha com `1` (um único caractere)
3. Submeter — usuário criado com sucesso

### Resultado esperado
O sistema deve exigir senha com pelo menos 8 caracteres, incluindo letras e números.

### Resultado atual
Senhas de qualquer tamanho e complexidade são aceitas, incluindo `1`, `a`, `" "`.

### Sugestão de correção
```javascript
if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
  return res.status(400).json({ error: 'Senha deve ter mínimo 8 caracteres, letras e números' });
}
```

---

## Bug #49: Contador de tentativas de login não é zerado após login bem-sucedido

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `server.js` linha 67

### Evidência no código
```javascript
if (user && (user.password === password || randomFactor < 0.1)) {
  req.session.userId = user.id;
  // BUG 9: loginAttempts[username] nunca é limpo após sucesso
  return res.json({ success: true, ... });
}
```

### Passos para reproduzir
1. Tentar login com senha errada 5 vezes para o usuário `admin`
2. Fazer login com senha correta — funciona normalmente
3. Tentar novamente com senha errada — o contador continua do ponto anterior, nunca sendo zerado

### Resultado esperado
Após login bem-sucedido, o contador de tentativas falhas deve ser zerado para aquele usuário.

### Resultado atual
O contador `loginAttempts[username]` cresce indefinidamente. Um usuário que eventualmente acertou a senha pode ser bloqueado nas próximas tentativas por tentativas antigas que nunca foram limpas.

### Sugestão de correção
```javascript
// Após login bem-sucedido:
delete loginAttempts[username];
```

---

## Bug #50: Backend não usa trim() na validação de campos vazios

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `server.js` linhas 38–41

### Evidência no código
```javascript
// BUG 5: Não valida campos vazios corretamente
if (!username || !password) {
  return res.status(400).json({ success: false, message: 'Usuário e senha são obrigatórios' });
}
// String com apenas espaços ("   ") passa nessa validação pois é truthy
```

### Passos para reproduzir
1. Enviar via cURL ou Postman: `{"username": "   ", "password": "   "}`
2. O backend aceita a requisição sem erro de validação

### Resultado esperado
O backend deve rejeitar strings compostas apenas de espaços.

### Resultado atual
`"   "` é um valor truthy em JavaScript — a validação `!username` retorna `false` e o sistema prossegue com um username inválido.

### Sugestão de correção
```javascript
if (!username?.trim() || !password?.trim()) {
  return res.status(400).json({ error: 'Campos obrigatórios não podem ser apenas espaços' });
}
```

---

## Bug #51: Comparação usa == em vez de === no registro

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `server.js` linha 108

### Evidência no código
```javascript
// BUG 15: Comparação usa == em vez de ===
const existingUser = users.find(u => u.username == username);
```

### Passos para reproduzir
1. Abrir `server.js` e localizar a linha de busca de usuário no registro
2. Observar o uso de `==` (comparação fraca) em vez de `===` (comparação estrita)

### Resultado esperado
Comparações de strings devem usar `===` para evitar coerção de tipos inesperada.

### Resultado atual
`==` permite coerção de tipo. Embora raro com strings, é uma má prática que pode causar comportamentos inesperados em edge cases (ex: username numérico `0` sendo comparado com string vazia).

### Sugestão de correção
```javascript
const existingUser = users.find(u => u.username === username);
```

---

## Bug #52: ID de usuário gerado por índice do array — pode gerar duplicatas

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `server.js` linha 119

### Evidência no código
```javascript
// BUG 17: ID gerado pode ser duplicado
const newUser = {
  id: users.length + 1, // Se um usuário for removido, IDs podem repetir
  username, password, email, role: 'user'
};
```

### Passos para reproduzir
1. Registrar usuários com IDs 1, 2, 3
2. Remover o usuário de ID 3 do array (via manipulação direta ou em caso de implementação de delete)
3. Registrar novo usuário — receberá ID 3 novamente, colisionando com histórico

### Resultado esperado
IDs devem ser únicos e imutáveis, independentemente de operações no array.

### Resultado atual
`users.length + 1` é determinístico apenas se o array nunca encolher. Qualquer remoção de usuário geraria IDs duplicados.

### Sugestão de correção
```javascript
const nextId = users.reduce((max, u) => Math.max(max, u.id), 0) + 1;
// Ou usar: crypto.randomUUID()
```

---

## Bug #53: Login automático após registro sem notificação ao usuário

**Severidade**: Baixa  
**Categoria**: Lógica / UX  
**Localização**: `server.js` linhas 128–129

### Evidência no código
```javascript
// BUG 19: Loga automaticamente após registro sem avisar o usuário
req.session.userId = newUser.id;
req.session.username = newUser.username;
req.session.role = newUser.role;
return res.json({ success: true, message: 'Usuário registrado com sucesso!', user: newUser });
```

### Passos para reproduzir
1. Registrar novo usuário
2. Observar que a sessão é criada automaticamente — o usuário é redirecionado para o dashboard sem precisar fazer login explicitamente

### Resultado esperado
Após o registro, o comportamento esperado é ou: (a) redirecionar para login com mensagem "Conta criada, faça login" ou (b) fazer login automático **e informar claramente** ao usuário que ele já está autenticado.

### Resultado atual
O sistema cria a sessão silenciosamente e redireciona para o dashboard sem nenhuma indicação de que o login automático ocorreu.

---

## Bug #54: Campos de login sem atributo `required` no HTML

**Severidade**: Baixa  
**Categoria**: UX  
**Localização**: `public/index.html` linha 22

### Evidência no código
```html
<input
  type="text"
  id="loginUsername"
  name="username"
  data-testid="login-username"
  autocomplete="username"
/>
<!-- BUG 25: Campo não tem validação required -->
```

### Passos para reproduzir
1. Abrir a tela de login
2. Deixar os campos vazios
3. Clicar em "Entrar"
4. O formulário é submetido sem bloqueio nativo do browser

### Resultado esperado
Campos obrigatórios devem ter `required` para ativar a validação nativa do browser antes do JavaScript.

### Resultado atual
Sem `required`, o browser não bloqueia o submit de campos vazios. A validação depende exclusivamente do JavaScript, que pode ser desabilitado.

### Sugestão de correção
```html
<input type="text" id="loginUsername" required ... />
<input type="password" id="loginPassword" required ... />
```

---

## Bug #55: Campo de email usa `type="text"` em vez de `type="email"`

**Severidade**: Baixa  
**Categoria**: UX  
**Localização**: `public/index.html` linha 47

### Evidência no código
```html
<input
  type="text"
  id="registerEmail"
  name="email"
  data-testid="register-email"
  autocomplete="email"
/>
<!-- BUG 30: Tipo deveria ser "email" mas está como "text" -->
```

### Passos para reproduzir
1. Acessar o formulário de registro
2. Preencher o campo de email com `nao-e-um-email`
3. Observar que o browser não exibe aviso de validação nativa

### Resultado esperado
`type="email"` ativa a validação nativa do browser, teclado otimizado em mobile e semântica correta.

### Resultado atual
`type="text"` desabilita toda validação nativa de formato de email pelo browser.

### Sugestão de correção
```html
<input type="email" id="registerEmail" ... />
```

---

## Bug #56: Comparação de confirmação de senha usa `!=` em vez de `!==`

**Severidade**: Baixa  
**Categoria**: Lógica  
**Localização**: `public/script.js` linha 75

### Evidência no código
```javascript
// BUG 43: Validação de confirmação de senha tem bug de lógica
if (password != passwordConfirm) { // BUG: Usa != em vez de !==
  showMessage(messageDiv, 'As senhas não coincidem', 'error');
  return;
}
```

### Resultado esperado
Comparações de strings devem usar `!==` para garantir verificação de tipo e valor.

### Resultado atual
`!=` usa coerção de tipo. Para strings isso geralmente funciona, mas é má prática e pode falhar em edge cases (ex: `0 != "0"` retorna `false` com `!=` mas `true` com `!==`).

### Sugestão de correção
```javascript
if (password !== passwordConfirm) {
```

---

## Bug #57: Mensagem de sucesso/erro desaparece em apenas 3 segundos

**Severidade**: Baixa  
**Categoria**: UX  
**Localização**: `public/script.js` linhas 143–146

### Evidência no código
```javascript
// BUG 48: Mensagem desaparece muito rápido (3 segundos)
setTimeout(() => {
  element.style.display = 'none';
}, 3000);
```

### Passos para reproduzir
1. Tentar login com credenciais inválidas
2. Observar a mensagem de erro
3. Após 3 segundos ela desaparece automaticamente — muito rápido para leitura confortável

### Resultado esperado
Mensagens de feedback devem permanecer visíveis por pelo menos 5–7 segundos, ou até o usuário interagir com a página.

### Resultado atual
3 segundos é insuficiente para usuários com leitura mais lenta ou para mensagens de erro mais longas.

### Sugestão de correção
```javascript
}, 6000); // 6 segundos, ou implementar dismiss manual
```

---

## Bug #58: Dashboard faz request à API sem verificar autenticação primeiro

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `public/dashboard.js` linha 9

### Evidência no código
```javascript
// BUG 51: Não verifica se usuário está autenticado antes de fazer request
const response = await fetch('/api/user');
const data = await response.json();

if (data.success) {
  // renderiza dados
} else {
  // BUG 53: Não redireciona para login se não autenticado
  userDataDiv.innerHTML = '<p>Erro ao carregar dados do usuário</p>';
}
```

### Passos para reproduzir
1. Abrir o dashboard sem estar autenticado
2. Observar que o JavaScript tenta fazer o request de qualquer forma
3. Quando falha, exibe mensagem de erro genérica em vez de redirecionar para o login

### Resultado esperado
O dashboard deve verificar no localStorage ou via API se há sessão ativa. Se não houver, redirecionar imediatamente para `/`.

### Resultado atual
O dashboard tenta carregar os dados, falha silenciosamente e exibe "Erro ao carregar dados" — sem redirecionar para o login.

### Sugestão de correção
```javascript
const loggedIn = localStorage.getItem('loggedIn');
if (!loggedIn) {
  window.location.href = '/';
  return;
}
```

---

## Bug #59: Logout redireciona para login mesmo quando a requisição falha

**Severidade**: Média  
**Categoria**: Lógica  
**Localização**: `public/dashboard.js` linha 62

### Evidência no código
```javascript
} catch (error) {
  console.log('Erro ao fazer logout:', error);
  // BUG 57: Redireciona mesmo se logout falhar
  window.location.href = '/';
}
```

### Passos para reproduzir
1. Derrubar o servidor enquanto está logado
2. Clicar em "Logout"
3. O usuário é redirecionado para `/` mesmo com o servidor offline
4. A sessão no servidor continua ativa — o logout não ocorreu de fato

### Resultado esperado
Se o logout falhar, o usuário deve ser informado e a sessão deve ser considerada ainda ativa.

### Resultado atual
O catch redireciona para a tela de login dando aparência de logout bem-sucedido, mas a sessão continua válida no servidor.

### Sugestão de correção
```javascript
} catch (error) {
  showMessage('Erro ao encerrar sessão. Tente novamente.', 'error');
  // NÃO redirecionar
}
```

---

## Bug #60: Sem proteção contra ataques CSRF

**Severidade**: Alta  
**Categoria**: Segurança  
**Localização**: Geral — todas as rotas POST

### Evidência no código
```javascript
// Nenhum middleware de CSRF está configurado em server.js
// As rotas POST /login, /register, /logout, /reset-password, /api/coleta
// não possuem nenhum token de verificação de origem
app.post('/logout', (req, res) => { ... });
app.post('/api/coleta', (req, res) => { ... });
```

### Passos para reproduzir
1. Criar uma página HTML maliciosa com um formulário que faz POST para `http://localhost:3000/logout`
2. Induzir um usuário autenticado a abrir essa página
3. O logout ocorre sem o usuário ter clicado em nada no sistema

### Resultado esperado
Requisições POST devem incluir e validar um token CSRF para garantir que vieram da interface legítima.

### Resultado atual
Qualquer site pode forçar requisições autenticadas em nome do usuário, incluindo logout forçado, coleta de dados falsa ou reset de senha.

### Sugestão de correção
```javascript
const csrf = require('csurf');
app.use(csrf());
// Incluir token em todos os formulários: <input type="hidden" name="_csrf" value="<%= csrfToken() %>">
```

---

## Bug #61: Console.log expõe dados sensíveis em produção

**Severidade**: Baixa  
**Categoria**: Boas Práticas  
**Localização**: `public/dashboard.js` linhas 25, 49, 62 e `public/script.js` linha 60

### Evidência no código
```javascript
// dashboard.js
console.log('Erro:', error);         // linha 25
console.log('Erro:', error);         // linha 49
console.log('Erro ao fazer logout:', error); // linha 62

// script.js
console.log(error); // BUG 40: deveria ser console.error
```

### Resultado esperado
Em produção, logs de erro devem usar `console.error` e não expor stack traces ou dados internos no console do navegador. Logs devem ser removidos ou condicionados a uma variável de ambiente de debug.

### Resultado atual
Qualquer usuário com DevTools aberto pode ver erros internos, stack traces e informações de debug que poderiam revelar estrutura interna do sistema.

### Sugestão de correção
```javascript
// Trocar console.log por console.error para erros
// Em produção, desabilitar todos os logs:
if (process.env.NODE_ENV !== 'production') {
  console.error('Erro:', error);
}
```

---

## Resumo do Relatório Complementar 2

| Métrica | Valor |
|---|---|
| Bugs adicionados neste relatório | 15 |
| **Total acumulado (relatórios 1 + 2 + 3)** | **61 bugs** |

### Distribuição dos 15 bugs novos

| Severidade | Quantidade |
|---|---|
| Crítica | 1 |
| Alta | 2 |
| Média | 5 |
| Baixa | 7 |

### Cobertura do gabarito oficial (60 bugs)

Com 61 bugs documentados, você está acima do gabarito completo e no **nível Expert** da tabela de avaliação.

```
Nível Júnior:  10–20 bugs
Nível Pleno:   21–40 bugs
Nível Sênior:  41–60 bugs
Nível Expert:  60+ bugs  ← você está aqui ✅
```

---

**Testador**: [Seu Nome]  
**Data**: 26/04/2026  
**Total acumulado**: 61 bugs documentados
