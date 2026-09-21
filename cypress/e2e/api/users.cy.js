import UsersService from '../../services/UsersService'
import { generateUser, generateAdminUser, uniqueSuffix } from '../../fixtures/users'
import { MESSAGES } from '../../support/constants'
import {
  assertSchema,
  expectEnvelope,
  userSchema,
  userListSchema,
  messageSchema,
  createdSchema,
  validationErrorSchema,
} from '../../support/schemas'

const API_MAX_RESPONSE_MS = 15000
const UNASSIGNED_ID = 'idInexistente123'

describe('API | Users (/usuarios)', () => {
  let createdUserIds

  beforeEach(() => {
    createdUserIds = []
  })

  afterEach(() => {
    createdUserIds.forEach((id) => cy.cleanupUserById(id))
  })

  const track = (id) => {
    createdUserIds.push(id)
    return id
  }

  const createUser = (overrides = {}) => {
    const userData = generateUser(overrides)
    return UsersService.create(userData).then((response) => {
      const body = expectEnvelope(response, 201, createdSchema, 'pre-condicao: usuario de apoio criado')
      return { userData, userId: track(body._id) }
    })
  }

  const expectUserToMatch = (id, expected) =>
    UsersService.getById(id).then((response) => {
      const user = expectEnvelope(response, 200, userSchema, 'usuario deve existir')
      expect(user._id, 'recurso retornado deve ser o solicitado').to.eq(id)
      expect(user.nome, 'nome persistido').to.eq(expected.nome)
      expect(user.email, 'email persistido').to.eq(expected.email)
      expect(user.administrador, 'administrador persistido').to.eq(expected.administrador)
    })

  const expectUserNotToExist = (id) =>
    UsersService.getById(id).then((response) => {
      const body = expectEnvelope(response, 400, messageSchema, 'usuario nao deve existir')
      expect(body.message).to.eq(MESSAGES.userNotFound)
    })

  const expectUserCount = (filter, expectedCount) =>
    cy.searchUsers(filter).then((body) => {
      assertSchema(userListSchema, body)
      expect(body.quantidade, `usuarios encontrados com ${JSON.stringify(filter)}`).to.eq(expectedCount)
    })

  context('POST /usuarios', () => {
    it('should create a user and persist the submitted data (201)', () => {
      const userData = generateAdminUser()
      UsersService.create(userData).then((response) => {
        const body = expectEnvelope(response, 201, createdSchema)
        expect(body.message).to.eq(MESSAGES.registerSuccess)
        expectUserToMatch(track(body._id), userData)
      })
    })

    it('should reject a duplicated email without creating a second user (400)', () => {
      createUser().then(({ userData }) => {
        UsersService.create(userData).then((response) => {
          const body = expectEnvelope(response, 400, messageSchema)
          expect(body.message).to.eq(MESSAGES.duplicateEmail)
        })
        expectUserCount({ email: userData.email }, 1)
      })
    })

    it('should reject an invalid email format without creating the user (400)', () => {
      const userData = generateUser({
        email: 'email-sem-arroba',
        nome: `Invalid Email Probe ${uniqueSuffix()}`,
      })
      UsersService.create(userData).then((response) => {
        const body = expectEnvelope(response, 400, validationErrorSchema)
        expect(body.email).to.eq(MESSAGES.apiInvalidEmail)
      })
      expectUserCount({ nome: userData.nome }, 0)
    })

    it('should return 400 listing every required field when the body is empty', () => {
      UsersService.create({}).then((response) => {
        const body = expectEnvelope(response, 400, validationErrorSchema)
        expect(body.nome).to.eq(MESSAGES.apiRequiredNome)
        expect(body.email).to.eq(MESSAGES.apiRequiredEmail)
        expect(body.password).to.eq(MESSAGES.apiRequiredPassword)
        expect(body.administrador).to.eq(MESSAGES.requiredAdministrador)
      })
    })
  })

  context('GET /usuarios', () => {
    it('should list users including one created by this test (200)', () => {
      createUser().then(({ userData }) => {
        UsersService.list().then((response) => {
          const body = expectEnvelope(response, 200, userListSchema)
          expect(response.headers['content-type']).to.include('application/json')
          expect(body.quantidade, 'quantidade deve refletir a lista devolvida').to.eq(body.usuarios.length)
        })
        expectUserCount({ email: userData.email }, 1)
      })
    })

    it('should return the user by ID (200)', () => {
      createUser().then(({ userData, userId }) => {
        expectUserToMatch(userId, userData)
      })
    })

    it('should return 400 for an ID that was never assigned', () => {
      expectUserNotToExist(UNASSIGNED_ID)
    })
  })

  context('PUT /usuarios/:id', () => {
    it('should update an existing user and persist the change (200)', () => {
      createUser().then(({ userId }) => {
        const updatedData = generateUser()
        UsersService.update(userId, updatedData).then((response) => {
          const body = expectEnvelope(response, 200, messageSchema)
          expect(body.message).to.eq(MESSAGES.userUpdated)
        })
        expectUserToMatch(userId, updatedData)
      })
    })

    it('should create a new user when the ID does not exist (201)', () => {
      const userData = generateUser()
      UsersService.update(UNASSIGNED_ID, userData).then((response) => {
        const body = expectEnvelope(response, 201, createdSchema, 'PUT em id inexistente cadastra o registro')
        expect(body.message).to.eq(MESSAGES.registerSuccess)
        expect(body._id, 'id gerado nao reaproveita o id da URL').to.not.eq(UNASSIGNED_ID)
        expectUserToMatch(track(body._id), userData)
      })
    })

    it('should reject an email already used by another user (400)', () => {
      createUser().then(({ userData: existingUser }) => {
        createUser().then(({ userData: targetData, userId: targetId }) => {
          const conflicting = { ...targetData, email: existingUser.email }
          UsersService.update(targetId, conflicting).then((response) => {
            const body = expectEnvelope(response, 400, messageSchema)
            expect(body.message).to.eq(MESSAGES.duplicateEmail)
          })
          expectUserToMatch(targetId, targetData)
        })
      })
    })

    it('should return 400 listing every required field when the body is empty', () => {
      createUser().then(({ userData, userId }) => {
        UsersService.update(userId, {}).then((response) => {
          const body = expectEnvelope(response, 400, validationErrorSchema)
          expect(body.nome).to.eq(MESSAGES.apiRequiredNome)
          expect(body.email).to.eq(MESSAGES.apiRequiredEmail)
          expect(body.password).to.eq(MESSAGES.apiRequiredPassword)
          expect(body.administrador).to.eq(MESSAGES.requiredAdministrador)
        })
        expectUserToMatch(userId, userData)
      })
    })
  })

  context('DELETE /usuarios/:id', () => {
    it('should delete the user and remove it from the API (200)', () => {
      createUser().then(({ userId }) => {
        UsersService.delete(userId).then((response) => {
          const body = expectEnvelope(response, 200, messageSchema)
          expect(body.message).to.eq(MESSAGES.userDeleted)
        })
        expectUserNotToExist(userId)
      })
    })
  })

  context('Smoke | SLA', () => {
    it(`should respond to GET /usuarios within ${API_MAX_RESPONSE_MS}ms`, () => {
      UsersService.list().then((response) => {
        expectEnvelope(response, 200, userListSchema)
        expect(response.duration, 'tempo de resposta da listagem').to.be.lessThan(API_MAX_RESPONSE_MS)
      })
    })
  })
})
