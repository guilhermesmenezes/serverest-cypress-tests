export const request = ({ method, path, body }) =>
  cy.env(['apiUrl']).then(({ apiUrl }) =>
    cy.request({
      method,
      url: `${apiUrl}${path}`,
      body,
      failOnStatusCode: false,
    })
  )
