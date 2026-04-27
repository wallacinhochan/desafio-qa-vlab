// cypress/e2e/api.cy.js
// Testes de API: health check, endpoints autenticados e não autenticados

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

    it('API02 — uptime deve ser um número positivo', () => {
      cy.request('GET', '/health').then(response => {
        expect(response.body.uptime).to.be.a('number')
        expect(response.body.uptime).to.be.greaterThan(0)
      })
    })

    it('API03 — timestamp deve ser uma data válida', () => {
      cy.request('GET', '/health').then(response => {
        const ts = new Date(response.body.timestamp)
        expect(ts.toString()).to.not.eq('Invalid Date')
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
      cy.request({
        method: 'POST',
        url: '/login',
        body: { username: 'admin', password: 'admin123' }
      }).then(response => {
        expect(response.body.user).to.not.have.property('password')
      })
    })

    it('API05 — Credenciais inválidas retornam erro 401', () => {
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

  context('POST /api/coleta', () => {
    beforeEach(() => {
      cy.login('admin', 'admin123')
    })

    it('API07 — Coleta válida retorna sucesso', () => {
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: {
          id: '1001',
          nome: 'Beneficiário Teste',
          taxa: 80,
          frequencia: 90,
          nota: 8,
          observacoes: 'Ótimo desempenho',
          status: 'completo'
        }
      }).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.success).to.be.true
      })
    })

    it('BUG #2 — Taxa negativa não deve ser aceita', () => {
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: { id: '1', nome: 'Teste', taxa: -50, frequencia: 80, nota: 7 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.not.eq(200)
      })
    })

    it('BUG #3 — Taxa acima de 100 não deve ser aceita', () => {
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: { id: '1', nome: 'Teste', taxa: 200, frequencia: 80, nota: 7 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.not.eq(200)
      })
    })

    it('BUG #7 — Nota acima de 10 não deve ser aceita', () => {
      cy.request({
        method: 'POST',
        url: '/api/coleta',
        body: { id: '1', nome: 'Teste', taxa: 80, frequencia: 80, nota: 99 },
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.not.eq(200)
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

    it('BUG #16 — Histórico deve filtrar apenas coletas do usuário logado', () => {
      cy.login('user', 'user123')
      cy.request('/api/coleta/historico').then(response => {
        const coletas = response.body.coletas || response.body
        if (Array.isArray(coletas)) {
          coletas.forEach(coleta => {
            expect(coleta.usuarioColeta || coleta.coletadoPor).to.eq('user')
          })
        }
      })
    })
  })
})