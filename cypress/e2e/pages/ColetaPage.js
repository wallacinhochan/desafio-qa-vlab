// cypress/e2e/pages/ColetaPage.js
// Page Object do módulo de coleta de dados

class ColetaPage {
  // ── Seletores — Formulário individual ─────────────────────
  get idField()        { return cy.get('[data-testid="beneficiario-id"]') }
  get nomeField()      { return cy.get('[data-testid="beneficiario-nome"]') }
  get conclusaoField() { return cy.get('[data-testid="indicador-conclusao"]') }
  get frequenciaField(){ return cy.get('[data-testid="indicador-frequencia"]') }
  get notaField()      { return cy.get('[data-testid="indicador-nota"]') }
  get statusSelect()   { return cy.get('[data-testid="coleta-status"]') }
  get observacoesField(){ return cy.get('[data-testid="observacoes"]') }
  get submitButton()   { return cy.get('[data-testid="submit-coleta"]') }
  get previewButton()  { return cy.get('[data-testid="preview-coleta"]') }
  get messageDiv()     { return cy.get('[data-testid="coleta-message"]') }
  get previewDiv()     { return cy.get('[data-testid="coleta-preview"]') }

  // ── Seletores — Abas ──────────────────────────────────────
  get tabIndividual()  { return cy.get('[data-testid="tab-individual"]') }
  get tabLote()        { return cy.get('[data-testid="tab-lote"]') }
  get tabHistorico()   { return cy.get('[data-testid="tab-historico"]') }

  // ── Seletores — Upload em lote ────────────────────────────
  get arquivoInput()       { return cy.get('[data-testid="arquivo-lote"]') }
  get submitLoteButton()   { return cy.get('[data-testid="submit-lote"]') }
  get loteMessage()        { return cy.get('[data-testid="lote-message"]') }
  get validarDuplicatas()  { return cy.get('[data-testid="validar-duplicatas"]') }

  // ── Seletores — Histórico ─────────────────────────────────
  get carregarHistorico()  { return cy.get('[data-testid="carregar-historico"]') }
  get historicoData()      { return cy.get('[data-testid="historico-data"]') }

  // ── Navegação ─────────────────────────────────────────────
  visit() {
    cy.visit('/coleta')
  }

  // ── Ações — Formulário individual ────────────────────────
  fillId(id) {
    this.idField.clear().type(id)
  }

  fillNome(nome) {
    this.nomeField.clear().type(nome)
  }

  fillConclusao(valor) {
    this.conclusaoField.clear().type(valor)
  }

  fillFrequencia(valor) {
    this.frequenciaField.clear().type(valor)
  }

  fillNota(valor) {
    this.notaField.clear().type(valor)
  }

  selectStatus(status) {
    this.statusSelect.select(status)
  }

  fillObservacoes(texto) {
    this.observacoesField.clear().type(texto)
  }

  submit() {
    this.submitButton.click()
  }

  preview() {
    this.previewButton.click()
  }

  /**
   * Preenche todos os campos obrigatórios com valores padrão válidos.
   * Use para garantir um estado base antes de sobrescrever o campo sob teste.
   */
  fillValidForm({ id = 'BEN001', nome = 'Usuário Teste', conclusao = '85',
                  frequencia = '90', nota = '8', status = 'completo' } = {}) {
    this.fillId(id)
    this.fillNome(nome)
    this.fillConclusao(conclusao)
    this.fillFrequencia(frequencia)
    this.fillNota(nota)
    this.selectStatus(status)
  }

  // ── Ações — Abas ─────────────────────────────────────────
  goToIndividual() { this.tabIndividual.click() }
  goToLote()       { this.tabLote.click() }
  goToHistorico()  { this.tabHistorico.click() }

  // ── Ações — Upload ────────────────────────────────────────
  uploadCsv(fileName, content) {
    this.arquivoInput.selectFile({
      contents: Cypress.Buffer.from(content),
      fileName,
      mimeType: 'text/csv',
    })
  }

  uploadFile(fileName, content, mimeType = 'text/plain') {
    this.arquivoInput.selectFile({
      contents: Cypress.Buffer.from(content),
      fileName,
      mimeType,
    })
  }

  submitLote() {
    this.submitLoteButton.click()
  }

  // ── Ações — Histórico ─────────────────────────────────────
  loadHistorico() {
    this.goToHistorico()
    this.carregarHistorico.click()
  }

  // ── Assertions ────────────────────────────────────────────
  assertMessageVisible() {
    this.messageDiv.should('be.visible')
  }

  assertMessageContains(text) {
    this.messageDiv.should('be.visible').and('contain', text)
  }

  assertSuccessMessage() {
    this.messageDiv.should('be.visible').and('contain', 'sucesso')
  }

  assertErrorMessage() {
    this.messageDiv.should('be.visible')
  }

  assertPreviewVisible() {
    this.previewDiv.should('be.visible')
  }

  assertPreviewContains(text) {
    this.previewDiv.should('be.visible').and('contain', text)
  }

  assertTabActive(tab) {
    this[`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`]
      .should('have.class', 'active')
  }

  assertFormCleared() {
    this.idField.should('have.value', '')
    this.nomeField.should('have.value', '')
  }

  assertHistoricoVisible() {
    this.historicoData.should('be.visible')
  }
}

export default new ColetaPage()
