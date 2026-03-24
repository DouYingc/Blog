<template>
  <div class="notification-bell">
    <i class="el-icon-bell" @click="toggleNotifications"></i>
    <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>

    <div v-if="showNotifications" class="notification-dropdown">
      <div class="notification-header">
        <h3>通知</h3>
        <span class="mark-all-read" @click="markAllAsRead">全部标为已读</span>
      </div>

      <div class="notification-list">
        <div v-if="notifications.length === 0" class="no-notifications">
          暂无通知
        </div>

        <div v-for="notification in notifications" :key="notification.id"
          :class="['notification-item', notification.is_read ? 'read' : 'unread']"
          @click="handleNotificationClick(notification)">
          <div class="notification-icon">
            <i :class="getNotificationIcon(notification.type)"></i>
          </div>
          <div class="notification-content">
            <div class="notification-text">{{ notification.content }}</div>
            <div class="notification-time">{{ formatTime(notification.created_at) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'NotificationBell',
  data () {
    return {
      showNotifications: false,
      notifications: [],
      unreadCount: 0,
      notificationTimer: null
    }
  },
  mounted () {
    this.fetchNotifications()
    // 设置定时轮询，每30秒检查一次新通知
    this.startNotificationTimer()
  },
  beforeDestroy () {
    if (this.notificationTimer) {
      clearInterval(this.notificationTimer)
    }
  },
  computed: {
    isLoggedIn () {
      return !!localStorage.getItem('token')
    }
  },
  methods: {
    toggleNotifications () {
      this.showNotifications = !this.showNotifications
    },
    startNotificationTimer () {
      // 每30秒检查一次新通知
      this.notificationTimer = setInterval(() => {
        if (this.isLoggedIn) {
          this.checkNewNotifications()
        }
      }, 30000)
    },
    async checkNewNotifications () {
      try {
        // 先获取未读通知数量
        const countResponse = await axios.get('/notifications/unread-count')
        const newUnreadCount = countResponse.data.count || 0

        // 如果有新的未读通知，显示提示并获取完整通知列表
        if (newUnreadCount > this.unreadCount) {
          this.$message.info('您有新的通知')
          await this.fetchNotifications()
        } else {
          this.unreadCount = newUnreadCount
        }
      } catch (error) {
        console.error('检查新通知失败:', error)
      }
    },
    async fetchNotifications () {
      if (!this.isLoggedIn) {
        this.notifications = []
        this.unreadCount = 0
        return
      }

      try {
        const response = await axios.get('/notifications')
        this.notifications = response.data.notifications || []
        this.unreadCount = this.notifications.filter(n => !n.is_read).length
      } catch (error) {
        console.error('获取通知失败:', error)
        this.notifications = []
        this.unreadCount = 0
      }
    },
    async markAsRead (notificationId) {
      if (!this.isLoggedIn) return

      try {
        await axios.put(`/notifications/${notificationId}/read`)
        this.fetchNotifications()
      } catch (error) {
        console.error('标记已读失败:', error)
      }
    },
    async markAllAsRead () {
      if (!this.isLoggedIn) return

      try {
        await axios.put('/notifications/read-all')
        this.fetchNotifications()
      } catch (error) {
        console.error('全部标为已读失败:', error)
      }
    },
    async handleNotificationClick (notification) {
      // 先标记为已读
      await this.markAsRead(notification.id)

      // 根据通知类型和目标类型跳转到相应页面
      if (notification.target_type === 'article') {
        // 跳转到文章详情页
        const targetPath = `/article/${notification.target_id}`
        if (this.$route.path !== targetPath) {
          this.$router.push(targetPath)
        }
      } else if (notification.target_type === 'comment') {
        try {
          // 查询评论对应的文章ID
          const response = await axios.get(`/comments/${notification.target_id}`)
          const articleId = response.data.article_id
          const commentId = notification.target_id

          // 保存要定位的评论ID到sessionStorage，以便页面加载后使用
          sessionStorage.setItem('scrollToCommentId', commentId)

          // 跳转到文章详情页
          const targetPath = `/article/${articleId}`
          if (this.$route.path !== targetPath) {
            this.$router.push(targetPath)
          } else {
            // 如果已经在当前文章页面，直接滚动到评论位置
            this.scrollToComment(commentId)
          }
        } catch (error) {
          console.error('查询评论信息失败:', error)
          // 如果查询失败，尝试直接跳转到首页
          if (this.$route.path !== '/') {
            this.$router.push('/')
          }
          this.$message.warning('相关内容已被删除或不存在')
        }
      } else if (notification.target_type === 'message') {
        // 跳转到留言板页面
        if (this.$route.path !== '/messages') {
          this.$router.push('/messages')
        }
      }

      // 关闭通知弹窗
      this.showNotifications = false
    },
    scrollToComment (commentId) {
      this.$nextTick(() => {
        const commentElement = document.getElementById(`comment-${commentId}`)
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    },
    getNotificationIcon (type) {
      const iconMap = {
        comment: 'el-icon-message',
        comment_like: 'el-icon-star-on',
        like: 'el-icon-star-on',
        favorite: 'el-icon-star-on',
        reply: 'el-icon-chat-line-round',
        system: 'el-icon-info'
      }
      return iconMap[type] || 'el-icon-info'
    },
    formatTime (timeString) {
      const now = new Date()
      const time = new Date(timeString)
      const diff = now - time
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 60) {
        return `${minutes}分钟前`
      } else if (hours < 24) {
        return `${hours}小时前`
      } else if (days < 30) {
        return `${days}天前`
      } else {
        return time.toLocaleDateString()
      }
    }
  }
}
</script>
<style scoped>
.notification-bell {
  position: relative;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #f56c6c;
  color: white;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  padding: 0 6px;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  background-color: white;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.mark-all-read {
  color: #409eff;
  font-size: 12px;
  cursor: pointer;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-notifications {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.notification-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #f5f7fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-icon {
  margin-right: 12px;
  font-size: 18px;
  color: #409eff;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-text {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}
</style>