import request from '@/utils/request'

export function getMenuTree() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/menu/search/tree',
    method: 'get'
  })
}

export function addMenu(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/menu/create',
    method: 'post',
    data
  })
}

export function editMenu(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/menu/update',
    method: 'put',
    data
  })
}

export function deleteMenu(id) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/menu/delete/${id}`,
    method: 'delete'
  })
}
