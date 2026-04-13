<template>
  <div class="register">
    <el-card class="register-card">
      <div slot="header" class="register-title">用户注册</div>
      <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="0">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <!-- 邮箱输入框 -->
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" prefix-icon="el-icon-message" placeholder="邮箱"></el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" prefix-icon="el-icon-lock"
            placeholder="密码"></el-input>
        </el-form-item>
        <!-- 确认密码输入框 -->
        <el-form-item prop="checkPassword">
          <el-input v-model="registerForm.checkPassword" type="password" prefix-icon="el-icon-lock"
            placeholder="确认密码"></el-input>
        </el-form-item>
        <!-- 注册按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-button">立即注册</el-button>
        </el-form-item>
        <!-- 底部链接 -->
        <el-form-item class="register-links">
          已有账号？<router-link to="/login" class="login-link">去登录</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
/**
 * 注册页面组件
 * 功能：提供用户注册表单，处理注册逻辑，包括表单验证、密码确认、API调用和错误处理
 */
import axios from '../axios' // 网络请求

export default {
  name: 'RegisterView',
  data () {
    /**
     * 密码验证规则
     * @param {object} rule - 验证规则
     * @param {string} value - 输入值
     * @param {function} callback - 回调函数
     */
    const validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        if (this.registerForm.checkPassword !== '') {
          this.$refs.registerForm.validateField('checkPassword')
        }
        callback()
      }
    }

    /**
     * 确认密码验证规则
     * @param {object} rule - 验证规则
     * @param {string} value - 输入值
     * @param {function} callback - 回调函数
     */
    const validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.registerForm.password) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }

    return {
      /**
       * 注册表单数据
       * @property {string} username - 用户名
       * @property {string} password - 密码
       * @property {string} checkPassword - 确认密码
       * @property {string} email - 邮箱
       */
      registerForm: {
        username: '',
        password: '',
        checkPassword: '',
        email: ''
      },
      /**
       * 表单验证规则
       */
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
        ],
        password: [
          { validator: validatePass, trigger: 'blur' },
          { min: 6, message: '密码不能少于 6 位', trigger: 'blur' }
        ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    /**
     * 处理注册逻辑
     */
    handleRegister () {
      // 表单验证
      this.$refs.registerForm.validate(async valid => {
        if (valid) {
          try {
            // 调用注册API
            await axios.post('/auth/register', this.registerForm)
            // 显示注册成功消息
            this.$message.success({
              message: '注册成功，请登录',
              duration: 1500
            })
            // 跳转到登录页面
            this.$router.push('/login')
          } catch (error) {
            // 显示注册失败消息
            this.$message.error(error.response.data.message || '注册失败')
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
 * 注册页面样式
 * 包含渐变背景、卡片样式、输入框样式和按钮样式
 */
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  position: relative;
  overflow: hidden;
}

.register::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.register-card {
  width: 420px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.register-title {
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  padding: 20px 0;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.register-button {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  transition: all 0.3s ease;
}

.register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
}

.register-button:active {
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
  border-color: #f5576c;
  box-shadow: 0 0 0 2px rgba(245, 87, 108, 0.1);
}

.el-form-item {
  margin-bottom: 20px;
}

.el-icon-user,
.el-icon-message,
.el-icon-lock {
  color: #f5576c;
}

.register-links {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link {
  color: #f5576c;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-left: 5px;
}

.login-link:hover {
  color: #f093fb;
  text-decoration: underline;
}
</style>
