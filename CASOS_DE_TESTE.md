# Casos de Teste — Desafio QA VLAB

**Autor**: Wallace Leão  
**Data**: 27/04/2026  
**Ambiente**: Chrome · Windows 11 · Node.js 18 · localhost:3000  
**Referência**: Desafio QA VLAB — Módulos de Login e Coleta

---

## Módulo de Login

---

### CT-L01 — Login com credenciais válidas de administrador

| Campo | Detalhe |
|---|---|
| **ID** | CT-L01 |
| **Módulo** | Login |
| **Tipo** | Positivo |
| **Prioridade** | Alta |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`  
- Usuário `admin` cadastrado com senha `admin123`  
- Nenhuma sessão ativa no navegador

**Passos**  
1. Acessar `http://localhost:3000`  
2. Preencher o campo "Usuário" com `admin`  
3. Preencher o campo "Senha" com `admin123`  
4. Clicar no botão "Entrar"

**Resultado Esperado**  
- Redirecionamento para `/dashboard`  
- Mensagem de boas-vindas exibida com o nome do usuário  
- Cookie de sessão criado com flags `httpOnly: true` e `secure: true`  
- Campo `password` ausente no response da API de login

**Resultado Atual**  
Funciona conforme esperado, exceto: response da API retorna o campo `password` em texto puro (BUG #15).

**Automação**: `CT01` em `login.cy.js`

---

### CT-L02 — Login com senha incorreta exibe mensagem de erro

| Campo | Detalhe |
|---|---|
| **ID** | CT-L02 |
| **Módulo** | Login |
| **Tipo** | Negativo |
| **Prioridade** | Alta |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`  
- Usuário `admin` cadastrado com senha `admin123`

**Passos**  
1. Acessar `http://localhost:3000`  
2. Preencher o campo "Usuário" com `admin`  
3. Preencher o campo "Senha" com `senhaerrada`  
4. Clicar no botão "Entrar"

**Resultado Esperado**  
- Permanência na página de login  
- Mensagem de erro genérica exibida: *"Usuário ou senha incorretos"*  
- Nenhum redirecionamento para o dashboard  
- Tentativa registrada para controle de rate limiting

**Resultado Atual**  
Sistema exibe mensagens diferentes para usuário válido (`Senha incorreta`) e usuário inválido (`Usuário X não encontrado`), permitindo enumeração de usuários (BUG #44). Além disso, há 10% de chance do login ser aceito mesmo com senha errada (BUG #37).

**Automação**: `CT03` em `login.cy.js`

---

### CT-L03 — Login com campos vazios exibe validação

| Campo | Detalhe |
|---|---|
| **ID** | CT-L03 |
| **Módulo** | Login |
| **Tipo** | Negativo |
| **Prioridade** | Média |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`

**Passos**  
1. Acessar `http://localhost:3000`  
2. Deixar campo "Usuário" em branco  
3. Deixar campo "Senha" em branco  
4. Clicar no botão "Entrar"

**Resultado Esperado**  
- Formulário não é submetido ao servidor  
- Mensagem de validação exibida: *"Usuário e senha são obrigatórios"*  
- Campos com foco visual para indicar o erro  
- Nenhuma requisição de rede disparada

**Resultado Atual**  
Sistema valida os campos, mas aceita strings compostas apenas de espaços (`"   "`) como valor válido pois não aplica `.trim()` na verificação (BUG #50).

**Automação**: `CT05` em `login.cy.js`

---

### CT-L04 — Acesso direto ao dashboard sem autenticação deve ser bloqueado

| Campo | Detalhe |
|---|---|
| **ID** | CT-L04 |
| **Módulo** | Login / Segurança |
| **Tipo** | Negativo — Bypass |
| **Prioridade** | Alta |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`  
- Nenhuma sessão ativa no navegador

**Passos**  
1. Abrir o navegador sem realizar login  
2. Acessar diretamente `http://localhost:3000/dashboard`

**Resultado Esperado**  
- Redirecionamento imediato para `http://localhost:3000/`  
- Conteúdo do dashboard não é exibido  
- Nenhuma informação sensível carregada na página

**Resultado Atual**  
Ao acessar `/dashboard?admin=true`, o sistema exibe o dashboard completo sem exigir autenticação (BUG #42 — backdoor).

**Automação**: `SEC01` em `login.cy.js`, `BUG #32` em `security.cy.js`

---

### CT-L05 — Bypass de autenticação via Math.random deve ser inexistente

| Campo | Detalhe |
|---|---|
| **ID** | CT-L05 |
| **Módulo** | Login / Segurança |
| **Tipo** | Negativo — Segurança Crítica |
| **Prioridade** | Crítica |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`  
- Usuário `admin` cadastrado com senha `admin123`

**Passos**  
1. Acessar `http://localhost:3000`  
2. Preencher "Usuário" com `admin`  
3. Preencher "Senha" com qualquer valor incorreto (ex: `senhaerrada_1`)  
4. Clicar em "Entrar"  
5. Repetir os passos 2–4 por 20 tentativas seguidas com senhas diferentes

**Resultado Esperado**  
- Todas as 20 tentativas são recusadas com erro 401  
- Nenhuma tentativa resulta em redirecionamento para o dashboard  
- Sistema bloqueia o usuário após 3–5 tentativas falhas (rate limiting)

**Resultado Atual**  
Em aproximadamente 10% das tentativas o login é aceito mesmo com senha errada, devido ao uso de `Math.random()` na lógica de validação (BUG #37 — crítico). Rate limiting ativo apenas após 1.000 tentativas (BUG #41), tornando o ataque trivial.

**Automação**: `BUG #31` em `login.cy.js`

---

## Módulo de Coleta

---

### CT-C01 — Submissão de coleta com todos os dados válidos

| Campo | Detalhe |
|---|---|
| **ID** | CT-C01 |
| **Módulo** | Coleta |
| **Tipo** | Positivo |
| **Prioridade** | Alta |

**Pré-condição**  
- Sistema iniciado e acessível em `http://localhost:3000`  
- Usuário `admin` autenticado com sessão ativa  
- Página de coleta `/coleta` carregada

**Passos**  
1. Preencher "ID do Beneficiário" com `1001`  
2. Preencher "Nome" com `João Silva`  
3. Preencher "Taxa de Conclusão" com `85`  
4. Preencher "Frequência" com `90`  
5. Preencher "Nota" com `8`  
6. Selecionar status `Completo`  
7. Clicar em "Salvar Coleta"

**Resultado Esperado**  
- Mensagem de sucesso exibida na tela  
- Formulário limpo automaticamente após salvar  
- Registro aparece no histórico com os dados corretos  
- Apenas um registro criado por submissão (sem duplicatas)

**Resultado Atual**  
Coleta é registrada em duplicidade a cada submissão (BUG #17 — double-dispatch de evento).

**Automação**: `CT-COL01` em `coleta.cy.js`

---

### CT-C02 — Campo "Taxa de Conclusão" rejeita valores fora do intervalo [0–100]

| Campo | Detalhe |
|---|---|
| **ID** | CT-C02 |
| **Módulo** | Coleta — Validação |
| **Tipo** | Negativo |
| **Prioridade** | Alta |

**Pré-condição**  
- Usuário `admin` autenticado  
- Demais campos do formulário preenchidos com valores válidos

**Passos — Cenário A (valor negativo)**  
1. Preencher "Taxa de Conclusão" com `-1`  
2. Clicar em "Salvar Coleta"

**Passos — Cenário B (valor acima de 100)**  
1. Preencher "Taxa de Conclusão" com `2000`  
2. Clicar em "Salvar Coleta"

**Resultado Esperado**  
- Ambos os cenários exibem mensagem de erro: *"Taxa deve estar entre 0 e 100"*  
- Registro não é salvo  
- Validação ocorre tanto no frontend quanto no backend (verificar via cURL direto)

**Resultado Atual**  
Sistema aceita e persiste valores negativos e acima de 100 sem erro. A validação existe apenas no frontend e é bypassável via DevTools (BUGs #2, #3, #4, #5).

**Automação**: `BUG-COL05`, `BUG-COL06` em `coleta.cy.js` / `BUG #2` em `api.cy.js`

---

### CT-C03 — Acesso ao módulo de coleta sem autenticação deve ser bloqueado

| Campo | Detalhe |
|---|---|
| **ID** | CT-C03 |
| **Módulo** | Coleta / Segurança |
| **Tipo** | Negativo — Controle de acesso |
| **Prioridade** | Alta |

**Pré-condição**  
- Sistema iniciado em `http://localhost:3000`  
- Nenhuma sessão ativa no navegador

**Passos**  
1. Sem realizar login, acessar diretamente `http://localhost:3000/coleta`

**Resultado Esperado**  
- Redirecionamento para `http://localhost:3000/`  
- Conteúdo da coleta não carregado  
- Requisição à API `/api/coleta` retorna 401

**Resultado Atual**  
Funciona conforme esperado no frontend. Porém, a API `/api/coleta` pode ser acessada diretamente via cURL sem autenticação válida, dependendo da rota.

**Automação**: `CT-C03` em `security.cy.js`

---

### CT-C04 — Histórico de coletas exibe apenas os registros do usuário logado

| Campo | Detalhe |
|---|---|
| **ID** | CT-C04 |
| **Módulo** | Coleta — Histórico |
| **Tipo** | Negativo — IDOR |
| **Prioridade** | Crítica |

**Pré-condição**  
- Usuário `admin` autenticado; realizar uma coleta qualquer  
- Fazer logout  
- Autenticar como `user`

**Passos**  
1. Autenticado como `user`, acessar `/coleta`  
2. Clicar na aba "Histórico"  
3. Clicar em "Carregar Histórico"  
4. Inspecionar os registros exibidos

**Resultado Esperado**  
- Apenas as coletas realizadas pelo usuário `user` são exibidas  
- Registros do `admin` não aparecem na listagem  
- Response da API filtra por `req.session.userId`

**Resultado Atual**  
Todos os registros de todos os usuários são exibidos (BUG #16 — IDOR crítico). Campo `usuarioColeta` expõe qual conta realizou cada coleta (BUG #65).

**Automação**: `BUG-HIS02` em `coleta.cy.js` / `BUG #16` em `api.cy.js`

---

### CT-C05 — Upload de arquivo executável deve ser bloqueado

| Campo | Detalhe |
|---|---|
| **ID** | CT-C05 |
| **Módulo** | Coleta — Upload em lote |
| **Tipo** | Negativo — Segurança |
| **Prioridade** | Crítica |

**Pré-condição**  
- Usuário `admin` autenticado  
- Página de coleta `/coleta` na aba "Lote"

**Passos**  
1. Clicar na aba "Lote"  
2. Selecionar um arquivo com extensão `.exe` para upload  
3. Clicar em "Enviar Lote"

**Resultado Esperado**  
- Sistema rejeita o arquivo imediatamente  
- Mensagem de erro: *"Formato de arquivo não permitido"*  
- Nenhum processamento é iniciado  
- Validação ocorre no backend pelo tipo MIME real, não apenas pela extensão

**Resultado Atual**  
Sistema aceita arquivos `.exe` sem bloqueio (BUG #30 — crítico). Validação de tipo MIME ausente no backend.

**Automação**: teste manual — seletor de arquivo com `.exe` real

### CT-CPF01 — Validação de máscara de CPF no campo ID

| Campo | Detalhe |
|---|---|
| **ID** | CT-CPF01 |
| **Módulo** | Coleta — Campo ID do Beneficiário |
| **Tipo** | Negativo |
| **Prioridade** | Alta |

**Pré-condição**
- Sistema iniciado, usuário autenticado
- Campo "ID do Beneficiário" deve exibir máscara de CPF (requisito não implementado)

**Passos**
1. Acessar `/coleta`
2. Clicar no campo "ID do Beneficiário"
3. Digitar `12345678901`

**Resultado Esperado**
- Campo exibe `123.456.789-01` com formatação automática
- Algoritmo de validação dos dígitos verificadores executado no blur

**Resultado Atual**
- Campo aceita qualquer texto sem formatação (BUG #56 — ausência de máscara CPF)

**Automação**: `CT-CPF01` em `cypress/e2e/cpf.cy.js`

---

### CT-ANO01 — Detecção de anomalia: taxa de conclusão cai > 25%

| Campo | Detalhe |
|---|---|
| **ID** | CT-ANO01 |
| **Módulo** | Coleta — Regra de anomalia |
| **Tipo** | Negativo / Regra de negócio |
| **Prioridade** | Alta |

**Pré-condição**
- Beneficiário com histórico de coletas (média taxaConclusao ≥ 80%)
- Sistema autenticado como admin

**Passos**
1. Registrar 3 coletas para "BEN001" com taxaConclusao = 80
2. Registrar nova coleta com taxaConclusao = 40
3. Verificar response da API e estado visual

**Resultado Esperado**
- Response contém `{ anomalia: true, indicadores: ['taxaConclusao'] }`
- Interface exibe alerta visual na coleta registrada
- Status automaticamente definido como `pendente_revisao`

**Resultado Atual**
- Sistema aceita e registra sem qualquer sinalização (BUG #57 — regra dos 25% não implementada)

**Automação**: `CT-ANO01` em `cypress/e2e/anomalia.cy.js`

---

## Resumo dos casos de teste

| ID | Módulo | Tipo | Prioridade | BUGs Relacionados |
|---|---|---|---|---|
| CT-L01 | Login | Positivo | Alta | BUG #15 |
| CT-L02 | Login | Negativo | Alta | BUG #37, #44 |
| CT-L03 | Login | Negativo | Média | BUG #50 |
| CT-L04 | Segurança | Negativo — Bypass | Alta | BUG #42 |
| CT-L05 | Segurança | Negativo — Crítico | Crítica | BUG #31, #37, #41 |
| CT-C01 | Coleta | Positivo | Alta | BUG #17 |
| CT-C02 | Coleta — Validação | Negativo | Alta | BUG #2, #3, #4, #5 |
| CT-C03 | Coleta — Acesso | Negativo | Alta | — |
| CT-C04 | Coleta — IDOR | Negativo — Crítico | Crítica | BUG #16 |
| CT-C05 | Coleta — Upload | Negativo — Crítico | Crítica | BUG #30 |
| CT-CPF01 | Coleta — Campo ID | Negativo | Alta | BUG #56 |
| CT-ANO01 | Coleta — Regra de negócio | Negativo | Alta | BUG #57 |

---

*Casos de teste gerados com base na análise dos módulos de Login e Coleta — Desafio QA VLAB 2026*
