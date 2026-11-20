describe('Smoke tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200')
  })

  it('affiche le logo et les liens du menu', () => {
    cy.get('[data-cy="nav-link-home-logo"] img')
      .should('be.visible')
      .and(($img) => {
       expect(($img[0] as HTMLImageElement).naturalWidth)
       .to.be.greaterThan(0)
      })

    const liens = [
      'nav-link-home',
      'nav-link-products',
      'nav-link-reviews',
      'nav-link-login',
      'nav-link-register'
    ]

    liens.forEach((lien) => {
      cy.get(`[data-cy="${lien}"]`).should('be.visible')
    })
  })

  it('ouvre le formulaire de connexion', () => {
    cy.get('[data-cy="nav-link-login"]').click()

    cy.location('hash').should('eq', '#/login')

    cy.get('[data-cy="login-input-username"]')
      .should('be.visible')
      .and('be.enabled')

    cy.get('[data-cy="login-input-password"]')
      .should('be.visible')
      .and('be.enabled')

    cy.get('[data-cy="login-submit"]')
      .should('be.visible')
      .and('be.enabled')
  })
  it('affiche le bouton d’ajout au panier après connexion', () => {
  cy.request('POST', 'http://localhost:8081/login', {
    username: 'test2@test.fr',
    password: 'testtest'
  }).then((response) => {
    cy.visit('http://localhost:4200/#/products/6', {
      onBeforeLoad(win) {
        win.localStorage.setItem('user', response.body.token)
      }
    })
  })

  cy.get('[data-cy="detail-product-name"]')
  .should('be.visible')
  .and('not.be.empty')

  cy.get('[data-cy="detail-product-add"]')
    .should('be.visible')
    .and('be.enabled')
    .and('contain.text', 'Ajouter au panier')
})
})