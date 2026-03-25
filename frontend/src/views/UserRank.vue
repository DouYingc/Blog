<template>
  <div class="user-rank">
    <el-container direction="vertical">
      <nav-bar></nav-bar>
      
      <el-main class="main">
        <div class="rank-header">
          <h1>用户排行榜</h1>
          <p class="rank-subtitle">展示社区中最活跃的用户和优质作者</p>
        </div>
        
        <div class="rank-tabs">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="活跃用户" name="active"></el-tab-pane>
            <el-tab-pane label="优质作者" name="quality"></el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="rank-content">
          <el-table :data="users" style="width: 100%" v-loading="loading">
            <el-table-column label="排名" width="80" align="center">
              <template slot-scope="scope">
                <div class="rank-number" :class="getRankClass(scope.$index)">
                  {{ scope.$index + 1 }}
                </div>
              </template>
            </el-table-column>
            <el-table-column label="用户信息" min-width="300">
              <template slot-scope="scope">
                <div class="user-info">
                  <el-avatar :size="50" :src="scope.row.avatar" icon="el-icon-user"></el-avatar>
                  <div class="user-details">
                    <div class="username" @click="$router.push(`/user/profile/${scope.row.id}`)">
                      {{ scope.row.username }}
                    </div>
                    <div class="user-meta">
                      <span class="user-id">ID: {{ scope.row.id }}</span>
                      <span class="user-role" :class="scope.row.role">{{ scope.row.role === 'admin' ? '管理员' : '用户' }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="统计数据" min-width="300">
              <template slot-scope="scope">
                <div class="stats">
                  <div class="stat-item">
                    <span class="stat-label">文章数</span>
                    <span class="stat-value">{{ scope.row.articles_count || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">总阅读</span>
                    <span class="stat-value">{{ scope.row.total_views || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">总点赞</span>
                    <span class="stat-value">{{ scope.row.total_likes || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">总评论</span>
                    <span class="stat-value">{{ scope.row.comments_count || 0 }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="加入时间" width="180">
              <template slot-scope="scope">
                {{ formatDate(scope.row.created_at) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../axios'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'UserRank',
  components: { NavBar },
  data() {
    return {
      activeTab: 'active',
      users: [],
      loading: false
    }
  },
  created() {
    window.scrollTo(0, 0)
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const endpoint = this.activeTab === 'active' ? '/users/active' : '/users/quality'
        const response = await axios.get(endpoint)
        this.users = response.data
      } catch (error) {
        console.error('获取用户排行榜失败', error)
        this.users = []
      } finally {
        this.loading = false
      }
    },
    handleTabClick(tab) {
      this.activeTab = tab.name
      this.fetchUsers()
    },
    getRankClass(index) {
      if (index === 0) return 'rank-first'
      if (index === 1) return 'rank-second'
      if (index === 2) return 'rank-third'
      return ''
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.user-rank {
  min-height: 100vh;
  background-color: #f8fafc;
}

.main {
  max-width: 1200px;
  margin: 80px auto 20px;
  padding: 0 20px;
}

.rank-header {
  text-align: center;
  margin-bottom: 40px;
}

.rank-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.rank-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.rank-tabs {
  margin-bottom: 32px;
}

.rank-content {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.rank-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  font-size: 16px;
}

.rank-first {
  background-color: #ffd700;
  color: #fff;
}

.rank-second {
  background-color: #c0c0c0;
  color: #fff;
}

.rank-third {
  background-color: #cd7f32;
  color: #fff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  cursor: pointer;
  margin-bottom: 4px;
}

.username:hover {
  color: #409eff;
}

.user-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.user-role {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.user-role.admin {
  background-color: #ff4d4f;
  color: #fff;
}

.user-role.user {
  background-color: #ecf5ff;
  color: #409eff;
}

.stats {
  display: flex;
  gap: 24px;
  align-items: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
</style>
