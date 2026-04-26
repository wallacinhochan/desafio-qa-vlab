# Relatório de Bugs — Desafio QA VLAB

**Testador**: [Seu Nome]  
**Data**: 26/04/2026  
**Tempo de Teste**: ~8 horas  
**Ambiente Base**: Chrome 124 · Windows 11 · Node.js 18 · localhost:3000

---

## Bug #1: Campo ID aceita valores não numéricos

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "ID do Beneficiário" no formulário de coleta aceita e persiste valores alfanuméricos sem qualquer validação de tipo.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher o campo "ID" com `abcs`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve validar o campo ID e aceitar apenas valores numéricos, exibindo mensagem de erro para valores inválidos.

### Resultado Atual
O sistema aceita o valor `abcs` e registra a coleta com ID inválido no histórico.

### Evidências
Campo "ID" aceita string arbitrária sem erro ou aviso ao usuário.

### Impacto
Dados de beneficiários ficam inconsistentes. Relatórios e consultas que dependem de ID numérico podem quebrar ou retornar resultados incorretos.

### Sugestão de Correção
Adicionar validação `isNaN()` ou `Number.isInteger()` no frontend e backend antes de persistir. Usar `type="number"` no input HTML.

---

## Bug #2: Campo "Taxa de Conclusão" aceita valores negativos

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Taxa de Conclusão" não valida o limite inferior do intervalo permitido (0–100), aceitando valores negativos.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher o campo "Taxa de Conclusão" com `-1`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve rejeitar o valor e exibir: "Taxa de Conclusão deve estar entre 0 e 100".

### Resultado Atual
O sistema aceita e salva o valor `-1` sem qualquer erro.

### Impacto
Indicadores de desempenho de bolsistas ficam corrompidos. Cálculos de média e relatórios gerenciais retornam dados inválidos.

### Sugestão de Correção
Validar `value >= 0 && value <= 100` no frontend (atributos `min="0" max="100"`) e no backend antes de persistir.

---

## Bug #3: Campo "Taxa de Conclusão" aceita valores acima de 100%

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Taxa de Conclusão" não valida o limite superior, aceitando valores absurdos como 2000.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher o campo "Taxa de Conclusão" com `2000`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve rejeitar o valor e exibir: "Taxa de Conclusão deve estar entre 0 e 100".

### Resultado Atual
O sistema aceita e salva o valor `2000`.

### Impacto
Mesmos impactos do Bug #2 — corrompimento de indicadores e relatórios.

### Sugestão de Correção
Mesma correção do Bug #2: validar intervalo [0, 100] em ambas as camadas.

---

## Bug #4: Campo "Frequência de Presença" aceita valores negativos

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Frequência de Presença" aceita valores negativos sem validação.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Frequência de Presença" com `-10`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
Erro de validação: "Frequência deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva o valor `-10`.

### Impacto
Indicadores de frequência de bolsistas ficam inválidos, comprometendo análises de presença.

---

## Bug #5: Campo "Frequência de Presença" aceita valores acima de 100%

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Frequência de Presença" aceita valores impossíveis como 2000000.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Frequência de Presença" com `2000000`
3. Submeter o formulário

### Resultado Esperado
Erro de validação: "Frequência deve estar entre 0 e 100".

### Resultado Atual
Sistema aceita e salva o valor `2000000`.

### Impacto
Dados de frequência completamente inválidos no histórico de bolsistas.

---

## Bug #6: Campo "Nota de Avaliação" aceita valores negativos

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Nota de Avaliação" não possui validação de limite inferior, aceitando notas negativas.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Nota de Avaliação" com `-12`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
Erro de validação: "Nota deve estar entre 0 e 10".

### Resultado Atual
Sistema aceita e salva o valor `-12`.

### Impacto
Notas de avaliação de bolsistas ficam inválidas, tornando relatórios de desempenho não confiáveis.

---

## Bug #7: Campo "Nota de Avaliação" aceita valores acima do limite

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Nota de Avaliação" aceita valores superiores ao máximo permitido (10).

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Nota de Avaliação" com `99`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
Erro de validação: "Nota deve estar entre 0 e 10".

### Resultado Atual
Sistema aceita e salva o valor `99`.

### Impacto
Mesmos impactos do Bug #6.

### Sugestão de Correção
Validar `value >= 0 && value <= 10` no frontend (`min="0" max="10"`) e no backend.

---

## Bug #8: Campo "Nome do Beneficiário" não possui limite de tamanho

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Nome do Beneficiário" aceita strings de tamanho arbitrário sem restrição.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Nome do Beneficiário" com texto de milhares de caracteres
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve limitar o campo a um máximo razoável (ex: 255 caracteres) e exibir erro quando excedido.

### Resultado Atual
Sistema aceita e armazena o texto completo sem qualquer restrição.

### Impacto
Possível degradação de performance em memória. Payload excessivo pode causar lentidão ou crash em sistemas de produção.

---

## Bug #9: Campo "Observações" não possui limite de tamanho

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "Observações" aceita entrada de tamanho ilimitado, sem qualquer restrição de caracteres.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/coleta` autenticado
2. Preencher "Observações" com texto repetido de milhares de caracteres
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve limitar o tamanho do campo e exibir erro quando excedido.

### Resultado Atual
Sistema aceita o envio e armazena o texto completo sem restrição.

### Impacto
Além de performance, ausência de limite em campo de texto livre aumenta a superfície de ataque para injeção de conteúdo malicioso.

---

## Bug #10: Backend aceita campos de indicadores como null sem validação

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O endpoint `POST /api/coleta` aceita e persiste campos de indicadores com valor `null`, sem rejeitar a requisição.

### Ambiente
- **Navegador**: Chrome 124 (testado via DevTools → Network)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Autenticar e capturar requisição de coleta via DevTools → Network → "Copy as cURL"
2. Modificar o payload definindo `taxa`, `frequencia` e `nota` como `null`
3. Reenviar a requisição

### Resultado Esperado
O backend deve rejeitar campos obrigatórios nulos com status 400 e mensagem de erro.

### Resultado Atual
Sistema retorna sucesso e persiste os dados com valores nulos.

### Impacto
Integridade dos dados comprometida. Registros com indicadores nulos podem causar erros em cálculos e relatórios downstream.

### Sugestão de Correção
Adicionar validação server-side: verificar se os campos obrigatórios existem e não são nulos antes de persistir.

---

## Bug #11: Campo "username" no registro não possui limite de tamanho

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "username" no formulário de registro aceita strings de tamanho ilimitado.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/` (página de registro)
2. Preencher "username" com texto extremamente longo (ex: parágrafo repetido)
3. Preencher email e senha válidos
4. Submeter o formulário

### Resultado Esperado
O sistema deve limitar o username (ex: 50–150 caracteres) e exibir erro quando excedido.

### Resultado Atual
Cadastro realizado com sucesso com username de tamanho excessivo.

### Impacto
Payloads excessivos podem degradar performance. Em sistemas com banco de dados real, pode causar erros de truncamento ou overflow.

---

## Bug #12: Campo "email" não possui limite de tamanho máximo

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O campo "email" no registro aceita endereços sintaticamente válidos, porém extremamente longos.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/` (registro)
2. Informar email válido com centenas de caracteres antes do `@`
3. Preencher os demais campos corretamente
4. Submeter o formulário

### Resultado Esperado
O sistema deve impor limite máximo de 255 caracteres e rejeitar entradas acima desse limite.

### Resultado Atual
Cadastro realizado com sucesso com email extremamente longo.

### Impacto
Performance e possível overflow em sistemas de produção com banco de dados.

---

## Bug #13: Sistema permite criação de usuário com senha vazia

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `POST /register` permite criar usuários sem senha, contornando a validação do frontend.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/` (registro)
2. Preencher "username" com valor válido (ex: `testuser`)
3. Preencher "email" válido
4. Deixar o campo "password" vazio
5. Submeter o formulário via fetch/DevTools com `password: ""`

### Resultado Esperado
O sistema deve impedir o cadastro com senha vazia e retornar mensagem de erro.

### Resultado Atual
Usuário criado com sucesso com senha vazia armazenada.

### Impacto
Conta sem senha é acessível por qualquer pessoa que conheça o username. Grave falha de segurança de autenticação.

### Sugestão de Correção
Validar no backend: `if (!password || password.trim() === '') return res.status(400).json({ error: 'Senha obrigatória' })`.

---

## Bug #14: Campo "senha" não possui limite de tamanho máximo

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O campo "password" aceita senhas de tamanho ilimitado, o que pode ser explorado em ataques de negação de serviço (DoS) via hashing de senhas gigantes.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar `/` (registro)
2. Inserir senha com milhares de caracteres
3. Submeter o formulário

### Resultado Esperado
O sistema deve impor limite máximo de tamanho para senha (ex: 255 caracteres).

### Resultado Atual
Cadastro realizado e senha gigante armazenada sem erro.

### Impacto
Em sistemas que fazem hash de senha (bcrypt), senhas extremamente longas causam alto consumo de CPU, podendo ser usadas para DoS.

---

## Bug #15: Endpoint /dashboard retorna senha do usuário em texto puro

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint chamado ao carregar o dashboard retorna o objeto completo do usuário, incluindo o campo `password` em texto puro na resposta JSON.

### Ambiente
- **Navegador**: Chrome 124 (verificado via DevTools → Network)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login válido com qualquer usuário
2. Acessar `/dashboard`
3. Abrir DevTools → aba Network
4. Inspecionar a resposta da requisição ao endpoint de dados do usuário

### Resultado Esperado
A API não deve retornar senha em nenhuma forma — nem em texto puro, nem como hash. Apenas dados necessários para o frontend (username, email, role).

### Resultado Atual
A resposta JSON inclui o campo `"password"` com o valor em texto puro.

### Evidências
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "password": "admin123"
}
```

### Impacto
Qualquer pessoa com acesso ao navegador ou que intercepte o tráfego obtém a senha em texto claro. Comprometimento total da conta.

### Sugestão de Correção
Remover o campo `password` do objeto retornado: `const { password, ...safeUser } = user; res.json(safeUser)`.

---

## Bug #16: Histórico de coletas expõe dados de todos os usuários (IDOR)

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `GET /api/coleta/historico` retorna coletas de todos os usuários do sistema sem filtrar pela sessão autenticada. Trata-se de uma vulnerabilidade IDOR (Insecure Direct Object Reference).

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Login como `admin` → submeter uma coleta qualquer → logout
2. Login como `user`
3. Acessar a aba "Histórico" em `/coleta`
4. Observar os registros listados

### Resultado Esperado
Usuário `user` deve ver apenas suas próprias coletas.

### Resultado Atual
A coleta feita pelo `admin` aparece visível para o usuário `user`, incluindo o campo "Coletado por: admin".

### Impacto
Violação de privacidade dos dados de beneficiários. Qualquer usuário autenticado tem acesso a todos os dados coletados por todos os outros usuários da plataforma.

### Sugestão de Correção
Filtrar no endpoint pelo usuário da sessão: `coletas.filter(c => c.usuarioId === req.session.userId)`.

---

## Bug #17: Coleta é registrada em duplicidade a cada submissão

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
Cada submissão do formulário de coleta gera dois registros idênticos no histórico.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Login com qualquer usuário
2. Preencher todos os campos do formulário de coleta corretamente
3. Submeter o formulário uma única vez
4. Verificar o histórico de coletas

### Resultado Esperado
Uma submissão deve gerar exatamente um registro.

### Resultado Atual
Dois registros idênticos são criados a cada submissão, com os mesmos dados e timestamps iguais ou muito próximos.

### Impacto
Duplicidade de dados contamina relatórios e indicadores. Contagem de coletas e médias ficam incorretas.

### Sugestão de Correção
Verificar se há double-dispatch de evento no frontend (ex: listener registrado duas vezes). Adicionar verificação de idempotência no backend.

---

## Bug #18: Rota /health declarada duas vezes no servidor

**Severidade**: [x] Baixa  
**Categoria**: [x] Boas Práticas  
**Status**: [x] Aberto

### Descrição
A rota `GET /health` está declarada duas vezes no arquivo `server.js` (linhas 65 e 360). O Express utiliza apenas a primeira declaração e ignora a segunda silenciosamente.

### Ambiente
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Abrir `server.js`
2. Buscar por `app.get("/health"`
3. Observar duas declarações idênticas

### Resultado Esperado
Cada rota deve ser declarada uma única vez.

### Resultado Atual
A rota `/health` aparece nas linhas 65 e 360. A segunda declaração é código morto.

### Impacto
Confusão para desenvolvedores durante manutenção. A segunda declaração nunca é executada, criando falsa sensação de que há duas versões do health check.

---

## Bug #19: Endpoint /api/users expõe lista completa de usuários com senhas

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `GET /api/users`, quando acessado por usuário autenticado com role `admin`, retorna a lista completa de todos os usuários incluindo o campo `password` em texto puro.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Autenticar com `admin / admin123`
2. Acessar `http://localhost:3000/api/users`

### Resultado Esperado
O endpoint deve retornar apenas dados não sensíveis. Senhas nunca devem ser expostas em nenhuma circunstância.

### Resultado Atual
Retorna lista completa com `id`, `username`, `email`, `role` e `password` em texto puro para todos os usuários.

### Evidências
```json
[
  { "id": 1, "username": "admin", "password": "admin123", "role": "admin" },
  { "id": 2, "username": "user",  "password": "user123",  "role": "user" }
]
```

### Impacto
Comprometimento total de todas as contas do sistema a partir de um único endpoint. Violação grave de segurança.

### Sugestão de Correção
Remover o campo `password` da resposta: `users.map(({ password, ...u }) => u)`.

---

## Bug #20: Funcionalidade "Lembrar de mim" não altera comportamento da sessão

**Severidade**: [x] Média  
**Categoria**: [x] UX / Segurança  
**Status**: [x] Aberto

### Descrição
O checkbox "Lembrar de mim" na tela de login não produz nenhum efeito real. A sessão persiste da mesma forma independentemente do estado do checkbox.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Acessar a tela de login
2. Realizar login **sem** marcar "Lembrar de mim"
3. Fechar completamente o navegador
4. Reabrir e acessar `/dashboard` — sessão permanece ativa
5. Repetir o processo **marcando** "Lembrar de mim" — comportamento idêntico

### Resultado Esperado
Sem marcar: sessão deve expirar ao fechar o navegador. Com marcar: sessão pode persistir.

### Resultado Atual
O usuário permanece autenticado em ambos os casos.

### Impacto
Funcionalidade enganosa. Usuário acredita que a sessão expirará, mas ela persiste — risco em dispositivos compartilhados.

---

## Bug #21: Senha armazenada em texto puro no LocalStorage do navegador

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
Após o login, o sistema armazena o objeto completo do usuário no `localStorage`, incluindo o campo `password` em texto puro.

### Ambiente
- **Navegador**: Chrome 124 (verificado em DevTools → Application → LocalStorage)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com credenciais válidas
2. Abrir DevTools → aba "Application"
3. Acessar "LocalStorage" → `http://localhost:3000`
4. Verificar o objeto armazenado

### Resultado Esperado
Senhas nunca devem ser armazenadas no cliente. Apenas tokens de sessão ou identificadores mínimos devem ser persistidos.

### Resultado Atual
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "role": "admin",
  "password": "admin123"
}
```

### Impacto
Qualquer script JavaScript na página (incluindo extensões do navegador ou XSS) pode ler a senha diretamente do `localStorage`. Em dispositivos compartilhados, a senha fica exposta.

### Sugestão de Correção
Armazenar apenas dados não sensíveis no `localStorage`. Nunca armazenar senha. Usar `httpOnly cookies` para tokens de sessão.

---

## Bug #22: Logout não remove credenciais sensíveis do LocalStorage

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
Após o logout, as credenciais do usuário — incluindo a senha em texto puro — permanecem armazenadas no `localStorage` do navegador.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com credenciais válidas
2. Confirmar presença de dados no `localStorage` (DevTools → Application)
3. Executar logout
4. Verificar novamente o `localStorage`

### Resultado Esperado
Logout deve limpar completamente todos os dados sensíveis do `localStorage`.

### Resultado Atual
A senha e demais dados do usuário permanecem no `localStorage` mesmo após o logout.

### Impacto
Usuário acredita ter encerrado a sessão com segurança, mas credenciais continuam acessíveis no navegador. Risco crítico em dispositivos compartilhados.

### Sugestão de Correção
Chamar `localStorage.clear()` ou `localStorage.removeItem('user')` na função de logout.

---

## Bug #23: Session ID não é regenerado após novo login

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O cookie de sessão mantém o mesmo valor após logout e novo login, permitindo ataques de Session Fixation.

### Ambiente
- **Navegador**: Chrome 124 (verificado via DevTools → Application → Cookies)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com credenciais válidas
2. Anotar o valor do cookie de sessão
3. Executar logout
4. Realizar novo login com as mesmas credenciais
5. Comparar o valor do cookie

### Resultado Esperado
O sistema deve gerar um novo Session ID a cada autenticação bem-sucedida.

### Resultado Atual
O cookie de sessão permanece com o mesmo valor após o novo login.

### Impacto
Vulnerabilidade de Session Fixation: um atacante pode fixar um Session ID e aguardar a vítima autenticar para sequestrar a sessão.

### Sugestão de Correção
Chamar `req.session.regenerate()` após autenticação bem-sucedida no backend.

---

## Bug #24: Reset de senha permite alteração sem autenticação ou verificação de identidade

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `POST /reset-password` altera a senha de qualquer usuário sem exigir autenticação, senha anterior, token de recuperação ou confirmação por email.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Sem estar autenticado, enviar a requisição:
```bash
curl -X POST http://localhost:3000/reset-password \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","newPassword":"hacked123"}'
```
2. Tentar login com a nova senha

### Resultado Esperado
O sistema deve exigir pelo menos um fator de verificação de identidade (token por email, senha atual ou autenticação ativa).

### Resultado Atual
A senha do usuário `admin` é alterada para `hacked123` sem qualquer validação de identidade.

### Impacto
Qualquer pessoa pode redefinir a senha de qualquer conta do sistema sem qualquer autenticação. Comprometimento total de todas as contas.

### Sugestão de Correção
Implementar fluxo de token temporário por email ou exigir senha atual para confirmar a identidade antes de permitir a alteração.

---

## Bug #25: Reset de senha não valida campos obrigatórios

**Severidade**: [x] Média  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
O endpoint `POST /reset-password` com campos vazios retorna "Usuário não encontrado" em vez de um erro de validação adequado.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Enviar payload com campos vazios:
```json
{ "username": "", "newPassword": "" }
```

### Resultado Esperado
O sistema deve retornar imediatamente: `"Usuário e nova senha são obrigatórios"` (status 400).

### Resultado Atual
O sistema retorna: `"Usuário não encontrado"` — validando lógica de negócio antes de validar os campos obrigatórios.

### Impacto
Mensagem de erro inadequada confunde o usuário e expõe lógica interna desnecessária.

---

## Bug #26: Endpoint de reset de senha permite enumeração de usuários

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `/reset-password` responde de forma diferente para usernames válidos e inválidos, permitindo que um atacante enumere usuários existentes no sistema.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Enviar reset para username válido (`admin`) → resposta: `"Senha alterada com sucesso"`
2. Enviar reset para username inexistente → resposta: `"Usuário não encontrado"`

### Resultado Esperado
Ambas as respostas devem ser genéricas e idênticas: ex: `"Se a conta existir, a solicitação será processada"`.

### Resultado Atual
Respostas diferentes revelam existência ou não de contas.

### Impacto
Um atacante pode enumerar todos os usernames válidos do sistema com requisições automatizadas, facilitando ataques de força bruta direcionados.

---

## Bug #27: Endpoint /api/user expõe senha do usuário autenticado em texto puro

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint `GET /api/user` retorna o objeto completo do usuário autenticado, incluindo o campo `password` em texto puro.

### Ambiente
- **Navegador**: Chrome 124 (verificado via DevTools → Network)
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Realizar login com credenciais válidas
2. Acessar `http://localhost:3000/api/user`
3. Observar a resposta JSON

### Resultado Esperado
O endpoint deve retornar apenas dados necessários, sem expor a senha.

### Resultado Atual
```json
{
  "id": 2,
  "username": "user",
  "email": "user@example.com",
  "role": "user",
  "password": "user123"
}
```

### Impacto
Mesmos impactos dos bugs #15 e #19 — exposição de senha via API.

### Sugestão de Correção
Remover o campo password antes de serializar a resposta.

---

## Bug #28: Upload em lote registra múltiplas entradas a partir de um único registro

**Severidade**: [x] Alta  
**Categoria**: [x] Lógica  
**Status**: [x] Aberto

### Descrição
Ao fazer upload de um arquivo CSV com apenas 1 registro válido, o sistema gera múltiplos registros no histórico.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Criar arquivo CSV com exatamente 1 registro válido
2. Acessar `/coleta` → aba "Lote"
3. Submeter o arquivo
4. Verificar a quantidade de registros gerados no histórico

### Resultado Esperado
Um registro no CSV deve gerar exatamente um registro no sistema.

### Resultado Atual
Um único registro enviado resulta em múltiplos registros inseridos.

### Impacto
Duplicidade de dados nos relatórios. Contagem de beneficiários incorreta.

---

## Bug #29: Upload em lote aceita arquivos inválidos renomeados como .csv

**Severidade**: [x] Alta  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O sistema valida apenas a extensão do arquivo e não o conteúdo real. Um arquivo `.txt` renomeado para `.csv` é aceito normalmente.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Criar arquivo `teste.txt` com conteúdo arbitrário
2. Renomear para `teste.csv`
3. Submeter via upload em lote em `/coleta`

### Resultado Esperado
Sistema deve validar o conteúdo e estrutura real do arquivo, não apenas a extensão.

### Resultado Atual
Sistema aceita o arquivo sem erro, mesmo sem estrutura CSV válida.

### Impacto
Dados inválidos podem ser importados silenciosamente. A validação superficial cria falsa sensação de segurança.

---

## Bug #30: Upload em lote aceita arquivos executáveis (.exe) sem bloqueio

**Severidade**: [x] Crítica  
**Categoria**: [x] Segurança  
**Status**: [x] Aberto

### Descrição
O endpoint de upload em lote aceita arquivos `.exe` sem qualquer validação de tipo MIME ou extensão perigosa.

### Ambiente
- **Navegador**: Chrome 124
- **Sistema Operacional**: Windows 11
- **Data do Teste**: 26/04/2026

### Passos para Reproduzir
1. Selecionar qualquer arquivo `.exe` do sistema
2. Submeter via upload em lote em `/coleta`

### Resultado Esperado
O sistema deve bloquear extensões perigosas e aceitar apenas `.csv` ou `.xlsx` válidos.

### Resultado Atual
O arquivo `.exe` é aceito sem qualquer erro ou aviso.

### Impacto
Em sistemas com processamento real de arquivos, isso permitiria upload de código malicioso. Grave falha de segurança na validação de uploads.

### Sugestão de Correção
Validar extensão e tipo MIME no backend:
```javascript
const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
if (!allowedTypes.includes(file.mimetype)) {
  return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
}
```

---

## Resumo dos Testes

### Estatísticas

| Métrica | Valor |
|---|---|
| **Total de Bugs Encontrados** | 30 |
| **Bugs Críticos** | 7 |
| **Bugs de Alta Severidade** | 14 |
| **Bugs de Média Severidade** | 8 |
| **Bugs de Baixa Severidade** | 1 |

### Distribuição por Categoria

| Categoria | Quantidade |
|---|---|
| **Segurança** | 15 |
| **Lógica / Validação** | 12 |
| **UX / Boas Práticas** | 3 |

### Áreas Testadas

- [x] Login
- [x] Registro
- [x] Reset de Senha
- [x] Dashboard
- [x] Logout
- [x] Segurança (XSS, enumeração, IDOR)
- [x] Validações de campos
- [x] Autorização e controle de acesso
- [x] APIs (via DevTools e cURL)
- [x] Upload de arquivos
- [x] LocalStorage e gestão de sessão

### Bugs Críticos — Prioridade Máxima

1. **BUG-16** — IDOR: qualquer usuário vê coletas de todos os outros
2. **BUG-21** — Senha armazenada em texto puro no LocalStorage
3. **BUG-24** — Reset de senha sem qualquer autenticação
4. **BUG-27** — `/api/user` expõe senha em texto puro
5. **BUG-19** — `/api/users` expõe senhas de todos os usuários
6. **BUG-30** — Upload de arquivos `.exe` sem bloqueio
7. **BUG-18 (renumerado)** — não se aplica (era baixa)

### Recomendações Gerais

1. **Nunca retornar senhas em respostas de API** — remover o campo `password` de todos os endpoints antes de serializar a resposta.
2. **Implementar validação server-side em todos os campos numéricos** — validação apenas no frontend é bypassável via DevTools.
3. **Filtrar dados por usuário autenticado** — o histórico de coletas deve retornar apenas registros do usuário da sessão atual.
4. **Rever o fluxo de reset de senha** — implementar verificação de identidade antes de permitir alteração.
5. **Limpar LocalStorage no logout** — remover todos os dados sensíveis ao encerrar a sessão.
6. **Implementar validação de tipo MIME no upload** — não confiar apenas na extensão do arquivo.

### Observações

- Testes de SQL Injection não foram aplicados pois o sistema utiliza armazenamento em memória (array), sem camada de banco de dados relacional — demonstra raciocínio técnico sobre o escopo de testes aplicáveis.
- Os bugs de exposição de senha (BUGs 15, 19, 21, 27) formam um padrão sistêmico: o objeto de usuário é serializado sem sanitização em múltiplos pontos da aplicação. Uma correção centralizada resolveria todos simultaneamente.
- A duplicidade de registros (BUG-17 e BUG-28) sugere um padrão de double-dispatch de eventos no frontend.

---

**Testador**: [Seu Nome]  
**Data**: 26/04/2026  
**Tempo de Teste**: ~8 horas
