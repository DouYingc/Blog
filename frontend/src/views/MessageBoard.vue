<template>
  <div class="message-board">
    <el-container direction="vertical">
      <nav-bar></nav-bar>

      <el-main class="main">
        <div class="board-hero">
          <div class="hero-content">
            <div class="hero-main">
              <h1>社区留言板</h1>
              <p>欢迎在这里分享你的想法、建议或单纯打个招呼！</p>
            </div>
            <div class="hero-announcement">
              <div class="announcement-item">
                <div class="announcement-title">社区公告</div>
                <div class="announcement-date">2026-03-20</div>
                <div class="announcement-text">请文明发言，共同维护良好的社区氛围。</div>
              </div>
            </div>
          </div>
        </div>

        <div class="board-container">
          <!-- 主内容区 -->
          <div class="main-content">

            <!-- 留言输入区 -->
            <div class="input-section">
              <el-card class="input-card" shadow="hover">
                <div class="input-wrapper">
                  <div class="user-info-section">
                    <el-avatar :size="60" :src="currentUser.avatar || ''" icon="el-icon-user"
                      class="user-avatar"></el-avatar>
                    <div class="user-welcome">
                      <div v-if="isLoggedIn">
                        {{ currentUser.username }}
                        <span v-if="isAdmin" class="user-role-tag">管理员</span>
                      </div>
                      <div v-else>游客</div>
                    </div>
                  </div>

                  <div class="form-content">
                    <el-form :model="messageForm" label-width="0">
                      <el-form-item v-if="!isLoggedIn">
                        <el-input v-model="messageForm.nickname" placeholder="请输入您的昵称"
                          prefix-icon="el-icon-user"></el-input>
                      </el-form-item>

                      <div v-if="messageForm.parent_id" class="reply-indicator">
                        <span>回复: {{ replyTarget }}</span>
                        <i class="el-icon-close" @click="cancelReply"></i>
                      </div>

                      <el-form-item>
                        <el-input type="textarea" :rows="6" v-model="messageForm.content"
                          :placeholder="replyPlaceholder" resize="none"></el-input>
                      </el-form-item>
                      <div class="form-footer">
                        <span class="tip"><i class="el-icon-info"></i> 文明发言，共建和谐社区</span>
                        <el-button type="primary" round icon="el-icon-s-promotion" @click="submitMessage"
                          :loading="submitting">发布</el-button>
                      </div>
                    </el-form>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 留言列表区 -->
            <div class="message-section">
              <div class="message-list-container">
                <div class="list-header">
                  <div class="list-title">全部留言 ({{ totalMessages }})</div>
                </div>
                <div class="message-list">
                  <div v-for="msg in nestedMessages" :key="msg.id" class="message-wrapper">
                    <div class="message-item">
                      <div class="msg-avatar-wrapper">
                        <el-avatar :size="50" :src="msg.avatar || ''" icon="el-icon-user"></el-avatar>
                      </div>
                      <div class="msg-main">
                        <div class="msg-header">
                          <span class="nickname">{{ msg.nickname }}</span>
                          <span class="date">{{ formatDate(msg.created_at) }}</span>
                        </div>
                        <div class="msg-content">{{ msg.content }}</div>
                        <div class="msg-actions">
                          <span class="action-btn" @click="showReplyForm(msg, null)"><i class="el-icon-chat-round"></i>
                            回复</span>
                          <span v-if="isAdmin" class="action-btn delete-btn" @click="handleDelete(msg.id)"><i
                              class="el-icon-delete"></i> 删除</span>
                        </div>

                        <!-- 嵌入式回复表单 -->
                        <div v-if="showingReplyForm === msg.id" class="reply-form-container">
                          <el-form :model="replyForm" label-width="0">
                            <el-form-item>
                              <el-input type="textarea" :rows="3" v-model="replyForm.content" placeholder="回复..."
                                resize="none"></el-input>
                            </el-form-item>
                            <div class="reply-form-actions">
                              <el-button size="small" @click="cancelReplyForm">取消</el-button>
                              <el-button type="primary" size="small" @click="submitReply(msg.id)"
                                :loading="submitting">回复</el-button>
                            </div>
                          </el-form>
                        </div>
                      </div>
                    </div>

                    <!-- 回复列表 -->
                    <div v-if="msg.replies && msg.replies.length" class="reply-list">
                      <div v-for="reply in msg.replies" :key="reply.id" class="reply-item">
                        <div class="msg-avatar-wrapper">
                          <el-avatar :size="36" :src="reply.avatar || ''" icon="el-icon-user"></el-avatar>
                        </div>
                        <div class="msg-main">
                          <div class="msg-header">
                            <span class="nickname">{{ reply.nickname }}</span>
                            <span class="date">{{ formatDate(reply.created_at) }}</span>
                          </div>
                          <div class="msg-content">{{ reply.content }}</div>
                          <div class="msg-actions">
                            <span class="action-btn" @click="showReplyForm(reply, msg)"><i
                                class="el-icon-chat-round"></i>
                              回复</span>
                            <span v-if="isAdmin" class="action-btn delete-btn" @click="handleDelete(reply.id)"><i
                                class="el-icon-delete"></i> 删除</span>
                          </div>

                          <!-- 嵌入式回复表单 -->
                          <div v-if="showingReplyForm === reply.id" class="reply-form-container">
                            <el-form :model="replyForm" label-width="0">
                              <el-form-item>
                                <el-input type="textarea" :rows="3" v-model="replyForm.content" placeholder="回复..."
                                  resize="none"></el-input>
                              </el-form-item>
                              <div class="reply-form-actions">
                                <el-button size="small" @click="cancelReplyForm">取消</el-button>
                                <el-button type="primary" size="small" @click="submitReply(reply.id)"
                                  :loading="submitting">回复</el-button>
                              </div>
                            </el-form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-empty v-if="messages.length === 0" description="暂无留言，快来抢沙发吧！"></el-empty>
                </div>

                <!-- 分页组件 -->
                <div class="pagination-container">
                  <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="currentPage" :page-sizes="[5, 10, 20]" :page-size="pageSize"
                    layout="total, sizes, prev, pager, next" :total="totalMessages">
                  </el-pagination>
                </div>
              </div>
            </div>
          </div>

          <!-- 侧边栏 -->
          <div class="sidebar">
            <!-- 统计信息 -->
            <el-card class="sidebar-card" shadow="hover">
              <div slot="header" class="sidebar-header">
                <i class="el-icon-data-line"></i> 留言统计
              </div>
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-value">{{ totalMessages }}</div>
                  <div class="stat-label">总留言数</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value">{{ activeUsers }}</div>
                  <div class="stat-label">活跃用户</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value">{{ todayMessages }}</div>
                  <div class="stat-label">今日留言</div>
                </div>
              </div>
            </el-card>

            <!-- 热门话题 -->
            <el-card class="sidebar-card" shadow="hover" style="margin-top: 20px;">
              <div slot="header" class="sidebar-header">
                <i class="el-icon-star-on"></i> 热门话题
              </div>
              <div class="topic-list">
                <div v-for="topic in hotTopics" :key="topic.id" class="topic-item">
                  <i class="el-icon-trophy"></i>
                  <span>{{ topic.title }}</span>
                  <span class="topic-count">{{ topic.count }}条留言</span>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../axios'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'MessageBoard',
  components: { NavBar },
  data () {
    return {
      messages: [],
      messageForm: {
        nickname: '',
        content: '',
        avatar: '',
        parent_id: null
      },
      replyForm: {
        content: ''
      },
      submitting: false,
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      replyTarget: '',
      replyPlaceholder: '写下你的想法...',
      showingReplyForm: null,
      // 分页相关
      currentPage: 1,
      pageSize: 5,
      totalMessages: 0,
      // 侧边栏数据
      activeUsers: 12,
      todayMessages: 5,
      hotTopics: [
        { id: 1, title: '技术交流', count: 8 },
        { id: 2, title: '学习心得', count: 6 },
        { id: 3, title: '问题求助', count: 4 },
        { id: 4, title: '经验分享', count: 3 },
        { id: 5, title: '项目讨论', count: 2 }
      ]
    }
  },
  computed: {
    isLoggedIn () {
      return !!localStorage.getItem('token')
    },
    isAdmin () {
      return this.currentUser.role === 'admin'
    },
    nestedMessages () {
      if (!this.messages || !Array.isArray(this.messages)) {
        return []
      }
      const roots = this.messages.filter(m => !m.parent_id)
      return roots.map(root => ({
        ...root,
        replies: this.messages.filter(m => m.parent_id === root.id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }))
    }
  },
  created () {
    this.initForm()
    this.fetchMessages()
    this.fetchStats()
  },
  methods: {
    initForm () {
      if (this.isLoggedIn) {
        this.messageForm.nickname = this.currentUser.username
        this.messageForm.avatar = this.currentUser.avatar || ''
      } else {
        this.messageForm.nickname = ''
        this.messageForm.avatar = ''
      }
      this.cancelReply()
    },
    async fetchMessages () {
      try {
        const response = await axios.get(`/messages?page=${this.currentPage}&limit=${this.pageSize}`)
        this.messages = response.data.rows
        this.totalMessages = response.data.count
      } catch (error) {
        this.$message.error('获取留言失败')
      }
    },

    async fetchStats () {
      try {
        const response = await axios.get('/messages/stats')
        this.totalMessages = response.data.totalMessages
        this.activeUsers = response.data.activeUsers
        this.todayMessages = response.data.todayMessages
      } catch (error) {
        console.error('获取统计数据失败', error)
        // 使用默认值避免404错误影响页面显示
        this.totalMessages = 0
        this.activeUsers = 12
        this.todayMessages = 5
      }
    },
    async submitMessage () {
      if (!this.messageForm.nickname) {
        this.$message.warning('请填写昵称')
        return
      }
      if (!this.messageForm.content) {
        this.$message.warning('内容不能为空')
        return
      }
      this.submitting = true
      try {
        await axios.post('/messages', this.messageForm)
        this.$message.success('发布成功')
        this.messageForm.content = ''
        this.cancelReply()
        this.currentPage = 1
        this.fetchMessages()
        this.fetchStats()
      } catch (error) {
        this.$message.error('发布失败')
      } finally {
        this.submitting = false
      }
    },
    replyTo (msg, rootMsg = null) {
      // 如果回复的是子评论，则 parent_id 应该是它的父评论 ID
      this.messageForm.parent_id = rootMsg ? rootMsg.id : msg.id
      this.replyTarget = msg.nickname
      this.messageForm.content = `@${msg.nickname} `
      this.replyPlaceholder = `回复 @${msg.nickname}...`
      // 自动滚动到输入框
      const inputCard = document.querySelector('.input-card')
      if (inputCard) {
        inputCard.scrollIntoView({ behavior: 'smooth' })
      }
    },
    showReplyForm (msg, rootMsg = null) {
      this.showingReplyForm = msg.id
      this.replyForm.content = ''
    },
    cancelReplyForm () {
      this.showingReplyForm = null
      this.replyForm.content = ''
    },
    async submitReply (parentId) {
      if (!this.replyForm.content.trim()) {
        this.$message.warning('回复内容不能为空')
        return
      }

      this.submitting = true
      try {
        const formData = {
          nickname: this.isLoggedIn ? this.currentUser.username : '',
          content: this.replyForm.content,
          avatar: this.currentUser.avatar || '',
          parent_id: parentId
        }

        await axios.post('/messages', formData)
        this.$message.success('回复成功')
        this.cancelReplyForm()
        this.fetchMessages()
        this.fetchStats()
      } catch (error) {
        this.$message.error('回复失败')
      } finally {
        this.submitting = false
      }
    },
    cancelReply () {
      this.messageForm.parent_id = null
      this.replyTarget = ''
      this.replyPlaceholder = '写下你的想法...'
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这条留言吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await axios.delete(`/messages/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.currentPage = 1
        this.fetchMessages()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    formatDate (dateStr) {
      if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return '未知'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '无效日期'
      return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },
    handleSizeChange (val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchMessages()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this.fetchMessages()
    },
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/')
      location.reload()
    }
  }
}
</script>

<style scoped src="../assets/styles/views/MessageBoard.css"></style>
