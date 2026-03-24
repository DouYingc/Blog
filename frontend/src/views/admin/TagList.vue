<template>
  <div class="tag-list">
    <div class="toolbar">
      <el-button type="primary" icon="el-icon-plus" @click="handleAdd">添加标签</el-button>
    </div>
    <el-table :data="tags" style="width: 100%" stripe border>
      <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
      <el-table-column prop="name" label="标签名称"></el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标签名称">
          <el-input v-model="form.name" placeholder="请输入标签名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  name: 'TagList',
  data () {
    return {
      tags: [],
      dialogVisible: false,
      dialogTitle: '添加标签',
      form: {
        id: null,
        name: ''
      }
    }
  },
  created () {
    this.fetchTags()
  },
  methods: {
    async fetchTags () {
      try {
        const response = await axios.get('/tags')
        this.tags = response.data
      } catch (error) {
        this.$message.error('获取标签列表失败')
      }
    },
    handleAdd () {
      this.dialogTitle = '添加标签'
      this.form = { id: null, name: '' }
      this.dialogVisible = true
    },
    handleEdit (row) {
      this.dialogTitle = '编辑标签'
      this.form = { ...row }
      this.dialogVisible = true
    },
    async submitForm () {
      if (!this.form.name) {
        this.$message.warning('标签名称不能为空')
        return
      }
      try {
        const config = {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
        if (this.form.id) {
          await axios.put(`/tags/${this.form.id}`, this.form, config)
          this.$message.success('更新成功')
        } else {
          await axios.post('/tags', this.form, config)
          this.$message.success('添加成功')
        }
        this.dialogVisible = false
        this.fetchTags()
      } catch (error) {
        this.$message.error('操作失败')
      }
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这个标签吗？', '警告', { type: 'warning' })
        await axios.delete(`/tags/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.fetchTags()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    }
  }
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 20px;
}
</style>
