## Lancer les tests Cypress

Démarrer le backend et la base de données avec Docker. Dans un terminal ouvert à la racine du projet, démarrer le frontend :

```powershell
cd frontend
npm start
```

Laisser le serveur tourner. Dans un deuxième terminal, depuis le dossier `frontend`, ouvrir l’interface Cypress :

```powershell
npx cypress open
```

## Générer le rapport de la campagne principale

Depuis le dossier `frontend`, exécuter les tests API, connexion, panier et smoke tests sur Edge :

```powershell
npx cypress run --browser edge --spec "cypress/e2e/api.cy.js,cypress/e2e/connexion.cy.js,cypress/e2e/panier.cy.js,cypress/e2e/smoke.cy.ts"
```

Mochawesome enregistre le rapport HTML dans `frontend/cypress/reports/index.html`.
Le récapitulatif des résultats est également affiché à la fin de l’exécution dans le terminal.

Le test d’ajout d’un produit en rupture échoue tant que l’API autorise cet ajout. L’anomalie est décrite dans le bilan de campagne.