<template>
  <div class="related-articles" v-if="articles.length > 0">
    <div class="section-header">
      <h3>相关文章</h3>
      <el-divider></el-divider>
    </div>

    <div class="articles-list" v-loading="loading">
      <div v-for="article in articles" :key="article.id" class="article-card"
        @click="$router.push(`/article/${article.id}`)">
        <div class="article-content">
          <h4 class="article-title">{{ article.title }}</h4>
          <div class="article-meta">
            <span class="article-category">{{ article.Category?.name || '未分类' }}</span>
            <span class="article-separator">·</span>
            <span class="article-views">{{ article.views }} 阅读</span>
            <span class="article-separator">·</span>
            <span class="article-date">{{ formatDate(article.created_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 相关文章组件
 * 功能：根据当前文章ID获取并展示相关文章列表
 */
import axios from '../axios' // 网络请求

export default {
  name: 'RelatedArticles',
  props: {
    /**
     * 文章ID
     * @type {Number}
     * @required
     */
    articleId: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      articles: [], // 相关文章列表
      loading: false // 加载状态
    }
  },
  watch: {
    /**
     * 监听文章ID变化，重新获取相关文章
     */
    articleId: {
      handler () {
        this.fetchRelatedArticles()
      },
      immediate: true // 立即执行
    }
  },
  methods: {
    /**
     * 获取相关文章
     */
    async fetchRelatedArticles () {
      if (!this.articleId) return

      this.loading = true
      try {
        const response = await axios.get(`/articles/${this.articleId}/related`)
        this.articles = response.data
      } catch (error) {
        console.error('获取相关文章失败:', error)
      } finally {
        this.loading = false
      }
    },
    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    formatDate (dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/**
 * 相关文章组件样式
 */
.related-articles {
  margin-top: 40px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.article-card {
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
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

.article-category {
  background-color: #ecf5ff;
  color: #409eff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.article-date {
  color: #909399;
}
</style>
