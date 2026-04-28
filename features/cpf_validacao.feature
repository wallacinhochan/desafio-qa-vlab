# language: pt

Funcionalidade: Validação e formatação de CPF nos dados do beneficiário
  Como um operador do sistema de coleta
  Quero que campos de identificação aceitem apenas CPF válido com máscara
  Para garantir integridade dos dados de beneficiários

  Contexto:
    Dado que estou autenticado como "admin"
    E estou na página de coleta individual

  # ─── CENÁRIOS POSITIVOS ───────────────────────────────────

  Cenário: Campo ID deve exibir máscara de CPF ao digitar
    Dado que o campo "ID do Beneficiário" aceita CPF
    Quando digito "12345678901" no campo ID
    Então o campo deve exibir o valor formatado "123.456.789-01"
    E o dado enviado ao backend deve ser "12345678901" (apenas dígitos)

  Cenário: Coleta aceita CPF válido formatado
    Dado que preencho o campo ID com "529.982.247-25"
    E preencho os demais campos com valores válidos
    Quando submeto o formulário
    Então a coleta deve ser registrada com sucesso
    E o ID armazenado deve ser "52998224725"

  # ─── CENÁRIOS NEGATIVOS ───────────────────────────────────

  Cenário: Campo ID rejeita CPF com todos os dígitos iguais
    Dado que preencho o campo ID com "111.111.111-11"
    E preencho os demais campos com valores válidos
    Quando submeto o formulário
    Então devo ver a mensagem de erro "CPF inválido"
    E a coleta não deve ser registrada

  Cenário: Campo ID rejeita CPF com dígitos verificadores incorretos
    Dado que preencho o campo ID com "123.456.789-00"
    E preencho os demais campos com valores válidos
    Quando submeto o formulário
    Então devo ver a mensagem de erro "CPF inválido"
    E a coleta não deve ser registrada

  Cenário: Campo ID rejeita CPF com menos de 11 dígitos
    Dado que preencho o campo ID com "123.456.789"
    Quando submeto o formulário
    Então devo ver mensagem de erro indicando formato inválido

  Cenário: Campo ID rejeita texto livre onde CPF é esperado
    Dado que preencho o campo ID com "abc.def.ghi-jk"
    Quando submeto o formulário
    Então devo ver mensagem de erro indicando formato inválido

  # ─── BUG DOCUMENTADO ─────────────────────────────────────

  Cenário: BUG — Campo ID aceita qualquer texto sem validação de CPF
    Dado que o sistema deveria validar CPF no campo ID do beneficiário
    Quando preencho o campo ID com "abcs" e submeto
    Então o sistema aceita e registra a coleta sem erro
    E isso constitui ausência de validação de CPF — bug de requisito