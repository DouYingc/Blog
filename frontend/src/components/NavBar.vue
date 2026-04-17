<template>
  <div>
    <el-header class="header">
      <div class="header-content">
        <!-- 网站Logo -->
        <div class="logo" @click="goToHome">个人技术博客</div>

        <!-- 搜索栏 -->
        <div class="nav-center">
          <div class="search-bar">
            <search-box v-if="showSearch"></search-box>
          </div>
        </div>

        <!-- 右侧导航 -->
        <div class="nav-right">
          <!-- 通知铃铛 -->
          <notification-bell v-if="isLoggedIn" class="nav-notification"></notification-bell>

          <!-- 私信入口 -->
          <div v-if="isLoggedIn" class="nav-message" @click="goToPrivateMessages">
            <i class="el-icon-chat-line-round"></i>
            <el-badge v-if="unreadMessageCount > 0" :value="unreadMessageCount" type="danger"
              class="message-badge"></el-badge>
          </div>

          <!-- 导航菜单 -->
          <el-menu mode="horizontal" router :default-active="$route.path" class="nav-menu">
            <el-menu-item index="/">首页</el-menu-item>
            <el-menu-item index="/ai-assistant">AI助手</el-menu-item>
            <el-menu-item index="/users/rank">排行榜</el-menu-item>
            <el-menu-item index="/archives">归档</el-menu-item>
            <el-menu-item index="/messages">留言板</el-menu-item>
            <el-menu-item v-if="!isLoggedIn" index="/login">登录</el-menu-item>
            <el-menu-item v-if="!isLoggedIn" index="/register">注册</el-menu-item>
          </el-menu>

          <!-- 用户菜单 -->
          <div v-if="isLoggedIn" class="user-menu-container">
            <div class="user-nav" @click="toggleUserMenu">
              <el-avatar v-if="currentUser.avatar" :size="30" :src="currentUser.avatar"
                style="margin-right: 8px; vertical-align: middle"></el-avatar>
              <i v-else class="el-icon-user" style="margin-right: 8px"></i>
              <span>{{ currentUser.username }}</span>
              <i class="el-icon-arrow-down" style="margin-left: 8px"></i>
            </div>
            <div v-if="userMenuVisible" class="user-dropdown-menu">
              <div class="dropdown-item" @click="goToUserCenter">个人中心</div>
              <div class="dropdown-item" v-if="isAdmin" @click="goToAdmin">系统后台</div>
              <div class="dropdown-item" @click="handleLogout">退出登录</div>
            </div>
          </div>
        </div>
      </div>
    </el-header>
  </div>
</template>

<script>
/**
 * 导航栏组件
 * 功能：展示网站导航、用户信息、通知和私信等
 */
import SearchBox from './SearchBox.vue' // 搜索框组件
import NotificationBell from './NotificationBell.vue' // 通知铃铛组件
import axios from '../axios' // 网络请求

export default {
  name: 'NavBar',
  components: {
    SearchBox,
    NotificationBell
  },
  data () {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'), // 当前用户信息
      showSearch: true, // 是否显示搜索框
      userMenuVisible: false, // 用户菜单是否可见
      unreadMessageCount: 0 // 未读消息数量
    }
  },
  computed: {
    /**
     * 是否已登录
     */
    isLoggedIn () {
      return !!localStorage.getItem('token')
    },
    /**
     * 是否为管理员
     */
    isAdmin () {
      return this.currentUser.role === 'admin'
    }
  },
  mounted () {
    // 点击外部关闭菜单
    document.addEventListener('click', this.handleClickOutside)
    // 获取未读消息数量
    if (this.isLoggedIn) {
      this.fetchUnreadMessageCount()
    }

    // 监听更新未读消息计数的事件
    this.$root.$on('updateUnreadCount', this.fetchUnreadMessageCount)
  },
  beforeDestroy () {
    // 移除点击外部关闭菜单的事件监听
    document.removeEventListener('click', this.handleClickOutside)
    // 移除更新未读消息计数的事件监听
    this.$root.$off('updateUnreadCount', this.fetchUnreadMessageCount)
  },
  methods: {
    /**
     * 切换用户菜单显示状态
     */
    toggleUserMenu (event) {
      event.stopPropagation()
      this.userMenuVisible = !this.userMenuVisible
    },
    /**
     * 点击外部关闭用户菜单
     */
    handleClickOutside () {
      this.userMenuVisible = false
    },
    /**
     * 退出登录
     */
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (this.$route.path === '/') {
        location.reload()
      } else {
        this.$router.push('/')
      }
    },
    /**
     * 跳转到首页
     */
    goToHome () {
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
    /**
     * 获取未读消息数量
     */
    async fetchUnreadMessageCount () {
      try {
        const response = await axios.get('/privateMessages/unread-count')
        this.unreadMessageCount = response.data.unreadCount
      } catch (error) {
        console.error('获取未读消息数量失败:', error)
      }
    },
    /**
     * 跳转到私信页面
     */
    goToPrivateMessages () {
      if (this.$route.path !== '/messages/private') {
        this.$router.push('/messages/private')
      }
    },
    /**
     * 跳转到用户中心
     */
    goToUserCenter () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.$router.push('/user/center')
    },
    /**
     * 跳转到系统后台
     */
    goToAdmin () {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      this.$router.push('/admin')
    }
  }
}
</script>

<style scoped>
/* 导航栏样式 */
.header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 100;
  height: 80px;
}

/* 导航栏内容 */
.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30px;
}

/* Logo样式 */
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  cursor: pointer;
  white-space: nowrap;
  margin-right: 40px;
}

/* 中间搜索区域 */
.nav-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 40px;
}

/* 搜索栏 */
.search-bar {
  width: 100%;
  max-width: 600px;
}

/* 右侧导航区域 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 通知图标 */
.nav-notification {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  padding: 8px;
  position: relative;
}

.nav-notification:hover {
  color: #409eff;
}

/* 私信图标 */
.nav-message {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  padding: 8px;
  position: relative;
}

.nav-message:hover {
  color: #409eff;
}

/* 消息徽章 */
.message-badge {
  position: absolute;
  top: 0;
  right: 0;
}

/* 导航菜单 */
.nav-menu {
  border-bottom: none;
}

/* 用户菜单容器 */
.user-menu-container {
  position: relative;
}

/* 用户导航 */
.user-nav {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
}

.user-nav:hover {
  background-color: #f5f7fa;
  border-radius: 4px;
}

/* 用户下拉菜单 */
.user-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 160px;
  padding: 4px 0;
  margin-top: 4px;
}

/* 下拉菜单项 */
.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .header-content {
    padding: 0 20px;
  }

  .logo {
    font-size: 20px;
    margin-right: 20px;
  }

  .nav-center {
    margin: 0 20px;
  }

  .nav-right {
    gap: 10px;
  }
}

@media (max-width: 768px) {
  .nav-center {
    display: none;
  }

  .header-content {
    padding: 0 15px;
  }
}
</style>
