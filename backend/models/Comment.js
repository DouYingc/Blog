/**
 * 评论模型
 * 功能：定义评论数据结构和属性
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db') // 数据库连接

/**
 * 评论模型定义
 * @param {string} tableName - 表名
 * @param {object} options - 模型配置选项
 */
const Comment = sequelize.define('Comment', {
  /**
   * 评论ID
   * @type {number}
   * @primaryKey
   * @autoIncrement
   */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  /**
   * 文章ID
   * @type {number}
   * @notNull
   */
  article_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  /**
   * 评论昵称
   * @type {string}
   * @notNull
   */
  nickname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 评论邮箱
   * @type {string}
   */
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  /**
   * 评论内容
   * @type {string}
   * @notNull
   */
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  /**
   * 用户ID
   * @type {number}
   */
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  /**
   * 父评论ID
   * @type {number}
   */
  parent_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  /**
   * 点赞数
   * @type {number}
   * @default 0
   * @notNull
   */
  likes_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'comments', // 表名
  timestamps: true, // 启用时间戳
  createdAt: 'created_at', // 创建时间字段名
  updatedAt: false // 禁用更新时间字段
})

module.exports = Comment
