<template>
  <div class="archives-page">
    <nav-bar></nav-bar>
    <div class="main-container">
      <el-card class="timeline-card">
        <div slot="header" class="clearfix">
          <span class="card-title">文章归档</span>
          <span class="article-count">共 {{ articles.length }} 篇</span>
        </div>
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in timeline" :key="index" :timestamp="activity.year"
            placement="top" size="large" type="primary">
            <el-card v-for="item in activity.items" :key="item.id" class="archive-item" shadow="hover"
              @click.native="$router.push(`/article/${item.id}`)">
              <div class="item-content">
                <span class="item-date">{{ formatDate(item.created_at) }}</span>
                <span class="item-title">{{ item.title }}</span>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </div>
  </div>
</template>

<script>
import axios from '../axios'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'Archives',
  components: { NavBar },
  data () {
    return {
      articles: []
    }
  },
  computed: {
    timeline () {
      const groups = {}
      if (!Array.isArray(this.articles)) return [] // Add safety check

      this.articles.forEach(article => {
        const date = new Date(article.created_at)
        const year = date.getFullYear()
        if (!groups[year]) {
          groups[year] = []
        }
        groups[year].push(article)
      })

      return Object.keys(groups).sort((a, b) => b - a).map(year => ({
        year: year + '年',
        items: groups[year]
      }))
    }
  },
  created () {
    this.fetchArchives()
  },
  methods: {
    async fetchArchives () {
      try {
        const response = await axios.get('/articles?type=archives')
        this.articles = response.data
      } catch (error) {
        this.$message.error('获取归档失败')
      }
    },
    formatDate (dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}-${date.getDate()}`
    }
  }
}
</script>

<style scoped src="@/assets/styles/views/Archives.css"></style>
