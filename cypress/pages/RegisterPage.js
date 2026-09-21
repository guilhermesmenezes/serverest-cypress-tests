import { ROUTES } from '../support/constants'

class RegisterPage {
  get nameInput() { return cy.get('[data-testid="nome"]') }
  get emailInput() { return cy.get('[data-testid="email"]') }
  get passwordInput() { return cy.get('[data-testid="password"]') }
  get adminCheckbox() { return cy.get('[data-testid="checkbox"]') }
  get registerButton() { return cy.get('[data-testid="cadastrar"]') }

  visit() {
    cy.visit(ROUTES.register)
  }

  fillForm({ nome, email, password, administrador }) {
    if (nome) this.nameInput.type(nome)
    if (email) this.emailInput.type(email)
    if (password) this.passwordInput.type(password)
    if (administrador === 'true') this.adminCheckbox.check()
  }

  submit() {
    this.registerButton.click()
  }

  register(user) {
    this.visit()
    this.fillForm(user)
    this.submit()
  }
}

export default new RegisterPage()
