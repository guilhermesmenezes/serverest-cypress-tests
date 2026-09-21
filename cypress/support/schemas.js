import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true })

export const assertSchema = (schema, data) => {
  const validate = ajv.compile(schema)
  const valid = validate(data)
  expect(valid, JSON.stringify(validate.errors)).to.eq(true)
}

export const expectEnvelope = (response, status, schema, label = 'resposta da API') => {
  expect(response.status, label).to.eq(status)
  assertSchema(schema, response.body)
  return response.body
}

export const userSchema = {
  type: 'object',
  required: ['_id', 'nome', 'email', 'password', 'administrador'],
  additionalProperties: false,
  properties: {
    _id: { type: 'string' },
    nome: { type: 'string' },
    email: { type: 'string' },
    password: { type: 'string' },
    administrador: { type: 'string', enum: ['true', 'false'] },
  },
}

export const userListSchema = {
  type: 'object',
  required: ['quantidade', 'usuarios'],
  properties: {
    quantidade: { type: 'integer', minimum: 0 },
    usuarios: { type: 'array', items: userSchema },
  },
}

export const messageSchema = {
  type: 'object',
  required: ['message'],
  additionalProperties: false,
  properties: {
    message: { type: 'string', minLength: 1 },
  },
}

export const createdSchema = {
  type: 'object',
  required: ['message', '_id'],
  additionalProperties: false,
  properties: {
    message: { type: 'string', minLength: 1 },
    _id: { type: 'string', minLength: 1 },
  },
}

export const validationErrorSchema = {
  type: 'object',
  minProperties: 1,
  additionalProperties: { type: 'string' },
}
