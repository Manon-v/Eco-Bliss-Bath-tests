describe('Tests API', () => {
  const api = 'http://localhost:8081'
  let nettoyage

  const connexion = () => cy.request('POST', `${api}/login`, {
    username: 'test2@test.fr',
    password: 'testtest'
  })

  const lirePanier = (headers) => cy.request({
    method: 'GET',
    url: `${api}/orders`,
    headers
  })

  const trouverLigne = (panier, productId) =>
    panier.orderLines.find(
      (line) => line.product.id === productId
    )

  beforeEach(() => {
    nettoyage = null
  })

  afterEach(() => {
    if (!nettoyage) return

    const {
      headers,
      productId,
      initialQuantity,
      initialStock
    } = nettoyage

    lirePanier(headers).then(({ body }) => {
      const line = trouverLigne(body, productId)

      if (!line || line.quantity === initialQuantity) return

      cy.request({
        method: initialQuantity > 0 ? 'PUT' : 'DELETE',
        url: initialQuantity > 0
          ? `${api}/orders/${line.id}/change-quantity`
          : `${api}/orders/${line.id}/delete`,
        headers,
        ...(initialQuantity > 0
          ? { body: { quantity: initialQuantity } }
          : {})
      })
    })

    lirePanier(headers).then(({ body }) => {
      const line = trouverLigne(body, productId)

      expect(
        line ? line.quantity : 0,
        'quantité restaurée après nettoyage'
      ).to.eq(initialQuantity)
    })

    cy.request('GET', `${api}/products/${productId}`)
      .then(({ body }) => {
        expect(
          body.availableStock,
          'stock restauré après nettoyage'
        ).to.eq(initialStock)
      })
  })

  it('connecte un utilisateur avec des identifiants valides', () => {
    connexion().then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.token)
        .to.be.a('string').and.not.be.empty
    })
  })

  it('refuse la connexion avec des identifiants invalides', () => {
    cy.request({
      method: 'POST',
      url: `${api}/login`,
      failOnStatusCode: false,
      body: {
        username: 'inconnu@test.fr',
        password: 'motdepasseincorrect'
      }
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('refuse l’accès au panier sans connexion', () => {
    cy.request({
      method: 'GET',
      url: `${api}/orders`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(401)
    })
  })

  it('récupère le panier après connexion', () => {
    connexion().then(({ body }) => {
      const headers = {
        Authorization: `Bearer ${body.token}`
      }

      lirePanier(headers).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.orderLines).to.be.an('array')

        response.body.orderLines.forEach((line) => {
          expect(line.product.id).to.be.a('number')
          expect(line.product.name)
            .to.be.a('string').and.not.be.empty
          expect(line.quantity)
            .to.be.a('number').and.be.greaterThan(0)
        })
      })
    })
  })

  it('récupère la fiche du produit demandé', () => {
    cy.request('GET', `${api}/products/6`)
      .then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.id).to.eq(6)
        expect(response.body.name).to.eq('Dans la forêt')
        expect(response.body.price).to.be.a('number')
        expect(response.body.availableStock)
          .to.be.a('number')
      })
  })

  // Prépare un ajout et mémorise l’état à restaurer.
  function preparerAjout(productId, disponible) {
    return connexion().then(({ body }) => {
      const headers = {
        Authorization: `Bearer ${body.token}`
      }

      return cy.request('GET', `${api}/products/${productId}`)
        .then(({ body: product }) => {
          if (disponible) {
            expect(product.availableStock).to.be.greaterThan(0)
          } else {
            expect(product.availableStock).to.be.at.most(0)
          }

          return lirePanier(headers).then(({ body: panier }) => {
            const line = trouverLigne(panier, productId)
            const initialQuantity = line ? line.quantity : 0

            nettoyage = {
              headers,
              productId,
              initialQuantity,
              initialStock: product.availableStock
            }

            return cy.wrap({ headers, initialQuantity })
          })
        })
    })
  }

  it('ajoute un produit disponible au panier', () => {
    preparerAjout(5, true).then(({ headers, initialQuantity }) => {
      cy.request({
        method: 'PUT',
        url: `${api}/orders/add`,
        headers,
        body: {
          product: 5,
          quantity: 1
        }
      }).then((response) => {
        expect(response.status).to.eq(200)

        const line = trouverLigne(response.body, 5)
        expect(line, 'produit présent dans la réponse').to.exist
        expect(line.quantity).to.eq(initialQuantity + 1)
      })

      lirePanier(headers).then(({ body }) => {
        const line = trouverLigne(body, 5)
        expect(line, 'ajout enregistré dans le panier').to.exist
        expect(line.quantity).to.eq(initialQuantity + 1)
      })
    })
  })

  it('n’ajoute pas un produit en rupture de stock au panier', () => {
    preparerAjout(4, false).then(({ headers, initialQuantity }) => {
      cy.request({
        method: 'PUT',
        url: `${api}/orders/add`,
        headers,
        body: {
          product: 4,
          quantity: 1
        },
        failOnStatusCode: false
      })

      lirePanier(headers).then(({ body }) => {
        const line = trouverLigne(body, 4)

        expect(
          line ? line.quantity : 0,
          'quantité inchangée pour le produit en rupture'
        ).to.eq(initialQuantity)
      })
    })
  })

  it('crée un avis après connexion', () => {
    const review = {
      title: `Avis Cypress ${Date.now()}`,
      comment: 'Produit agréable à utiliser.',
      rating: 5
    }

    connexion().then(({ body }) => {
      cy.request({
        method: 'POST',
        url: `${api}/reviews`,
        headers: {
          Authorization: `Bearer ${body.token}`
        },
        body: review
      }).then((response) => {
        expect(response.status).to.eq(200)
        expect(response.body.id).to.be.a('number')
        expect(response.body.title).to.eq(review.title)
        expect(response.body.comment).to.eq(review.comment)
        expect(response.body.rating).to.eq(review.rating)
      })
    })
  })
})