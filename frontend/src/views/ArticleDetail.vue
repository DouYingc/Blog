<template>
  <div class="article-detail">
    <el-container direction="vertical">
      <!-- 导航栏 -->
      <nav-bar></nav-bar>

      <!-- 阅读进度条 -->
      <div class="reading-progress">
        <div class="reading-progress-bar" :style="{ width: readingProgress + '%' }"></div>
      </div>

      <el-main class="main" :style="mainStyle">
        <div class="article-layout">
          <!-- 左侧：文章内容 -->
          <div class="article-content">
            <el-card class="detail-card">
              <!-- 错误提示 -->
              <el-alert v-if="errorMsg" :title="errorMsg" type="error" show-icon style="margin-bottom: 20px"></el-alert>
              <div slot="header">
                <div class="title-wrapper">
                  <!-- 文章标题 -->
                  <h1 class="title">{{ article.title }}</h1>
                  <!-- 文章管理操作 -->
                  <div v-if="canManage" class="detail-manage">
                    <el-button type="primary" size="small" icon="el-icon-edit" @click="handleEdit">编辑文章</el-button>
                    <el-button type="danger" size="small" icon="el-icon-delete" @click="handleDelete">删除文章</el-button>
                  </div>
                </div>
                <!-- 文章元信息 -->
                <div class="meta">
                  <span class="user-link" @click="$router.push(`/user/profile/${article.user_id}`)">
                    <i class="el-icon-user"></i> {{ article.User ? article.User.username : '未知' }}
                  </span>
                  <span><i class="el-icon-date"></i> {{ formatDate(article.created_at) }}</span>
                  <span v-if="article.Category"><i class="el-icon-folder"></i> {{ article.Category.name }}</span>
                  <span><i class="el-icon-view"></i> 阅读: {{ article.views }}</span>
                </div>
              </div>
              <!-- 文章内容 -->
              <div class="content markdown-body" v-html="article.html_content"></div>
              <!-- 文章标签 -->
              <div class="tags" v-if="article.Tags && article.Tags.length">
                <el-tag v-for="tag in article.Tags" :key="tag.id" size="mini" style="margin-right: 5px">{{ tag.name
                  }}</el-tag>
              </div>

              <!-- 交互操作：点赞、收藏与分享 -->
              <div class="interactions">
                <div class="interaction-item" v-if="isLoggedIn">
                  <el-button :type="isLiked ? 'primary' : 'default'" icon="el-icon-caret-top" circle @click="handleLike"
                    :title="isLiked ? '取消点赞' : '点赞'"></el-button>
                  <span class="count">{{ article.likes_count || 0 }}</span>
                  <span class="label">点赞</span>
                </div>
                <div class="interaction-item" v-if="isLoggedIn">
                  <el-button :type="isFavorited ? 'warning' : 'default'" icon="el-icon-star-on" circle
                    @click="handleFavorite" :title="isFavorited ? '取消收藏' : '收藏'"></el-button>
                  <span class="count">{{ article.favorites_count || 0 }}</span>
                  <span class="label">收藏</span>
                </div>
                <div class="interaction-item share-item">
                  <el-dropdown @command="handleShare" trigger="click">
                    <div class="share-button">
                      <i class="el-icon-share"></i>
                      <span>分享</span>
                    </div>
                    <el-dropdown-menu slot="dropdown" class="share-dropdown">
                      <el-dropdown-item command="copy" class="share-option">
                        <i class="el-icon-link"></i>
                        <span>复制链接</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="wechat" class="share-option">
                        <i class="el-icon-chat-dot-round"></i>
                        <span>微信</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="weibo" class="share-option">
                        <i class="el-icon-share"></i>
                        <span>微博</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="qq" class="share-option">
                        <i class="el-icon-chat-line-round"></i>
                        <span>QQ</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
                </div>
              </div>
            </el-card>

            <!-- 相关文章 -->
            <related-articles v-if="article.id" :article-id="article.id"></related-articles>

            <!-- 评论区 -->
            <el-card class="comments-card" style="margin-top: 20px">
              <div slot="header" class="comment-header-title">全部评论 ({{ commentsCount }})</div>

              <!-- 评论输入框 -->
              <el-form :model="commentForm" ref="commentForm" class="comment-form">
                <div class="comment-input-row">
                  <el-avatar :size="40" :src="currentUser.avatar || ''" icon="el-icon-user"></el-avatar>
                  <div class="input-main">
                    <el-row :gutter="10" v-if="!isLoggedIn" style="margin-bottom: 10px">
                      <el-col :span="12">
                        <el-input v-model="commentForm.nickname" placeholder="昵称 (必填)" size="small"></el-input>
                      </el-col>
                      <el-col :span="12">
                        <el-input v-model="commentForm.email" placeholder="邮箱 (可选)" size="small"></el-input>
                      </el-col>
                    </el-row>
                    <el-input type="textarea" :rows="3" v-model="commentForm.content" :placeholder="replyPlaceholder"
                      @focus="onCommentFocus"></el-input>
                    <div class="form-actions" v-if="commentForm.content || showActions">
                      <el-button v-if="commentForm.parent_id" size="small" @click="cancelReply">取消回复</el-button>
                      <el-button type="primary" size="small" @click="submitComment">提交评论</el-button>
                    </div>
                  </div>
                </div>
              </el-form>

              <!-- 评论列表 -->
              <div class="comment-list">
                <div v-for="comment in nestedComments" :key="comment.id" class="comment-item"
                  :id="`comment-${comment.id}`">
                  <div class="comment-main">
                    <el-avatar :size="40" :src="comment.User ? comment.User.avatar : ''"
                      icon="el-icon-user"></el-avatar>
                    <div class="comment-body">
                      <div class="comment-info">
                        <span class="nickname" :class="{ 'user-link': !!comment.user_id }"
                          @click="comment.user_id && $router.push(`/user/profile/${comment.user_id}`)">{{
                            comment.nickname
                          }}</span>
                        <span class="date">{{ formatDate(comment.created_at) }}</span>
                      </div>
                      <div class="comment-text">{{ comment.content }}</div>
                      <div class="comment-footer">
                        <div class="comment-actions">
                          <span class="action-btn like-btn" v-if="isLoggedIn"
                            :class="{ 'liked': isCommentLiked(comment.id) }" @click="handleCommentLike(comment)">
                            <i class="el-icon-star-on"></i> {{ comment.likes_count || 0 }}
                          </span>
                          <span class="action-btn reply-btn" @click="toggleReplyForm(comment)">
                            <i class="el-icon-chat-line-round"></i> 回复
                          </span>
                        </div>
                      </div>

                      <!-- 嵌入式回复表单 -->
                      <div v-if="comment.showReplyForm" class="reply-form-container">
                        <el-form :model="getReplyForm(comment.id)" ref="replyForm" class="reply-form">
                          <el-input type="textarea" :rows="2" v-model="getReplyForm(comment.id).content"
                            placeholder="写下你的回复..." @keyup.enter.prevent="submitReply(comment)"></el-input>
                          <div class="reply-form-actions">
                            <el-button size="small" @click="toggleReplyForm(comment)">取消</el-button>
                            <el-button type="primary" size="small" @click="submitReply(comment)">回复</el-button>
                          </div>
                        </el-form>
                      </div>

                      <!-- 子评论 (二级评论) -->
                      <div v-if="comment.replies && comment.replies.length" class="reply-list">
                        <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                          <el-avatar :size="30" :src="reply.User ? reply.User.avatar : ''"
                            icon="el-icon-user"></el-avatar>
                          <div class="reply-body">
                            <div class="comment-info">
                              <span class="nickname" :class="{ 'user-link': !!reply.user_id }"
                                @click="reply.user_id && $router.push(`/user/profile/${reply.user_id}`)">{{
                                  reply.nickname
                                }}</span>
                              <span class="date">{{ formatDate(reply.created_at) }}</span>
                            </div>
                            <div class="comment-text">{{ reply.content }}</div>
                            <div class="comment-footer">
                              <div class="comment-actions">
                                <span class="action-btn like-btn" v-if="isLoggedIn"
                                  :class="{ 'liked': isCommentLiked(reply.id) }" @click="handleCommentLike(reply)">
                                  <i class="el-icon-star-on"></i> {{ reply.likes_count || 0 }}
                                </span>
                                <span class="action-btn reply-btn" @click="toggleReplyForm(reply, comment.id)">
                                  <i class="el-icon-chat-line-round"></i> 回复
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="comments.length === 0" class="no-comments">暂无评论，快来抢沙发吧！</div>
              </div>
            </el-card>
          </div>

          <!-- 右侧：目录 -->
          <div class="toc-sidebar" v-if="toc.length">
            <div class="toc-container">
              <h3 class="toc-title">目录</h3>
              <div class="toc-list">
                <a v-for="item in toc" :key="item.id" class="toc-item" :class="`lv-${item.level}`"
                  href="javascript:void(0)" @click="scrollToHeading(item.id)">
                  {{ item.text }}
                </a>
              </div>
            </div>
          </div>
        </div>
        <el-backtop :bottom="40" :right="40"></el-backtop>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
 * 文章详情页组件
 * 功能：展示文章详情、目录、评论，支持点赞、收藏、分享等交互功能
 */
import axios from '../axios' // 网络请求
import 'github-markdown-css/github-markdown.css' // Markdown样式
import RelatedArticles from '@/components/RelatedArticles.vue' // 相关文章组件
import NavBar from '@/components/NavBar.vue' // 导航栏组件

export default {
  name: 'ArticleDetail',
  components: {
    RelatedArticles,
    NavBar
  },
  data () {
    return {
      article: {}, // 文章详情数据
      comments: [], // 评论列表
      commentForm: {
        nickname: '', // 评论昵称
        email: '', // 评论邮箱
        content: '', // 评论内容
        parent_id: null // 父评论ID（用于回复）
      },
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'), // 当前用户信息
      isLiked: false, // 是否已点赞
      isFavorited: false, // 是否已收藏
      showActions: false, // 是否显示评论操作按钮
      replyPlaceholder: '写下你的评论...', // 回复占位符
      errorMsg: '', // 错误信息
      toc: [], // 文章目录

      readingProgress: 0, // 阅读进度
      replyForms: {}, // 回复表单数据
      commentLikes: new Set() // 评论点赞状态
    }
  },
  computed: {
    /**
     * 主内容区域样式
     */
    mainStyle () {
      return {
        maxWidth: '1200px',
        width: '100%',
        margin: '80px auto 20px',
        padding: '0 20px',
        minHeight: 'calc(100vh - 100px)'
      }
    },
    /**
     * 是否已登录
     */
    isLoggedIn () {
      return !!localStorage.getItem('token')
    },
    /**
     * 是否可以管理文章
     */
    canManage () {
      if (!this.isLoggedIn || !this.article.id) return false
      return this.currentUser.role === 'admin' || (this.article.user_id === this.currentUser.id)
    },
    /**
     * 评论数量
     */
    commentsCount () {
      return this.comments.length
    },
    /**
     * 嵌套评论结构
     */
    nestedComments () {
      const roots = this.comments.filter(c => !c.parent_id)
      return roots.map(root => ({
        ...root,
        replies: this.comments.filter(c => c.parent_id === root.id)
      }))
    }
  },
  mounted () {
    // 重置滚动位置到顶部
    window.scrollTo(0, 0)
    this.updateReadingProgress()
    window.addEventListener('scroll', this.updateReadingProgress, { passive: true })
  },
  beforeDestroy () {
    window.removeEventListener('scroll', this.updateReadingProgress)
  },
  watch: {
    // 监听路由变化，重新获取数据并重置滚动位置
    '$route.params.id': {
      handler: function () {
        // 重置滚动位置到顶部
        window.scrollTo(0, 0)
        this.fetchArticle()
        this.fetchComments()
        if (this.isLoggedIn) {
          this.fetchInteractionStatus()
          this.fetchCommentLikes()
        }
        this.initCommentForm()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 更新阅读进度
     */
    updateReadingProgress () {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
      const total = (document.documentElement.scrollHeight || 0) - (document.documentElement.clientHeight || 0)
      const progress = total > 0 ? (scrollTop / total) * 100 : 0
      this.readingProgress = Math.max(0, Math.min(100, Math.round(progress)))
    },
    /**
     * 构建文章目录
     */
    buildToc () {
      // 确保有文章数据和html_content
      if (!this.article || !this.article.html_content) {
        this.toc = []
        return
      }

      // 先清空目录
      this.toc = []

      // 等待DOM渲染完成后再处理
      this.$nextTick(() => {
        const contentElement = document.querySelector('.content')
        if (contentElement) {
          const headings = contentElement.querySelectorAll('h1,h2,h3')

          if (headings.length === 0) {
            this.toc = []
            return
          }

          // 为每个标题设置ID并生成目录
          this.toc = Array.from(headings).map((h, idx) => {
            const level = parseInt(h.tagName.replace('H', ''), 10)
            const text = h.textContent.trim()
            const id = `heading-${idx}`

            // 确保标题有ID
            h.setAttribute('id', id)

            return { id, text, level }
          }).filter(item => item.text)
        }
      })
    },

    /**
     * 初始化评论表单
     */
    initCommentForm () {
      if (this.isLoggedIn) {
        this.commentForm.nickname = this.currentUser.username
        this.commentForm.email = this.currentUser.email || ''
      }
    },
    /**
     * 评论输入框获得焦点
     */
    onCommentFocus () {
      this.showActions = true
    },
    /**
     * 处理回复评论
     */
    handleReply (comment, parentId = null) {
      this.commentForm.parent_id = parentId || comment.id
      this.commentForm.content = `@${comment.nickname} `
      this.replyPlaceholder = `回复 @${comment.nickname}`
      this.showActions = true
      // 滚动到输入框
      document.querySelector('.comment-form').scrollIntoView({ behavior: 'smooth' })
    },
    /**
     * 取消回复
     */
    cancelReply () {
      this.commentForm.parent_id = null
      this.commentForm.content = ''
      this.replyPlaceholder = '写下你的评论...'
      this.showActions = false
    },
    /**
     * 获取文章详情
     */
    async fetchArticle () {
      try {
        const id = this.$route.params.id
        if (!id) {
          this.errorMsg = '文章 ID 缺失'
          this.$message.error('文章 ID 缺失')
          return
        }
        const response = await axios.get(`/articles/${id}`)
        this.article = response.data
        this.errorMsg = ''
        this.buildToc()
        this.$nextTick(() => {
          this.updateReadingProgress()
        })
      } catch (error) {
        console.error('获取文章详情失败:', error)
        this.article = {}
        const url = `/articles/${this.$route.params.id}`
        this.errorMsg = `获取文章失败: ${error.message} (URL: ${url})`
        this.$message.error('获取文章详情失败')
        this.toc = []
      }
    },
    /**
     * 获取交互状态
     */
    async fetchInteractionStatus () {
      try {
        const response = await axios.get(`/interactions/status/${this.$route.params.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.isLiked = response.data.isLiked
        this.isFavorited = response.data.isFavorited
      } catch (error) {
        console.error('获取交互状态失败', error)
      }
    },
    /**
     * 处理点赞
     */
    async handleLike () {
      try {
        const response = await axios.post('/interactions/like',
          { article_id: this.article.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        this.isLiked = response.data.isLiked
        this.$message.success(response.data.message)
        this.fetchArticle() // 重新获取以更新计数
      } catch (error) {
        this.$message.error('点赞失败')
      }
    },
    /**
     * 处理收藏
     */
    async handleFavorite () {
      try {
        const response = await axios.post('/interactions/favorite',
          { article_id: this.article.id },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        this.isFavorited = response.data.isFavorited
        this.$message.success(response.data.message)
        this.fetchArticle() // 重新获取以更新计数
      } catch (error) {
        this.$message.error('收藏失败')
      }
    },
    /**
     * 检查评论是否已点赞
     */
    isCommentLiked (commentId) {
      return this.commentLikes.has(commentId)
    },

    /**
     * 切换回复表单显示状态
     */
    toggleReplyForm (comment, parentId = null) {
      // 直接更新状态，避免延迟
      comment.showReplyForm = !comment.showReplyForm
      if (comment.showReplyForm) {
        // 直接创建回复表单对象
        this.replyForms = {
          ...this.replyForms,
          [comment.id]: {
            content: '',
            parent_id: parentId || comment.id
          }
        }
      } else {
        // 直接删除回复表单对象
        const newReplyForms = { ...this.replyForms }
        delete newReplyForms[comment.id]
        this.replyForms = newReplyForms
      }
    },

    /**
     * 获取回复表单数据
     */
    getReplyForm (commentId) {
      if (!this.replyForms[commentId]) {
        // 确保回复表单对象存在
        this.replyForms = {
          ...this.replyForms,
          [commentId]: {
            content: '',
            parent_id: null
          }
        }
      }
      return this.replyForms[commentId]
    },

    /**
     * 提交回复
     */
    async submitReply (comment) {
      const replyForm = this.getReplyForm(comment.id)
      if (!replyForm.content.trim()) {
        this.$message.warning('回复内容不能为空')
        return
      }

      try {
        const response = await axios.post('/comments', {
          article_id: this.article.id,
          content: replyForm.content,
          parent_id: replyForm.parent_id,
          nickname: this.currentUser.username,
          email: this.currentUser.email || ''
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        this.$message.success('回复成功')
        this.toggleReplyForm(comment)
        this.fetchComments()
      } catch (error) {
        this.$message.error('回复失败')
      }
    },

    /**
     * 获取评论点赞状态
     */
    async fetchCommentLikes () {
      if (!this.isLoggedIn) return

      try {
        const response = await axios.get(`/comments/likes`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        // 确保正确设置点赞状态
        this.commentLikes.clear()
        if (response.data && response.data.likedCommentIds) {
          response.data.likedCommentIds.forEach(id => {
            this.commentLikes.add(id)
          })
        }
      } catch (error) {
        console.error('获取评论点赞状态失败', error)
        // 出错时清空点赞状态，避免错误显示
        this.commentLikes.clear()
      }
    },

    /**
     * 处理评论点赞
     */
    async handleCommentLike (comment) {
      if (this.isCommentLiked(comment.id)) {
        this.$message.warning('已经点赞过了')
        return
      }

      try {
        const response = await axios.post(`/comments/${comment.id}/like`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        // 更新原始comments数组中的评论对象，确保响应式更新
        const originalComment = this.comments.find(c => c.id === comment.id)
        if (originalComment) {
          this.$set(originalComment, 'likes_count', response.data.likes_count)
        }

        // 同时更新传入的评论对象
        this.$set(comment, 'likes_count', response.data.likes_count)

        // 更新点赞状态
        this.commentLikes.add(comment.id)

        // 强制重新渲染嵌套评论
        this.$forceUpdate()

        this.$message.success(response.data.message)
      } catch (error) {
        this.$message.error('点赞失败')
      }
    },
    /**
     * 编辑文章
     */
    handleEdit () {
      this.$router.push(`/article/edit/${this.article.id}`)
    },
    /**
     * 删除文章
     */
    async handleDelete () {
      try {
        await this.$confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
        await axios.delete(`/articles/${this.article.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.$router.push('/')
      } catch (error) {
        if (error !== 'cancel') this.$message.error('删除失败')
      }
    },
    /**
     * 获取评论列表
     */
    async fetchComments () {
      try {
        const id = this.$route.params.id
        const response = await axios.get(`/comments/article/${id}`)
        // 按创建时间倒序排序，新评论在前
        this.comments = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        if (this.isLoggedIn) {
          this.fetchCommentLikes()
        }

        // 检查是否需要滚动到特定评论
        this.$nextTick(() => {
          const commentId = sessionStorage.getItem('scrollToCommentId')
          if (commentId) {
            const commentElement = document.getElementById(`comment-${commentId}`)
            if (commentElement) {
              setTimeout(() => {
                commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 300)
            }
            sessionStorage.removeItem('scrollToCommentId')
          }
        })
      } catch (error) {
        console.error('获取评论失败', error)
      }
    },
    /**
     * 滚动到标题
     */
    scrollToHeading (id) {
      const element = document.getElementById(id)
      if (element) {
        // 计算滚动位置，减去导航栏高度(60px)和额外的20px间距
        const offsetTop = element.offsetTop - 80
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        })
      }
    },
    /**
     * 提交评论
     */
    async submitComment () {
      if (!this.commentForm.nickname || !this.commentForm.content) {
        this.$message.warning('请填写昵称和内容')
        return
      }
      try {
        const headers = {}
        const token = localStorage.getItem('token')
        if (token) {
          headers.Authorization = `Bearer ${token}`
        }

        await axios.post('/comments', {
          ...this.commentForm,
          article_id: this.article.id
        }, { headers })

        this.$message.success('评论成功')
        this.commentForm.content = ''
        this.cancelReply()
        this.fetchComments()
      } catch (error) {
        this.$message.error('评论失败')
      }
    },
    /**
     * 格式化日期
     */
    formatDate (dateStr) {
      if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return '未知时间'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '无效日期'
      const Y = date.getFullYear()
      const M = (date.getMonth() + 1).toString().padStart(2, '0')
      const D = date.getDate().toString().padStart(2, '0')
      const h = date.getHours().toString().padStart(2, '0')
      const m = date.getMinutes().toString().padStart(2, '0')
      if (isNaN(Y) || isNaN(date.getMonth()) || isNaN(date.getDate())) return '无效日期'
      return `${Y}-${M}-${D} ${h}:${m}`
    },
    /**
     * 处理分享
     */
    handleShare (command) {
      const shareUrl = `${window.location.origin}/article/${this.article.id}`
      const shareTitle = this.article.title

      switch (command) {
        case 'copy':
          navigator.clipboard.writeText(shareUrl).then(() => {
            this.$message.success('链接已复制到剪贴板')
          }).catch(() => {
            this.$message.error('复制失败')
          })
          break
        case 'wechat':
          this.$message.info('请扫描二维码分享到微信')
          // 可以添加微信分享的二维码生成逻辑
          break
        case 'weibo':
          const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
          window.open(weiboUrl, '_blank', 'width=600,height=400')
          break
        case 'qq':
          const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`
          window.open(qqUrl, '_blank', 'width=600,height=400')
          break
        default:
          break
      }
    }
  }
}
</script>

<style scoped src="../assets/styles/views/ArticleDetail.css"></style>
