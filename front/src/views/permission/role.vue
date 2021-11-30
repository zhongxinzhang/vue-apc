<template>
  <div class="app-container">
    <!--第一部分，新建角色-->
    <el-button v-if="checkPermission(createRoleRoles)" type="primary" @click="handleAddRole">新建角色</el-button>

    <!--显示角色的列表-->
    <el-table :data="rolesList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色名称" width="160">
        <template slot-scope="scope">
          {{ scope.row.rlName }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="角色描述">
        <template slot-scope="scope">
          {{ scope.row.rlDesc }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Operations">
        <template slot-scope="scope">
          <el-button v-if="checkPermission(updateRouteRoles)" type="primary" size="small" @click="handleEdit(scope)">编辑角色和路由权限</el-button>
          <el-button v-if="checkPermission(updatePermRoles)" type="primary" size="small" @click="handleResourceEdit(scope)">编辑后端权限</el-button>
          <el-button v-if="checkPermission(deleteRoleRoles)" type="danger" size="small" @click="handleDelete(scope)">删除角色</el-button>

        </template>
      </el-table-column>
    </el-table>

    <!--显示角色信息， 路由表-->
    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'Edit Role':'New Role'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名称">
          <el-input v-model="role.rlName" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="role.rlDesc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
          />
        </el-form-item>
        <el-form-item label="路由树">
          <el-tree
            ref="tree"
            :check-strictly="checkStrictly"
            :data="routesData"
            :props="defaultProps"
            show-checkbox
            default-expand-all
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRole">提交</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="resourceDialogVisible" :title="'修改后台权限'">
      <el-form :model="role" label-width="80px" label-position="left">
        <el-form-item label="角色名称">
          <el-input v-model="role.rlName" placeholder="角色名称" :readonly="true" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input
            v-model="role.rlDesc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="角色描述"
            :readonly="true"
          />
        </el-form-item>
        <el-form-item label="后台权限">
          <el-tree
            ref="permTree"
            :check-strictly="checkStrictly"
            :data="resourceList"
            :props="permTreeDefaultProps"
            show-checkbox
            default-expand-all
            node-key="id"
            class="permission-tree"
          />
        </el-form-item>
      </el-form>

      <div style="text-align:right;">
        <el-button type="danger" @click="resourceDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmRolePermission">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import path from 'path'
import { deepClone } from '@/utils'
import { getRoles, addRole, deleteRole, updateRole, updateRolePermssions } from '@/api/role'
import { getRoutes, getOperateMenuRoleId } from '@/api/auth'
import { getResourceList } from '@/api/resource'
import checkPermission from '@/utils/permission' // 权限判断函数

// 定义一个角色对象（初始化）
const defaultRole = {
  rlId: 0,
  rlName: '',
  rlDesc: '',
  routes: [],
  checkedList: []
}

export default {
  data() {
    return {
      role: Object.assign({}, defaultRole), // 角色属性-绑定到角色表单上
      routes: [], // 存放当前角色拥有的路由
      rolesList: [], // 角色表个显示的角色集合
      dialogVisible: false, // 控制角色对话框是否可见
      resourceDialogVisible: false, // 控制资源对话框是否可见
      dialogType: 'new', // 角色对话框的title
      checkStrictly: false, // 父子节点 checkbox的选择是否关联
      defaultProps: { // 角色树
        children: 'children',
        label: 'title'
      },
      permTreeDefaultProps: { // 权限树
        children: 'permissionList',
        label: 'title'
      },
      createRoleRoles: [], // 哪些角色可以创建角色
      updateRouteRoles: [], // 哪些角色可以更新角色信息和给角色分配路由
      updatePermRoles: [], // 哪些角色可以修改后台权限
      deleteRoleRoles: [], // 哪些角色可以删除角色
      resourceList: []
    }
  },
  computed: {
    routesData() {
      return this.routes
    }
  },
  created() {
    // Mock: get all routes and roles list from server
    this.getRoutes()
    this.getRoles()
    this.getOperateRoles() // 获取能操作的角色
    this.getResourceList()
  },
  methods: {

    checkPermission, // 注册import的checkPermission方法
    async getResourceList() {
      const res = await getResourceList()
      this.resourceList = res.data // this.tinyResourceCheckedList(res.data)
      // 给resource和permssion添加title属性，以便于显示树
      this.resourceList.forEach(res => {
        res.id = 10000 + res.rscId
        res.title = res.rscName
        res.permissionList.forEach(perm => {
          perm.title = perm.prmName
          perm.id = perm.prmId
        })
      })
    },

    async getOperateRoles() {
      // 新建角色的角色集合
      let res = await getOperateMenuRoleId('createRole') // 获取能够操作“创建角色”功能的所有角色id
      this.createRoleRoles = res.data

      // 编辑路由的角色集合
      res = await getOperateMenuRoleId('updateRoleMenu')
      this.updateRouteRoles = res.data
      // 编辑后台权限的角色集合
      res = await getOperateMenuRoleId('updateRolePermission')
      this.updatePermRoles = res.data
      // 删除角色的角色集合
      res = await getOperateMenuRoleId('deleteRole')
      this.deleteRoleRoles = res.data
    },

    async getUpdateRoles() { // updateRolePermission
      const res = await getOperateMenuRoleId('updateRolePermission') // 获取能够操作“创建角色”功能的所有角色id
      this.updateRoleRoles = res.data
      console.log(this.updateRoleRoles)
    },

    // 获取路由树
    async getRoutes() {
      const res = await getRoutes()
      // 保存路由数据
      this.serviceRoutes = res.data
      // 将路由对象，整理成{path， title， id}
      this.routes = this.generateRoutes(res.data)
    },
    async getRoles() {
      const res = await getRoles()

      this.rolesList = res.data // this.tinyRoleCheckedList(res.data)
      // console.log(this.rolesList)
    },

    // Reshape the routes structure so that it looks the same as the sidebar
    generateRoutes(routes, basePath = '/') {
      const res = []

      for (const route of routes) {
        const data = {
          path: path.resolve(basePath, route.path),
          title: route.meta && route.meta.title,
          id: route.id
        }

        // recursive child routes
        if (route.children) {
          data.children = this.generateRoutes(route.children, data.path)
        }
        res.push(data)
      }
      return res
    },
    generateArr(routes) {
      let data = []
      routes.forEach(route => {
        // data.push(route)
        if (route.children) {
          const temp = this.generateArr(route.children)
          if (temp.length > 0) {
            data = [...data, ...temp]
          }
        } else {
          data.push(route.id)
        }
      })
      return data
    },
    handleAddRole() { // 响应添加角色的按钮
      this.role = Object.assign({}, defaultRole)
      if (this.$refs.tree) {
        this.$refs.tree.setCheckedNodes([])
      }
      this.dialogType = 'new'
      this.dialogVisible = true
    },
    handleEdit(scope) { // 响应编辑角色按钮
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.checkStrictly = true
      this.role = deepClone(scope.row)
      this.$nextTick(() => {
        // const routes = this.generateRoutes(this.role.routes)
        // this.$refs.tree.setCheckedNodes(this.generateArr(routes))
        // set checked state of a node not affects its father and child nodes
        const selectedKeys = this.generateArr(this.role.routes)
        this.$refs.tree.setCheckedKeys(selectedKeys)
        this.checkStrictly = false
      })
    },
    handleResourceEdit(scope) { // 响应分配角色权限按钮的点击
      const rowRole = deepClone(scope.row)
      this.role = rowRole
      this.resourceDialogVisible = true
      this.checkStrictly = false
      this.$nextTick(() => {
        const selectedKeys = []
        this.role.permissionList.forEach(perm => {
          selectedKeys.push(perm.prmId)
        })
        this.$refs.permTree.setCheckedKeys(selectedKeys)
      })
    },
    handleDelete({ $index, row }) { // 删除
      this.$confirm('确定要删除该角色吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          await deleteRole(row.rlId)
          this.rolesList.splice($index, 1)
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
        })
        .catch(err => { console.error(err) })
    },
    generateTree(routes, basePath = '/', checkedKeys) {
      const res = []

      for (const route of routes) {
        const routePath = path.resolve(basePath, route.path)

        // recursive child routes
        if (route.children) {
          route.children = this.generateTree(route.children, routePath, checkedKeys)
        }

        if (checkedKeys.includes(routePath) || (route.children && route.children.length >= 1)) {
          res.push(route)
        }
      }
      return res
    },
    async confirmRolePermission() { // 角色权限对话框的提交按钮
      // 获取选中的树id
      const selectedKeys = this.$refs.permTree.getCheckedKeys()
      this.role.permissionList = []
      if (selectedKeys.length > 0) {
        selectedKeys.forEach(key => {
          if (key < 10000) {
            this.role.permissionList.push({ prmId: key })
          }
        })
      }
      await updateRolePermssions(this.role)
      this.$message({
        type: 'success',
        message: '更新成功!'
      })
      this.getRoles()
    },
    async confirmRole() { // 维护角色信息和给角色分配路由的对话框
      const isEdit = this.dialogType === 'edit'
      // 获取选中权限树id
      const checkedKeys = this.$refs.tree.getCheckedKeys()
      // 根据checkedKeys，生成Menu对象数组
      if (checkedKeys) {
        const routes = []
        checkedKeys.forEach(key => {
          const obj = { id: key }
          routes.push(obj)
        })
        // 将menu对象数组，赋给要添加的role
        this.role.routes = routes
      }
      if (isEdit) { // 修改角色
        await updateRole(this.role.rlId, this.role)
        for (let index = 0; index < this.rolesList.length; index++) {
          if (this.rolesList[index].key === this.role.key) {
            this.rolesList.splice(index, 1, Object.assign({}, this.role))
            break
          }
        }
      } else { // 创建角色
        // 同步发送添加角色请求，获取添加成功的角色对象
        const { data } = await addRole(this.role)
        // 替换角色id（其它角色属性都是自己提交的，没必要更新）
        this.role.rlId = data.rlId
      }

      // 重新获取最新的角色列表
      await this.getRoles()
      const { rlDesc, rlId, rlName } = this.role
      this.dialogVisible = false
      // 提示操作结果
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>Role Key: ${rlId}</div>
            <div>Role Name: ${rlName}</div>
            <div>Description: ${rlDesc}</div>
          `,
        type: 'success'
      })
    },
    // reference: src/view/layout/components/Sidebar/SidebarItem.vue
    onlyOneShowingChild(children = [], parent) {
      let onlyOneChild = null
      const showingChildren = children.filter(item => !item.hidden)

      // When there is only one child route, the child route is displayed by default
      if (showingChildren.length === 1) {
        onlyOneChild = showingChildren[0]
        onlyOneChild.path = path.resolve(parent.path, onlyOneChild.path)
        return onlyOneChild
      }

      // Show parent if there are no child route to display
      if (showingChildren.length === 0) {
        onlyOneChild = { ... parent, path: '', noShowingChildren: true }
        return onlyOneChild
      }

      return false
    }
  }
}
</script>

<style lang="scss" scoped>
.app-container {
  .roles-table {
    margin-top: 30px;
  }
  .permission-tree {
    margin-bottom: 30px;
  }
}
</style>
