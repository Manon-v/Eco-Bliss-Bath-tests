## Lancer les tests Cypress

Démarrer le backend et la base de données avec Docker.

Dans un terminal ouvert à la racine du projet, démarrer le frontend :

```powershell
cd frontend
npm start
```

Laisser le serveur tourner.

Dans un deuxième terminal, depuis le dossier `frontend`, ouvrir l'interface Cypress :

```powershell
npx cypress open
```

Sélectionner le mode **E2E Testing**, puis le navigateur souhaité pour exécuter les tests.

## Tests automatisés

La campagne comprend **19 tests répartis dans 6 fichiers** :

| Fichier | Nombre de tests | Vérifications |
|---|---:|---|
| `api.cy.js` | 8 | Connexion API, accès aux commandes, consultation des produits, gestion du panier et création d'avis |
| `connexion.cy.js` | 2 | Connexion valide et refus des identifiants incorrects |
| `panier.cy.js` | 3 | Ajout de produits, quantités et gestion du stock |
| `produits.cy.js` | 2 | Affichage des produits sur l'accueil et consultation des fiches détaillées |
| `smoke.cy.ts` | 3 | Présence des éléments essentiels de l'interface |
| `xss.cy.js` | 1 | Vérification de la non-exécution d'un code JavaScript inséré dans un commentaire |

## Générer le rapport de la campagne complète

Depuis le dossier `frontend`, exécuter tous les tests Cypress :

```powershell
npx cypress run
```

Pour exécuter la campagne sur Microsoft Edge :

```powershell
npx cypress run --browser edge
```

Mochawesome génère le rapport HTML à l'emplacement :

`frontend/cypress/reports/index.html`

Le récapitulatif des résultats est également affiché à la fin de l'exécution dans le terminal.

## Résultats de la campagne du 20 novembre 2026

La campagne complète a exécuté **19 tests** :

- **18 tests réussis**
- **1 test en échec**

Le test en échec concerne l'ajout d'un produit en rupture de stock. L'API renvoie un statut HTTP `200` et augmente la quantité dans le panier, alors que l'ajout devrait être refusé.

D'autres observations ont été relevées : une valeur de stock négative affichée sur une fiche produit et un problème d'encodage de caractères accentués dans un nom de produit.

Ces anomalies et observations sont détaillées dans le bilan de campagne de test.

Le test XSS vérifie que le code JavaScript inséré dans un commentaire ne s'exécute pas dans le navigateur lors du scénario testé.