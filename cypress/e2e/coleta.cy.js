// cypress/e2e/coleta.cy.js
// Testes E2E do módulo de coleta de dados

import ColetaPage from './pages/ColetaPage'

describe('Coleta de Dados — Módulo de coleta', () => {

  beforeEach(() => {
    cy.login('admin', 'admin123')
    ColetaPage.visit()
  })

  // ── COLETA INDIVIDUAL ────────────────────────────────────────

  describe('Coleta individual', () => {

    it('CT-COL01 — Deve submeter coleta com todos os dados válidos', () => {
      ColetaPage.fillValidForm({ id: 'BEN001', nome: 'João Silva', status: 'completo' })
      ColetaPage.submit()
      ColetaPage.assertSuccessMessage()
    })

    it('CT-COL02 — Deve rejeitar coleta sem ID do beneficiário', () => {
      ColetaPage.fillValidForm()
      ColetaPage.fillId('{selectall}{del}')
      ColetaPage.submit()
      ColetaPage.assertMessageContains('obrigatório')
    })

    it('CT-COL03 — Deve rejeitar coleta sem nome do beneficiário', () => {
      ColetaPage.fillValidForm()
      ColetaPage.fillNome('{selectall}{del}')
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('CT-COL04 — Deve rejeitar coleta sem indicadores obrigatórios', () => {
      ColetaPage.fillId('BEN002')
      ColetaPage.fillNome('Maria Santos')
      ColetaPage.submit()
      ColetaPage.assertMessageContains('obrigatório')
    })

    it('BUG-COL05 — Taxa negativa não deve ser aceita', () => {
      // BUG #2/#3: sistema aceita valores negativos sem erro
      ColetaPage.fillValidForm()
      ColetaPage.fillConclusao('-50')
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('BUG-COL06 — Taxa acima de 100 não deve ser aceita', () => {
      // BUG #3: sistema aceita valores acima de 100% sem validação
      ColetaPage.fillValidForm()
      ColetaPage.fillConclusao('150')
      ColetaPage.fillFrequencia('200')
      ColetaPage.fillNota('15')
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('CT-COL07 — Deve aceitar valores com casas decimais', () => {
      ColetaPage.fillValidForm({ id: 'BEN003', conclusao: '87.5', frequencia: '91.3', nota: '8.75' })
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('CT-COL08 — Deve permitir pré-visualização dos dados antes de salvar', () => {
      ColetaPage.fillValidForm({ id: 'BEN004', nome: 'Ana Costa' })
      ColetaPage.preview()
      ColetaPage.assertPreviewVisible()
      ColetaPage.assertPreviewContains('BEN004')
    })

    it('CT-COL09 — Deve limpar formulário após submissão bem-sucedida', () => {
      ColetaPage.fillValidForm({ id: 'BEN005', nome: 'Carlos Mendes' })
      ColetaPage.submit()
      ColetaPage.assertSuccessMessage()
      ColetaPage.assertFormCleared()
    })

    it('BUG-COL10 — Campo com valor 0 não deve ser tratado como campo vazio', () => {
      // BUG #51: comparação == ao invés de === trata 0 como falsy
      ColetaPage.fillValidForm({ id: 'BEN006', conclusao: '0', frequencia: '0', nota: '0' })
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('BUG-COL11 — Observações longas não devem ter tamanho ilimitado', () => {
      // BUG #9/#48: sem limite de caracteres — risco de XSS armazenado
      const observacaoLonga = 'Lorem ipsum dolor sit amet. '.repeat(50)
      ColetaPage.fillValidForm({ id: 'BEN007', nome: 'Francisco Gomes' })
      ColetaPage.fillObservacoes(observacaoLonga)
      ColetaPage.submit()
      ColetaPage.assertMessageVisible()
    })

    it('CT-COL12 — Deve aceitar todos os status disponíveis', () => {
      const statusOptions = ['em_progresso', 'completo', 'pendente_revisao', 'aprovado', 'rejeitado']
      statusOptions.forEach((status, index) => {
        ColetaPage.fillId(`BEN0${20 + index}`)
        ColetaPage.fillNome(`Usuário ${status}`)
        ColetaPage.fillConclusao('85')
        ColetaPage.fillFrequencia('90')
        ColetaPage.fillNota('8')
        ColetaPage.selectStatus(status)
        ColetaPage.submit()
        ColetaPage.assertMessageVisible()
      })
    })
  })

  // ── NAVEGAÇÃO DE ABAS ────────────────────────────────────────

  describe('Navegação de abas', () => {

    it('CT-NAV01 — Deve alternar entre abas corretamente', () => {
      ColetaPage.tabIndividual.should('have.class', 'active')
      ColetaPage.goToLote()
      ColetaPage.tabLote.should('have.class', 'active')
      ColetaPage.goToHistorico()
      ColetaPage.tabHistorico.should('have.class', 'active')
      ColetaPage.goToIndividual()
      ColetaPage.tabIndividual.should('have.class', 'active')
    })
  })

  // ── HISTÓRICO ────────────────────────────────────────────────

  describe('Histórico de coletas', () => {

    it('CT-HIS01 — Deve carregar e exibir o histórico de coletas', () => {
      ColetaPage.loadHistorico()
      ColetaPage.assertHistoricoVisible()
    })

    it('BUG-HIS02 — Histórico expõe coletas de todos os usuários (IDOR)', () => {
      // BUG #16: qualquer usuário autenticado vê coletas de outros
      ColetaPage.fillValidForm({ id: 'BEN030', nome: 'Fatima Santos' })
      ColetaPage.submit()
      ColetaPage.assertSuccessMessage()
      ColetaPage.loadHistorico()
      ColetaPage.assertHistoricoVisible()
    })
  })

  // ── UPLOAD EM LOTE ───────────────────────────────────────────

  describe('Upload em lote', () => {

    beforeEach(() => {
      ColetaPage.goToLote()
    })

    it('CT-UPL01 — Deve exigir seleção de arquivo antes de enviar', () => {
      ColetaPage.submitLote()
      ColetaPage.loteMessage.should('contain', 'arquivo')
    })

    it('CT-UPL02 — Deve aceitar upload de arquivo CSV válido', () => {
      ColetaPage.uploadCsv('dados.csv', 'ID,Nome,Taxa\nBEN001,Teste,85')
      ColetaPage.submitLote()
      ColetaPage.loteMessage.should('be.visible')
    })

    it('BUG-UPL03 — Arquivo .txt não deve ser aceito como CSV válido', () => {
      // BUG #29/#60: sistema valida apenas extensão, não o conteúdo real
      ColetaPage.uploadFile('fake.txt', 'Conteúdo de texto qualquer', 'text/plain')
      ColetaPage.submitLote()
      ColetaPage.loteMessage.should('be.visible')
    })
  })

  // ── LINK DE NAVEGAÇÃO ────────────────────────────────────────

  describe('Link de coleta no dashboard', () => {

    it('CT-LNK01 — Dashboard deve ter link para a página de coleta', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="link-coleta"]')
        .should('exist')
        .and('have.attr', 'href', '/coleta')
    })

    it('CT-LNK02 — Clicar no link deve navegar para /coleta', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="link-coleta"]').click()
      cy.url().should('include', '/coleta')
    })
  })
})
