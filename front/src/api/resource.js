import request from '@/utils/request'

export function getResourceList() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/resource/search',
    method: 'get'
  })
}

export function getResource(id) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/resource/search/${id}`,
    method: 'get'
  })
}

export function addResource(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/resource/create`,
    method: 'post',
    data
  })
}

export function updateResource(data) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/resource/update`,
    method: 'put',
    data
  })
}

export function deleteResource(id) {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/resource/delete/${id}`,
    method: 'delete'
  })
}
