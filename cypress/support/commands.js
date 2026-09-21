import UsersService from '../services/UsersService'

Cypress.Commands.add('searchUsers', (filter) =>
  UsersService.search(filter).then((response) => {
    expect(response.status, 'GET /usuarios (busca) deve responder 200').to.eq(200)
    return response.body
  })
)

Cypress.Commands.add('cleanupUserById', (id) => {
  if (!id) return
  UsersService.delete(id).then(() =>
    UsersService.getById(id).then(({ body }) => {
      if (body._id) {
        cy.log(`⚠️ Usuário ${id} ainda existe após a tentativa de limpeza`)
      }
    })
  )
})

Cypress.Commands.add('cleanupUserByEmail', (email) => {
  if (!email) return
  UsersService.search({ email }).then((response) => {
    const [user] = response.body.usuarios
    if (user) cy.cleanupUserById(user._id)
  })
})
