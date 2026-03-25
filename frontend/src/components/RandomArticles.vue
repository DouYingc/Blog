<template>
  <div class="random-articles">
    <div class="section-header">
      <h3>发现更多</h3>
      <el-divider></el-divider>
    </div>
    
    <div class="articles-grid" v-loading="loading">
      <div 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card"
        @click="$router.push(`/article/${article.id}`)"
      >
        <div v-if="article.cover" class="article-cover">
          <img :src="article.cover" :alt="article.title">
        </div>
        <div class="article-content">
          <h4 class="article-title">{{ article.title }}</h4>
          <div class="article-meta">
            <span class="article-author">{{ article.User.username }}</span>
            <span class="article-separator">·</span>
            <span class="article-views">{{ article.views }} 阅读</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="load-more">
      <el-button type="primary" @click="fetchRandomArticles" :loading="loading">
        <i class="el-icon-refresh"></i>
        换一批
      </el-button>
    </div>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'RandomArticles',
  data() {
    return {
      articles: [],
      loading: false
    }
  },
  mounted() {
    this.fetchRandomArticles()
  },
  methods: {
    async fetchRandomArticles() {
      this.loading = true
      try {
        const response = await axios.get('/articles/random', {
          params: { limit: 6 }
        })
        this.articles = response.data
      } catch (error) {
        console.error('获取随机文章失败:', error)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.random-articles {
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

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.article-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.article-cover {
  height: 160px;
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.article-card:hover .article-cover img {
  transform: scale(1.05);
}

.article-content {
  padding: 16px;
}

.article-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

.load-more {
  text-align: center;
}

.load-more .el-button {
  border-radius: 20px;
  padding: 8px 24px;
}
</style>
