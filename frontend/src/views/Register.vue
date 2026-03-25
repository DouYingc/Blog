<template>
  <div class="register">
    <el-card class="register-card">
      <div slot="header" class="register-title">用户注册</div>
      <el-form :model="registerForm" :rules="rules" ref="registerForm" label-width="0">
        <el-form-item prop="username">
          <el-input v-model="registerForm.username" prefix-icon="el-icon-user" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="registerForm.email" prefix-icon="el-icon-message" placeholder="邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="registerForm.password" type="password" prefix-icon="el-icon-lock"
            placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item prop="checkPassword">
          <el-input v-model="registerForm.checkPassword" type="password" prefix-icon="el-icon-lock"
            placeholder="确认密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRegister" class="register-button">立即注册</el-button>
        </el-form-item>
        <el-form-item style="text-align: center">
          已有账号？<router-link to="/login">去登录</router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import axios from '../axios'

export default {
  name: 'RegisterView',
  data () {
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
      registerForm: {
        username: '',
        password: '',
        checkPassword: '',
        email: ''
      },
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
    handleRegister () {
      this.$refs.registerForm.validate(async valid => {
        if (valid) {
          try {
            await axios.post('/auth/register', this.registerForm)
            this.$message.success({
              message: '注册成功，请登录',
              duration: 1500
            })
            this.$router.push('/login')
          } catch (error) {
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
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7f9;
}

.register-card {
  width: 400px;
}

.register-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

.register-button {
  width: 100%;
}
</style>
