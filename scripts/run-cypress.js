const cypress = require('cypress')
const fs = require('fs')
const path = require('path')

const browser = process.argv[2]
if (!browser) {
  console.error('Uso: node scripts/run-cypress.js <browser>')
  process.exit(1)
}

const REPORTS_DIR = 'cypress/reports'

cypress
  .run({ browser, reporter: 'mochawesome' })
  .then((results) => {
    if (results.status === 'failed') {
      console.error(results.message)
      process.exit(1)
    }

    const flakyTests = results.runs.flatMap((run) =>
      run.tests
        .filter((test) => test.attempts.length > 1 && test.state === 'passed')
        .map((test) => ({
          spec: run.spec.relative,
          title: test.title.join(' > '),
          attempts: test.attempts.length,
        }))
    )

    fs.mkdirSync(REPORTS_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(REPORTS_DIR, `flaky-${browser}.json`),
      JSON.stringify(flakyTests, null, 2)
    )

    if (flakyTests.length > 0) {
      console.warn(`\n⚠️  ${flakyTests.length} teste(s) só passaram após retry em ${browser}:`)
      flakyTests.forEach((test) =>
        console.warn(`   - [${test.spec}] ${test.title} (${test.attempts} tentativas)`)
      )
    }

    process.exit(results.totalFailed > 0 ? 1 : 0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
