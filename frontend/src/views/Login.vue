<template>
  <div class="login">
    <el-card class="login-card">
      <div slot="header" class="login-title">用户登录</div>
      <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="0">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock" placeholder="密码"></el-input>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
        <!-- 底部链接 -->
        <el-form-item class="login-links">
          没有账号？<router-link to="/register" class="register-link">立即注册</router-link>
          <el-divider direction="vertical" class="divider"></el-divider>
          <router-link to="/" class="home-link">返回首页</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
/**
 * 登录页面组件
 * 功能：提供用户登录表单，处理登录逻辑，包括表单验证、API调用和错误处理
 */
import axios from '../axios' // 网络请求

export default {
  name: 'LoginView',
  data () {
    return {
      /**
       * 登录表单数据
       * @property {string} username - 用户名
       * @property {string} password - 密码
       */
      loginForm: {
        username: '',
        password: ''
      },
      /**
       * 表单验证规则
       */
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    /**
     * 处理登录逻辑
     */
    handleLogin () {
      // 表单验证
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            // 调用登录API
            const response = await axios.post('/auth/login', this.loginForm)
            // 存储token和用户信息到本地存储
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            // 显示登录成功消息
            this.$message.success({
              message: '登录成功',
              duration: 1500
            })

            // 登录后跳转到主页
            this.$router.push('/')
          } catch (error) {
            // 显示登录失败消息
            this.$message.error(error.response.data.message || '登录失败')
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
/**
 * 登录页面样式
 * 包含渐变背景、卡片样式、输入框样式和按钮样式
 */
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.login-card {
  width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  padding: 20px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.el-input__inner {
  height: 48px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  font-size: 15px;
}

.el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
}

.el-form-item {
  margin-bottom: 20px;
}

.el-icon-user,
.el-icon-lock {
  color: #667eea;
}

.login-links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link,
.home-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin: 0 8px;
}

.register-link:hover,
.home-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}
</style>
