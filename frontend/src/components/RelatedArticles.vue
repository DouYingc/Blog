<template>
  <div class="related-articles" v-if="articles.length > 0">
    <div class="related-title">相关推荐</div>
    <el-row :gutter="20">
      <el-col :span="6" v-for="article in articles" :key="article.id">
        <el-card shadow="hover" :body-style="{ padding: '0px' }" class="related-card"
          @click.native="goToArticle(article.id)">
          <div class="image-placeholder" v-if="!article.cover">
            {{ article.title.charAt(0) }}
          </div>
          <img v-else :src="article.cover" class="image">
          <div style="padding: 14px;">
            <div class="related-article-title" :title="article.title">{{ article.title }}</div>
            <div class="related-article-meta">
              <span><i class="el-icon-view"></i> {{ article.views }}</span>
              <span>{{ formatDate(article.created_at) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'RelatedArticles',
  props: {
    currentArticleId: {
      type: [Number, String],
      required: true
    }
  },
  data () {
    return {
      articles: []
    }
  },
  watch: {
    currentArticleId: {
      handler (val) {
        if (val) this.fetchRelatedArticles()
      },
      immediate: true
    }
  },
  methods: {
    async fetchRelatedArticles () {
      try {
        const response = await axios.get(`/articles/${this.currentArticleId}/related`)
        this.articles = response.data
      } catch (error) {
        console.error('Fetch related articles failed', error)
      }
    },
    goToArticle (id) {
      this.$router.push(`/article/${id}`)
    },
    formatDate (date) {
      if (!date) return ''
      return new Date(date).toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.related-articles {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.related-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.related-card {
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
}

.related-card:hover {
  transform: translateY(-5px);
}

.related-article-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 44px;
  line-height: 22px;
}

.related-article-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  justify-content: space-between;
}

.image {
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
}

.image-placeholder {
  width: 100%;
  height: 120px;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #c0c4cc;
}
</style>
