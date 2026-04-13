/**
 * 用户管理路由
 * 功能：处理用户相关的API请求，包括用户列表、用户个人资料、角色管理等
 */
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Article = require("../models/Article");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const { sequelize } = require("../config/db");
const { Op } = require("sequelize");

/**
 * 获取活跃用户
 * 功能：根据用户活动情况获取活跃用户列表
 * @route GET /api/users/active
 * @returns {array} 活跃用户列表
 */
router.get("/active", async (req, res) => {
  try {
    const activeUsers = await User.findAll({
      where: {},
      attributes: [
        "id",
        "username",
        "avatar",
        "created_at",
        "role",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM articles WHERE articles.user_id = User.id)",
          ),
          "articles_count",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.user_id = User.id)",
          ),
          "comments_count",
        ],
        [
          sequelize.literal(
            "(SELECT SUM(articles.views) FROM articles WHERE articles.user_id = User.id)",
          ),
          "total_views",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.user_id = User.id)",
          ),
          "total_likes",
        ],
      ],
      order: [
        [sequelize.literal("articles_count"), "DESC"],
        [sequelize.literal("comments_count"), "DESC"],
        [sequelize.literal("total_views"), "DESC"],
      ],
      limit: 20,
    });

    res.json(activeUsers);
  } catch (error) {
    res.status(500).json({ message: "获取活跃用户失败", error: error.message });
  }
});

/**
 * 获取优质作者
 * 功能：根据文章质量指标获取优质作者列表
 * @route GET /api/users/quality
 * @returns {array} 优质作者列表
 */
router.get("/quality", async (req, res) => {
  try {
    const qualityAuthors = await User.findAll({
      where: {},
      attributes: [
        "id",
        "username",
        "avatar",
        "created_at",
        "role",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM articles WHERE articles.user_id = User.id)",
          ),
          "articles_count",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.user_id = User.id)",
          ),
          "comments_count",
        ],
        [
          sequelize.literal(
            "(SELECT SUM(articles.views) FROM articles WHERE articles.user_id = User.id)",
          ),
          "total_views",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.user_id = User.id)",
          ),
          "total_likes",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.article_id IN (SELECT id FROM articles WHERE articles.user_id = User.id))",
          ),
          "received_likes",
        ],
      ],
      order: [
        [sequelize.literal("received_likes"), "DESC"],
        [sequelize.literal("total_views"), "DESC"],
        [sequelize.literal("articles_count"), "DESC"],
      ],
      limit: 20,
    });

    res.json(qualityAuthors);
  } catch (error) {
    res.status(500).json({ message: "获取优质作者失败", error: error.message });
  }
});

/**
 * 获取用户个人资料
 * 功能：获取指定用户的详细信息和统计数据
 * @route GET /api/users/:id
 * @param {number} id - 用户ID
 * @returns {object} 用户个人资料和统计数据
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "avatar", "created_at", "role", "email"],
    });

    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 获取用户统计数据
    const [articlesCount, commentsCount, totalViews, receivedLikes] =
      await Promise.all([
        Article.count({ where: { user_id: userId } }),
        Comment.count({ where: { user_id: userId } }),
        Article.sum("views", { where: { user_id: userId } }) || 0,
        Like.count({
          where: {
            article_id: {
              [Op.in]: sequelize.literal(
                `(SELECT id FROM articles WHERE user_id = ${userId})`,
              ),
            },
          },
        }),
      ]);

    const userData = {
      ...user.toJSON(),
      articles_count: articlesCount,
      comments_count: commentsCount,
      total_views: totalViews,
      received_likes: receivedLikes,
    };

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: "获取用户信息失败", error: error.message });
  }
});

/**
 * 更新用户角色
 * 功能：更新指定用户的角色
 * @route PUT /api/users/:id/role
 * @param {number} id - 用户ID
 * @param {string} role - 新角色（admin或visitor）
 * @returns {object} 更新结果
 */
router.put("/:id/role", async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    // 验证角色值
    if (!["admin", "visitor"].includes(role)) {
      return res.status(400).json({ message: "无效的角色" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 更新角色
    await user.update({ role });
    res.json({ message: "角色更新成功", user: { ...user.toJSON(), role } });
  } catch (error) {
    res.status(500).json({ message: "角色更新失败", error: error.message });
  }
});

/**
 * 删除用户
 * 功能：删除指定用户及其相关数据
 * @route DELETE /api/users/:id
 * @param {number} id - 用户ID
 * @returns {object} 删除结果
 */
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 不能删除管理员账号
    if (user.role === "admin") {
      return res.status(400).json({ message: "不能删除管理员账号" });
    }

    // 删除相关数据
    await Comment.destroy({ where: { user_id: userId } });
    await Like.destroy({ where: { user_id: userId } });
    await Article.destroy({ where: { user_id: userId } });

    // 删除用户
    await user.destroy();
    res.json({ message: "用户删除成功" });
  } catch (error) {
    res.status(500).json({ message: "用户删除失败", error: error.message });
  }
});

/**
 * 获取用户列表
 * 功能：获取所有用户列表，支持分页和筛选
 * @route GET /api/users
 * @param {number} page - 页码，默认1
 * @param {number} size - 每页数量，默认10
 * @param {string} search - 搜索关键词
 * @param {string} role - 角色筛选
 * @returns {object} 用户列表和分页信息
 */
router.get("/", async (req, res) => {
  try {
    const { page = 1, size = 10, search, role } = req.query;

    const where = {};
    if (search) {
      where.username = { [Op.like]: `%${search}%` };
    }
    if (role) {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: [
        "id",
        "username",
        "avatar",
        "created_at",
        "role",
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM articles WHERE articles.user_id = User.id)",
          ),
          "articles_count",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM comments WHERE comments.user_id = User.id)",
          ),
          "comments_count",
        ],
        [
          sequelize.literal(
            "(SELECT SUM(articles.views) FROM articles WHERE articles.user_id = User.id)",
          ),
          "total_views",
        ],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.user_id = User.id)",
          ),
          "total_likes",
        ],
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(size),
      offset: (parseInt(page) - 1) * parseInt(size),
    });

    const total = await User.count({ where });

    res.json({
      users,
      total,
      page: parseInt(page),
      size: parseInt(size),
    });
  } catch (error) {
    res.status(500).json({ message: "获取用户列表失败", error: error.message });
  }
});

// 导出路由
module.exports = router;
