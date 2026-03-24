<template>
  <div class="user-profile">
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="logo" @click="$router.push('/')">个人技术博客</div>
          <el-menu mode="horizontal" router :default-active="$route.path">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/messages">留言板</el-menu-item>
          </el-menu>
        </div>
      </el-header>

      <el-main class="main">
        <el-row :gutter="30">
          <!-- 用户基本信息 -->
          <el-col :span="10">
            <el-card class="profile-card" v-loading="loadingUser">
              <div class="profile-header">
                <el-avatar :size="100" :src="user.avatar || ''" icon="el-icon-user"></el-avatar>
                <h2 class="username">{{ user.username }}</h2>
                <el-tag size="small" :type="user.role === 'admin' ? 'danger' : 'success'">{{ user.role === 'admin' ?
                  '管理员' : '普通用户' }}</el-tag>
                <div v-if="isLoggedIn && user.id !== currentUserId" class="follow-section">
                  <el-button 
                    :type="isFollowing ? 'default' : 'primary'" 
                    @click="toggleFollow"
                    :loading="loadingFollow"
                  >
                    {{ isFollowing ? '已关注' : '关注' }}
                  </el-button>
                  <el-button 
                    type="info" 
                    size="small"
                    @click="sendPrivateMessage"
                  >
                    私信
                  </el-button>
                </div>
              </div>
              <div class="profile-details">
                <div class="detail-item"><i class="el-icon-message"></i> {{ user.email || '保密' }}</div>
                <div class="detail-item"><i class="el-icon-date"></i> 加入于 {{ new
                  Date(user.created_at).toLocaleDateString() }}</div>
                <div class="detail-item"><i class="el-icon-user"></i> {{ user.bio || '这个人很懒，什么都没有留下' }}</div>
                <div v-if="user.social_links && user.social_links.github" class="detail-item">
                  <i class="el-icon-link"></i>
                  <a :href="user.social_links.github.includes('http') ? user.social_links.github : 'https://' + user.social_links.github" target="_blank" class="social-link">GitHub: {{ user.social_links.github }}</a>
                </div>
                <div v-if="user.social_links && user.social_links.website" class="detail-item">
                  <i class="el-icon-link"></i>
                  <a :href="user.social_links.website.includes('http') ? user.social_links.website : 'https://' + user.social_links.website" target="_blank" class="social-link">个人网站: {{ user.social_links.website }}</a>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 用户贡献文章 -->
          <el-col :span="14">
            <el-card class="articles-card">
              <div slot="header" class="card-header">
                <span>TA 的文章 ({{ articles.length }})</span>
              </div>
              <div class="article-list" v-loading="loadingArticles">
                <div v-for="art in articles" :key="art.id" class="article-item"
                  @click="$router.push(`/article/${art.id}`)">
                  <div class="art-title">{{ art.title }}</div>
                  <div class="art-meta">
                    <span><i class="el-icon-view"></i> {{ art.views }}</span>
                    <span><i class="el-icon-date"></i> {{ new Date(art.created_at).toLocaleDateString() }}</span>
                  </div>
                </div>
                <el-empty v-if="articles.length === 0" description="该用户暂未发布文章"></el-empty>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'UserProfile',
  data () {
    return {
      user: {},
      articles: [],
      loadingUser: false,
      loadingArticles: false,
      isLoggedIn: false,
      currentUserId: null,
      isFollowing: false,
      loadingFollow: false
    }
  },
  created () {
    this.checkLoginStatus()
  },
  watch: {
    '$route.params.id': {
      handler: function (id) {
        if (id) {
          this.fetchUser(id)
          this.fetchUserArticles(id)
        }
      },
      immediate: true
    }
  },
  methods: {
    checkLoginStatus () {
      const token = localStorage.getItem('token')
      if (token) {
        this.isLoggedIn = true
        try {
          const userInfoStr = localStorage.getItem('userInfo')
          if (userInfoStr) {
            const userInfo = JSON.parse(userInfoStr)
            if (userInfo && userInfo.id) {
              this.currentUserId = userInfo.id
            }
          }
        } catch (error) {
          console.error('解析用户信息失败:', error)
        }
      }
    },
    async fetchUser (id) {
      this.loadingUser = true
      try {
        const response = await axios.get(`/auth/user/${id}`)
        this.user = response.data
        if (this.isLoggedIn && this.currentUserId !== this.user.id) {
          await this.checkFollowStatus(id)
        }
      } catch (error) {
        this.$message.error('获取用户信息失败')
      } finally {
        this.loadingUser = false
      }
    },
    async fetchUserArticles (id) {
      this.loadingArticles = true
      try {
        const response = await axios.get('/articles', {
          params: { user_id: id }
        })
        this.articles = response.data.articles
      } catch (error) {
        this.$message.error('获取用户文章失败')
      } finally {
        this.loadingArticles = false
      }
    },
    async checkFollowStatus (userId) {
      try {
        const response = await axios.get(`/follows/check/${userId}`)
        this.isFollowing = response.data.isFollowing
      } catch (error) {
        console.error('检查关注状态失败:', error)
      }
    },
    async toggleFollow () {
      this.loadingFollow = true
      try {
        if (this.isFollowing) {
          await axios.delete(`/follows/unfollow/${this.user.id}`)
          this.$message.success('取消关注成功')
        } else {
          await axios.post(`/follows/follow/${this.user.id}`)
          this.$message.success('关注成功')
        }
        this.isFollowing = !this.isFollowing
      } catch (error) {
        this.$message.error(error.response?.data?.message || '操作失败')
      } finally {
        this.loadingFollow = false
      }
    },
    sendPrivateMessage () {
      this.$router.push(`/messages/private/${this.user.id}`)
    }
  }
}
</script>

<style scoped src="../assets/styles/views/UserProfile.css"></style>
