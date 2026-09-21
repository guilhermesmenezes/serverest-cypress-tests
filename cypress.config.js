const { defineConfig } = require('cypress')

module.exports = defineConfig({
  allowCypressEnv: false,
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 10000,
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://front.serverest.dev/',
    env: {
      apiUrl: process.env.CYPRESS_API_URL || 'https://serverest.dev',
    },
    video: true,
    videosFolder: 'cypress/videos',
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/mochawesome',
      overwrite: false,
      html: true,
      json: true,
    },
  },
})
