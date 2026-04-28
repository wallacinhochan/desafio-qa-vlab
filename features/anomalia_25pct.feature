# language: pt

Funcionalidade: Detecção de anomalia por variação superior a 25%
  Como um gestor do sistema de coleta
  Quero que o sistema sinalize automaticamente variações anômalas nos indicadores
  Para identificar beneficiários que necessitam de atenção imediata

  Contexto:
    Dado que o beneficiário "BEN001" tem histórico de coletas com média de:
      | indicador          | média histórica |
      | taxaConclusao      | 80%             |
      | frequencia         | 75%             |
      | nota               | 7.5             |

  # ─── REGRA DE NEGÓCIO ────────────────────────────────────
  # Uma nova coleta é considerada ANÔMALA quando qualquer indicador
  # cair mais de 25 pontos percentuais abaixo da média histórica

  Cenário: Nova coleta dentro da variação normal não gera alerta
    Dado que registro nova coleta para "BEN001" com:
      | taxaConclusao | 65 |
      | frequencia    | 60 |
      | nota          | 6  |
    Quando submeto a coleta
    Então a coleta deve ser salva com status "normal"
    E nenhum alerta de anomalia deve ser gerado

  Cenário: Taxa de conclusão com queda superior a 25% gera alerta
    Dado que registro nova coleta para "BEN001" com:
      | taxaConclusao | 50 |
    Quando submeto a coleta
    Então o sistema deve sinalizar anomalia no indicador "taxaConclusao"
    E a coleta deve ser salva com flag "anomalia_detectada: true"
    E o status deve ser "pendente_revisao"

  Cenário: Frequência com queda superior a 25% gera alerta
    Dado que registro nova coleta para "BEN001" com:
      | frequencia | 45 |
    Quando submeto a coleta
    Então o sistema deve sinalizar anomalia no indicador "frequencia"

  Cenário: Múltiplos indicadores anômalos simultâneos
    Dado que registro nova coleta para "BEN001" com:
      | taxaConclusao | 40 |
      | frequencia    | 30 |
      | nota          | 2  |
    Quando submeto a coleta
    Então todos os três indicadores devem ser marcados como anômalos
    E o alerta deve ter severidade "crítica"

  # ─── BUG DOCUMENTADO ─────────────────────────────────────

  Cenário: BUG — Sistema não implementa detecção de anomalia por variação de 25%
    Dado que o beneficiário "BEN001" tem média histórica de taxaConclusao em 80%
    Quando registro nova coleta com taxaConclusao "40"
    Então o sistema deveria sinalizar anomalia (queda de 50% — acima do limiar de 25%)
    Mas o sistema aceita e registra sem nenhum alerta
    E isso constitui ausência de implementação da regra de anomalia — bug de requisito