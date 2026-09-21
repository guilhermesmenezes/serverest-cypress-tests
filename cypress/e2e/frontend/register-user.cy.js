import RegisterPage from '../../pages/RegisterPage'
import { MESSAGES, ROUTES } from '../../support/constants'
import { generateUser, generateAdminUser } from '../../fixtures/users'
import AlertComponent from '../../pages/components/AlertComponent'

const validateAlert = (type, message) => {
  AlertComponent(type).contains(message).should('be.visible')
}

const validateUserCreated = (user) =>
  cy.searchUsers({ email: user.email }).then((body) => {
    const createdUser = body.usuarios.find((usuario) => usuario.email === user.email)
    expect(createdUser, `email ${user.email} deve existir na lista de usuários`).to.exist
    expect(createdUser.nome, 'nome persistido').to.eq(user.nome)
    expect(createdUser.administrador, 'administrador persistido').to.eq(user.administrador)
    return createdUser
  })

const validateRegisterStatus = (statusCode) => {
  cy.wait('@createUser').then(({ response }) => {
    expect(response.statusCode).to.eq(statusCode)
  })
}

describe('Frontend | User Registration', () => {
  let registeredEmail

  beforeEach(() => {
    registeredEmail = null
  })

  afterEach(() => {
    cy.cleanupUserByEmail(registeredEmail)
  })

  context('Valid registration', () => {
    it('should register a new user successfully and redirect to home', () => {
      const user = generateUser()
      registeredEmail = user.email
      RegisterPage.register(user)
      validateAlert('success', MESSAGES.registerSuccess)
      cy.url().should('include', ROUTES.home)
      validateUserCreated(user)
    })
  })

  context('Admin registration', () => {
    it('should register a new admin user and persist administrador as true', () => {
      const user = generateAdminUser()
      registeredEmail = user.email
      RegisterPage.register(user)
      validateAlert('success', MESSAGES.registerSuccess)
      cy.url().should('include', ROUTES.home)
      validateUserCreated(user)
    })
  })

  context('Duplicate email', () => {
    it('should prevent registering with an already existing email', () => {
      const user = generateUser()
      registeredEmail = user.email
      RegisterPage.register(user)
      validateAlert('success', MESSAGES.registerSuccess)
      cy.url().should('include', ROUTES.home)
      validateUserCreated(user)
      cy.intercept('POST', '**/usuarios').as('createUser')
      RegisterPage.register(user)
      validateAlert('error', MESSAGES.duplicateEmail)
      validateRegisterStatus(400)
      cy.url().should('include', ROUTES.register)
    })
  })

  context('Validation errors', () => {
    beforeEach(() => {
      cy.intercept('POST', '**/usuarios').as('createUser')
    })

    it('should display validation errors when required fields are empty', () => {
      RegisterPage.visit()
      RegisterPage.submit()
      validateAlert('error', MESSAGES.requiredName)
      validateAlert('error', MESSAGES.requiredEmail)
      validateAlert('error', MESSAGES.requiredPassword)
      validateRegisterStatus(400)
    })

    const REQUIRED_FIELD_CASES = [
      { field: 'nome', overrides: { nome: '' }, message: MESSAGES.requiredName },
      { field: 'email', overrides: { email: '' }, message: MESSAGES.requiredEmail },
      { field: 'password', overrides: { password: '' }, message: MESSAGES.requiredPassword },
    ]

    REQUIRED_FIELD_CASES.forEach(({ field, overrides, message }) => {
      it(`should display error for empty ${field}`, () => {
        const user = generateUser(overrides)
        RegisterPage.register(user)
        validateAlert('error', message)
        validateRegisterStatus(400)
      })
    })
  })
})
