<template>
  <!-- AI助手组件 -->
  <el-container class="ai-assistant">
    <!-- 头部导航 -->
    <el-header class="ai-header">
      <div class="header-content">
        <div class="logo" @click="goToHome">AI助手</div>
        <div class="nav-right">
          <!-- 导航菜单 -->
          <el-menu mode="horizontal" router :default-active="$route.path" class="nav-menu">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/ai-assistant">AI助手</el-menu-item>
            <el-menu-item index="/users/rank">排行榜</el-menu-item>
            <el-menu-item index="/archives">归档</el-menu-item>
            <el-menu-item index="/messages">留言板</el-menu-item>
          </el-menu>
          <!-- 用户菜单 -->
          <div v-if="isLoggedIn" class="user-menu-container">
            <div class="user-nav" @click="toggleUserMenu">
              <el-avatar v-if="currentUser.avatar" :size="30" :src="currentUser.avatar"
                style="margin-right: 8px; vertical-align: middle"></el-avatar>
              <i v-else class="el-icon-user" style="margin-right: 8px"></i>
              <span>{{ currentUser.username }}</span>
              <i class="el-icon-arrow-down" style="margin-left: 8px"></i>
            </div>
            <div v-if="userMenuVisible" class="user-dropdown-menu">
              <div class="dropdown-item" @click="goToUserCenter">个人中心</div>
              <div class="dropdown-item" v-if="isAdmin" @click="goToAdmin">系统后台</div>
              <div class="dropdown-item" @click="handleLogout">退出登录</div>
            </div>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 主内容区域 -->
    <el-main class="ai-main">
      <div class="ai-container">
        <!-- 功能切换标签页 -->
        <div class="ai-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="AI对话" name="chat"></el-tab-pane>
            <el-tab-pane label="文章生成" name="article"></el-tab-pane>
            <el-tab-pane label="提示词库" name="prompts"></el-tab-pane>
          </el-tabs>
        </div>

        <!-- AI对话界面 -->
        <div v-show="activeTab === 'chat'" class="chat-container">
          <!-- 聊天消息列表 -->
          <div class="chat-messages" ref="chatMessages">
            <div v-for="(message, index) in chatMessages" :key="index" :class="['message', message.role]">
              <div class="message-content"
                v-html="message.role === 'assistant' ? md.render(message.content) : message.content">
              </div>
              <div class="message-time">{{ message.time }}</div>
            </div>
          </div>

          <!-- 聊天输入区域 -->
          <div class="chat-input">
            <el-input v-model="chatInput" type="textarea" :rows="3" placeholder="请输入您的问题..."
              @keyup.enter.native="handleChatSend"></el-input>
            <el-button type="primary" @click="handleChatSend">
              {{ chatLoading ? '停止' : '发送' }}
            </el-button>
          </div>
        </div>

        <!-- 文章生成界面 -->
        <div v-show="activeTab === 'article'" class="article-container">
          <!-- 文章生成表单 -->
          <el-form :model="articleForm" label-width="100px">
            <el-form-item label="文章主题">
              <el-input v-model="articleForm.topic" placeholder="请输入文章主题"></el-input>
            </el-form-item>
            <el-form-item label="文章类型">
              <el-select v-model="articleForm.type" placeholder="选择文章类型">
                <el-option label="技术教程" value="tutorial"></el-option>
                <el-option label="技术分享" value="share"></el-option>
                <el-option label="经验总结" value="summary"></el-option>
                <el-option label="产品分析" value="analysis"></el-option>
                <el-option label="其他" value="other"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="文章长度">
              <el-select v-model="articleForm.length" placeholder="选择文章长度">
                <el-option label="短篇 (500字左右)" value="short"></el-option>
                <el-option label="中篇 (1000字左右)" value="medium"></el-option>
                <el-option label="长篇 (2000字左右)" value="long"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="详细要求">
              <el-input v-model="articleForm.requirement" type="textarea" :rows="4"
                placeholder="请输入详细要求，例如：包含代码示例、适合初学者、重点讲解某个知识点等"></el-input>
            </el-form-item>
          </el-form>

          <!-- 文章生成按钮 -->
          <div class="article-actions">
            <el-button type="primary" @click="generateArticle" :loading="articleLoading">
              生成文章
            </el-button>
          </div>

          <!-- 生成的文章展示 -->
          <div v-if="generatedArticle" class="generated-article">
            <h3>生成的文章</h3>
            <div v-html="renderedArticle"></div>
            <div class="article-actions">
              <el-button type="success" @click="copyArticle">复制文章</el-button>
              <el-button type="primary" @click="editArticle">编辑文章</el-button>
            </div>
          </div>
        </div>

        <!-- 提示词库界面 -->
        <div v-show="activeTab === 'prompts'" class="prompts-container">
          <!-- 提示词分类 -->
          <div class="prompt-categories">
            <el-button v-for="category in promptCategories" :key="category"
              :type="selectedCategory === category ? 'primary' : 'default'" @click="selectedCategory = category">
              {{ category }}
            </el-button>
          </div>

          <!-- 提示词列表 -->
          <div class="prompt-list">
            <el-card v-for="prompt in filteredPrompts" :key="prompt.id" class="prompt-card" @click="usePrompt(prompt)">
              <div class="prompt-title">{{ prompt.title }}</div>
              <div class="prompt-description">{{ prompt.description }}</div>
            </el-card>
          </div>
        </div>
      </div>
    </el-main>
  </el-container>
</template>

<script>
/**
 * AI助手组件
 * 功能：提供AI对话、文章生成和提示词库功能
 */
import axios from '../axios' // 网络请求
import MarkdownIt from 'markdown-it' // Markdown渲染
import hljs from 'highlight.js' // 代码高亮
import 'highlight.js/styles/github.css' // 代码高亮样式

export default {
  name: 'AIAssistant',
  data () {
    return {
      activeTab: 'chat', // 当前激活的标签页
      chatMessages: [], // 聊天消息列表
      chatInput: '', // 聊天输入内容
      chatLoading: false, // 聊天加载状态
      chatAbortController: null, // 用于取消流式请求
      articleForm: {
        topic: '', // 文章主题
        type: 'tutorial', // 文章类型
        length: 'medium', // 文章长度
        requirement: '' // 详细要求
      },
      articleLoading: false, // 文章生成加载状态
      generatedArticle: '', // 生成的文章
      selectedCategory: '技术', // 当前选中的提示词分类
      promptCategories: ['技术', '写作', '学习', '创意'], // 提示词分类列表
      prompts: [ // 提示词列表
        {
          id: 1,
          title: 'Python爬虫教程',
          description: '生成一篇关于Python爬虫的入门教程，包含基本概念和示例代码',
          category: '技术'
        },
        {
          id: 2,
          title: 'Vue3组件开发',
          description: '详细讲解Vue3组件的创建和使用方法',
          category: '技术'
        },
        {
          id: 3,
          title: '文章开头写法',
          description: '提供几种吸引人的文章开头写法',
          category: '写作'
        },
        {
          id: 4,
          title: '学习方法分享',
          description: '分享高效学习编程的方法和技巧',
          category: '学习'
        }
      ],
      isLoggedIn: false, // 是否登录
      currentUser: {}, // 当前用户信息
      isAdmin: false, // 是否为管理员
      userMenuVisible: false, // 用户菜单是否可见
      md: new MarkdownIt({ // Markdown渲染配置
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return '<pre class="hljs"><code>' +
                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                '</code></pre>'
            } catch (__) { }
          }
          return '<pre class="hljs"><code>' + str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code></pre>'
        }
      }),
    }
  },
  computed: {
    /**
     * 过滤当前分类的提示词
     */
    filteredPrompts () {
      return this.prompts.filter(prompt => prompt.category === this.selectedCategory)
    },
    /**
     * 渲染生成的文章
     */
    renderedArticle () {
      if (!this.generatedArticle) return ''
      return this.md.render(this.generatedArticle)
    }
  },
  created () {
    // 检查登录状态
    this.checkLoginStatus()
    // 加载聊天历史
    this.loadChatHistory()
  },
  mounted () {
    // 组件挂载后自动滚动到底部
    this.$nextTick(() => {
      this.scrollToBottom()
    })
  },
  methods: {
    /**
     * 检查登录状态
     */
    checkLoginStatus () {
      const user = localStorage.getItem('user')
      if (user) {
        this.currentUser = JSON.parse(user)
        this.isLoggedIn = true
        this.isAdmin = this.currentUser.role === 'admin'
      }
    },
    /**
     * 加载聊天历史
     */
    loadChatHistory () {
      // 根据当前用户生成唯一的聊天历史key
      const userKey = this.isLoggedIn ? `aiChatHistory_${this.currentUser.username}` : 'aiChatHistory'
      const savedMessages = localStorage.getItem(userKey)
      if (savedMessages) {
        this.chatMessages = JSON.parse(savedMessages)
      } else {
        // 默认消息
        this.chatMessages = [
          {
            role: 'assistant',
            content: '您好！我是AI助手，可以帮您解答问题、生成文章。请问有什么可以帮助您的？',
            time: new Date().toLocaleTimeString()
          }
        ]
        this.saveChatHistory()
      }
      this.addCopyButtons()
    },
    /**
     * 保存聊天历史
     */
    saveChatHistory () {
      // 根据当前用户生成唯一的聊天历史key
      const userKey = this.isLoggedIn ? `aiChatHistory_${this.currentUser.username}` : 'aiChatHistory'
      localStorage.setItem(userKey, JSON.stringify(this.chatMessages))
    },
    /**
     * 取消聊天请求
     */
    handleChatCancel () {
      if (this.chatAbortController) {
        this.chatAbortController.abort()
        this.chatAbortController = null
        this.chatLoading = false
      }
    },
    /**
     * 添加代码复制按钮
     */
    addCopyButtons () {
      this.$nextTick(() => {
        document.querySelectorAll('.message-content pre, .generated-article pre').forEach(pre => {
          // 移除所有现有的复制按钮
          const existingButtons = pre.querySelectorAll('.copy-btn')
          existingButtons.forEach(btn => btn.remove())

          // 设置pre元素样式
          pre.style.borderRadius = '8px'
          pre.style.padding = '20px'
          pre.style.position = 'relative'

          // 创建复制按钮
          const button = document.createElement('button')
          button.className = 'copy-btn'
          button.textContent = '复制'

          // 设置按钮样式
          button.style.cssText = 'position:absolute;top:8px;right:12px;background:#ffffff;border:1px solid #e0e0e0;border-radius:4px;padding:4px 8px;font-size:12px;color:#606266;cursor:pointer;z-index:1000;box-shadow:0 2px 4px rgba(0,0,0,0.2);outline:none;'

          button.onclick = function () {
            const code = this.parentNode.querySelector('code')
            if (code) {
              const range = document.createRange()
              range.selectNode(code)
              window.getSelection().removeAllRanges()
              window.getSelection().addRange(range)
              document.execCommand('copy')
              window.getSelection().removeAllRanges()
              this.textContent = '已复制'
              setTimeout(() => {
                this.textContent = '复制'
              }, 2000)
            }
          }

          // 确保pre元素有position: relative
          pre.style.position = 'relative'

          // 将按钮添加到pre元素中
          pre.appendChild(button)
        })
      })
    },
    /**
     * 处理标签页点击
     */
    handleTabClick (tab) {
      this.activeTab = tab.name
    },
    /**
     * 处理聊天发送
     */
    async handleChatSend () {
      // 如果正在加载中，点击则取消请求
      if (this.chatLoading) {
        this.handleChatCancel()
        return
      }

      // 如果输入为空，不发送
      if (!this.chatInput.trim()) return

      const message = this.chatInput.trim()
      this.chatMessages.push({
        role: 'user',
        content: message,
        time: new Date().toLocaleTimeString()
      })
      this.saveChatHistory()
      this.chatInput = ''
      this.chatLoading = true

      // 创建AbortController用于取消请求
      this.chatAbortController = new AbortController()

      // 添加AI助手的空消息，用于流式输出
      const assistantMessageIndex = this.chatMessages.length
      this.chatMessages.push({
        role: 'assistant',
        content: '',
        time: new Date().toLocaleTimeString()
      })
      this.scrollToBottom()

      try {
        // 使用原生fetch API处理流式响应
        const response = await fetch('http://localhost:3000/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ message }),
          signal: this.chatAbortController.signal
        })

        if (!response.ok) {
          throw new Error('请求失败')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder('utf-8')
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() // 保存最后一行（可能不完整）

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6) // 移除 "data: " 前缀
              if (data === '[DONE]') {
                // 流式结束，检查并处理代码格式
                const aiMessage = this.chatMessages[assistantMessageIndex]
                if (aiMessage && aiMessage.content) {
                  // 检查内容是否包含代码（包含典型的代码特征）
                  const hasCode = aiMessage.content.includes('原始数组') ||
                    aiMessage.content.includes('排序后数组') ||
                    aiMessage.content.includes('示例输出') ||
                    /(def |function |class |import |#include|<script>|if\s*\(|\{\s*\}|for\s*\(|while\s*\(|\/\/ |\/\*|\*\/|#\s*include|int\s+\w+\[\]|void\s+\w+\(|printf\(|scanf\(|return\s+\d|const\s+|let\s+|var\s+|==|!=|>=|<=|\+\+|\-\-|\*=|\/=|\+=|\-=|&&|\|\||:\s*\d+|\d+\s+\d+)/.test(aiMessage.content)

                  // 如果包含代码但没有使用Markdown代码块格式
                  if (hasCode && !/```[\s\S]*```/.test(aiMessage.content)) {
                    // 尝试识别编程语言
                    let language = 'plain'
                    if (aiMessage.content.includes('#include')) language = 'c'
                    else if (aiMessage.content.includes('import ') || aiMessage.content.includes('def ') || aiMessage.content.includes('class ')) language = 'python'
                    else if (aiMessage.content.includes('function ') || aiMessage.content.includes('const ') || aiMessage.content.includes('let ') || aiMessage.content.includes('var ')) language = 'javascript'
                    else if (aiMessage.content.includes('public ') || aiMessage.content.includes('private ') || aiMessage.content.includes('class ') && aiMessage.content.includes('{')) language = 'java'
                    else if (aiMessage.content.includes('package ') || aiMessage.content.includes('import ')) language = 'java'

                    // 添加Markdown代码块格式
                    aiMessage.content = `\`\`\`${language}\n${aiMessage.content}\n\`\`\``
                    // 强制更新数组以触发响应式更新
                    this.chatMessages = [...this.chatMessages]
                  }
                }

                this.saveChatHistory()
                this.chatLoading = false
                this.addCopyButtons()
                return
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  // 追加内容到AI消息
                  this.chatMessages[assistantMessageIndex].content += parsed.content
                  this.scrollToBottom()
                } else if (parsed.error) {
                  throw new Error(parsed.error)
                }
              } catch (e) {
                // 解析流式数据失败
              }
            }
          }
        }

        this.saveChatHistory()
        this.chatLoading = false

      } catch (error) {
        // 如果是用户主动取消请求，保留已输出的内容
        if (error.name === 'AbortError') {
          // 保留已经输出的内容，不做其他操作
        } else {
          // 流式请求失败
          // 如果AI消息为空，显示错误消息
          if (!this.chatMessages[assistantMessageIndex].content) {
            this.chatMessages[assistantMessageIndex].content = '抱歉，AI服务暂时不可用，请稍后再试。'
          }
          this.saveChatHistory()
        }
        this.chatLoading = false
      }
    },
    /**
     * 生成文章
     */
    async generateArticle () {
      if (!this.articleForm.topic.trim()) {
        this.$message.warning('请输入文章主题')
        return
      }

      this.articleLoading = true

      try {
        const response = await axios.post('/ai/generate-article', this.articleForm)
        this.generatedArticle = response.data.article
      } catch (error) {
        this.$message.error('文章生成失败，请稍后再试')
      } finally {
        this.articleLoading = false
        this.addCopyButtons()
      }
    },
    /**
     * 使用提示词
     */
    usePrompt (prompt) {
      if (this.activeTab === 'chat') {
        this.chatInput = prompt.description
      } else if (this.activeTab === 'article') {
        this.articleForm.requirement = prompt.description
      }
    },
    /**
     * 复制文章到剪贴板
     */
    copyArticle () {
      navigator.clipboard.writeText(this.generatedArticle).then(() => {
        this.$message.success('文章已复制到剪贴板')
      })
    },
    /**
     * 编辑生成的文章
     */
    editArticle () {
      this.$router.push(`/article/new?content=${encodeURIComponent(this.generatedArticle)}`)
    },
    /**
     * 滚动到聊天底部
     */
    scrollToBottom () {
      this.$nextTick(() => {
        const chatMessages = this.$refs.chatMessages
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight
        }
      })
    },
    /**
     * 跳转到首页
     */
    goToHome () {
      this.$router.push('/')
    },
    /**
     * 跳转到个人中心
     */
    goToUserCenter () {
      this.$router.push('/user/center')
      this.userMenuVisible = false
    },
    /**
     * 跳转到管理员后台
     */
    goToAdmin () {
      this.$router.push('/admin')
      this.userMenuVisible = false
    },
    /**
     * 退出登录
     */
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    },
    /**
     * 切换用户菜单显示状态
     */
    toggleUserMenu () {
      this.userMenuVisible = !this.userMenuVisible
    }
  }
}
</script>

<style scoped>
.ai-assistant {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.ai-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  color: #409eff;
}

.nav-right {
  display: flex;
  align-items: center;
}

.nav-menu {
  margin-right: 20px;
}

.user-menu-container {
  position: relative;
}

.user-nav {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-nav:hover {
  background-color: #f5f7fa;
}

.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 120px;
}

.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.ai-main {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
}

.ai-container {
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.ai-tabs {
  margin-bottom: 20px;
}

/* 聊天界面样式 */
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message-content {
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  line-height: 1.5;
}

.message.user .message-content {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background-color: #f5f7fa;
  color: #303133;
  border-bottom-left-radius: 4px;
}

/* 对话消息中的Markdown样式 */
.message-content code {
  background-color: #e6e6e6;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

.message-content pre {
  background-color: #2d3748 !important;
  padding: 20px !important;
  border-radius: 8px !important;
  overflow-x: auto !important;
  margin: 16px 0 !important;
  position: relative !important;
  border: 2px solid #4a5568 !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
  font-family: 'Courier New', Courier, monospace !important;
}

.message-content pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 6px;
  left: 12px;
  font-size: 11px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
}

/* 代码块样式 */
.message-content pre {
  position: relative !important;
  border-radius: 8px !important;
  padding: 20px !important;
}

.message-content pre code {
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 14px !important;
  line-height: 1.6 !important;
}

.message-content pre .copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 12px !important;
  background: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  color: #606266 !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  z-index: 10 !important;
}

.message-content pre .copy-btn:hover {
  background: #ecf5ff !important;
  border-color: #409eff !important;
  color: #409eff !important;
}

/* 确保复制按钮始终在右上角 */
pre.copy-btn-wrapper {
  position: relative !important;
}

pre.copy-btn-wrapper .copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 12px !important;
  z-index: 100 !important;
}

/* 确保所有pre元素都有正确的定位 */
.message-content pre {
  position: relative !important;
}

.message-content pre .copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 12px !important;
  z-index: 1000 !important;
}

/* 确保按钮样式正确应用 */
.copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 12px !important;
  z-index: 1000 !important;
  background: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  color: #606266 !important;
  cursor: pointer !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
  outline: none !important;
}

/* 确保所有pre元素都有正确的定位 */
pre {
  position: relative !important;
}

/* 确保按钮在pre元素内正确定位 */
pre .copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 12px !important;
  z-index: 1000 !important;
}

.message-content strong {
  font-weight: bold;
}

.message-content em {
  font-style: italic;
}

.message-content ul,
.message-content ol {
  margin: 5px 0;
  padding-left: 20px;
}

.message-content li {
  margin: 3px 0;
}

.message-content a {
  color: #409eff;
  text-decoration: none;
}

.message-content a:hover {
  text-decoration: underline;
}

.message-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.chat-input {
  display: flex;
  gap: 12px;
}

.chat-input .el-input {
  flex: 1;
}

/* 文章生成界面样式 */
.article-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.generated-article {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fafafa;
  margin-top: 20px;
}

.generated-article h3 {
  margin-bottom: 16px;
  color: #303133;
}

/* Markdown渲染样式 */
.generated-article h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px;
  color: #303133;
}

.generated-article h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 18px 0 8px;
  color: #303133;
}

.generated-article h3 {
  font-size: 18px;
  font-weight: bold;
  margin: 16px 0 6px;
  color: #303133;
}

.generated-article p {
  margin: 10px 0;
  line-height: 1.6;
  color: #606266;
}

.generated-article code {
  background-color: #f5f7fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

.generated-article pre {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 16px 0;
  position: relative;
  border: 1px solid #dee2e6;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  font-family: 'Courier New', Courier, monospace;
}

.generated-article pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 8px;
  left: 16px;
  font-size: 12px;
  color: #999;
  font-family: 'Courier New', Courier, monospace;
  font-weight: 500;
}

/* 文章生成区域代码块样式 */
.generated-article pre {
  position: relative !important;
  border-radius: 8px !important;
  padding: 20px !important;
}

.generated-article pre code {
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.generated-article pre .copy-btn {
  position: absolute !important;
  top: 8px !important;
  right: 16px !important;
  background: #ffffff !important;
  border: 1px solid #e0e0e0 !important;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  font-size: 12px !important;
  color: #606266 !important;
  cursor: pointer !important;
  transition: all 0.3s !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
  z-index: 10 !important;
}

.generated-article pre .copy-btn:hover {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

.generated-article pre code .keyword {
  color: #c678dd;
}

.generated-article pre code .string {
  color: #98c379;
}

.generated-article pre code .comment {
  color: #5c6370;
}

.generated-article pre code .function {
  color: #61afef;
}

.generated-article pre code .number {
  color: #d19a66;
}

.generated-article pre code .operator {
  color: #e06c75;
}

.generated-article ul,
.generated-article ol {
  margin: 10px 0;
  padding-left: 20px;
}

.generated-article li {
  margin: 5px 0;
  line-height: 1.6;
}

.generated-article blockquote {
  border-left: 4px solid #409eff;
  padding-left: 16px;
  margin: 10px 0;
  color: #909399;
  background-color: #ecf5ff;
}

.generated-article a {
  color: #409eff;
  text-decoration: none;
}

.generated-article a:hover {
  text-decoration: underline;
}

.generated-article img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
}

/* 提示词库样式 */
.prompts-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prompt-categories {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.prompt-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.prompt-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.prompt-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.prompt-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.prompt-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
</style>