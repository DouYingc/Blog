const express = require('express')
const router = express.Router()
const { adminAuth, auth } = require('../middleware/auth')
const Article = require('../models/Article')
const User = require('../models/User')
const Comment = require('../models/Comment')
const Category = require('../models/Category')
const { sequelize } = require('../config/db')
const { Op } = require('sequelize')

// 获取用户个人统计数据
router.get('/user-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id

    // 1. 文章总数
    const articleCount = await Article.count({ where: { user_id: userId } })

    // 2. 总阅读量
    const totalViews = await Article.sum('views', { where: { user_id: userId } }) || 0

    // 3. 总点赞数 (用户所有文章获得的点赞总和)
    // 需要查询该用户所有文章的 ID，然后统计 Likes 表中 article_id 在这些 ID 中的记录数
    const userArticles = await Article.findAll({
      where: { user_id: userId },
      attributes: ['id'],
      raw: true
    })
    const articleIds = userArticles.map(a => a.id)

    let totalLikes = 0
    if (articleIds.length > 0) {
      // 动态导入 Like 模型以避免循环依赖问题 (虽然这里不是循环依赖，但保持一致性)
      const Like = require('../models/Like')
      totalLikes = await Like.count({
        where: {
          article_id: { [Op.in]: articleIds }
        }
      })
    }

    // 4. 分类文章分布
    const categoryDistribution = await Article.findAll({
      attributes: [
        [sequelize.col('Category.name'), 'name'],
        [sequelize.fn('COUNT', sequelize.col('Article.id')), 'value']
      ],
      include: [{
        model: Category,
        attributes: []
      }],
      where: { user_id: userId },
      group: ['Category.id', 'Category.name'],
      raw: true
    })

    // 5. 阅读量最高的5篇文章
    const topArticles = await Article.findAll({
      where: { user_id: userId },
      order: [['views', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'views', 'created_at']
    })

    res.json({
      articleCount,
      totalViews,
      totalLikes,
      categoryDistribution,
      topArticles
    })
  } catch (error) {
    console.error('获取用户统计失败:', error)
    res.status(500).json({ message: '获取用户统计数据失败', error: error.message })
  }
})

// 获取综合统计数据 (仅管理员)
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const articleCount = await Article.count()
    const userCount = await User.count()
    const commentCount = await Comment.count()
    const categoryCount = await Category.count()

    // 获取总阅读量
    const totalViews = await Article.sum('views') || 0

    res.json({
      articleCount,
      userCount,
      commentCount,
      categoryCount,
      totalViews
    })
  } catch (error) {
    res.status(500).json({ message: '获取统计数据失败', error: error.message })
  }
})

// 获取最近 7 天的文章发布趋势
router.get('/trend', adminAuth, async (req, res) => {
  try {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      last7Days.push(date.toISOString().split('T')[0])
    }

    const trends = await Article.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      raw: true
    })

    // 格式化数据，补全没有文章的日期
    const result = last7Days.map(date => {
      const found = trends.find(t => t.date === date)
      return {
        date,
        count: found ? found.count : 0
      }
    })

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: '获取趋势数据失败', error: error.message })
  }
})

// 获取分类分布数据
router.get('/categories', adminAuth, async (req, res) => {
  try {
    const data = await Category.findAll({
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('Articles.id')), 'articleCount']
      ],
      include: [{
        model: Article,
        attributes: []
      }],
      group: ['Category.id'],
      raw: true
    })
    res.json(data)
  } catch (error) {
    res.status(500).json({ message: '获取分类分布失败', error: error.message })
  }
})

module.exports = router
