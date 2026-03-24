const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
require('dotenv').config()

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

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

// Update profile route
router.put('/profile', auth, async (req, res) => {
  const { email, avatar, bio, social_links } = req.body
  const userId = req.user.id

  try {
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 更新允许修改的字段
    if (email !== undefined) user.email = email
    if (avatar !== undefined) user.avatar = avatar
    if (bio !== undefined) user.bio = bio
    if (social_links !== undefined) user.social_links = social_links

    await user.save()

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

// Register route
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body
  try {
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role: 'visitor' // 注册默认为普通用户
    })

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

// Get public user profile info
router.get('/user/:id', async (req, res) => {
  try {
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
