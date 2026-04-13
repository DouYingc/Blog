/**
 * 用户模型
 * 功能：定义用户数据结构和属性
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db') // 数据库连接

/**
 * 用户模型定义
 * @param {string} tableName - 表名
 * @param {object} options - 模型配置选项
 */
const User = sequelize.define('User', {
  /**
   * 用户ID
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
   * 用户名
   * @type {string}
   * @unique
   * @notNull
   */
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  /**
   * 密码
   * @type {string}
   * @notNull
   */
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  /**
   * 邮箱
   * @type {string}
   */
  email: {
    type: DataTypes.STRING,
    allowNull: true
  },
  /**
   * 用户角色
   * @type {string}
   * @enum [admin, visitor]
   * @default admin
   */
  role: {
    type: DataTypes.ENUM('admin', 'visitor'),
    defaultValue: 'admin'
  },
  /**
   * 头像
   * @type {string}
   */
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  /**
   * 个人简介
   * @type {string}
   */
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '个人简介'
  },
  /**
   * 社交链接
   * @type {object}
   * @default {}
   */
  social_links: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {},
    comment: '社交链接'
  }
}, {
  tableName: 'users', // 表名
  timestamps: true, // 启用时间戳
  createdAt: 'created_at', // 创建时间字段名
  updatedAt: 'updated_at' // 更新时间字段名
})

module.exports = User
