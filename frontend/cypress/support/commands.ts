/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(): Chainable<string>
    }
  }
}

Cypress.Commands.add('login', () => {
  return cy.fixture('utilisateur').then((utilisateur) => {
    return cy.request({
      method: 'POST',
      url: 'http://localhost:8081/login',
      body: utilisateur,
      log: false
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.token)
        .to.be.a('string')
        .and.not.be.empty

      return response.body.token
    })
  })
})

export {}