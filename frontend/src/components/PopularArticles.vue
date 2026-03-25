<template>
  <div class="popular-articles">
    <div class="section-header">
      <h3>热门文章</h3>
      <el-divider></el-divider>
    </div>

    <div class="articles-list" v-loading="loading">
      <div v-for="(article, index) in articles" :key="article.id" class="article-card"
        @click="$router.push(`/article/${article.id}`)">
        <div class="article-rank">{{ index + 1 }}</div>
        <div class="article-content">
          <h4 class="article-title">{{ article.title }}</h4>
          <div class="article-meta">
            <span class="article-author">{{ article.User.username }}</span>
            <span class="article-separator">·</span>
            <span class="article-views">{{ article.views }} 阅读</span>
            <span class="article-separator">·</span>
            <span class="article-likes">{{ article.likes_count || 0 }} 点赞</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'PopularArticles',
  data () {
    return {
      articles: [],
      loading: false
    }
  },
  mounted () {
    this.fetchPopularArticles()
  },
  methods: {
    async fetchPopularArticles () {
      this.loading = true
      try {
        const response = await axios.get('/articles/popular', {
          params: { limit: 10 }
        })
        this.articles = response.data
      } catch (error) {
        console.error('获取热门文章失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.popular-articles {
  padding: 20px;
}

.section-header {
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.articles-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.article-card {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-rank {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5568;
  margin-right: 12px;
}

.article-rank:nth-child(-n+3) {
  background-color: #409eff;
  color: white;
}

.article-content {
  flex: 1;
}

.article-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 500;
  color: #2d3748;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #718096;
}

.article-separator {
  margin: 0 6px;
  color: #cbd5e0;
}

.article-author {
  color: #409eff;
  font-weight: 500;
}
</style>
