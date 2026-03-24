<template>
  <div class="comment-list">
    <el-table :data="comments" style="width: 100%" stripe border>
      <el-table-column prop="nickname" label="昵称" width="120"></el-table-column>
      <el-table-column prop="content" label="评论内容" min-width="250"></el-table-column>
      <el-table-column prop="Article.title" label="对应文章" width="200">
        <template slot-scope="scope">
          {{ scope.row.Article ? scope.row.Article.title : '已删除的文章' }}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="评论时间" width="180" align="center">
        <template slot-scope="scope">{{ new Date(scope.row.created_at).toLocaleString() }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'CommentList',
  data () {
    return {
      comments: []
    }
  },
  created () {
    this.fetchComments()
  },
  methods: {
    async fetchComments () {
      try {
        const response = await axios.get('/comments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.comments = response.data
      } catch (error) {
        this.$message.error('获取评论列表失败')
      }
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这条评论吗？', '警告', { type: 'warning' })
        await axios.delete(`/comments/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.fetchComments()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>
