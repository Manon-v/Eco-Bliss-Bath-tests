describe('Connexion', () => {
  it('connecte un utilisateur avec des identifiants valides', () => {
    cy.intercept('POST', 'http://localhost:8081/login')
      .as('connexion')

    cy.visit('http://localhost:4200')
    cy.contains('a', 'Connexion').click()

    cy.get('[data-cy="login-input-username"]')
      .type('test2@test.fr')

    cy.get('[data-cy="login-input-password"]')
      .type('testtest', { log: false })

    cy.get('[data-cy="login-submit"]').click()

    cy.wait('@connexion')
      .its('response.statusCode')
      .should('eq', 200)

    cy.get('[data-cy="login-form"]').should('not.exist')
    cy.get('[data-cy="nav-link-cart"]')
  .should('be.visible')
  .and('contain.text', 'Mon panier')
  })

  it('refuse la connexion avec un mot de passe incorrect', () => {
  cy.intercept('POST', 'http://localhost:8081/login')
    .as('connexionRefusee')

  cy.visit('http://localhost:4200')
  cy.contains('a', 'Connexion').click()

  cy.get('[data-cy="login-input-username"]')
    .type('test2@test.fr')

  cy.get('[data-cy="login-input-password"]')
    .type('motdepasseincorrect', { log: false })

  cy.get('[data-cy="login-submit"]').click()

  cy.wait('@connexionRefusee')
    .its('response.statusCode')
    .should('eq', 401)

  cy.get('[data-cy="login-errors"]')
    .should('be.visible')
    .and('have.text', 'Identifiants incorrects')

  cy.get('[data-cy="login-form"]').should('be.visible')

  cy.window().then((win) => {
    expect(win.localStorage.getItem('user')).to.be.null
  })
})
})