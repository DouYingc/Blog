<template>
  <div v-if="announcements.length > 0" class="announcement-bar">
    <div class="announcement-content">
      <i class="el-icon-bell"></i>
      <span class="announcement-text">{{ currentAnnouncement.content }}</span>
      <el-button type="text" @click="nextAnnouncement">下一条</el-button>
    </div>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  data() {
    return {
      announcements: [],
      currentIndex: 0
    }
  },
  computed: {
    currentAnnouncement() {
      return this.announcements[this.currentIndex] || {}
    }
  },
  mounted() {
    this.fetchAnnouncements()
  },
  methods: {
    async fetchAnnouncements() {
      try {
        const response = await axios.get('/announcements')
        this.announcements = response.data.announcements
      } catch (error) {
        console.error('获取公告失败:', error)
      }
    },
    nextAnnouncement() {
      this.currentIndex = (this.currentIndex + 1) % this.announcements.length
    }
  }
}
</script>

<style scoped>
.announcement-bar {
  background-color: #f0f9ff;
  border-bottom: 1px solid #d9ecff;
  padding: 10px 0;
  margin-bottom: 20px;
}

.announcement-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 30px;
}

.announcement-text {
  flex: 1;
  color: #1890ff;
  font-size: 14px;
}
</style>