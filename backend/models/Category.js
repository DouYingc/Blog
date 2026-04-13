/**
 * 分类模型
 * 功能：定义文章分类数据结构和属性
 */
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db"); // 数据库连接

/**
 * 分类模型定义
 * @param {string} tableName - 表名
 * @param {object} options - 模型配置选项
 */
const Category = sequelize.define(
  "Category",
  {
    /**
     * 分类ID
     * @type {number}
     * @primaryKey
     * @autoIncrement
     */
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    /**
     * 分类名称
     * @type {string}
     * @notNull
     */
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    /**
     * 分类描述
     * @type {string}
     */
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    /**
     * 父分类ID
     * @type {number}
     */
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    /**
     * 分类级别
     * @type {number}
     * @default 0
     */
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "categories", // 表名
    timestamps: true, // 启用时间戳
    createdAt: "created_at", // 创建时间字段名
    updatedAt: false, // 禁用更新时间字段
    indexes: [
      {
        fields: ["parent_id"], // 为parent_id字段创建索引
      },
    ],
  },
);

/**
 * 定义分类之间的父子关系
 */
// 一个分类属于另一个分类（父分类）
Category.belongsTo(Category, {
  foreignKey: "parent_id",
  as: "parent",
});

// 一个分类可以有多个子分类
Category.hasMany(Category, {
  foreignKey: "parent_id",
  as: "children",
});

module.exports = Category;
