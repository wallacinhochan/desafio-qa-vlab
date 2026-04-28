// cypress/support/commands.js

Cypress.Commands.add('login', (username, password) => {
  // cy.session() armazena e reutiliza a sessão entre testes do mesmo spec
  // Evita login repetido a cada beforeEach — mais rápido e menos flaky
  cy.session(
    [username, password],
    () => {
      cy.visit('/')
      cy.get('[data-testid="login-username"]').type(username)
      cy.get('[data-testid="login-password"]').type(password)
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/dashboard')
    },
    {
      validate() {
        // Garante que sessão ainda é válida antes de reutilizar
        cy.request({ url: '/api/user', failOnStatusCode: false })
          .its('status').should('eq', 200)
      }
    }
  )
})

Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click()
  cy.url().should('not.include', '/dashboard')
})

Cypress.Commands.add('register', (username, email, password) => {
  cy.visit('/')
  cy.get('[data-testid="tab-register"]').click()
  cy.get('[data-testid="register-username"]').type(username)
  cy.get('[data-testid="register-email"]').type(email)
  cy.get('[data-testid="register-password"]').type(password)
  cy.get('[data-testid="register-confirm"]').type(password)
  cy.get('[data-testid="register-button"]').click()
})