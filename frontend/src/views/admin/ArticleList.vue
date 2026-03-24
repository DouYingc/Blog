<template>
  <div class="article-list">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleCreate">发布新文章</el-button>
      <el-radio-group v-model="filterType" @change="fetchArticles" style="margin-left: 20px">
        <el-radio-button label="all">全部文章</el-radio-button>
        <el-radio-button label="mine">我的文章</el-radio-button>
      </el-radio-group>
    </div>
    <el-table :data="articles" style="width: 100%" stripe border>
      <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
      <el-table-column prop="User.username" label="作者" width="120">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.User && scope.row.User.id === currentUser.id ? 'success' : 'info'">
            {{ scope.row.User ? scope.row.User.username : '未知' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="Category.name" label="分类" width="120">
        <template slot-scope="scope">
          {{ scope.row.Category ? scope.row.Category.name : '未分类' }}
        </template>
      </el-table-column>
      <el-table-column prop="views" label="阅读量" width="100" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="发布时间" width="180" align="center">
        <template slot-scope="scope">{{ new Date(scope.row.created_at).toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row.id)"
            v-if="canManage(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)"
            v-if="canManage(scope.row)">删除</el-button>
          <span v-else class="no-permission">无权限</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'ArticleList',
  data () {
    return {
      articles: [],
      filterType: 'all',
      currentUser: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  created () {
    this.fetchArticles()
  },
  methods: {
    async fetchArticles () {
      try {
        const params = {}
        if (this.filterType === 'mine') {
          params.user_id = this.currentUser.id
        }
        const response = await axios.get('/articles', { params })
        this.articles = response.data.articles
      } catch (error) {
        this.$message.error('获取文章列表失败')
      }
    },
    canManage (article) {
      // 管理员可以管理所有文章，普通用户只能管理自己的文章
      return this.currentUser.role === 'admin' || (article.User && article.User.id === this.currentUser.id)
    },
    handleCreate () {
      this.$router.push('/article/new')
    },
    handleEdit (id) {
      this.$router.push(`/article/edit/${id}`)
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这篇文章吗？删除后不可恢复！', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await axios.delete(`/articles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('文章删除成功')
        this.fetchArticles()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.response.data.message || '删除文章失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.no-permission {
  color: #909399;
  font-size: 12px;
}
</style>
