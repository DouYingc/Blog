<template>
  <div class="home">
    <el-container direction="vertical">
      <nav-bar @search="handleSearch"></nav-bar>

      <el-main class="main">
        <div class="main-layout">
          <!-- 左侧内容区 (75%) -->
          <div class="left-container">
            <div class="article-list">
              <template v-if="articles.length > 0">
                <el-card v-for="article in articles" :key="article.id" class="article-card">
                  <div class="article-item">
                    <!-- 文章封面图 -->
                    <div v-if="article.cover" class="article-cover" @click="viewDetail(article.id)">
                      <img :src="article.cover" alt="封面">
                    </div>

                    <div class="article-content">
                      <div slot="header" class="clearfix article-header">
                        <span class="article-title" @click="viewDetail(article.id)">{{ article.title }}</span>
                        <el-tag v-if="article.is_top" size="mini" type="danger" style="margin-left: 10px">置顶</el-tag>

                      </div>
                      <div class="article-summary">{{ article.summary }}</div>
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
                <el-pagination layout="prev, pager, next" :total="total" :page-size="pageSize"
                  @current-change="handlePageChange" style="text-align: center; margin-top: 20px"></el-pagination>
              </template>
              <el-card v-else class="empty-card">
                <el-empty description="该分类下暂无文章"></el-empty>
              </el-card>
            </div>
          </div>

          <!-- 右侧侧边栏 (25%) -->
          <div class="right-container">
            <el-card class="sidebar-card">
              <div slot="header">文章分类</div>
              <ul class="sidebar-list">
                <li :class="{ active: categoryId === null }" @click="filterByCategory(null)">全部文章</li>
                <li v-for="cat in categories" :key="cat.id" :class="{ active: categoryId === cat.id }"
                  @click="filterByCategory(cat.id)">{{ cat.name }}</li>
              </ul>
            </el-card>
            <!-- 留言板侧边栏快捷入口 (论坛化增强) -->
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

            <el-card class="sidebar-card" style="margin-top: 20px">
              <div slot="header">热门讨论</div>
              <ul class="sidebar-list">
                <li v-for="art in hotArticles" :key="art.id" @click="viewDetail(art.id)">
                  <div class="hot-item">
                    <span class="hot-title">{{ art.title }}</span>
                    <span class="hot-views"><i class="el-icon-view"></i> {{ art.views }}</span>
                  </div>
                </li>
              </ul>
            </el-card>

            <el-card class="sidebar-card" style="margin-top: 20px">
              <div slot="header">热门标签</div>
              <div class="tag-cloud">
                <el-tag v-for="tag in tags" :key="tag.id" size="small" :type="tagId === tag.id ? 'primary' : 'info'"
                  style="margin: 5px; cursor: pointer" @click="filterByTag(tag.id)">{{ tag.name }}</el-tag>
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
  name: 'HomeView',
  components: { NavBar },
  data () {
    return {
      articles: [],
      categories: [],
      tags: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      categoryId: null,
      tagId: null,
      keyword: '',
      recentMessages: [],
      hotArticles: [],
      currentUser: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  computed: {
    isLoggedIn () {
      return !!localStorage.getItem('token')
    },
    isAdmin () {
      return this.currentUser.role === 'admin'
    }
  },
  created () {
    // 重置滚动位置到顶部
    window.scrollTo(0, 0)
    this.keyword = this.$route.query.keyword || ''
    this.fetchArticles()
    this.fetchCategories()
    this.fetchTags()
    this.fetchRecentMessages()
    this.fetchHotArticles()
  },
  watch: {
    '$route.query.keyword' (newVal) {
      this.keyword = newVal || ''
      this.currentPage = 1
      this.fetchArticles()
    }
  },
  methods: {
    async fetchHotArticles () {
      try {
        const response = await axios.get('/articles', {
          params: { limit: 5, order: 'views' } // 后端需支持按阅读量排序
        })
        this.hotArticles = response.data.articles
      } catch (error) {
        console.error('获取热门文章失败', error)
      }
    },
    async fetchRecentMessages () {
      try {
        const response = await axios.get('/messages')
        this.recentMessages = response.data.rows.slice(0, 5) // 只取前5条
      } catch (error) {
        console.error('获取最近留言失败', error)
        this.recentMessages = []
      }
    },
    formatDate (dateStr) {
      if (!dateStr || dateStr === 'undefined' || dateStr === 'null') return '未知'
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '无效日期'
      return `${date.getMonth() + 1}-${date.getDate()}`
    },
    handleSearch (keyword) {
      this.keyword = keyword
      this.currentPage = 1
      this.fetchArticles()
    },
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
    async fetchCategories () {
      try {
        const response = await axios.get('/categories')
        this.categories = response.data
      } catch (error) {
        this.$message.error('获取分类失败')
      }
    },
    async fetchTags () {
      try {
        const response = await axios.get('/tags')
        this.tags = response.data
      } catch (error) {
        this.$message.error('获取标签失败')
      }
    },
    handlePageChange (page) {
      this.currentPage = page
      this.fetchArticles()
    },
    filterByCategory (id) {
      this.categoryId = id
      this.tagId = null
      this.currentPage = 1
      this.fetchArticles()
    },
    filterByTag (id) {
      this.tagId = id
      this.categoryId = null
      this.currentPage = 1
      this.fetchArticles()
    },
    canManage (article) {
      return this.isAdmin || (article.user_id === this.currentUser.id)
    },
    handleEdit (id) {
      this.$router.push(`/article/edit/${id}`)
    },
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
    viewDetail (id) {
      this.$router.push(`/article/${id}`)
    },
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
