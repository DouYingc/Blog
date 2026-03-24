<template>
  <div class="user-center">
    <el-container direction="vertical">
      <nav-bar></nav-bar>
      <el-main class="main">
        <el-tabs v-model="activeTab" type="border-card">
          <!-- 数据中心 -->
          <el-tab-pane label="数据中心" name="dashboard">
            <user-dashboard />
          </el-tab-pane>

          <!-- 个人文章管理 -->
          <el-tab-pane label="我的文章" name="articles">
            <el-card shadow="never" class="tab-card">
              <div class="pane-content">
                <div class="toolbar">
                  <el-button type="primary" icon="el-icon-plus" @click="$router.push('/article/new')">发布文章</el-button>
                </div>
                <el-table :data="myArticles" style="width: 100%" v-loading="loading">
                  <el-table-column prop="title" label="标题"></el-table-column>
                  <el-table-column prop="Category.name" label="分类" width="120"></el-table-column>
                  <el-table-column prop="views" label="阅读" width="80" align="center"></el-table-column>
                  <el-table-column prop="created_at" label="发布时间" width="180">
                    <template slot-scope="scope">{{ new Date(scope.row.created_at).toLocaleString() }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                      <el-button size="mini" type="text"
                        @click="$router.push(`/article/${scope.row.id}`)">查看</el-button>
                      <el-button size="mini" type="text"
                        @click="$router.push(`/article/edit/${scope.row.id}`)">编辑</el-button>
                      <el-button size="mini" type="text" style="color: #F56C6C"
                        @click="handleDelete(scope.row.id)">删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 收藏夹 -->
          <el-tab-pane label="我的收藏" name="favorites">
            <el-card shadow="never" class="tab-card">
              <div class="pane-content">
                <el-table :data="favoriteArticles" style="width: 100%" v-loading="loading">
                  <el-table-column prop="title" label="标题"></el-table-column>
                  <el-table-column prop="User.username" label="作者" width="120"></el-table-column>
                  <el-table-column prop="Category.name" label="分类" width="120"></el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button size="mini" type="text"
                        @click="$router.push(`/article/${scope.row.id}`)">查看</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 我的关注 -->
          <el-tab-pane label="我的关注" name="following">
            <el-card shadow="never" class="tab-card">
              <div class="pane-content">
                <el-table :data="followingList" style="width: 100%" v-loading="loadingFollowing">
                  <el-table-column label="用户头像" width="80">
                    <template slot-scope="scope">
                      <el-avatar :size="40" :src="scope.row.avatar || ''" icon="el-icon-user"></el-avatar>
                    </template>
                  </el-table-column>
                  <el-table-column label="用户名" width="150">
                    <template slot-scope="scope">
                      <span @click="$router.push(`/profile/${scope.row.id}`)" class="user-link">{{ scope.row.username
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button size="mini" type="text" @click="sendPrivateMessage(scope.row.id)">私信</el-button>
                      <el-button size="mini" type="text" style="color: #F56C6C"
                        @click="unfollowUser(scope.row.id)">取消关注</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 我的粉丝 -->
          <el-tab-pane label="我的粉丝" name="followers">
            <el-card shadow="never" class="tab-card">
              <div class="pane-content">
                <el-table :data="followersList" style="width: 100%" v-loading="loadingFollowers">
                  <el-table-column label="用户头像" width="80">
                    <template slot-scope="scope">
                      <el-avatar :size="40" :src="scope.row.avatar || ''" icon="el-icon-user"></el-avatar>
                    </template>
                  </el-table-column>
                  <el-table-column label="用户名" width="150">
                    <template slot-scope="scope">
                      <span @click="$router.push(`/profile/${scope.row.id}`)" class="user-link">{{ scope.row.username
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button size="mini" type="text" @click="sendPrivateMessage(scope.row.id)">私信</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </el-card>
          </el-tab-pane>

          <!-- 个人资料修改 -->
          <el-tab-pane label="基本资料" name="profile">
            <el-card shadow="never" class="tab-card">
              <div class="pane-content profile-form">
                <el-form :model="userForm" label-width="80px" style="max-width: 600px; margin: 0 auto;">
                  <el-form-item label="用户头像">
                    <el-upload class="avatar-uploader" action="http://localhost:3000/api/upload/image" name="image"
                      :headers="uploadHeaders" :show-file-list="false" :on-success="handleAvatarSuccess"
                      :before-upload="beforeAvatarUpload">
                      <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar">
                      <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <small>点击上方区域上传头像</small>
                  </el-form-item>
                  <el-form-item label="用户名">
                    <el-input v-model="userForm.username" disabled></el-input>
                    <small>用户名暂不支持修改</small>
                  </el-form-item>
                  <el-form-item label="邮箱">
                    <el-input v-model="userForm.email"></el-input>
                  </el-form-item>
                  <el-form-item label="个人简介">
                    <el-input type="textarea" :rows="3" v-model="userForm.bio" placeholder="介绍一下自己吧..."></el-input>
                  </el-form-item>
                  <el-form-item label="社交链接">
                    <el-input v-model="userForm.social_links.github" placeholder="GitHub链接"></el-input>
                    <el-input v-model="userForm.social_links.website" placeholder="个人网站"
                      style="margin-top: 10px"></el-input>
                    <el-input v-model="userForm.social_links.twitter" placeholder="Twitter链接"
                      style="margin-top: 10px"></el-input>
                    <el-input v-model="userForm.social_links.linkedin" placeholder="LinkedIn链接"
                      style="margin-top: 10px"></el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="updateProfile" style="width: 100%">保存修改</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from '../axios'
import UserDashboard from '@/components/UserDashboard.vue'
import NavBar from '@/components/NavBar.vue'

export default {
  name: 'UserCenter',
  components: {
    UserDashboard,
    NavBar
  },
  data () {
    return {
      activeTab: 'dashboard',
      loading: false,
      loadingFollowing: false,
      loadingFollowers: false,
      myArticles: [],
      favoriteArticles: [],
      followingList: [],
      followersList: [],
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      userForm: {
        username: '',
        email: '',
        avatar: '',
        bio: '',
        social_links: {
          github: '',
          website: '',
          twitter: '',
          linkedin: ''
        }
      },
      uploadHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  },
  created () {
    this.userForm.username = this.currentUser.username
    this.userForm.email = this.currentUser.email || ''
    this.userForm.avatar = this.currentUser.avatar || ''
    this.userForm.bio = this.currentUser.bio || ''
    this.userForm.social_links = this.currentUser.social_links || {
      github: '',
      website: '',
      twitter: '',
      linkedin: ''
    }
    this.fetchMyArticles()
    this.fetchFavorites()
  },
  watch: {
    activeTab (newTab) {
      if (newTab === 'following') {
        this.fetchFollowing()
      } else if (newTab === 'followers') {
        this.fetchFollowers()
      }
    }
  },
  methods: {
    async fetchMyArticles () {
      this.loading = true
      try {
        const response = await axios.get('/articles', {
          params: { user_id: this.currentUser.id }
        })
        this.myArticles = response.data.articles
      } catch (error) {
        this.$message.error('获取文章失败')
      } finally {
        this.loading = false
      }
    },
    async fetchFavorites () {
      try {
        const response = await axios.get('/interactions/my-favorites', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.favoriteArticles = response.data
      } catch (error) {
        console.error('获取收藏失败', error)
      }
    },
    async handleDelete (id) {
      try {
        await this.$confirm('确定要删除这篇文章吗？', '提示', { type: 'warning' })
        await axios.delete(`/articles/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.$message.success('删除成功')
        this.fetchMyArticles()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('删除失败')
      }
    },
    async updateProfile () {
      try {
        const response = await axios.put('/auth/profile', {
          email: this.userForm.email,
          avatar: this.userForm.avatar,
          bio: this.userForm.bio,
          social_links: this.userForm.social_links
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })

        // 更新本地存储的用户信息
        const updatedUser = response.data.user
        localStorage.setItem('user', JSON.stringify(updatedUser))
        this.currentUser = updatedUser

        this.$message.success('资料更新成功')
      } catch (error) {
        this.$message.error(error.response?.data?.message || '资料更新失败')
      }
    },
    handleAvatarSuccess (res) {
      this.userForm.avatar = res.url
      this.$message.success('头像上传成功，点击保存修改生效')
    },
    beforeAvatarUpload (file) {
      const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPG) {
        this.$message.error('上传头像图片只能是 JPG 或 PNG 格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    async fetchFollowing () {
      this.loadingFollowing = true
      try {
        const response = await axios.get(`/follows/following/${this.currentUser.id}`)
        this.followingList = response.data.following
      } catch (error) {
        this.$message.error('获取关注列表失败')
      } finally {
        this.loadingFollowing = false
      }
    },
    async fetchFollowers () {
      this.loadingFollowers = true
      try {
        const response = await axios.get(`/follows/followers/${this.currentUser.id}`)
        this.followersList = response.data.followers
      } catch (error) {
        this.$message.error('获取粉丝列表失败')
      } finally {
        this.loadingFollowers = false
      }
    },
    async unfollowUser (userId) {
      try {
        await this.$confirm('确定要取消关注该用户吗？', '提示', { type: 'warning' })
        await axios.delete(`/follows/unfollow/${userId}`)
        this.$message.success('取消关注成功')
        this.fetchFollowing()
      } catch (error) {
        if (error !== 'cancel') this.$message.error('取消关注失败')
      }
    },
    sendPrivateMessage (userId) {
      this.$router.push(`/messages/private/${userId}`)
    },
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped src="../assets/styles/views/UserCenter.css"></style>
