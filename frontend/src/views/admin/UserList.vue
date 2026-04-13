<template>
  <div class="user-list">
    <h2>用户管理</h2>

    <el-card>
      <div class="filter-bar">
        <el-input v-model="searchQuery" placeholder="搜索用户名" class="search-input" clearable>
          <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
        </el-input>

        <el-select v-model="roleFilter" placeholder="筛选角色" clearable>
          <el-option label="管理员" value="admin"></el-option>
          <el-option label="访客" value="visitor"></el-option>
        </el-select>
      </div>

      <el-table :data="userList" border stripe style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120"></el-table-column>
        <el-table-column label="头像" width="100">
          <template slot-scope="scope">
            <el-avatar :size="40" :src="scope.row.avatar">
              {{ scope.row.username.charAt(0) }}
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
              {{ scope.row.role === 'admin' ? '管理员' : '访客' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="articles_count" label="文章数" width="90"></el-table-column>
        <el-table-column prop="comments_count" label="评论数" width="90"></el-table-column>
        <el-table-column prop="total_views" label="阅读量" width="90"></el-table-column>
        <el-table-column prop="total_likes" label="点赞数" width="90"></el-table-column>
        <el-table-column prop="created_at" label="注册时间" min-width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button type="text" :disabled="scope.row.role === 'admin'" @click="changeRole(scope.row)">
              {{ scope.row.role === 'admin' ? '管理员' : '设为管理员' }}
            </el-button>
            <el-button type="text" @click="viewProfile(scope.row)">
              查看
            </el-button>
            <el-button type="text" :disabled="scope.row.role === 'admin'" @click="deleteUser(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
          :page-sizes="[10, 20, 50]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'UserList',
  data () {
    return {
      userList: [],
      searchQuery: '',
      roleFilter: '',
      currentPage: 1,
      pageSize: 10,
      total: 0,
      selectedUsers: []
    }
  },
  mounted () {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers () {
      try {
        const response = await axios.get('/users/active', {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            search: this.searchQuery,
            role: this.roleFilter
          }
        })
        this.userList = response.data
        this.total = response.data.length
      } catch (error) {
        this.$message.error('获取用户列表失败')
      }
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchUsers()
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchUsers()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.fetchUsers()
    },
    handleSelectionChange (selection) {
      this.selectedUsers = selection
    },
    formatDate (dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    viewProfile (user) {
      this.$router.push(`/user/${user.id}`)
    },
    async changeRole (user) {
      try {
        const newRole = user.role === 'admin' ? 'visitor' : 'admin'
        await axios.put(`/users/${user.id}/role`, { role: newRole })
        this.$message.success('角色修改成功')
        this.fetchUsers()
      } catch (error) {
        this.$message.error('角色修改失败')
      }
    },
    async deleteUser (user) {
      this.$confirm('确定要删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await axios.delete(`/users/${user.id}`)
          this.$message.success('用户删除成功')
          this.fetchUsers()
        } catch (error) {
          this.$message.error('用户删除失败')
        }
      })
    }
  }
}
</script>

<style scoped>
.user-list {
  padding: 20px;
}

.user-list h2 {
  margin-bottom: 20px;
  color: #333;
}

.filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>