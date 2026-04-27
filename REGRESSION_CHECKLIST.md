# Checklist de Regressão — Desafio QA VLAB

Este checklist deve ser executado antes de cada release ou merge em produção.  
Itens marcados com 🔴 são bloqueantes — o release não deve ocorrer se falharem.

**Versão**: 1.0  
**Última atualização**: 27/04/2026  
**Responsável**: [Seu Nome]

---

## 1. Autenticação (Login)

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 1.1 | Login com credenciais válidas redireciona para dashboard | 🔴 Crítico | Automatizado `login.cy.js` |
| 1.2 | Login com senha incorreta retorna erro 401 **de forma consistente** | 🔴 Crítico | Automatizado — testar 15x seguidas |
| 1.3 | Login com campos vazios exibe mensagem de erro | 🟡 Alto | Automatizado `login.cy.js` |
| 1.4 | Mensagem de erro não revela se username existe ou não | 🔴 Crítico | Manual — comparar respostas para user válido vs inválido |
| 1.5 | Máximo de 5 tentativas falhas antes de bloqueio temporário | 🔴 Crítico | Manual — força bruta controlada |
| 1.6 | Response do login não contém campo `password` | 🔴 Crítico | Automatizado `api.cy.js` |
| 1.7 | Cookie de sessão tem flag `httpOnly: true` | 🔴 Crítico | DevTools → Application → Cookies |
| 1.8 | Cookie de sessão tem flag `secure: true` (em produção) | 🔴 Crítico | DevTools → Application → Cookies |
| 1.9 | Session ID é regenerado após novo login | 🔴 Crítico | Comparar cookie antes e após login |
| 1.10 | Senha não é armazenada no `localStorage` | 🔴 Crítico | DevTools → Application → LocalStorage |

---

## 2. Registro de Usuários

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 2.1 | Registro com dados válidos cria conta e redireciona | 🟡 Alto | Automatizado `register.cy.js` |
| 2.2 | Registro com email duplicado retorna erro | 🟡 Alto | Automatizado `register.cy.js` |
| 2.3 | Registro com email inválido (`a@b`) retorna erro | 🟡 Alto | Automatizado |
| 2.4 | Registro com senha vazia é bloqueado no **backend** | 🔴 Crítico | cURL direto sem frontend |
| 2.5 | Senha exige mínimo 8 caracteres com letras e números | 🟡 Alto | Manual + API |
| 2.6 | Username composto só de espaços é rejeitado | 🟠 Médio | Manual — `"   "` no campo |
| 2.7 | Response do registro não contém campo `password` | 🔴 Crítico | DevTools → Network |
| 2.8 | Usuário duplicado não pode ser criado via API direta | 🔴 Crítico | cURL — bypass do frontend |

---

## 3. Controle de Acesso e Autorização

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 3.1 | `/dashboard` sem autenticação redireciona para login | 🔴 Crítico | Automatizado `security.cy.js` |
| 3.2 | `/coleta` sem autenticação redireciona para login | 🔴 Crítico | Automatizado `security.cy.js` |
| 3.3 | `/dashboard?admin=true` não funciona sem autenticação | 🔴 Crítico | Automatizado `security.cy.js` |
| 3.4 | `/api/user?userId=N` retorna 401 sem autenticação | 🔴 Crítico | Automatizado `security.cy.js` |
| 3.5 | `/api/coleta/historico` retorna 401 sem autenticação | 🔴 Crítico | Automatizado `api.cy.js` |
| 3.6 | Usuário `user` não acessa seção administrativa | 🔴 Crítico | Login como user → verificar dashboard |
| 3.7 | `/api/users` retorna 403 para role `user` | 🔴 Crítico | cURL autenticado como user |

---

## 4. Módulo de Coleta — Validações de Campos

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 4.1 | Campo ID aceita apenas valores numéricos | 🟡 Alto | Manual + API |
| 4.2 | Taxa de Conclusão aceita apenas valores entre 0 e 100 | 🟡 Alto | Automatizado `api.cy.js` |
| 4.3 | Frequência de Presença aceita apenas valores entre 0 e 100 | 🟡 Alto | Manual + API |
| 4.4 | Nota de Avaliação aceita apenas valores entre 0 e 10 | 🟡 Alto | Automatizado `api.cy.js` |
| 4.5 | Campos obrigatórios (ID, Nome, indicadores) são validados | 🟡 Alto | Manual |
| 4.6 | Validações existem no **backend** (não só no frontend) | 🔴 Crítico | cURL com valores inválidos direto na API |
| 4.7 | Campo Observações sanitiza input — sem execução de HTML/JS | 🔴 Crítico | Inserir `<img src=x onerror="alert(1)">` e verificar histórico |

---

## 5. Módulo de Coleta — Isolamento de Dados (IDOR)

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 5.1 | Histórico mostra apenas coletas do usuário logado | 🔴 Crítico | Automatizado `security.cy.js` |
| 5.2 | `/api/coleta/historico` filtra por sessão no backend | 🔴 Crítico | cURL autenticado como `user` — verificar se coletas do `admin` aparecem |
| 5.3 | Campo `usuarioColeta` não expõe dados de outros usuários | 🔴 Crítico | Inspecionar response JSON |

---

## 6. Upload em Lote

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 6.1 | Upload de arquivo `.exe` é bloqueado | 🔴 Crítico | Manual — tentar subir arquivo .exe |
| 6.2 | Upload de arquivo `.txt` renomeado como `.csv` é bloqueado | 🟡 Alto | Manual |
| 6.3 | Upload sem arquivo selecionado exibe erro | 🟠 Médio | Automatizado `coleta.cy.js` |
| 6.4 | Arquivo com campos CSV faltando retorna erro de validação | 🟡 Alto | CSV incompleto |
| 6.5 | Limite de tamanho de arquivo é respeitado | 🟡 Alto | Upload de arquivo >10MB |
| 6.6 | Um registro no CSV gera exatamente um registro no sistema | 🟡 Alto | Verificar duplicatas no histórico |

---

## 7. Logout e Gestão de Sessão

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 7.1 | Logout limpa completamente o `localStorage` | 🔴 Crítico | Automatizado `security.cy.js` |
| 7.2 | Após logout, acesso ao dashboard é bloqueado | 🔴 Crítico | Automatizado `security.cy.js` |
| 7.3 | Sessão expira após inatividade (máx. 2h) | 🟡 Alto | Aguardar timeout e tentar ação autenticada |
| 7.4 | Logout destrói a sessão no servidor | 🟡 Alto | Tentar reenviar cookie após logout via cURL |

---

## 8. Reset de Senha

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 8.1 | Reset exige verificação de identidade (token ou senha atual) | 🔴 Crítico | cURL direto sem autenticação |
| 8.2 | Resposta do reset é idêntica para user válido e inválido | 🔴 Crítico | Comparar respostas — prevenir enumeração |
| 8.3 | Campos obrigatórios do reset são validados com `.trim()` | 🟠 Médio | Enviar body com espaços |

---

## 9. APIs e Health Check

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 9.1 | `GET /health` retorna status 200 com campos obrigatórios | 🟢 Baixo | Automatizado `api.cy.js` |
| 9.2 | `GET /health` uptime é número positivo | 🟢 Baixo | Automatizado `api.cy.js` |
| 9.3 | Nenhum endpoint retorna campo `password` em qualquer response | 🔴 Crítico | Inspecionar todos os responses autenticados |
| 9.4 | Rota `/health` declarada apenas uma vez no servidor | 🟢 Baixo | Buscar `app.get("/health"` no server.js |

---

## 10. Segurança Geral

| # | Verificação | Severidade | Método |
|---|---|---|---|
| 10.1 | Nenhuma senha hardcoded no código-fonte | 🔴 Crítico | Buscar `password:` e `secret:` no código |
| 10.2 | Secret de sessão carregado de variável de ambiente | 🔴 Crítico | Verificar `process.env.SESSION_SECRET` no server.js |
| 10.3 | Console.log não expõe dados sensíveis em produção | 🟠 Médio | Buscar `console.log` nos arquivos JS |
| 10.4 | Headers de segurança presentes (Content-Security-Policy, X-Frame-Options) | 🟡 Alto | DevTools → Network → Headers |
| 10.5 | Senhas armazenadas como hash (bcrypt/argon2) — nunca em texto puro | 🔴 Crítico | Verificar array `users` no server.js |

---

## Resumo de execução

Ao executar este checklist, preencha a tabela abaixo:

| Área | Total | OK | Falhou | Bloqueante |
|---|---|---|---|---|
| Autenticação | 10 | | | |
| Registro | 8 | | | |
| Controle de acesso | 7 | | | |
| Validações de coleta | 7 | | | |
| IDOR | 3 | | | |
| Upload | 6 | | | |
| Logout/Sessão | 4 | | | |
| Reset de senha | 3 | | | |
| APIs | 4 | | | |
| Segurança geral | 5 | | | |
| **Total** | **57** | | | |

---

### Critério de aprovação para release

- Zero itens 🔴 falhando
- Máximo 2 itens 🟡 falhando com plano de correção documentado
- Itens 🟠 e 🟢 podem ser aceitos com risco documentado

---

*Checklist gerado com base nos 70 bugs encontrados na auditoria de 26–27/04/2026*