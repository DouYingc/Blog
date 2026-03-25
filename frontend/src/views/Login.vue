<template>
  <div class="login">
    <el-card class="login-card">
      <div slot="header" class="login-title">管理员登录</div>
      <el-form :model="loginForm" :rules="rules" ref="loginForm" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" prefix-icon="el-icon-lock" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" class="login-button">登录</el-button>
        </el-form-item>
        <el-form-item style="text-align: center">
          没有账号？<router-link to="/register">立即注册</router-link>
          <el-divider direction="vertical"></el-divider>
          <router-link to="/">返回首页</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'LoginView',
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  methods: {
    handleLogin () {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          try {
            const response = await axios.post('/auth/login', this.loginForm)
            localStorage.setItem('token', response.data.token)
            localStorage.setItem('user', JSON.stringify(response.data.user))
            this.$message.success({
              message: '登录成功',
              duration: 1500
            })

            // 登录后跳转到主页
            this.$router.push('/')
          } catch (error) {
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
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7f9;
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.login-button {
  width: 100%;
}
</style>
