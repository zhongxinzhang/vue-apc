import request from '@/utils/request'

export function getRoles() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/role/search',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/role/create',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/role/update/${id}`,
    method: 'put',
    data
  })
}

export function updateRolePermssions(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/role/update/perms`,
    method: 'put',
    data
  })
}

export function deleteRole(id) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/role/delete/${id}`,
    method: 'delete'
  })
}
