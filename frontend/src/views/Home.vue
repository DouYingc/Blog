<template>
  <div class="home">
    <el-container direction="vertical">
      <!-- 导航栏组件 -->
      <nav-bar @search="handleSearch"></nav-bar>

      <el-main class="main">
        <div class="main-layout">
          <!-- 左侧内容区 (75%) -->
          <div class="left-container">
            <!-- 公告栏 -->
            <announcement-bar></announcement-bar>
            <div class="articles-grid">
              <template v-if="articles.length > 0">
                <!-- 文章列表 -->
                <el-card v-for="article in articles" :key="article.id" class="article-card">
                  <div class="article-item">
                    <!-- 文章封面图 -->
                    <div class="article-cover" @click="viewDetail(article.id)">
                      <img :src="article.cover || getDefaultCover()" alt="封面">
                    </div>

                    <div class="article-content">
                      <div slot="header" class="clearfix article-header">
                        <span class="article-title" @click="viewDetail(article.id)">{{ article.title }}</span>
                        <el-tag v-if="article.is_top" size="mini" type="danger" style="margin-left: 10px">置顶</el-tag>
                      </div>
                      <!-- 文章摘要 -->
                      <div class="article-summary">{{ article.summary }}</div>
                      <!-- 文章信息 -->
                      <div class="article-footer">
                        <span class="article-info user-link"
                          @click.stop="$router.push(`/user/profile/${article.user_id}`)">
                          <i class="el-icon-user"></i> {{ article.User ? article.User.username : '未知' }}
                        </span>
                        <span class="article-info">
                          <i class="el-icon-date"></i> {{ new Date(article.created_at).toLocaleDateString() }}
                        </span>
                        <span class="article-info">
                          <i class="el-icon-view"></i> 阅读: {{ article.views }}
                        </span>
                        <span class="article-info">
                          <i class="el-icon-caret-top"></i> 点赞: {{ article.likes_count || 0 }}
                        </span>
                        <span class="article-info">
                          <i class="el-icon-star-on"></i> 收藏: {{ article.favorites_count || 0 }}
                        </span>
                        <span class="article-info" v-if="article.Category">
                          <i class="el-icon-folder"></i> {{ article.Category.name }}
                        </span>
                      </div>
                    </div>
                  </div>
                </el-card>
                <!-- 分页控件 -->
                <el-pagination layout="prev, pager, next" :total="total" :page-size="pageSize"
                  @current-change="handlePageChange" style="text-align: center; margin-top: 20px"></el-pagination>

                <!-- 随机文章推荐 -->
                <random-articles></random-articles>
              </template>
              <!-- 空状态 -->
              <el-card v-else class="empty-card">
                <el-empty description="该分类下暂无文章"></el-empty>
              </el-card>
            </div>
          </div>

          <!-- 右侧侧边栏 (25%) -->
          <div class="right-container">
            <!-- 文章分类 -->
            <el-card class="sidebar-card">
              <div slot="header">文章分类</div>
              <ul class="sidebar-list">
                <li :class="{ active: categoryId === null }" @click="filterByCategory(null)">全部文章</li>
                <li v-for="cat in categories" :key="cat.id" :class="{ active: categoryId === cat.id }"
                  @click="filterByCategory(cat.id)">{{ cat.name }}</li>
              </ul>
            </el-card>
            <!-- 社区动态 -->
            <el-card class="sidebar-card" style="margin-top: 20px">
              <div slot="header" class="sidebar-header">
                <span>社区动态</span>
                <el-button type="text" @click="$router.push('/messages')">更多</el-button>
              </div>
              <div class="mini-messages">
                <div v-for="msg in recentMessages" :key="msg.id" class="mini-msg-item">
                  <div class="mini-msg-info">
                    <strong>{{ msg.nickname }}</strong>
                    <span>{{ formatDate(msg.created_at) }}</span>
                  </div>
                  <div class="mini-msg-content">{{ msg.content }}</div>
                </div>
                <div v-if="recentMessages.length === 0" class="empty-mini">暂无动态</div>
              </div>
            </el-card>

            <!-- 热门文章 -->
            <popular-articles></popular-articles>

            <!-- 热门标签 -->
            <el-card class="sidebar-card" style="margin-top: 20px">
              <div slot="header">热门标签</div>
              <div class="tag-cloud">
                <el-tag v-for="tag in tags" :key="tag.id" size="small" :type="tagId === tag.id ? 'primary' : 'info'"
                  style="margin: 5px; cursor: pointer" @click="goToTagPage(tag.id)">{{ tag.name }}</el-tag>
              </div>
            </el-card>
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
/**
 * 首页组件
 * 功能：展示文章列表、分类、标签、社区动态等内容
 */
import axios from '../axios'
import NavBar from '@/components/NavBar.vue' // 导航栏组件
import AnnouncementBar from '@/components/AnnouncementBar.vue' // 公告栏组件
import PopularArticles from '@/components/PopularArticles.vue' // 热门文章组件
import RandomArticles from '@/components/RandomArticles.vue' // 随机文章推荐组件

export default {
  name: 'HomeView',
  components: {
    NavBar,
    AnnouncementBar,
    PopularArticles,
    RandomArticles
  },
  data () {
    return {
      articles: [], // 文章列表
      categories: [], // 分类列表
      tags: [], // 标签列表
      total: 0, // 总文章数
      pageSize: 10, // 每页文章数
      currentPage: 1, // 当前页码
      categoryId: null, // 当前分类ID
      tagId: null, // 当前标签ID
      keyword: '', // 搜索关键词
      recentMessages: [], // 最近留言
      currentUser: JSON.parse(localStorage.getItem('user') || '{}') // 当前用户
    }
  },
  computed: {
    /**
     * 是否已登录
     */
    isLoggedIn () {
      return !!localStorage.getItem('token')
    },
    /**
     * 是否为管理员
     */
    isAdmin () {
      return this.currentUser.role === 'admin'
    }
  },
  created () {
    // 重置滚动位置到顶部
    window.scrollTo(0, 0)
    // 获取搜索关键词
    this.keyword = this.$route.query.keyword || ''
    // 加载数据
    this.fetchArticles()
    this.fetchCategories()
    this.fetchTags()
    this.fetchRecentMessages()
  },
  watch: {
    /**
     * 监听搜索关键词变化
     */
    '$route.query.keyword' (newVal) {
      this.keyword = newVal || ''
      this.currentPage = 1
      this.fetchArticles()
    }
  },
  methods: {
    /**
     * 获取最近留言
     */
    async fetchRecentMessages () {
      try {
        const response = await axios.get('/messages')
        this.recentMessages = response.data.rows.slice(0, 5) // 只取前5条
      } catch (error) {
        console.error('获取最近留言失败', error)
        this.recentMessages = []
      }
    },
    /**
     * 格式化日期
     */
    formatDate (dateStr) {
      if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return '未知'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '无效日期'
      return `${date.getMonth() + 1}-${date.getDate()}`
    },
    /**
     * 处理搜索
     */
    handleSearch (keyword) {
      this.keyword = keyword
      this.currentPage = 1
      this.fetchArticles()
    },
    /**
     * 获取文章列表
     */
    async fetchArticles () {
      try {
        const response = await axios.get('/articles', {
          params: {
            page: this.currentPage,
            limit: this.pageSize,
            category_id: this.categoryId,
            tag_id: this.tagId,
            keyword: this.keyword
          }
        })
        this.articles = response.data.articles
        this.total = response.data.total
      } catch (error) {
        this.$message.error('获取文章列表失败')
      }
    },
    /**
     * 获取分类列表
     */
    async fetchCategories () {
      try {
        const response = await axios.get('/categories')
        this.categories = response.data
      } catch (error) {
        this.$message.error('获取分类失败')
      }
    },
    /**
     * 获取标签列表
     */
    async fetchTags () {
      try {
        const response = await axios.get('/tags')
        this.tags = response.data
      } catch (error) {
        this.$message.error('获取标签失败')
      }
    },
    /**
     * 处理分页变化
     */
    handlePageChange (page) {
      this.currentPage = page
      this.fetchArticles()
    },
    /**
     * 按分类筛选
     */
    filterByCategory (id) {
      this.categoryId = id
      this.tagId = null
      this.currentPage = 1
      this.fetchArticles()
    },
    /**
     * 跳转到标签页面
     */
    goToTagPage (id) {
      this.$router.push(`/tags/${id}`)
    },
    /**
     * 检查是否可以管理文章
     */
    canManage (article) {
      return this.isAdmin || (article.user_id === this.currentUser.id)
    },
    /**
     * 编辑文章
     */
    handleEdit (id) {
      this.$router.push(`/article/edit/${id}`)
    },
    /**
     * 删除文章
     */
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
        await axios.delete(`/articles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.fetchArticles()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('删除失败')
      }
    },
    /**
     * 查看文章详情
     */
    viewDetail (id) {
      this.$router.push(`/article/${id}`)
    },
    /**
     * 获取默认封面图
     */
    getDefaultCover () {
      const covers = [
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20blog%20cover%20with%20code%20and%20technology%20elements&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=programming%20coding%20laptop%20screen%20with%20code&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20technology%20digital%20abstract%20background&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=web%20development%20frontend%20design%20interface&image_size=landscape_16_9',
        'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=data%20analytics%20dashboard%20charts%20and%20graphs&image_size=landscape_16_9'
      ]
      return covers[Math.floor(Math.random() * covers.length)]
    },
    /**
     * 退出登录
     */
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$message.success('已退出登录')
      location.reload() // 刷新页面更新状态
    }
  }
}
</script>

<style scoped src="../assets/styles/views/Home.css"></style>
