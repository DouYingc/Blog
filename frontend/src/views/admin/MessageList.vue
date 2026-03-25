<template>
  <div class="message-list">
    <div class="page-header">
      <h2>留言管理</h2>
    </div>

    <el-card shadow="never" class="message-card">
      <div class="table-toolbar">
        <el-input placeholder="搜索留言内容" v-model="searchKeyword" clearable style="width: 300px"
          @input="handleSearch"></el-input>
      </div>

      <el-table :data="messages" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column label="用户信息" width="200">
          <template slot-scope="scope">
            <div class="user-info">
              <el-avatar :size="40" :src="scope.row.User?.avatar || ''" icon="el-icon-user"></el-avatar>
              <div class="user-details">
                <div class="username">{{ scope.row.User?.username || scope.row.nickname || '匿名用户' }}</div>
                <div class="user-id">ID: {{ scope.row.user_id || '匿名' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="留言内容">
          <template slot-scope="scope">
            <div class="message-content">{{ scope.row.content }}</div>
            <div v-if="scope.row.parent_id" class="reply-info">
              <span class="reply-label">回复:</span>
              <span class="reply-id">#{{ scope.row.parent_id }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="留言时间" width="180">
          <template slot-scope="scope">
            {{ new Date(scope.row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template slot-scope="scope">
            <el-button size="mini" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'MessageList',
  data () {
    return {
      messages: [],
      loading: false,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      searchKeyword: ''
    }
  },
  created () {
    this.fetchMessages()
  },
  methods: {
    async fetchMessages () {
      this.loading = true
      try {
        const response = await axios.get('/messages', {
          params: {
            page: this.currentPage,
            limit: this.pageSize
          }
        })
        this.messages = response.data.rows
        this.total = response.data.count
      } catch (error) {
        this.$message.error('获取留言列表失败')
      } finally {
        this.loading = false
      }
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这条留言吗？', '提示', { type: 'warning' })
        await axios.delete(`/messages/${id}`)
        this.$message.success('删除成功')
        this.fetchMessages()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('删除失败')
      }
    },
    handleSizeChange (size) {
      this.pageSize = size
      this.currentPage = 1
      this.fetchMessages()
    },
    handleCurrentChange (page) {
      this.currentPage = page
      this.fetchMessages()
    },
    handleSearch () {
      this.currentPage = 1
      this.fetchMessages()
    }
  }
}
</script>

<style scoped>
.message-list {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.message-card {
  border-radius: 8px;
}

.table-toolbar {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  flex: 1;
}

.username {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #909399;
}

.message-content {
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
  margin-bottom: 8px;
}

.reply-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.reply-label {
  color: #606266;
}

.reply-id {
  color: #409eff;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
