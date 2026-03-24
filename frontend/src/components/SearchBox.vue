<template>
  <div class="search-box">
    <div class="search-input-wrapper">
      <el-autocomplete v-model="searchKeyword" :fetch-suggestions="fetchSuggestions" placeholder="搜索文章..."
        :trigger-on-focus="false" @select="handleSelect" @keyup.enter.native="handleSearch" class="search-input"
        prefix-icon="el-icon-search" clearable>
        <template slot-scope="{ item }">
          <div class="suggestion-item">
            <i :class="item.type === 'article' ? 'el-icon-document' : 'el-icon-price-tag'"></i>
            <span class="suggestion-text">{{ item.title || item.name }}</span>
          </div>
        </template>
      </el-autocomplete>

      <el-button type="primary" icon="el-icon-search" @click="handleSearch" class="search-button">搜索</el-button>
    </div>

    <!-- 搜索结果对话框 -->
    <el-dialog title="搜索结果" :visible.sync="searchDialogVisible" width="70%" class="search-result-dialog"
      :append-to-body="true">
      <div v-if="searchResults.length > 0">
        <div class="search-stats">找到 {{ searchTotal }} 条关于 "{{ searchedKeyword }}" 的结果</div>

        <div class="search-results">
          <div v-for="article in searchResults" :key="article.id" class="search-result-item"
            @click="goToArticle(article.id)">
            <h4 class="result-title" v-html="article.title_highlight || article.title"></h4>
            <p class="result-summary" v-html="article.summary_highlight"></p>
            <div class="result-meta">
              <span><i class="el-icon-user"></i> {{ article.User ? article.User.username : '未知' }}</span>
              <span><i class="el-icon-date"></i> {{ formatDate(article.created_at) }}</span>
              <span v-if="article.Category"><i class="el-icon-folder"></i> {{ article.Category.name }}</span>
              <span><i class="el-icon-view"></i> {{ article.views }}</span>
            </div>
          </div>
        </div>

        <el-pagination v-if="searchTotal > searchPageSize" layout="prev, pager, next" :total="searchTotal"
          :page-size="searchPageSize" :current-page="searchPage" @current-change="handlePageChange"
          style="text-align: center; margin-top: 20px"></el-pagination>
      </div>

      <el-empty v-else description="未找到相关文章"></el-empty>
    </el-dialog>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'SearchBox',
  data () {
    return {
      searchKeyword: '',
      searchedKeyword: '',
      searchDialogVisible: false,
      searchResults: [],
      searchTotal: 0,
      searchPage: 1,
      searchPageSize: 10
    }
  },
  methods: {
    // 获取搜索建议
    async fetchSuggestions (queryString, cb) {
      if (queryString.length < 2) {
        cb([])
        return
      }

      try {
        const response = await axios.get(`/search/suggestions?keyword=${queryString}`)
        const suggestions = [
          ...response.data.articles.map(a => ({ ...a, value: a.title })),
          ...response.data.tags.map(t => ({ ...t, value: t.name }))
        ]
        cb(suggestions)
      } catch (error) {
        cb([])
      }
    },

    // 选择建议项
    handleSelect (item) {
      if (item.type === 'article') {
        this.$router.push(`/article/${item.id}`)
      } else if (item.type === 'tag') {
        this.$router.push(`/?tag_id=${item.id}`)
      }
      this.searchKeyword = ''
    },

    // 执行搜索
    async handleSearch () {
      if (!this.searchKeyword.trim()) {
        this.$message.warning('请输入搜索关键词')
        return
      }

      this.searchPage = 1
      this.searchedKeyword = this.searchKeyword
      await this.performSearch()
      // 使用nextTick确保DOM更新后再显示对话框
      this.$nextTick(() => {
        this.searchDialogVisible = true
      })
    },

    // 执行搜索请求
    async performSearch () {
      try {
        const response = await axios.get(`/search/articles`, {
          params: {
            keyword: this.searchedKeyword,
            page: this.searchPage,
            limit: this.searchPageSize
          }
        })

        this.searchResults = response.data.articles
        this.searchTotal = response.data.total
      } catch (error) {
        this.$message.error('搜索失败')
        console.error(error)
      }
    },

    // 分页切换
    handlePageChange (page) {
      this.searchPage = page
      this.performSearch()
    },

    // 跳转到文章详情
    goToArticle (id) {
      this.searchDialogVisible = false
      this.searchKeyword = ''
      this.$router.push(`/article/${id}`)
    },

    // 格式化日期
    formatDate (dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return date.toLocaleDateString()
    }
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  padding: 8px 0 8px 0;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.search-input {
  flex: 1;
  min-width: 0;
}

.search-button {
  white-space: nowrap;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

.suggestion-item i {
  color: #909399;
}

.search-stats {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.search-result-item {
  padding: 15px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-result-item:hover {
  background-color: #f5f7fa;
}

.result-title {
  margin: 0 0 8px 0;
  color: #409eff;
  font-size: 16px;
}

.result-title :deep(mark) {
  background-color: #ffeb3b;
  color: #333;
  padding: 0 2px;
}

.result-summary {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

.result-summary :deep(mark) {
  background-color: #ffeb3b;
  color: #333;
  padding: 0 2px;
}

.result-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

.result-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
