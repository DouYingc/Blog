<template>
  <div id="app">
    <!-- 内容区域 -->
    <div class="content-wrapper">
      <!-- 路由视图，显示当前路由对应的组件 -->
      <router-view />
    </div>
    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <!-- 页脚链接 -->
        <div class="footer-links">
          <router-link to="/">首页</router-link>
          <router-link to="/messages">留言板</router-link>
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
        <!-- 页脚信息 -->
        <div class="footer-info">
          <p>&copy; 2026 个人技术博客社区 - 基于 Vue 2 & Node.js 构建</p>
          <p>让知识在这里流动，让讨论在这里发生。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* 应用根容器 */
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 确保应用占满整个视口高度 */
}

/* 内容包装器，占据剩余空间 */
.content-wrapper {
  flex: 1; /* 自动填充剩余空间 */
}

/* 全局样式 */
body {
  margin: 0;
  background-color: #f8fafc; /* 浅色背景 */
}

/* 页脚样式 */
.footer {
  background-color: #fff;
  border-top: 1px solid #e2e8f0;
  padding: 40px 0;
  margin-top: 40px;
}

/* 页脚内容 */
.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

/* 页脚链接 */
.footer-links {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  gap: 30px;
}

.footer-links a {
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s; /* 悬停效果 */
}

.footer-links a:hover {
  color: #409eff; /* 悬停时颜色变化 */
}

/* 页脚信息 */
.footer-info {
  color: #94a3b8;
  font-size: 13px;
}

.footer-info p {
  margin: 8px 0;
}
</style>
