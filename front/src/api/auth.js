import request from '@/utils/request'

export function getRoutes() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/auth/routes',
    method: 'get'
  })
}

export function getOperateMenuRoleId(mnName) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/auth/search/${mnName}`,
    method: 'get'
  })
}

export function login(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/auth/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/auth/info',
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
