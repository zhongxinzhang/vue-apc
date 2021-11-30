<template>
  <div class="app-container">
    <p>管理后台权限资源</p>
    <el-button type="primary" @click="handleNew">添加新资源</el-button>
    <el-table
      :data="resourceList"
      style="width: 100%"
      :row-class-name="tableRowClassName"
    >
      <el-table-column
        type="index"
        width="50"
      />
      <el-table-column
        prop="rscName"
        label="资源名称"
        width="200"
      />
      <el-table-column
        prop="rscUrl"
        label="资源url"
        width="200"
      />
      <el-table-column
        prop="rscDesc"
        label="资源描述"
        width="200"
      />
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :visible.sync="dialogVisible" :title="dialogType==='edit'?'修改资源':'创建资源'">
      <el-form :model="resource" label-width="80px" label-position="left">
        <el-form-item label="资源名称">
          <el-input v-model="resource.rscName" />
        </el-form-item>
        <el-form-item label="资源Url">
          <el-input v-model="resource.rscUrl" />
        </el-form-item>
        <el-form-item label="资源描述">
          <el-input
            v-model="resource.rscDesc"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
          />
        </el-form-item>
        <el-form-item label="操作权限">
          <el-checkbox-group v-model="permOperatorNames">
            <el-checkbox v-for="(operate, index) in operateList" :key="index" :label="operate.optName" />
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div style="text-align:right;">
        <el-button type="danger" @click="dialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmResource">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getResourceList, getResource, addResource, updateResource, deleteResource } from '@/api/resource'
import { getOperateList } from '@/api/operate'
import { deepClone } from '@/utils'

const defaultResource = {
  rscId: 0,
  rscName: '',
  rscUrl: '',
  rscDesc: '',
  permissionList: []
}

export default {
  data() {
    return {
      resource: Object.assign({}, defaultResource),
      dialogVisible: false,
      dialogType: 'new',
      resourceList: [],
      operateList: [],
      permOperatorNames: []
    }
  },

  created() {
    this.getResourceList()
    this.getOperateList()
  },

  methods: {
    async getOperateList() {
      const res = await getOperateList()
      this.operateList = res.data
    },

    async getResourceList() {
      const res = await getResourceList()
      this.resourceList = res.data
    },

    tableRowClassName({ row, rowIndex }) {
      if (rowIndex === 1) {
        return 'warning-row'
      } else if (rowIndex === 3) {
        return 'success-row'
      }
      return ''
    },
    handleNew() {
      this.dialogType = 'new'
      this.resource = Object.assign({}, defaultResource)
      this.permOperatorNames.splice(0, this.permOperatorNames.length)
      this.dialogVisible = true
    },
    handleEdit(index, row) {
      this.dialogType = 'edit'
      this.dialogVisible = true
      this.resource = row
      this.permOperatorNames.splice(0, this.permOperatorNames.length)
      this.resource.permissionList.forEach(element => {
        this.permOperatorNames.push(element.operator.optName)
      })
    },
    handleDelete(index, row) {
      console.log(index, row)
      this.$confirm('确定要删除该角色吗?', 'Warning', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        await deleteResource(row.rscId)
        this.getResourceList()
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      })
        .catch(err => { console.error(err) })
    },
    async confirmResource() {
      const perms = this.generateResourcePerms(this.resource, this.permOperatorNames)
      this.resource.permissionList = perms
      if (this.dialogType == 'edit') {
        // 修改资源
        await updateResource(this.resource)
      } else {
        // 新增资源
        await addResource(this.resource)
      }
      this.dialogVisible = false
      const { rscName, rscUrl, rscDesc } = this.resource
      this.$notify({
        title: 'Success',
        dangerouslyUseHTMLString: true,
        message: `
            <div>资源名称: ${rscName}</div>
            <div>资源url: ${rscUrl}</div>
            <div>资源描述: ${rscDesc}</div>
          `,
        type: 'success'
      })
      // 更新最新资源列表
      this.getResourceList()
    },

    generateResourcePerms(resource, operateNames) {
      const perms = []
      operateNames.forEach(element => {
        perms.push(this.generatePermission(resource, element))
      })
      return perms
    },

    generatePermission(resource, operateName) {
      const perm = { rscId: resource.rscId, prmName: '', optId: 0 }
      perm.prmName = operateName + resource.rscName
      this.operateList.forEach(element => {
        if (element.optName === operateName) {
          perm.optId = element.optId
          return
        }
      })
      return perm
    }
  }
}
</script>

<style>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
