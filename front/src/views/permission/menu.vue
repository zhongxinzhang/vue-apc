<template>
  <div class="app-container">
    <p>管理动态路由</p>
    <el-button type="primary" @click="addFirst">添加第一级路由</el-button>
    <!--
      data: 树要显示的数据
           [
             {
               id,
               title,
               ...
               children:[
                {id, title},...
               ]
             },
             {},
             {}
           ]
      node-key: 指定标识树节点的data属性
      default-expand-all: tree的节点是展开状态
      props：树显示的基本属性（树节点显示的数据，同data里面的对象属性的对应）
    -->
    <el-tree
      :data="data"
      node-key="id"
      default-expand-all
      :props="defaultProps"
      :expand-on-click-node="false"
    >
      <span slot-scope="{ node, data }" class="custom-tree-node">
        <span>{{ node.label }}</span>
        <span>
          <svg-icon v-if="!convertToBool(data.hidden)" icon-class="eye-open" />
          <svg-icon v-else icon-class="eye" />
          <el-button
            v-if="!data.parentId || data.parentId == 0"
            type="text"
            size="mini"
            @click="() => append(data)"
          >
            添加子路由
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="() => edit(data)"
          >
            修改路由
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="() => remove(data)"
          >
            删除路由
          </el-button>
        </span>
      </span>
    </el-tree>
    <!--新建一级路由，新建子路由，编辑路由-->
    <el-dialog :visible.sync="dialogVisible" :title="dialogTitle">
      <el-form :model="permission" label-width="100px" label-position="left">
        <el-form-item label="路径">
          <el-input v-model="permission.path" placeholder="路由path" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="permission.name" placeholder="路由名称" />
        </el-form-item>
        <el-form-item label="组件名称">
          <el-input v-model="permission.component" placeholder="组件名称" />
        </el-form-item>
        <el-form-item label="重定向路径">
          <el-input v-model="permission.redirect" placeholder="重定向路径" />
        </el-form-item>
        <el-form-item label="主题">
          <el-input v-model="permission.meta.title" placeholder="路由主题" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="permission.meta.icon" placeholder="路由图标" />
        </el-form-item>
        <el-form-item label="高亮菜单">
          <el-input v-model="permission.meta.activeMenu" placeholder="高亮菜单" />
        </el-form-item>

        <el-checkbox v-model="permission.hidden" label="隐藏" />
        <el-checkbox v-model="permission.alwaysShow" label="总是显示" />
        <el-checkbox v-model="permission.meta.noCache" label="显示缓存" />
        <el-checkbox v-model="permission.meta.affix" label="affix" />
        <el-checkbox v-model="permission.meta.breadcrumb" label="面包屑" />
      </el-form>

      <br>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="comfirmMenu">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMenuTree, addMenu, editMenu, deleteMenu } from '@/api/menu'
import { deepClone } from '@/utils'
import { getInfo } from '@/api/auth'

const id = 1000

const defaultPermisson = {
  id: '',
  parentId: 0,
  path: '',
  name: '',
  component: 'layout',
  redirect: '',
  hidden: false,
  alwaysShow: true,
  meta: {
    id: '',
    title: '',
    icon: '',
    noCache: false,
    affix: false,
    breadcrumb: false,
    activeMenu: '',
    mnId: ''
  }
}

export default {
  data() {
    return {
      permission: Object.assign({}, defaultPermisson),
      data: [],
      dialogVisible: false,
      dialogType: 'new',
      dialogTitle: '新增一级菜单',
      defaultProps: {
        children: 'children',
        label: 'title'
      }
    }
  },

  created() {
    this.getMenuData()
  },

  methods: {
    append(data) {
      this.dialogType = 'new'
      this.dialogTitle = '新增<' + data.title + '>的子菜单'
      this.dialogVisible = true
      this.permission = deepClone(defaultPermisson)
      this.permission.parentId = data.id
      // const newChild = { id: id++, label: 'testtest', children: [] };
      // if (!data.children) {
      //   this.$set(data, 'children', []);
      // }
      // data.children.push(newChild);
    },

    remove(data) {
      this.$confirm('确定要删除该菜单吗(子菜单会一起删除)?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteMenu(data.id)
        this.getMenuData()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
        .catch(err => { console.error(err) })
      // const parent = node.parent;
      // const children = parent.data.children || parent.data;
      // const index = children.findIndex(d => d.id === data.id);
      // children.splice(index, 1);
    },

    edit(data) {
      this.dialogType = 'edit'
      this.dialogTitle = '修改<' + data.title + '>菜单'
      this.permission = data
      this.dialogVisible = true
    },

    addFirst() {
      this.permission = deepClone(defaultPermisson)
      this.dialogType = 'new'
      this.dialogVisible = true
      this.dialogTitle = '新增一级菜单'
    },

    async comfirmMenu() {
      if (this.dialogType === 'edit') {
        // 修改菜单信息
        // 整理boolean属性
        const submitMenu = deepClone(this.permission)
        // 删除子菜单（子菜单不一起更新）
        delete submitMenu.children
        submitMenu.hidden = this.convertToNumber(submitMenu.hidden)
        submitMenu.alwaysShow = this.convertToNumber(submitMenu.alwaysShow)
        submitMenu.meta.noCache = this.convertToNumber(submitMenu.meta.noCache)
        submitMenu.meta.affix = this.convertToNumber(submitMenu.meta.affix)
        submitMenu.meta.breadcrumb = this.convertToNumber(submitMenu.meta.breadcrumb)

        await editMenu(submitMenu)
          .then(() => {
            this.$message({
              type: 'success',
              message: '修改成功!'
            })
          })
          .catch(err => {
            this.$message({
              type: 'error',
              message: '修改失败!'
            })
          })
      } else {
        // 添加菜单信息
        // 整理boolean属性
        const submitMenu = deepClone(this.permission)

        submitMenu.hidden = this.convertToNumber(submitMenu.hidden)
        submitMenu.alwaysShow = this.convertToNumber(submitMenu.alwaysShow)
        submitMenu.meta.noCache = this.convertToNumber(submitMenu.meta.noCache)
        submitMenu.meta.affix = this.convertToNumber(submitMenu.meta.affix)
        submitMenu.meta.breadcrumb = this.convertToNumber(submitMenu.meta.breadcrumb)

        await addMenu(submitMenu).then(() => {
          this.$message({
            type: 'success',
            message: '添加成功!'
          })
        }
        ).catch(err => {
          this.$message({
            type: 'success',
            message: '添加失败!'
          })
        })
      }
      this.dialogVisible = false
      this.getMenuData()
      this.permission = defaultPermisson
    },

    async getMenuData() {
      // 请求后端，获取动态路由tree
      const res = await getMenuTree()
      // 按el-tree组件的要求，整理数据结构
      this.data = this.generateRoutes(res.data)
    },

    generateRoutes(routes) {
      const res = []

      for (const route of routes) {
        const data = route
        // 将路由里面的title元数据，赋给data的title属性
        data.title = route.meta && route.meta.title

        // 将路由里面的相关属性的值，改成boolean类型
        data.hidden = this.convertToBool(data.hidden)
        data.alwaysShow = this.convertToBool(data.alwaysShow)
        data.meta.noCache = this.convertToBool(data.meta.noCache)
        data.meta.affix = this.convertToBool(data.meta.affix)
        data.meta.breadcrumb = this.convertToBool(data.meta.breadcrumb)

        // 递归子路由
        if (route.children) {
          data.children = this.generateRoutes(route.children)
        }
        res.push(data)
      }
      return res
    },
    convertToBool(v) {
      return v != 0
    },
    convertToNumber(v) {
      return v ? 1 : 0
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
.custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
}
</style>
