# language: pt

Funcionalidade: Módulo de coleta de dados de beneficiários
  Como um usuário autenticado
  Quero registrar dados de desempenho de beneficiários
  Para acompanhar indicadores da plataforma de fomento

  Contexto:
    Dado que estou autenticado como "admin"
    E que estou na página "/coleta"

  # ─── COLETA INDIVIDUAL ────────────────────────────────────────────

  Cenário: Submissão de coleta com todos os dados válidos
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

  Cenário: Campo "Taxa de Conclusão" não deve aceitar valores negativos
    Quando preencho o formulário com dados válidos
    E preencho o campo "Taxa de Conclusão" com "-1"
    E clico em "Salvar Coleta"
    Então o sistema deve exibir erro de validação
    E o registro não deve ser salvo

  Cenário: Campo "Taxa de Conclusão" não deve aceitar valores acima de 100
    Quando preencho o formulário com dados válidos
    E preencho o campo "Taxa de Conclusão" com "2000"
    E clico em "Salvar Coleta"
    Então o sistema deve exibir erro "Taxa deve estar entre 0 e 100"
    E o registro não deve ser salvo

  Cenário: Campo "Frequência" não deve aceitar valores acima de 100%
    Quando preencho o formulário com dados válidos
    E preencho o campo "Frequência" com "200"
    E clico em "Salvar Coleta"
    Então o sistema deve exibir erro de validação
    E o registro não deve ser salvo

  Cenário: Campo "Nota" não deve aceitar valores acima de 10
    Quando preencho o formulário com dados válidos
    E preencho o campo "Nota" com "99"
    E clico em "Salvar Coleta"
    Então o sistema deve exibir erro "Nota deve estar entre 0 e 10"
    E o registro não deve ser salvo

  Cenário: Campo "ID" não deve aceitar valores não numéricos
    Quando preencho o campo "ID" com "abcs"
    E preencho os demais campos corretamente
    E clico em "Salvar Coleta"
    Então o sistema deve exibir erro de validação no campo ID
    E o registro não deve ser salvo

  Cenário: Coleta sem autenticação deve ser bloqueada
    Dado que não estou autenticado
    Quando acesso diretamente "/coleta"
    Então devo ser redirecionado para a página de login

  # ─── HISTÓRICO ────────────────────────────────────────────────────

  Cenário: Usuário comum não deve ver coletas de outros usuários
    Dado que o usuário "admin" realizou uma coleta
    E que estou autenticado como "user"
    Quando acesso o histórico de coletas
    Então devo ver apenas minhas próprias coletas
    E não devo ver registros com "Coletado por: admin"

  # ─── UPLOAD EM LOTE ───────────────────────────────────────────────

  Cenário: Upload de arquivo CSV válido deve ser aceito
    Quando acesso a aba "Lote"
    E faço upload de um arquivo "dados.csv" com estrutura válida
    Então o sistema deve processar o arquivo
    E exibir confirmação de importação

  Cenário: Upload de arquivo executável deve ser bloqueado
    Quando acesso a aba "Lote"
    E faço upload de um arquivo com extensão ".exe"
    Então o sistema deve rejeitar o arquivo
    E exibir mensagem "Formato de arquivo não permitido"

  Cenário: Upload de arquivo sem extensão CSV deve ser bloqueado
    Quando acesso a aba "Lote"
    E faço upload de um arquivo ".txt" renomeado para ".csv"
    Então o sistema deve validar o conteúdo real do arquivo
    E rejeitar arquivos sem estrutura CSV válida
