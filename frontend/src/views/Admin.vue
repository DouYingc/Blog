<template>
  <div class="admin">
    <el-container style="height: 100vh;">
      <el-aside width="200px" style="background-color: #304156">
        <div class="admin-logo">博客后台管理</div>
        <el-menu :default-active="activeMenu" @select="handleSelect" router background-color="#304156"
          text-color="#bfcbd9" active-text-color="#409eff">
          <el-menu-item index="/admin">
            <i class="el-icon-odometer"></i>
            <span slot="title">仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/admin/articles">
            <i class="el-icon-document"></i>
            <span slot="title">文章管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <i class="el-icon-menu"></i>
            <span slot="title">分类管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <i class="el-icon-collection-tag"></i>
            <span slot="title">标签管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/comments">
            <i class="el-icon-chat-dot-round"></i>
            <span slot="title">评论管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/messages">
            <i class="el-icon-message"></i>
            <span slot="title">留言管理</span>
          </el-menu-item>
          <el-menu-item index="/">
            <i class="el-icon-s-home"></i>
            <span slot="title">返回前台</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-container>
        <el-header
          style="text-align: right; font-size: 14px; background-color: #fff; line-height: 60px; border-bottom: 1px solid #dcdfe6;">
          <el-dropdown>
            <span class="user-info">
              管理员 <i class="el-icon-arrow-down" style="margin-left: 5px"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="handleLogout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </el-header>

        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'AdminView',
  data () {
    return {
      activeMenu: '/admin/articles'
    }
  },
  watch: {
    '$route.path': {
      handler (val) {
        this.activeMenu = val
      },
      immediate: true
    }
  },
  methods: {
    handleSelect (key) {
      this.activeMenu = key
    },
    handleLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$message.success('已退出登录')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.admin {
  height: 100vh;
}

.admin-logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #2b2f3a;
}

.user-info {
  cursor: pointer;
  color: #409eff;
}

.welcome {
  text-align: center;
  margin-top: 100px;
  color: #606266;
}

.el-aside {
  box-shadow: 2px 0 6px rgba(0, 21, 41, 0.35);
}

.el-menu {
  border-right: none;
}
</style>
