/**
 * 私信模型
 * 功能：定义私信数据结构和属性
 */
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db') // 数据库连接

/**
 * 私信模型定义
 * @param {string} tableName - 表名
 * @param {object} options - 模型配置选项
 */
const PrivateMessage = sequelize.define('PrivateMessage', {
  /**
   * 私信ID
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
   * 发送者ID
   * @type {number}
   * @notNull
   * @references Users.id
   */
  sender_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  /**
   * 接收者ID
   * @type {number}
   * @notNull
   * @references Users.id
   */
  receiver_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  /**
   * 私信内容
   * @type {string}
   * @notNull
   */
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  /**
   * 是否已读
   * @type {boolean}
   * @default false
   */
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  /**
   * 创建时间
   * @type {date}
   * @default 当前时间
   */
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'private_messages', // 表名
  timestamps: false, // 禁用自动时间戳
  indexes: [
    {
      fields: ['sender_id'] // 为发送者ID创建索引
    },
    {
      fields: ['receiver_id'] // 为接收者ID创建索引
    },
    {
      fields: ['created_at'] // 为创建时间创建索引
    }
  ]
})

module.exports = PrivateMessage