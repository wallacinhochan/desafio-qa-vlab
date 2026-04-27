// cypress/e2e/login.cy.js
// Testes E2E do fluxo de autenticação

import LoginPage from './pages/LoginPage'

describe('Login — Fluxo de Autenticação', () => {

  beforeEach(() => {
    LoginPage.visit()
  })

  it('ACESS01 — Página deve ter elementos de acessibilidade básicos', () => {
  cy.visit('/')
  // Verifica lang no html
  cy.get('html').should('have.attr', 'lang')
  // Verifica que inputs de senha têm label ou aria-label
  cy.get('[data-testid="login-password"]')
    .should('have.attr', 'type', 'password')
  // Verifica título da página
  cy.title().should('not.be.empty')
  // Verifica que botão tem texto descritivo
  cy.get('[data-testid="login-button"]').should('not.have.text', '')
})

  // ── CENÁRIOS POSITIVOS ─────────────────────────────────────

  it('CT01 — Login válido como admin redireciona para dashboard', () => {
    LoginPage.login('admin', 'admin123')
    LoginPage.assertRedirectedToDashboard()
  })

  it('CT02 — Login válido como user comum redireciona para dashboard', () => {
    LoginPage.login('user', 'user123')
    LoginPage.assertRedirectedToDashboard()
  })

  // ── CENÁRIOS NEGATIVOS ─────────────────────────────────────

  it('CT03 — Login com senha incorreta exibe mensagem de erro', () => {
    LoginPage.login('admin', 'senhaerrada')
    LoginPage.assertStayedOnLogin()
    LoginPage.assertMessageVisible()
  })

  it('CT04 — Login com usuário inexistente exibe mensagem de erro', () => {
    LoginPage.login('usuario_fantasma', 'qualquer123')
    LoginPage.assertStayedOnLogin()
    LoginPage.assertMessageVisible()
  })

  it('CT05 — Login com campos vazios exibe mensagem de erro', () => {
    LoginPage.clickLoginButton()
    LoginPage.assertMessageVisible()
  })

  it('CT06 — Login com apenas username preenchido exibe erro', () => {
    LoginPage.enterUsername('admin')
    LoginPage.clickLoginButton()
    LoginPage.assertMessageVisible()
  })

  it('CT07 — Login com apenas password preenchido exibe erro', () => {
    LoginPage.enterPassword('admin123')
    LoginPage.clickLoginButton()
    LoginPage.assertMessageVisible()
  })

  // ── BUG DOCUMENTADO: Campo aceita espaços em branco ────────

  it('BUG #50 — Login com espaços em branco não deve autenticar', () => {
    LoginPage.login('   ', '   ')
    // Comportamento esperado: erro
    // Comportamento atual: pode aceitar (validação sem trim)
    LoginPage.assertStayedOnLogin()
  })

  // ── BUG DOCUMENTADO: Bypass aleatório de autenticação ──────

  it('BUG #31 — Sistema não deve autenticar com senha errada em múltiplas tentativas', () => {
    // Bug: 10% de chance de aceitar senha errada por Math.random()
    // Testamos 5 vezes para aumentar a chance de detectar o bug
    for (let i = 0; i < 5; i++) {
      cy.visit('/')
      LoginPage.login('admin', 'senha_completamente_errada_' + i)
      cy.url().then((url) => {
        if (url.includes('/dashboard')) {
          // Se chegou aqui, o bug foi reproduzido — marcamos como falha
          throw new Error(`BUG CONFIRMADO: login aceito com senha errada na tentativa ${i + 1}`)
        }
      })
    }
  })

  // ── SEGURANÇA ──────────────────────────────────────────────

  it('SEC01 — Dashboard não deve ser acessível sem autenticação', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.url().should('not.include', '/dashboard')
  })

  it('SEC02 — Backdoor ?admin=true não deve permitir acesso sem login', () => {
    cy.visit('/dashboard?admin=true', { failOnStatusCode: false })
    // Bug #32: sistema permite acesso com esse parâmetro
    // Resultado esperado: redirecionar para /
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })

  // ── API ────────────────────────────────────────────────────

  it('API01 — Health check retorna status ok', () => {
    cy.request('GET', '/health').then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body).to.have.property('status', 'ok')
      expect(response.body).to.have.property('timestamp')
      expect(response.body).to.have.property('uptime')
      expect(response.body.uptime).to.be.greaterThan(0)
    })
  })

  it('API02 — Login API retorna sucesso com credenciais válidas', () => {
    cy.request({
      method: 'POST',
      url: '/login',
      body: { username: 'admin', password: 'admin123' }
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.success).to.be.true
      // BUG #15: verificar se senha não vem no response
      expect(response.body.user).to.not.have.property('password')
    })
  })

  it('API03 — Login API rejeita credenciais inválidas com status 401', () => {
    cy.request({
      method: 'POST',
      url: '/login',
      body: { username: 'admin', password: 'errada' },
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
      expect(response.body.success).to.be.false
    })
  })
})