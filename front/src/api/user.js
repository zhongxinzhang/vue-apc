import request from '@/utils/request'

export function login(data) {
  return request({
    baseURL: 'http://localhost:7080',
    // '/vue-element-admin/user/login',
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/auth/info', //  '/vue-element-admin/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/auth/logout',
    method: 'post'
  })
}

export function getUserList() {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/user/search`,
    method: 'get'
  })
}

export function assignUserRoles(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/user/update/roles`,
    method: 'put',
    data
  })
}
