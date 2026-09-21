import { faker } from '@faker-js/faker'

const sanitizeForEmail = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '')

export const uniqueSuffix = () => `${Date.now()}${faker.number.int({ min: 100, max: 999 })}`

export const generateUser = (overrides = {}) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()

  return {
    nome: `${firstName} ${lastName}`,
    email: `${sanitizeForEmail(firstName)}.${sanitizeForEmail(lastName)}.${uniqueSuffix()}@test.com`,
    password: faker.internet.password({ length: 12 }),
    administrador: 'false',
    ...overrides,
  }
}

export const generateAdminUser = (overrides = {}) => {
  return generateUser({
    administrador: 'true',
    ...overrides,
  })
}
