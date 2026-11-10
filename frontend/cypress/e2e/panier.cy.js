describe('Panier', () => {
  const api = 'http://localhost:8081'
  const site = 'http://localhost:4200'
  const productId = 5

  let token
  let initialQuantity
  let initialStock

  const lirePanier = () => cy.request({
    method: 'GET',
    url: `${api}/orders`,
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const trouverLigne = (panier) => panier.orderLines.find(
    (line) => line.product.id === productId
  )

  beforeEach(() => {
    token = null
    initialQuantity = undefined
    initialStock = undefined

    cy.request('POST', `${api}/login`, {
      username: 'test2@test.fr',
      password: 'testtest'
    }).then(({ body }) => {
      token = body.token

      lirePanier().then(({ body }) => {
        const line = trouverLigne(body)
        initialQuantity = line ? line.quantity : 0
      })
    })

    cy.intercept('GET', `${api}/products/${productId}`)
      .as('produit')
    cy.intercept('PUT', `${api}/orders/add`)
      .as('ajoutPanier')

    cy.then(() => {
      cy.visit(`${site}/#/products/${productId}`, {
        onBeforeLoad(win) {
          win.localStorage.setItem('user', token)
        }
      })
    })

    cy.wait('@produit').then(({ response }) => {
      initialStock = response.body.availableStock
    })
  })

  afterEach(() => {
    // On nettoie aussi si une assertion du test a échoué.
    if (
      !token ||
      initialQuantity === undefined ||
      initialStock === undefined
    ) return

    lirePanier().then(({ body }) => {
      const line = trouverLigne(body)

      if (!line || line.quantity === initialQuantity) return

      cy.request({
        method: initialQuantity > 0 ? 'PUT' : 'DELETE',
        url: initialQuantity > 0
          ? `${api}/orders/${line.id}/change-quantity`
          : `${api}/orders/${line.id}/delete`,
        headers: {
          Authorization: `Bearer ${token}`
        },
        ...(initialQuantity > 0
          ? { body: { quantity: initialQuantity } }
          : {})
      })
    })

    lirePanier().then(({ body }) => {
      const line = trouverLigne(body)
      expect(
        line ? line.quantity : 0,
        'quantité initiale restaurée'
      ).to.eq(initialQuantity)
    })

    cy.request('GET', `${api}/products/${productId}`)
      .then(({ body }) => {
        expect(
          body.availableStock,
          'stock initial restauré'
        ).to.eq(initialStock)
      })
  })

  // Même parcours, vérifié avec deux quantités différentes.
  ;[1, 21].forEach((quantity) => {
    it(`ajoute ${quantity} unité(s) et vérifie panier et stock`, () => {
      cy.then(() => {
        expect(
          initialStock,
          'stock suffisant pour ce scénario'
        ).to.be.at.least(quantity)
      })

      cy.get('[data-cy="detail-product-stock"]')
        .should('be.visible')

      cy.get('[data-cy="detail-product-quantity"]')
        .clear()
        .type(String(quantity))

      cy.get('[data-cy="detail-product-add"]').click()

      cy.wait('@ajoutPanier')
        .its('response.statusCode')
        .should('eq', 200)

      cy.location('hash').should('eq', '#/cart')

      lirePanier().then(({ body }) => {
        const line = trouverLigne(body)

        expect(line, 'produit présent via API').to.exist
        expect(line.quantity)
          .to.eq(initialQuantity + quantity)

        cy.contains(
          '[data-cy="cart-line"]',
          'Poussière de lune'
        )
          .find('[data-cy="cart-line-quantity"]')
          .should(
            'have.value',
            String(initialQuantity + quantity)
          )
      })

      cy.visit(`${site}/#/products/${productId}`)

      cy.wait('@produit').then(({ response }) => {
        const expectedStock = initialStock - quantity

        expect(
          response.body.availableStock,
          'stock diminué de la quantité ajoutée'
        ).to.eq(expectedStock)

        cy.get('[data-cy="detail-product-stock"]')
          .should('contain.text', `${expectedStock} en stock`)
      })
    })
  })

  it('refuse une quantité négative sans modifier le panier', () => {
    cy.get('[data-cy="detail-product-quantity"]')
      .clear()
      .type('-1')

    cy.get('[data-cy="detail-product-add"]').click()

    cy.location('hash').should('eq', '#/products/5')

    lirePanier().then(({ body }) => {
      const line = trouverLigne(body)

      expect(
        line ? line.quantity : 0,
        'panier inchangé'
      ).to.eq(initialQuantity)
    })

    cy.request('GET', `${api}/products/${productId}`)
      .then(({ body }) => {
        expect(body.availableStock).to.eq(initialStock)
      })
  })
})