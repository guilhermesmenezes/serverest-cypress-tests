import { request } from '../support/httpClient'

const RESOURCE = '/usuarios'

const UsersService = {
  create(user) {
    return request({ method: 'POST', path: RESOURCE, body: user })
  },

  list() {
    return request({ method: 'GET', path: RESOURCE })
  },

  getById(id) {
    return request({ method: 'GET', path: `${RESOURCE}/${id}` })
  },

  search(params) {
    return request({ method: 'GET', path: `${RESOURCE}?${new URLSearchParams(params)}` })
  },

  update(id, user) {
    return request({ method: 'PUT', path: `${RESOURCE}/${id}`, body: user })
  },

  delete(id) {
    return request({ method: 'DELETE', path: `${RESOURCE}/${id}` })
  },
}

export default UsersService
