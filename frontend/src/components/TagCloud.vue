<template>
  <div class="tag-cloud">
    <h3 class="tag-cloud-title">热门标签</h3>
    <div class="tag-cloud-content">
      <el-tag v-for="tag in tags" :key="tag.id" :size="getTagSize(tag.article_count)" effect="plain" class="tag-item"
        @click="handleTagClick(tag)">
        {{ tag.name }}
        <span class="tag-count">{{ tag.article_count }}</span>
      </el-tag>
    </div>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'TagCloud',
  data () {
    return {
      tags: []
    }
  },
  mounted () {
    this.fetchPopularTags()
  },
  methods: {
    async fetchPopularTags () {
      try {
        const response = await axios.get('/tags/popular?limit=20')
        this.tags = response.data
      } catch (error) {
        console.error('获取热门标签失败', error)
      }
    },
    getTagSize (count) {
      if (count >= 10) return 'large'
      if (count >= 5) return 'medium'
      return 'small'
    },
    handleTagClick (tag) {
      this.$router.push(`/tags/${tag.name}`)
    }
  }
}
</script>

<style scoped>
.tag-cloud {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tag-cloud-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.tag-cloud-content {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.tag-count {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
}
</style>