/**
 * 文章模型
 * 功能：定义文章数据结构和属性
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db') // 数据库连接

/**
 * 文章模型定义
 * @param {string} tableName - 表名
 * @param {object} options - 模型配置选项
 */
const Article = sequelize.define('Article', {
  /**
   * 文章ID
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
   * 文章标题
   * @type {string}
   * @notNull
   */
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 文章内容（Markdown格式）
   * @type {string}
   * @notNull
   */
  content: {
    type: DataTypes.TEXT('medium'),
    allowNull: false
  },
  /**
   * 文章内容（HTML格式）
   * @type {string}
   * @notNull
   */
  html_content: {
    type: DataTypes.TEXT('medium'),
    allowNull: false
  },
  /**
   * 文章摘要
   * @type {string}
   */
  summary: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  /**
   * 分类ID
   * @type {number}
   */
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true
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
   * 阅读量
   * @type {number}
   * @default 0
   */
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  /**
   * 文章状态
   * @type {string}
   * @enum [draft, published]
   * @default published
   */
  status: {
    type: DataTypes.ENUM('draft', 'published'),
    defaultValue: 'published'
  },
  /**
   * 是否置顶
   * @type {boolean}
   * @default false
   */
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  /**
   * 文章封面
   * @type {string}
   */
  cover: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'articles', // 表名
  timestamps: true, // 启用时间戳
  createdAt: 'created_at', // 创建时间字段名
  updatedAt: 'updated_at' // 更新时间字段名
})

module.exports = Article
