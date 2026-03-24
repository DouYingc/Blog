<template>
  <div id="app">
    <div class="content-wrapper">
      <router-view />
    </div>
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <router-link to="/">首页</router-link>
          <router-link to="/messages">留言板</router-link>
          <a href="https://github.com" target="_blank">GitHub</a>
        </div>
        <div class="footer-info">
          <p>&copy; 2026 个人技术博客社区 - 基于 Vue 2 & Node.js 构建</p>
          <p>让知识在这里流动，让讨论在这里发生。</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content-wrapper {
  flex: 1;
}

body {
  margin: 0;
  background-color: #f8fafc;
}

.footer {
  background-color: #fff;
  border-top: 1px solid #e2e8f0;
  padding: 40px 0;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
}

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
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #409eff;
}

.footer-info {
  color: #94a3b8;
  font-size: 13px;
}

.footer-info p {
  margin: 8px 0;
}
</style>
