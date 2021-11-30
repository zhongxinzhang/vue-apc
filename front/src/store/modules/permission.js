import { asyncRoutes, constantRoutes, componentMap } from '@/router'
import { getRoutes } from '@/api/auth'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

// 替换route对象中的component
function replaceComponent(comp) {
  if (comp.component && typeof (comp.component) === 'string') {
    comp.component = componentMap[comp.component]
  }

  if (comp.children && comp.children.length > 0) {
    for (let i = 0; i < comp.children.length; i++) {
      comp.children[i] = replaceComponent(comp.children[i])
    }
  }
  return comp
}

const actions = {
  // generateRoutes({ commit }, roles) {
  //   return new Promise(resolve => {
  //     // 定义一个变量，用来存放可以访问的路由表
  //     let accessedRoutes
  //     // 判断当前的角色列表中，是否有包含admin
  //     if (roles.includes('admin')) {
  //       // 所有路由都可以被访问，将ansyncRoutes改造成从数据库中获取
  //       accessedRoutes = asyncRoutes || []
  //     } else {
  //        // 根据角色，过滤掉不能访问的路由表
  //       accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
  //     }
  //      // commit
  //     commit('SET_ROUTES', accessedRoutes)
  //     // 成功返回
  //     resolve(accessedRoutes)
  //   })
  generateRoutes: async function({ commit }, roles) {
    // return new Promise(resolve => {
    //   // 定义一个变量，用来存放可以访问的路由表
    //   let accessedRoutes
    //   // 判断当前的角色列表中，是否有包含admin
    //   if (roles.includes('admin')) {
    //     // 所有路由都可以被访问，将ansyncRoutes改造成从数据库中获取
    //     accessedRoutes = asyncRoutes || []
    //   } else {
    //      // 根据角色，过滤掉不能访问的路由表
    //     accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
    //   }
    //    // commit
    //   commit('SET_ROUTES', accessedRoutes)
    //   // 成功返回
    //   resolve(accessedRoutes)
    // })

    // 从后台请求所有的路由信息
    const res = await getRoutes()
    // 定义一个变量，用来存放可以访问的路由表
    let myAsyncRoutes = res.data

    // 整理（替换组件名称，删除children）
    myAsyncRoutes = myAsyncRoutes.filter(curr => {
      if (curr.children == null || curr.children.length == 0) {
        delete curr.children
      }
      return replaceComponent(curr)
    })

    // 定义一个变量，用来存放可以访问的路由表
    let accessedRoutes
    // 判断当前的角色列表中，是否有包含admin
    if (roles.includes('admin')) {
      // 所有路由都可以被访问，将ansyncRoutes改造成从数据库中获取
      accessedRoutes = myAsyncRoutes || []
    } else {
      // 根据角色，过滤掉不能访问的路由表
      accessedRoutes = filterAsyncRoutes(myAsyncRoutes, roles)
    }
    // commit
    commit('SET_ROUTES', accessedRoutes)
    // 成功返回
    // resolve(accessedRoutes)
    return accessedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
