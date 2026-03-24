const jwt = require('jsonwebtoken')
require('dotenv').config()

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ message: '请先登录' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: '登录已过期，请重新登录' })
  }
}

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员有权访问此接口' })
    }
    next()
  })
}

module.exports = { auth, adminAuth }
