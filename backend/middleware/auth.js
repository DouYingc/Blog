/**
 * 认证中间件
 * 功能：处理用户认证和权限控制
 */
const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * 认证中间件
 * 功能：验证用户是否已登录，解析token并将用户信息添加到请求对象
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @param {function} next - 下一个中间件
 */
const auth = (req, res, next) => {
  // 从请求头获取token
  const token = req.header('Authorization')?.replace('Bearer ', '')

  // 未提供token，返回401错误
  if (!token) {
    return res.status(401).json({ message: '请先登录' })
  }

  try {
    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // 将用户信息添加到请求对象
    req.user = decoded
    // 继续处理请求
    next()
  } catch (error) {
    // token无效或过期，返回401错误
    res.status(401).json({ message: '登录已过期，请重新登录' })
  }
}

/**
 * 管理员认证中间件
 * 功能：验证用户是否为管理员
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @param {function} next - 下一个中间件
 */
const adminAuth = (req, res, next) => {
  // 先执行普通认证
  auth(req, res, () => {
    // 检查用户角色是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员有权访问此接口' })
    }
    // 继续处理请求
    next()
  })
}

// 导出中间件
module.exports = { auth, adminAuth }
