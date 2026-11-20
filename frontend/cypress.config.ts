import { defineConfig } from 'cypress'

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',

  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'Eco Bliss Bath — Résultats des tests',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
  },

  env: {
    apiUrl: 'http://localhost:8081',
  },

  e2e: {
    baseUrl: 'http://localhost:4200',

    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on)
      return config
    },
  },
})