// cypress/e2e/security.cy.js
// Testes de segurança: auth bypass, IDOR, exposição de dados

describe('Segurança — Controle de Acesso e Exposição de Dados', () => {

  // ── PROTEÇÃO DE ROTAS ──────────────────────────────────────

  context('Proteção de rotas sem autenticação', () => {
    beforeEach(() => {
      cy.window().then(win => win.localStorage.clear())
    })

    it('SEC01 — /dashboard deve redirecionar sem autenticação', () => {
      cy.visit('/dashboard', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard')
    })

    it('SEC02 — /coleta deve redirecionar sem autenticação', () => {
      cy.visit('/coleta', { failOnStatusCode: false })
      cy.url().should('not.include', '/coleta')
    })

    it('BUG #32 — Backdoor ?admin=true não deve liberar dashboard', () => {
      cy.visit('/dashboard?admin=true', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard')
    })

    it('BUG #33 — /api/user?userId=1 não deve funcionar sem autenticação', () => {
      cy.request({
        url: '/api/user?userId=1',
        failOnStatusCode: false
      }).then(response => {
        // Bug: retorna dados com senha sem autenticação
        expect(response.status).to.eq(401)
      })
    })

    it('SEC03 — /api/coleta/historico deve retornar 401 sem autenticação', () => {
      cy.request({
        url: '/api/coleta/historico',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(401)
      })
    })
  })

  // ── EXPOSIÇÃO DE DADOS NA API ──────────────────────────────

  context('Exposição de dados sensíveis na API', () => {
    beforeEach(() => {
      cy.login('admin', 'admin123')
    })

    it('BUG #15 — /api/user não deve retornar senha no response', () => {
      cy.request('/api/user').then(response => {
        expect(response.body.user).to.not.have.property('password')
      })
    })

    it('BUG #19 — /api/users não deve expor senhas dos usuários', () => {
      cy.request({
        url: '/api/users?secret=admin123',
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200 && response.body.users) {
          response.body.users.forEach(user => {
            expect(user).to.not.have.property('password',
              'Senha exposta para usuário: ' + user.username)
          })
        }
      })
    })

    it('BUG #21 — Senha não deve ser armazenada no localStorage após login', () => {
      cy.window().then(win => {
        const stored = win.localStorage.getItem('user')
        if (stored) {
          const user = JSON.parse(stored)
          expect(user).to.not.have.property('password')
        }
      })
    })
  })

  // ── IDOR — HISTÓRICO DE COLETAS ───────────────────────────

  context('IDOR — Isolamento de dados entre usuários', () => {
    it('BUG #16 — Usuário comum não deve ver coletas de outros usuários', () => {
      // Admin faz uma coleta
      cy.login('admin', 'admin123')
      cy.visit('/coleta')

      cy.get('[data-testid="coleta-id"]').type('9999')
      cy.get('[data-testid="coleta-nome"]').type('Beneficiario Exclusivo Admin')
      cy.get('[data-testid="coleta-taxa"]').type('50')
      cy.get('[data-testid="coleta-frequencia"]').type('80')
      cy.get('[data-testid="coleta-nota"]').type('7')
      cy.get('[data-testid="coleta-submit"]').click()

      cy.logout()

      // User tenta ver o histórico
      cy.login('user', 'user123')
      cy.visit('/coleta')

      cy.request('/api/coleta/historico').then(response => {
        const coletas = response.body.coletas || response.body
        if (Array.isArray(coletas)) {
          const coletasDeAdmin = coletas.filter(c =>
            c.usuarioColeta === 'admin' || c.coletadoPor === 'admin'
          )
          expect(coletasDeAdmin).to.have.length(0,
            'Coletas do admin não devem aparecer para o usuário comum')
        }
      })
    })
  })

  // ── LOGOUT ─────────────────────────────────────────────────

  context('Logout e limpeza de sessão', () => {
    beforeEach(() => {
      cy.login('admin', 'admin123')
    })

    it('BUG #22 — Logout deve limpar localStorage', () => {
      cy.window().then(win => {
        expect(win.localStorage.getItem('user')).to.not.be.null
      })

      cy.logout()

      cy.window().then(win => {
        expect(win.localStorage.getItem('user')).to.be.null
        expect(win.localStorage.getItem('loggedIn')).to.be.null
      })
    })

    it('BUG #38 — Após logout, acesso ao dashboard deve ser bloqueado', () => {
      cy.logout()
      cy.visit('/dashboard', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard')
    })
  })

  // ── RESET DE SENHA ─────────────────────────────────────────

  context('Reset de senha sem autenticação', () => {
    it('BUG #24 — Reset de senha não deve funcionar sem autenticação', () => {
      cy.request({
        method: 'POST',
        url: '/reset-password',
        body: { username: 'admin', newPassword: 'hacked123' },
        failOnStatusCode: false
      }).then(response => {
        // Bug: retorna sucesso sem verificação de identidade
        expect(response.status).to.not.eq(200)
      })
    })

    it('BUG #26 — Reset deve retornar mesma mensagem para user válido e inválido', () => {
      cy.request({
        method: 'POST',
        url: '/reset-password',
        body: { username: 'admin', newPassword: 'nova123' },
        failOnStatusCode: false
      }).then(adminRes => {
        cy.request({
          method: 'POST',
          url: '/reset-password',
          body: { username: 'usuario_inexistente', newPassword: 'nova123' },
          failOnStatusCode: false
        }).then(invalidRes => {
          // Mensagens devem ser idênticas para evitar enumeração
          expect(adminRes.body.message).to.eq(invalidRes.body.message)
        })
      })
    })
  })
})