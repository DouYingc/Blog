/**
 * 认证路由
 * 功能：处理用户认证相关的API请求，包括登录、注册、更新个人资料和获取用户信息
 */
const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs') // 密码加密
const jwt = require('jsonwebtoken') // JWT令牌生成
const User = require('../models/User') // 用户模型
const { auth } = require('../middleware/auth') // 认证中间件
require('dotenv').config() // 加载环境变量

/**
 * 用户登录
 * @route POST /api/auth/login
 * @description 处理用户登录，验证用户名和密码，生成JWT令牌
 * @access 公开
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    // 查找用户
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' })
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } // 令牌有效期1天
    )

    // 返回令牌和用户信息
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(500).json({ message: '登录失败', error: error.message })
  }
})

/**
 * 更新个人资料
 * @route PUT /api/auth/profile
 * @description 更新当前登录用户的个人资料
 * @access 私有 (需要登录)
 */
router.put('/profile', auth, async (req, res) => {
  const { email, avatar, bio, social_links } = req.body
  const userId = req.user.id

  try {
    // 查找用户
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 更新允许修改的字段
    if (email !== undefined) user.email = email
    if (avatar !== undefined) user.avatar = avatar
    if (bio !== undefined) user.bio = bio
    if (social_links !== undefined) user.social_links = social_links

    // 保存更新
    await user.save()

    // 返回更新后的用户信息
    res.json({
      message: '资料更新成功',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
        bio: user.bio,
        social_links: user.social_links
      }
    })
  } catch (error) {
    res.status(500).json({ message: '更新资料失败', error: error.message })
  }
})

/**
 * 用户注册
 * @route POST /api/auth/register
 * @description 处理用户注册，创建新用户
 * @access 公开
 */
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body
  try {
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)
    // 创建新用户
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: 'visitor' // 注册默认为普通用户
    })

    // 返回注册成功信息
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    res.status(500).json({ message: '注册失败', error: error.message })
  }
})

/**
 * 获取用户公开资料
 * @route GET /api/auth/user/:id
 * @description 获取指定用户的公开资料信息
 * @access 公开
 */
router.get('/user/:id', async (req, res) => {
  try {
    // 查找用户并只返回公开字段
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'email', 'avatar', 'role', 'created_at', 'bio', 'social_links']
    })
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: '获取用户信息失败', error: error.message })
  }
})

module.exports = router
