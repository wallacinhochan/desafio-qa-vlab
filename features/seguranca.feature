# language: pt

Funcionalidade: Segurança e controle de acesso
  Como auditora de qualidade
  Quero garantir que o sistema protege dados sensíveis
  E impede acessos não autorizados

  Contexto:
    Dado que o sistema está disponível em "http://localhost:3000"

  # ─── EXPOSIÇÃO DE DADOS ───────────────────────────────────────────

  Cenário: API não deve retornar senha do usuário em texto puro
    Dado que estou autenticado como "admin"
    Quando acesso o endpoint "/api/user"
    Então a resposta não deve conter o campo "password"
    E dados sensíveis não devem ser expostos na API

  Cenário: Senha não deve ser armazenada no LocalStorage
    Dado que estou na página de login
    Quando realizo login com "admin" e "admin123"
    Então o LocalStorage não deve conter o campo "password"
    E apenas token de sessão deve ser persistido no cliente

  Cenário: Logout deve remover dados sensíveis do navegador
    Dado que estou autenticado e tenho dados no LocalStorage
    Quando clico em "Logout"
    Então o LocalStorage deve ser limpo completamente
    E cookies de sessão devem ser invalidados

  # ─── RESET DE SENHA ───────────────────────────────────────────────

  Cenário: Reset de senha deve exigir autenticação ou token válido
    Dado que não estou autenticado
    Quando envio requisição POST para "/reset-password"
    Com o body '{"username":"admin","newPassword":"nova123"}'
    Então o sistema deve retornar erro 401
    E a senha não deve ser alterada

  Cenário: Endpoint de reset não deve revelar existência de contas
    Quando envio reset para username "usuario_inexistente"
    E envio reset para username "admin"
    Então ambas as respostas devem ser idênticas
    E o sistema não deve permitir enumeração de usuários

  # ─── CONTROLE DE ACESSO ───────────────────────────────────────────

  Cenário: Usuário comum não deve acessar lista de todos os usuários
    Dado que estou autenticado como "user"
    Quando acesso o endpoint "/api/users"
    Então devo receber erro 403
    E a lista de usuários não deve ser retornada

  Cenário: Session ID deve ser regenerado após novo login
    Dado que estou autenticado e anoto o valor do cookie de sessão
    Quando faço logout
    E realizo novo login com as mesmas credenciais
    Então o cookie de sessão deve ter um valor diferente do anterior

  # ─── REGISTRO ─────────────────────────────────────────────────────

  Cenário: Sistema não deve permitir cadastro com senha vazia
    Dado que estou na página de registro
    Quando preencho "username" com "novo_usuario"
    E preencho "email" com "novo@email.com"
    E deixo o campo "password" vazio
    E submeto o formulário
    Então o sistema deve retornar erro de validação
    E o usuário não deve ser criado

  Cenário: API de coleta deve exigir autenticação válida
    Dado que não estou autenticado
    Quando envio requisição POST para "/api/coleta" com dados válidos
    Então o sistema deve retornar erro 401
    E o registro não deve ser salvo
