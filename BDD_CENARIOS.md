# Cenários BDD — Desafio QA VLAB

**Autor**: Wallace Leão  
**Data**: 27/04/2026  
**Formato**: Gherkin (Dado/Quando/Então)  
**Total**: 34 cenários em 4 módulos

---

## Sumário

- [Módulo de Login](#módulo-de-login) — 7 cenários
- [Módulo de Registro](#módulo-de-registro) — 7 cenários
- [Módulo de Coleta](#módulo-de-coleta) — 11 cenários
- [Segurança e Controle de Acesso](#segurança-e-controle-de-acesso) — 9 cenários

---

## Módulo de Login

> **Como** um usuário do sistema  
> **Quero** realizar login com minhas credenciais  
> **Para** acessar as funcionalidades protegidas da plataforma

**Contexto:**
- Dado que o sistema está disponível em `http://localhost:3000`
- E que existem usuários cadastrados: `admin/admin123`, `user/user123`

---

### ✅ CT-L01 — Login com credenciais válidas de administrador

```gherkin
Dado que estou na página de login
Quando preencho o campo "username" com "admin"
E preencho o campo "password" com "admin123"
E clico no botão "Entrar"
Então devo ser redirecionado para "/dashboard"
E devo ver uma mensagem de boas-vindas com o nome do usuário
```

---

### ✅ CT-L02 — Login com credenciais válidas de usuário comum

```gherkin
Dado que estou na página de login
Quando preencho o campo "username" com "user"
E preencho o campo "password" com "user123"
E clico no botão "Entrar"
Então devo ser redirecionado para "/dashboard"
```

---

### ❌ CT-L03 — Login com senha incorreta

```gherkin
Dado que estou na página de login
Quando preencho o campo "username" com "admin"
E preencho o campo "password" com "senhaerrada"
E clico no botão "Entrar"
Então devo permanecer na página de login
E devo ver a mensagem de erro "Usuário ou senha incorretos"
```

---

### ❌ CT-L04 — Login com usuário inexistente

```gherkin
Dado que estou na página de login
Quando preencho o campo "username" com "usuario_fantasma"
E preencho o campo "password" com "qualquer123"
E clico no botão "Entrar"
Então devo ver uma mensagem de erro
E não devo ser redirecionado para o dashboard
```

---

### ❌ CT-L05 — Login com campos vazios

```gherkin
Dado que estou na página de login
Quando deixo o campo "username" vazio
E deixo o campo "password" vazio
E clico no botão "Entrar"
Então devo ver a mensagem de erro "Usuário e senha são obrigatórios"
E não devo ser autenticado
```

---

### 🔒 CT-L06 — Login com payload XSS no campo username

```gherkin
Dado que estou na página de login
Quando preencho o campo "username" com "<script>alert('xss')</script>"
E preencho o campo "password" com "qualquer"
E clico no botão "Entrar"
Então o script não deve ser executado
E o sistema deve tratar o input como texto puro
```

---

### 🔒 CT-L07 — Acesso ao dashboard sem autenticação

```gherkin
Dado que não estou autenticado no sistema
Quando acesso diretamente a URL "/dashboard"
Então devo ser redirecionado para a página de login
E não devo ver o conteúdo do dashboard
```

---

## Módulo de Registro

> **Como** um novo usuário  
> **Quero** me registrar no sistema  
> **Para** criar uma conta e acessar a plataforma

**Contexto:**
- Dado que estou na página de registro
- E os seguintes usuários já estão cadastrados: `admin`, `user`

---

### ✅ CT-R01 — Registro bem-sucedido com dados válidos

```gherkin
Dado que estou na página de registro
Quando insiro "novousuario" no campo de usuário
E insiro "novo@test.com" no campo de email
E insiro "senha123" no campo de senha
E insiro "senha123" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver uma mensagem de sucesso
E o novo usuário deve estar cadastrado no sistema
```

---

### ❌ CT-R02 — Registro com usuário duplicado

```gherkin
Dado que estou na página de registro
Quando insiro "admin" no campo de usuário
E insiro "newemail@test.com" no campo de email
E insiro "senha123" no campo de senha
E insiro "senha123" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver uma mensagem de erro "Usuário já existe"
E o usuário não deve ser registrado
```

---

### ❌ CT-R03 — Registro com email duplicado

```gherkin
Dado que estou na página de registro
Quando insiro "novousuario" no campo de usuário
E insiro "admin@test.com" no campo de email
E insiro "senha123" no campo de senha
E insiro "senha123" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver uma mensagem de erro
```

---

### ❌ CT-R04 — Registro com senhas não correspondentes

```gherkin
Dado que estou na página de registro
Quando insiro "novousuario" no campo de usuário
E insiro "novo@test.com" no campo de email
E insiro "senha123" no campo de senha
E insiro "diferente456" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver a mensagem de erro "As senhas não coincidem"
E o usuário não deve ser registrado
```

---

### ❌ CT-R05 — Registro com email inválido

```gherkin
Dado que estou na página de registro
Quando insiro "novousuario" no campo de usuário
E insiro "email-invalido" no campo de email
E insiro "senha123" no campo de senha
E insiro "senha123" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver uma mensagem de erro de email inválido
```

---

### ❌ CT-R06 — Registro com campos obrigatórios vazios

```gherkin
Dado que estou na página de registro
Quando deixo o campo de usuário vazio
E insiro "novo@test.com" no campo de email
E insiro "senha123" no campo de senha
E insiro "senha123" no campo de confirmação de senha
E clico no botão "Registrar"
Então devo ver uma mensagem de validação
```

---

### ❌ CT-R07 — Registro com senha fraca

```gherkin
Dado que estou na página de registro
Quando insiro "novousuario" no campo de usuário
E insiro "novo@test.com" no campo de email
E insiro "123" no campo de senha
E insiro "123" no campo de confirmação de senha
E clico no botão "Registrar"
Então o sistema deve exibir mensagem "Senha deve ter mínimo 8 caracteres"
E o usuário não deve ser criado
```

---

## Módulo de Coleta

> **Como** um usuário autenticado  
> **Quero** registrar dados de desempenho de beneficiários  
> **Para** acompanhar indicadores da plataforma de fomento

**Contexto:**
- Dado que estou autenticado como `admin`
- E que estou na página `/coleta`

---

### ✅ CT-C01 — Submissão de coleta com todos os dados válidos

```gherkin
Quando preencho o campo "ID" com "1001"
E preencho o campo "Nome" com "João Silva"
E preencho o campo "Taxa de Conclusão" com "85"
E preencho o campo "Frequência" com "90"
E preencho o campo "Nota" com "8"
E preencho o campo "Observações" com "Bom desempenho"
E seleciono o status "completo"
E clico em "Salvar Coleta"
Então devo ver mensagem de sucesso
E o registro deve aparecer no histórico
```

---

### ❌ CT-C02 — Taxa de Conclusão não deve aceitar valores negativos

```gherkin
Quando preencho o formulário com dados válidos
E preencho o campo "Taxa de Conclusão" com "-1"
E clico em "Salvar Coleta"
Então o sistema deve exibir erro "Taxa deve estar entre 0 e 100"
E o registro não deve ser salvo
```

---

### ❌ CT-C03 — Taxa de Conclusão não deve aceitar valores acima de 100

```gherkin
Quando preencho o formulário com dados válidos
E preencho o campo "Taxa de Conclusão" com "2000"
E clico em "Salvar Coleta"
Então o sistema deve exibir erro "Taxa deve estar entre 0 e 100"
E o registro não deve ser salvo
```

---

### ❌ CT-C04 — Frequência não deve aceitar valores acima de 100%

```gherkin
Quando preencho o formulário com dados válidos
E preencho o campo "Frequência" com "200"
E clico em "Salvar Coleta"
Então o sistema deve exibir erro de validação
E o registro não deve ser salvo
```

---

### ❌ CT-C05 — Nota não deve aceitar valores acima de 10

```gherkin
Quando preencho o formulário com dados válidos
E preencho o campo "Nota" com "99"
E clico em "Salvar Coleta"
Então o sistema deve exibir erro "Nota deve estar entre 0 e 10"
E o registro não deve ser salvo
```

---

### ❌ CT-C06 — Campo ID não deve aceitar valores não numéricos

```gherkin
Quando preencho o campo "ID" com "abcs"
E preencho os demais campos corretamente
E clico em "Salvar Coleta"
Então o sistema deve exibir erro de validação no campo ID
E o registro não deve ser salvo
```

---

### 🔒 CT-C07 — Coleta sem autenticação deve ser bloqueada

```gherkin
Dado que não estou autenticado
Quando acesso diretamente "/coleta"
Então devo ser redirecionado para a página de login
```

---

### 🔒 CT-C08 — Usuário comum não deve ver coletas de outros usuários (IDOR)

```gherkin
Dado que o usuário "admin" realizou uma coleta
E que estou autenticado como "user"
Quando acesso o histórico de coletas
Então devo ver apenas minhas próprias coletas
E não devo ver registros com "Coletado por: admin"
```

---

### ✅ CT-C09 — Upload de arquivo CSV válido deve ser aceito

```gherkin
Quando acesso a aba "Lote"
E faço upload de um arquivo "dados.csv" com estrutura válida
Então o sistema deve processar o arquivo
E exibir confirmação de importação
```

---

### ❌ CT-C10 — Upload de arquivo executável deve ser bloqueado

```gherkin
Quando acesso a aba "Lote"
E faço upload de um arquivo com extensão ".exe"
Então o sistema deve rejeitar o arquivo
E exibir mensagem "Formato de arquivo não permitido"
```

---

### ❌ CT-C11 — Upload de arquivo .txt renomeado como .csv deve ser bloqueado

```gherkin
Quando acesso a aba "Lote"
E faço upload de um arquivo ".txt" renomeado para ".csv"
Então o sistema deve validar o conteúdo real do arquivo
E rejeitar arquivos sem estrutura CSV válida
```

---

## Segurança e Controle de Acesso

> **Como** auditora de qualidade  
> **Quero** garantir que o sistema protege dados sensíveis  
> **E** impede acessos não autorizados

**Contexto:**
- Dado que o sistema está disponível em `http://localhost:3000`

---

### 🔒 CT-S01 — API não deve retornar senha em texto puro

```gherkin
Dado que estou autenticado como "admin"
Quando acesso o endpoint "/api/user"
Então a resposta não deve conter o campo "password"
E dados sensíveis não devem ser expostos na API
```

---

### 🔒 CT-S02 — Senha não deve ser armazenada no LocalStorage

```gherkin
Dado que estou na página de login
Quando realizo login com "admin" e "admin123"
Então o LocalStorage não deve conter o campo "password"
E apenas token de sessão deve ser persistido no cliente
```

---

### 🔒 CT-S03 — Logout deve remover dados sensíveis do navegador

```gherkin
Dado que estou autenticado e tenho dados no LocalStorage
Quando clico em "Logout"
Então o LocalStorage deve ser limpo completamente
E cookies de sessão devem ser invalidados
```

---

### 🔒 CT-S04 — Reset de senha deve exigir verificação de identidade

```gherkin
Dado que não estou autenticado
Quando envio requisição POST para "/reset-password"
Com o body '{"username":"admin","newPassword":"nova123"}'
Então o sistema deve retornar erro 401
E a senha não deve ser alterada
```

---

### 🔒 CT-S05 — Endpoint de reset não deve revelar existência de contas

```gherkin
Quando envio reset para username "usuario_inexistente"
E envio reset para username "admin"
Então ambas as respostas devem ser idênticas
E o sistema não deve permitir enumeração de usuários
```

---

### 🔒 CT-S06 — Usuário comum não deve acessar lista de todos os usuários

```gherkin
Dado que estou autenticado como "user"
Quando acesso o endpoint "/api/users"
Então devo receber erro 403
E a lista de usuários não deve ser retornada
```

---

### 🔒 CT-S07 — Session ID deve ser regenerado após novo login

```gherkin
Dado que estou autenticado e anoto o valor do cookie de sessão
Quando faço logout
E realizo novo login com as mesmas credenciais
Então o cookie de sessão deve ter um valor diferente do anterior
```

---

### 🔒 CT-S08 — Sistema não deve permitir cadastro com senha vazia

```gherkin
Dado que estou na página de registro
Quando preencho "username" com "novo_usuario"
E preencho "email" com "novo@email.com"
E deixo o campo "password" vazio
E submeto o formulário
Então o sistema deve retornar erro de validação
E o usuário não deve ser criado
```

---

### 🔒 CT-S09 — API de coleta deve exigir autenticação válida

```gherkin
Dado que não estou autenticado
Quando envio requisição POST para "/api/coleta" com dados válidos
Então o sistema deve retornar erro 401
E o registro não deve ser salvo
```

---

## Legenda

| Ícone | Significado |
|---|---|
| ✅ | Cenário positivo — comportamento esperado correto |
| ❌ | Cenário negativo — sistema deve rejeitar ou tratar o erro |
| 🔒 | Cenário de segurança — proteção contra acesso não autorizado |

---

BDD documentado com base nos 59 bugs encontrados na auditoria de 26–27/04/2026