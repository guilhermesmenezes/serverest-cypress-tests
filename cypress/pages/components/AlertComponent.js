const SELECTOR_BY_TYPE = {
  error: '[role="alert"]',
  success: '.alert-primary',
}

export function AlertComponent(type) {
  const selector = SELECTOR_BY_TYPE[type]
  if (!selector) {
    throw new Error(`Tipo de alerta desconhecido: "${type}"`)
  }
  return cy.get(selector)
}

export default AlertComponent
