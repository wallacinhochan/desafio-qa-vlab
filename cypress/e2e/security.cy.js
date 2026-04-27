// cypress/e2e/security.cy.js
// Testes de segurança: auth bypass, IDOR, exposição de dados

describe('Segurança — Controle de Acesso e Exposição de Dados', () => {

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

    it('BUG #33 — /api/user?userId=1 não deve retornar dados sem autenticação', () => {
      cy.request({ url: '/api/user?userId=1', failOnStatusCode: false })
        .then(response => {
          expect(response.status).to.eq(401)
        })
    })

    it('SEC03 — /api/coleta/historico deve retornar 401 sem autenticação', () => {
      cy.request({ url: '/api/coleta/historico', failOnStatusCode: false })
        .then(response => {
          expect(response.status).to.eq(401)
        })
    })
  })

  context('Exposição de dados sensíveis na API', () => {
    beforeEach(() => {
      cy.login('user', 'user123')
    })

    it('BUG #15 — /api/user não deve retornar senha no response', () => {
      cy.request({ url: '/api/user', failOnStatusCode: false })
        .then(response => {
          if (response.status === 200 && response.body.user) {
            expect(response.body.user).to.not.have.property('password')
          }
        })
    })

    it('BUG #21 — Senha não deve ser armazenada no localStorage após login', () => {
      cy.window().then(win => {
        const stored = win.localStorage.getItem('user')
        if (stored) {
          const userData = JSON.parse(stored)
          expect(userData).to.not.have.property('password')
        }
      })
    })
  })

  context('Logout e limpeza de sessão', () => {
    beforeEach(() => {
      cy.login('user', 'user123')
    })

    it('BUG #22 — Logout deve limpar localStorage', () => {
      cy.window().then(win => {
        expect(win.localStorage.getItem('user')).to.not.be.null
      })
      cy.visit('/dashboard')
      cy.get('[data-testid="logout-button"]').click()
      cy.window().then(win => {
        expect(win.localStorage.getItem('user')).to.be.null
      })
    })

    it('BUG #38 — Após logout, dashboard deve ser bloqueado', () => {
      cy.visit('/dashboard')
      cy.get('[data-testid="logout-button"]').click()
      cy.visit('/dashboard', { failOnStatusCode: false })
      cy.url().should('not.include', '/dashboard')
    })
  })

  context('IDOR — Histórico expõe dados de outros usuários', () => {
    it('BUG #16 — API retorna coletas de todos os usuários', () => {
      cy.login('user', 'user123')
      cy.request({ url: '/api/coleta/historico', failOnStatusCode: false })
        .then(response => {
          if (response.status === 200) {
            const coletas = response.body.coletas || response.body
            if (Array.isArray(coletas) && coletas.length > 0) {
              const outrosUsuarios = coletas.filter(c =>
                (c.usuarioColeta || c.coletadoPor) !== 'user'
              )
              expect(outrosUsuarios.length).to.be.greaterThan(0)
            }
          }
        })
    })
  })

  context('Reset de senha sem autenticação', () => {
    it('BUG #24 — Reset funciona sem autenticação (usa usuário "teste")', () => {
      // Usa "teste" para não quebrar credenciais de admin/user
      cy.request({
        method: 'POST',
        url: '/reset-password',
        body: { username: 'teste', newPassword: 'senha_teste_alterada' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.not.eq(200)
      })
    })

    it('BUG #26 — Mensagens diferentes revelam existência de usuários', () => {
      cy.request({
        method: 'POST',
        url: '/reset-password',
        body: { username: 'user', newPassword: 'qualquer123' },
        failOnStatusCode: false
      }).then(validRes => {
        cy.request({
          method: 'POST',
          url: '/reset-password',
          body: { username: 'usuario_inexistente_xyz', newPassword: 'qualquer123' },
          failOnStatusCode: false
        }).then(invalidRes => {
          expect(validRes.body.message).to.eq(invalidRes.body.message)
        })
      })
    })
  })
})