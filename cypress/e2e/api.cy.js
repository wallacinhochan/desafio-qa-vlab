// cypress/e2e/api.cy.js
// Testes de API: health check e endpoints

describe('API — Testes de Endpoints', () => {

  // ── HEALTH CHECK ───────────────────────────────────────────

  context('GET /health', () => {
    it('API01 — Retorna status 200 com campos obrigatórios', () => {
      cy.request('GET', '/health').then(response => {
        expect(response.status).to.eq(200)
        expect(response.body).to.have.property('status', 'ok')
        expect(response.body).to.have.property('timestamp')
        expect(response.body).to.have.property('uptime')
      })
    })

    it('API02 — uptime deve ser número positivo', () => {
      cy.request('GET', '/health').then(response => {
        expect(response.body.uptime).to.be.a('number').and.greaterThan(0)
      })
    })

    it('API03 — timestamp deve ser data válida', () => {
      cy.request('GET', '/health').then(response => {
        expect(new Date(response.body.timestamp).toString()).to.not.eq('Invalid Date')
      })
    })
  })

  // ── LOGIN API ──────────────────────────────────────────────

  context('POST /login', () => {
    it('API04 — Credenciais válidas retornam sucesso', () => {
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'admin', password: 'admin123' }
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
      })
    })

    it('BUG #15 — Response de login não deve conter campo password', () => {
      // BUG CONFIRMADO: a API retorna o campo password em texto puro no objeto user.
      // Resultado esperado: response.body.user NÃO deve ter a propriedade password.
      // Resultado atual:    response.body.user CONTÉM a propriedade password.
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'admin', password: 'admin123' }
      }).then(response => {
        expect(response.body.user, 'BUG #15: senha exposta no response de login').to.not.have.property('password')
      })
    })

    it('API05 — Credenciais inválidas retornam 401', () => {
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'admin', password: 'errada' },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(401)
        expect(response.body.success).to.be.false
      })
    })

    it('API06 — Body vazio retorna erro 400', () => {
      cy.request({
        method: 'POST',
        url: '/login',
        body: {},
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(400)
      })
    })
  })

  // ── COLETA API ─────────────────────────────────────────────
  // FIX: cy.session() não propaga cookies para cy.request().
  // Solução: fazer login via cy.request() direto no beforeEach,
  // o que define o cookie de sessão automaticamente para os requests seguintes.

  context('POST /api/coleta', () => {
    beforeEach(() => {
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'admin', password: 'admin123' }
      })
    })

    it('API07 — Coleta válida retorna sucesso', () => {
  cy.request({
    method: 'POST',
    url: '/api/coleta',
    failOnStatusCode: false,
    body: {
      beneficiarioId: '1001',
      beneficiarioNome: 'Beneficiário Teste',
      indicador1: 80,
      indicador2: 90,
      indicador3: 8,
      observacoes: 'Teste',
      status: 'completo'
    }
  }).then(response => {
    expect(response.status, `Resposta inesperada: ${JSON.stringify(response.body)}`).to.eq(200)
    expect(response.body.success).to.be.true
  })
})

    it('BUG #2 — Taxa negativa não deve ser aceita', () => {
      // BUG CONFIRMADO: sistema aceita taxa: -50 sem erro.
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: { id: '1', nome: 'Teste', taxa: -50, frequencia: 80, nota: 7 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status, 'BUG #2: taxa negativa aceita pelo backend').to.not.eq(200)
      })
    })

    it('BUG #7 — Nota acima de 10 não deve ser aceita', () => {
      // BUG CONFIRMADO: sistema aceita nota: 99 sem erro.
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: { id: '1', nome: 'Teste', taxa: 80, frequencia: 80, nota: 99 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status, 'BUG #7: nota acima de 10 aceita pelo backend').to.not.eq(200)
      })
    })
  })

  // ── HISTÓRICO API ──────────────────────────────────────────

  context('GET /api/coleta/historico', () => {
    it('API08 — Retorna 401 sem autenticação', () => {
      cy.request({
        url: '/api/coleta/historico',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.eq(401)
      })
    })

    it('BUG #16 — Histórico expõe coletas de outros usuários (IDOR)', () => {
      // BUG CONFIRMADO: usuário "user" consegue ver coletas de outros usuários.
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'user', password: 'user123' }
      })

      cy.request({
        url: '/api/coleta/historico',
        failOnStatusCode: false
      }).then(response => {
        if (response.status === 200) {
          const coletas = response.body.coletas || response.body
          if (Array.isArray(coletas) && coletas.length > 0) {
            const deOutros = coletas.filter(c =>
              (c.usuarioColeta || c.coletadoPor) !== 'user'
            )
            expect(deOutros.length, 'BUG #16: IDOR — coletas de outros usuários visíveis').to.be.greaterThan(0)
          }
        }
      })
    })
  })
})