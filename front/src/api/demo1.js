import request from '@/utils/request'

export function getUserList() {
  return request({
    baseURL: 'http://localhost:7080',
    url: `/user/search`,
    method: 'get'
  })
}
