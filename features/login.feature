# language: pt

Funcionalidade: Autenticação de usuários
  Como um usuário do sistema
  Quero realizar login com minhas credenciais
  Para acessar as funcionalidades protegidas da plataforma

  Contexto:
    Dado que o sistema está disponível em "http://localhost:3000"
    E que existem usuários cadastrados: "admin/admin123", "user/user123"

  # ─── CENÁRIOS POSITIVOS ───────────────────────────────────────────

  Cenário: Login com credenciais válidas de administrador
    Dado que estou na página de login
    Quando preencho o campo "username" com "admin"
    E preencho o campo "password" com "admin123"
    E clico no botão "Entrar"
    Então devo ser redirecionado para "/dashboard"
    E devo ver uma mensagem de boas-vindas com o nome do usuário

  Cenário: Login com credenciais válidas de usuário comum
    Dado que estou na página de login
    Quando preencho o campo "username" com "user"
    E preencho o campo "password" com "user123"
    E clico no botão "Entrar"
    Então devo ser redirecionado para "/dashboard"

  # ─── CENÁRIOS NEGATIVOS ───────────────────────────────────────────

  Cenário: Login com senha incorreta
    Dado que estou na página de login
    Quando preencho o campo "username" com "admin"
    E preencho o campo "password" com "senhaerrada"
    E clico no botão "Entrar"
    Então devo permanecer na página de login
    E devo ver a mensagem de erro "Senha incorreta"

  Cenário: Login com usuário inexistente
    Dado que estou na página de login
    Quando preencho o campo "username" com "usuario_fantasma"
    E preencho o campo "password" com "qualquer123"
    E clico no botão "Entrar"
    Então devo ver uma mensagem de erro
    E não devo ser redirecionado para o dashboard

  Cenário: Login com campos vazios
    Dado que estou na página de login
    Quando deixo o campo "username" vazio
    E deixo o campo "password" vazio
    E clico no botão "Entrar"
    Então devo ver a mensagem de erro "Usuário e senha são obrigatórios"
    E não devo ser autenticado

  Cenário: Login com payload XSS no campo username
    Dado que estou na página de login
    Quando preencho o campo "username" com "<script>alert('xss')</script>"
    E preencho o campo "password" com "qualquer"
    E clico no botão "Entrar"
    Então o script não deve ser executado
    E o sistema deve tratar o input como texto puro

  Cenário: Tentativa de acesso ao dashboard sem estar autenticado
    Dado que não estou autenticado no sistema
    Quando acesso diretamente a URL "/dashboard"
    Então devo ser redirecionado para a página de login
    E não devo ver o conteúdo do dashboard
