import request from '@/utils/request'

export function getOperateList() {
  return request({
    baseURL: 'http://localhost:7080',
    url: '/operate/search',
    method: 'get'
  })
}
