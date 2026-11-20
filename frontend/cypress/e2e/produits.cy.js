
describe('Test fonctionnel - Affichage des produits', () => {
  it('affiche les produits et leurs informations sur la page d’accueil', () => {
    cy.visit('http://localhost:4200')

    cy.get('[data-cy="product-home"]')
      .should('have.length.greaterThan', 0)
      .each(($produit) => {
        cy.wrap($produit).within(() => {
          cy.get('[data-cy="product-home-img"]')
            .should('be.visible')
            .and(($img) => {
              expect($img[0].naturalWidth).to.be.greaterThan(0)
            })

          cy.get('[data-cy="product-home-name"]')
            .should('be.visible')
            .and('not.be.empty')

          cy.get('[data-cy="product-home-ingredients"]')
            .should('be.visible')
            .and('not.be.empty')

          cy.get('[data-cy="product-home-price"]')
            .should('be.visible')
            .and('contain.text', '€')

          cy.get('[data-cy="product-home-link"]')
            .should('be.visible')
            .and('contain.text', 'Consulter')
        })
      })
  })


it('affiche les informations détaillées de chaque produit', () => {
  cy.visit('http://localhost:4200/#/products')

  cy.get('[data-cy="product-link"]').then(($boutons) => {
    const nombreProduits = $boutons.length

    expect(nombreProduits).to.be.greaterThan(0)

    for (let index = 0; index < nombreProduits; index++) {
      cy.visit('http://localhost:4200/#/products')

      cy.get('[data-cy="product-link"]')
        .eq(index)
        .click()

      cy.location('hash')
        .should('match', /^#\/products\/\d+$/)

      cy.get('[data-cy="detail-product-img"]')
        .should('be.visible')
        .and(($img) => {
          expect($img[0].naturalWidth).to.be.greaterThan(0)
        })

      cy.get('[data-cy="detail-product-name"]')
        .should('be.visible')
        .and('not.be.empty')

      cy.get('[data-cy="detail-product-description"]')
        .should('be.visible')
        .and('not.be.empty')

      cy.get('[data-cy="detail-product-price"]')
        .should('be.visible')
        .and('contain.text', '€')

      cy.get('[data-cy="detail-product-stock"]')
     .should('be.visible')
     .invoke('text')
     .should('match', /^\s*-?\d+ en stock\s*$/)
    }
  })
})

})
