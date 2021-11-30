<template>
  <div class="app-container">
    <el-table :data="userList" style="width: 100%;margin-top:30px;" border>
      <el-table-column align="center" label="序号" width="80">
        <template slot-scope="scope">
          {{ scope.$index+1 }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="用户名" width="220">
        <template slot-scope="scope">
          {{ scope.row.urUserName }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="姓名">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getUserList } from '@/api/demo1'

const defaultUser = {
  urId: 0,
  urUserName: '',
  urSalt: '',
  introduction: '',
  avatar: '',
  name: ''
}

export default {
  data() {
    return {
      user: Object.assign({}, defaultUser),
      userList: [],
      dialogVisible: false,
      dialogTitle: '',
      roleList: [],
      checkedList: []
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const res = await getUserList()
      this.userList = res.data
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
