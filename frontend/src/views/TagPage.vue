<template>
  <div class="tag-page">
    <el-container direction="vertical">
      <nav-bar></nav-bar>
      
      <el-main class="main">
        <div class="tag-header">
          <h1>{{ tagName }}</h1>
          <p class="tag-description">包含 {{ articles.length }} 篇文章</p>
        </div>
        
        <div class="articles-list">
          <el-card v-for="article in articles" :key="article.id" class="article-card">
            <div class="article-item">
              <div class="article-cover" @click="viewDetail(article.id)">
                <img :src="article.cover || getDefaultCover()" alt="封面">
              </div>
              
              <div class="article-content">
                <div class="article-header">
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
          
          <el-pagination 
            layout="prev, pager, next" 
            :total="total" 
            :page-size="pageSize"
            @current-change="handlePageChange" 
            style="text-align: center; margin-top: 20px">
          </el-pagination>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../axios'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'TagPage',
  components: { NavBar },
  data() {
    return {
      tagName: '',
      articles: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      tagId: null
    }
  },
  created() {
    window.scrollTo(0, 0)
    this.tagId = this.$route.params.id
    this.fetchTagInfo()
    this.fetchArticles()
  },
  watch: {
    '$route.params.id': {
      handler(newVal) {
        this.tagId = newVal
        this.currentPage = 1
        this.fetchTagInfo()
        this.fetchArticles()
      },
      immediate: true
    }
  },
  methods: {
    async fetchTagInfo() {
      try {
        const response = await axios.get(`/tags/${this.tagId}`)
        this.tagName = response.data.name
      } catch (error) {
        console.error('获取标签信息失败', error)
        this.tagName = '标签'
      }
    },
    async fetchArticles() {
      try {
        const response = await axios.get('/articles', {
          params: {
            page: this.currentPage,
            limit: this.pageSize,
            tag_id: this.tagId
          }
        })
        this.articles = response.data.articles
        this.total = response.data.total
      } catch (error) {
        console.error('获取文章列表失败', error)
      }
    },
    handlePageChange(page) {
      this.currentPage = page
      this.fetchArticles()
    },
    viewDetail(id) {
      this.$router.push(`/article/${id}`)
    },
    getDefaultCover() {
      const covers = [
        'https://img.icons8.com/fluency/96/000000/blog.png',
        'https://img.icons8.com/color/96/000000/blog.png',
        'https://img.icons8.com/color/96/000000/book.png',
        'https://img.icons8.com/fluency/96/000000/book.png',
        'https://img.icons8.com/color/96/000000/book-open.png'
      ]
      return covers[Math.floor(Math.random() * covers.length)]
    }
  }
}
</script>

<style scoped>
.tag-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.main {
  max-width: 1200px;
  margin: 80px auto 20px;
  padding: 0 20px;
}

.tag-header {
  text-align: center;
  margin-bottom: 40px;
}

.tag-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.tag-description {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-card {
  border-radius: 16px;
  border: none;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08);
}

.article-item {
  display: flex;
  gap: 24px;
  align-items: stretch;
}

.article-cover {
  width: 280px;
  height: 160px;
  flex-shrink: 0;
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.article-cover:hover img {
  transform: scale(1.08);
}

.article-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.article-header {
  margin-bottom: 16px;
}

.article-title {
  font-size: 22px;
  font-weight: 600;
  cursor: pointer;
  color: #1f2937;
  line-height: 1.3;
  margin-bottom: 8px;
}

.article-title:hover {
  color: #409eff;
}

.article-summary {
  margin: 12px 0 20px 0;
  color: #6b7280;
  line-height: 1.7;
  font-size: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  gap: 24px;
  color: #9ca3af;
  font-size: 14px;
  align-items: center;
  flex-wrap: wrap;
}

.article-info i {
  margin-right: 5px;
}

.user-link {
  cursor: pointer;
  transition: color 0.2s;
}

.user-link:hover {
  color: #409eff;
}
</style>
