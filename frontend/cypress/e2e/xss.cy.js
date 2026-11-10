describe('Sécurité des commentaires', () => {
  it('empêche l’exécution de JavaScript dans un commentaire', () => {
    const title = `Test XSS ${Date.now()}`
    const payload =
      '<img src="/image-xss-inexistante" onerror="window.__xssExecuted=true">'

    cy.request('POST', 'http://localhost:8081/login', {
      username: 'test2@test.fr',
      password: 'testtest'
    }).then((response) => {
      cy.intercept('GET', 'http://localhost:8081/reviews')
        .as('avis')
      cy.intercept('POST', 'http://localhost:8081/reviews')
        .as('publication')

      cy.visit('http://localhost:4200/#/reviews', {
        onBeforeLoad(win) {
          win.localStorage.setItem('user', response.body.token)
          win.__xssExecuted = false
        }
      })

      cy.wait('@avis')

      cy.get('[data-cy="review-input-rating-images"] img')
        .eq(4)
        .click()

      cy.get('[data-cy="review-input-title"]').type(title)

      cy.get('[data-cy="review-input-comment"]')
        .type(payload, { parseSpecialCharSequences: false })

      cy.get('[data-cy="review-submit"]').click()

      cy.wait('@publication')
        .its('response.statusCode')
        .should('eq', 200)

      cy.wait('@avis')

      // On vérifie aussi l’avis après rechargement.
      cy.reload()
      cy.wait('@avis')

      cy.contains('[data-cy="review-detail"]', title)
        .find('[data-cy="review-comment"]')
        .should('be.visible')
        .within(() => {
          cy.get('[onerror]').should('not.exist')
        })

      cy.window().then((win) => {
        expect(
          win.__xssExecuted,
          'aucune exécution du code injecté'
        ).not.to.eq(true)
      })
    })
  })
})