// cypress/e2e/pages/LoginPage.js
// Page Object do módulo de autenticação

class LoginPage {
  // ── Seletores ──────────────────────────────────────────────
  get usernameField()  { return cy.get('[data-testid="login-username"]') }
  get passwordField()  { return cy.get('[data-testid="login-password"]') }
  get submitButton()   { return cy.get('[data-testid="login-button"]') }
  get messageDiv()     { return cy.get('[data-testid="message"]') }
  get registerTab()    { return cy.get('[data-testid="tab-register"]') }
  get rememberMeCheck(){ return cy.get('#rememberMe') }

  // ── Ações ──────────────────────────────────────────────────
  visit() {
    cy.visit('/')
  }

  enterUsername(username) {
    this.usernameField.clear().type(username)
  }

  enterPassword(password) {
    this.passwordField.clear().type(password)
  }

  clickLoginButton() {
    this.submitButton.click()
  }

  login(username, password) {
    this.enterUsername(username)
    this.enterPassword(password)
    this.clickLoginButton()
  }

  clickRegisterTab() {
    this.registerTab.click()
  }

  // ── Assertions ─────────────────────────────────────────────
  assertRedirectedToDashboard() {
    cy.url().should('include', '/dashboard')
  }

  assertStayedOnLogin() {
    cy.url().should('not.include', '/dashboard')
  }

  assertMessageVisible() {
    this.messageDiv.should('be.visible')
  }

  assertMessageContains(text) {
    this.messageDiv.should('be.visible').and('contain', text)
  }
}

export default new LoginPage()