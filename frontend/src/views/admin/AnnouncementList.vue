<template>
  <div class="announcement-list">
    <h2>系统公告管理</h2>
    <el-button type="primary" @click="addAnnouncement">添加公告</el-button>
    <el-table :data="announcements" style="margin-top: 20px">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="title" label="标题"></el-table-column>
      <el-table-column prop="is_active" label="状态" width="100">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.is_active" @change="updateStatus(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180"></el-table-column>
      <el-table-column label="操作" width="150">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="editAnnouncement(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteAnnouncement(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑公告对话框 -->
    <el-dialog title="公告管理" :visible.sync="showAddDialog" width="600px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input type="textarea" v-model="form.content" :rows="10"></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.is_active"></el-switch>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="saveAnnouncement">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from '../../axios'

export default {
  data() {
    return {
      announcements: [],
      showAddDialog: false,
      form: {
        id: null,
        title: '',
        content: '',
        is_active: true
      }
    }
  },
  mounted() {
    this.fetchAnnouncements()
  },
  methods: {
    async fetchAnnouncements() {
      try {
        const response = await axios.get('/announcements/admin')
        this.announcements = response.data.announcements
      } catch (error) {
        this.$message.error('获取公告失败')
      }
    },
    addAnnouncement() {
      this.form = {
        id: null,
        title: '',
        content: '',
        is_active: true
      }
      this.showAddDialog = true
    },
    editAnnouncement(announcement) {
      this.form = { ...announcement }
      this.showAddDialog = true
    },
    async saveAnnouncement() {
      try {
        if (this.form.id) {
          await axios.put(`/announcements/${this.form.id}`, this.form)
          this.$message.success('公告更新成功')
        } else {
          await axios.post('/announcements', this.form)
          this.$message.success('公告创建成功')
        }
        this.showAddDialog = false
        this.fetchAnnouncements()
      } catch (error) {
        this.$message.error('保存公告失败')
      }
    },
    async updateStatus(announcement) {
      try {
        await axios.put(`/announcements/${announcement.id}`, {
          is_active: announcement.is_active
        })
        this.$message.success('状态更新成功')
      } catch (error) {
        this.$message.error('状态更新失败')
        announcement.is_active = !announcement.is_active
      }
    },
    async deleteAnnouncement(id) {
      try {
        await axios.delete(`/announcements/${id}`)
        this.$message.success('公告删除成功')
        this.fetchAnnouncements()
      } catch (error) {
        this.$message.error('公告删除失败')
      }
    }
  }
}
</script>

<style scoped>
.announcement-list {
  padding: 20px;
}
</style>