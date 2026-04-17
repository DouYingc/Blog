<template>
  <div class="private-messages">
    <nav-bar></nav-bar>
    <el-container class="main-container">
      <el-aside width="300px" class="message-sidebar">
        <div class="sidebar-header">
          <h3>私信</h3>
        </div>
        <div class="conversation-list">
          <el-card v-for="conversation in conversations" :key="conversation.id"
            :class="{ 'active': activeConversationId === conversation.id }" class="conversation-item">
            <div class="conversation-header" @click.stop="selectConversation(conversation)">
              <el-badge :value="conversation.unread_count || 0" :hidden="!(conversation.unread_count > 0)"
                class="unread-badge">
                <el-avatar :size="40" :src="conversation.avatar || ''" icon="el-icon-user"></el-avatar>
              </el-badge>
              <div class="conversation-info">
                <div class="username">{{ conversation.username }}</div>
                <div class="last-message">{{ conversation.last_message }}</div>
              </div>
            </div>
          </el-card>
        </div>
      </el-aside>

      <el-main class="message-content">
        <div v-if="activeConversation" class="chat-container">
          <div class="chat-header">
            <el-avatar :size="40" :src="activeConversation.avatar || ''" icon="el-icon-user"></el-avatar>
            <div class="chat-title">{{ activeConversation.username }}</div>
          </div>

          <div class="messages-list" ref="messagesList">
            <div v-for="message in messages" :key="message.id">
              <div class="message-time">{{ formatTime(message.created_at) }}</div>
              <div :class="[
                'message-item',
                parseInt(message.sender_id) === parseInt(currentUserId) ? 'my-message' : 'other-message'
              ]">
                <el-avatar v-if="parseInt(message.sender_id) !== parseInt(currentUserId)" :size="30"
                  :src="message.Sender?.avatar || ''" icon="el-icon-user"></el-avatar>
                <div class="message-content">
                  <div class="message-text">{{ message.content }}</div>
                </div>
                <el-avatar v-if="parseInt(message.sender_id) === parseInt(currentUserId)" :size="30"
                  :src="message.Sender?.avatar || ''" icon="el-icon-user"></el-avatar>
              </div>
            </div>
          </div>

          <div class="message-input">
            <el-input v-model="messageText" type="textarea" :rows="2" placeholder="输入消息..."
              @keyup.enter.native="sendMessage"></el-input>
            <el-button type="primary" @click="sendMessage" :disabled="!messageText.trim()">发送</el-button>
          </div>
        </div>

        <div v-else class="empty-state">
          <el-empty description="请选择一个对话开始聊天"></el-empty>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
 * 私信页面组件
 * 功能：实现用户之间的私信聊天功能，包括对话列表、消息展示和发送
 */
import axios from '../axios' // 网络请求
import NavBar from '@/components/NavBar.vue' // 导航栏组件

export default {
  name: 'PrivateMessages',
  components: {
    NavBar
  },
  data () {
    return {
      conversations: [], // 对话列表
      messages: [], // 消息列表
      activeConversation: null, // 当前激活的对话
      activeConversationId: null, // 当前激活的对话ID
      messageText: '', // 消息输入框内容
      loading: false, // 加载状态
      currentUserId: null // 当前用户ID
    }
  },
  created () {
    // 获取当前用户ID
    this.getCurrentUserId()
    // 获取对话列表
    this.fetchConversations()

    // 如果URL中有用户ID，自动选择该对话
    const userId = this.$route.params.userId
    if (userId) {
      this.selectConversationById(parseInt(userId))
    }
  },
  methods: {
    /**
     * 获取当前用户ID
     */
    getCurrentUserId () {
      try {
        const userInfoStr = localStorage.getItem('userInfo')
        const userInfo = JSON.parse(userInfoStr || '{}')
        this.currentUserId = userInfo.id

        // 如果localStorage中没有userInfo，尝试从token解析
        if (!this.currentUserId) {
          const token = localStorage.getItem('token')
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]))
              this.currentUserId = payload.id
            } catch (e) {
              console.error('解析token失败:', e)
            }
          }
        }
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    },
    /**
     * 获取对话列表
     */
    async fetchConversations () {
      try {
        const response = await axios.get('/privateMessages/conversations')
        this.conversations = response.data.conversations
      } catch (error) {
        this.$message.error('获取对话列表失败')
      }
    },
    /**
     * 选择对话
     * @param {object} conversation - 对话对象
     */
    async selectConversation (conversation) {
      this.activeConversation = conversation
      this.activeConversationId = conversation.id
      await this.fetchMessages(conversation.id)
      
      // 批量标记该用户的所有未读消息为已读
      try {
        await axios.patch(`/privateMessages/mark-all-read/${conversation.id}`)
        // 实时更新未读消息数为0
        this.$set(conversation, 'unread_count', 0)
        
        // 通知导航栏更新未读消息计数
        this.$root.$emit('updateUnreadCount')
      } catch (error) {
        console.error('标记消息已读失败:', error)
      }
    },
    /**
     * 根据用户ID选择对话
     * @param {number} userId - 用户ID
     */
    async selectConversationById (userId) {
      const conversation = this.conversations.find(c => c.id === userId)
      if (conversation) {
        await this.selectConversation(conversation)
      } else {
        // 如果用户不在对话列表中，创建一个临时对话并获取用户信息
        this.activeConversation = { id: userId }
        this.activeConversationId = userId

        // 先获取用户信息
        try {
          const userResponse = await axios.get(`/auth/user/${userId}`)
          this.activeConversation.username = userResponse.data.username
          this.activeConversation.avatar = userResponse.data.avatar
        } catch (error) {
          console.error('获取用户信息失败:', error)
        }

        await this.fetchMessages(userId)
      }
    },
    /**
     * 获取消息列表
     * @param {number} userId - 用户ID
     */
    async fetchMessages (userId) {
      this.loading = true
      try {
        // 获取所有消息，设置较大的limit值
        const response = await axios.get(`/privateMessages/conversation/${userId}?limit=100`)
        this.messages = response.data.messages

        // 获取用户信息
        if (!this.activeConversation.username) {
          const userResponse = await axios.get(`/auth/user/${userId}`)
          this.activeConversation.username = userResponse.data.username
          this.activeConversation.avatar = userResponse.data.avatar
        }

        // 滚动到底部
        this.$nextTick(() => {
          this.scrollToBottom()
        })
      } catch (error) {
        this.$message.error('获取消息失败')
      } finally {
        this.loading = false
      }
    },
    /**
     * 发送消息
     */
    async sendMessage () {
      if (!this.messageText.trim() || !this.activeConversationId) return

      const content = this.messageText.trim()
      this.messageText = ''

      try {
        await axios.post('/privateMessages/send', {
          receiver_id: this.activeConversationId,
          content
        })

        // 重新获取消息
        await this.fetchMessages(this.activeConversationId)
        // 重新获取对话列表，更新最新消息预览
        await this.fetchConversations()
        this.$message.success('消息发送成功')
      } catch (error) {
        this.$message.error(error.response?.data?.message || '消息发送失败')
        this.messageText = content
      }
    },
    /**
     * 格式化时间
     * @param {string} time - 时间字符串
     * @returns {string} 格式化后的时间
     */
    formatTime (time) {
      const date = new Date(time)
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()

      if (isToday) {
        return `今天 ${date.toLocaleString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })}`
      } else {
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    },
    /**
     * 滚动到消息列表底部
     */
    scrollToBottom () {
      const messagesList = this.$refs.messagesList
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight
      }
    }
  }
}
</script>

<style scoped>
/**
 * 私信页面样式
 */
.private-messages {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  width: 80%;
  margin: 0 auto;
  box-sizing: border-box;
}

.main-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.message-sidebar {
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.conversation-list {
  padding: 10px;
}

.conversation-item {
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.conversation-item:hover {
  border-color: #409eff;
}

.conversation-item.active {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.conversation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  cursor: pointer;
}

.conversation-info {
  flex: 1;
}

.username {
  font-weight: 600;
  color: #1e293b;
}

.last-message {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  position: relative;
}

.message-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.chat-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.messages-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f8fafc;
}

.message-item {
  display: flex;
  margin-bottom: 10px;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
}

.my-message {
  justify-content: flex-end;
}

.my-message .message-content {
  align-items: flex-end;
}

.other-message {
  justify-content: flex-start;
}

.other-message .message-content {
  align-items: flex-start;
}

.message-text {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
}

.my-message .message-text {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.other-message .message-text {
  background-color: white;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  text-align: center;
  margin: 10px 0;
}

.message-input {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
  background-color: white;
}

.message-input .el-input {
  flex: 1;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>