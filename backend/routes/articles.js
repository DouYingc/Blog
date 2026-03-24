const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const User = require("../models/User");
const { Op } = require("sequelize");
const { auth } = require("../middleware/auth");
const { sequelize } = require("../config/db");
const Like = require("../models/Like");
const Favorite = require("../models/Favorite");

// Get all articles (with pagination and filtering)
router.get("/", async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category_id,
    tag_id,
    keyword,
    user_id,
    order = "date",
  } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (category_id) where.category_id = category_id;
  if (user_id) where.user_id = user_id; // 支持按作者筛选
  if (keyword) {
    where[Op.or] = [
      { title: { [Op.like]: `%${keyword}%` } },
      { content: { [Op.like]: `%${keyword}%` } },
    ];
  }

  const include = [
    { model: Category, attributes: ["id", "name"] },
    { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
    { model: User, attributes: ["id", "username"] },
  ];

  // 设置排序
  let orderClause = [
    ["is_top", "DESC"],
    ["created_at", "DESC"],
  ];
  if (order === "views") {
    orderClause = [["views", "DESC"]];
  }

  // 文章归档：只返回 ID、标题和创建时间，不分页（或大分页）
  if (req.query.type === "archives") {
    try {
      const articles = await Article.findAll({
        attributes: ["id", "title", "created_at"],
        order: [["created_at", "DESC"]],
      });

      return res.json(articles);
    } catch (error) {
      console.error("Archives fetch error:", error);
      return res
        .status(500)
        .json({ message: "获取归档失败", error: error.message });
    }
  }

  if (tag_id) {
    include.push({
      model: Tag,
      where: { id: tag_id },
      attributes: [],
      through: { attributes: [] },
    });
  }

  try {
    const { count, rows } = await Article.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        include: [
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM likes WHERE likes.article_id = Article.id)`,
            ),
            "likes_count",
          ],
          [
            sequelize.literal(
              `(SELECT COUNT(*) FROM favorites WHERE favorites.article_id = Article.id)`,
            ),
            "favorites_count",
          ],
        ],
      },
      include,
      order: orderClause,
      distinct: true,
    });

    res.json({
      total: count,
      articles: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get related articles (same category)
router.get("/:id/related", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: "文章不存在" });
    }

    if (!article.category_id) {
      return res.json([]);
    }

    const related = await Article.findAll({
      where: {
        category_id: article.category_id,
        id: { [Op.ne]: articleId },
      },
      limit: 5,
      order: [["views", "DESC"]],
      attributes: ["id", "title", "cover", "created_at", "views"],
    });

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: "获取相关推荐失败", error: error.message });
  }
});

// Get article detail
router.get("/:id", async (req, res) => {
  try {
    const articleId = req.params.id;
    console.log(`[Backend] Fetching article detail for ID: ${articleId}`); // Debug log

    const article = await Article.findByPk(articleId, {
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
        { model: User, attributes: ["id", "username", "avatar"] },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: "文章不存在" });
    }

    // Increment views
    await article.increment("views");

    // 获取点赞和收藏数量（分开查询比 literal 子查询更稳健）
    const likes_count = await Like.count({ where: { article_id: articleId } });
    const favorites_count = await Favorite.count({
      where: { article_id: articleId },
    });

    const articleJSON = article.toJSON();
    articleJSON.likes_count = likes_count;
    articleJSON.favorites_count = favorites_count;

    res.json(articleJSON);
  } catch (error) {
    console.error("获取文章详情失败:", error);
    res.status(500).json({ message: "获取文章详情失败", error: error.message });
  }
});

// Create article
router.post("/", auth, async (req, res) => {
  const {
    title,
    content,
    html_content,
    summary,
    category_id,
    tags,
    status,
    is_top,
  } = req.body;
  try {
    // 权限校验：只有管理员可以设置置顶
    const finalIsTop = req.user.role === "admin" ? is_top : false;

    // 如果没有提供摘要，自动从内容中提取
    let finalSummary = summary;
    if (!finalSummary && content) {
      // 移除Markdown标记和HTML标签，提取前150个字符作为摘要
      const plainText = content
        .replace(/\[.*?\]\(.*?\)/g, "") // 移除链接
        .replace(/#{1,6}\s/g, "") // 移除标题
        .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗体
        .replace(/\*(.*?)\*/g, "$1") // 移除斜体
        .replace(/`{3}[\s\S]*?`{3}/g, "") // 移除代码块
        .replace(/`(.*?)`/g, "$1") // 移除行内代码
        .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
        .replace(/<[^>]+>/g, "") // 移除HTML标签
        .trim();

      finalSummary =
        plainText.length > 150
          ? plainText.substring(0, 150) + "..."
          : plainText;
    }

    const article = await Article.create({
      title,
      content,
      html_content,
      summary: finalSummary,
      category_id,
      user_id: req.user.id,
      status: status || "published",
      is_top: finalIsTop,
    });

    if (Array.isArray(tags) && tags.length > 0) {
      await article.setTags(tags);
    }

    res.status(201).json(article);
  } catch (error) {
    console.error("发布文章失败:", error);
    res.status(500).json({ message: "发布文章失败", error: error.message });
  }
});

// Update article (Admin or Owner only)
router.put("/:id", auth, async (req, res) => {
  const {
    title,
    content,
    html_content,
    summary,
    category_id,
    tags,
    status,
    is_top,
  } = req.body;
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "文章不存在" });
    }

    // 权限校验：管理员或者文章所有者
    if (req.user.role !== "admin" && article.user_id !== req.user.id) {
      return res.status(403).json({ message: "没有权限修改他人文章" });
    }

    // 权限校验：只有管理员可以设置置顶
    const finalIsTop = req.user.role === "admin" ? is_top : article.is_top;

    // 如果没有提供摘要，自动从内容中提取
    let finalSummary = summary;
    if (!finalSummary && content) {
      // 移除Markdown标记和HTML标签，提取前150个字符作为摘要
      const plainText = content
        .replace(/\[.*?\]\(.*?\)/g, "") // 移除链接
        .replace(/#{1,6}\s/g, "") // 移除标题
        .replace(/\*\*(.*?)\*\*/g, "$1") // 移除粗体
        .replace(/\*(.*?)\*/g, "$1") // 移除斜体
        .replace(/`{3}[\s\S]*?`{3}/g, "") // 移除代码块
        .replace(/`(.*?)`/g, "$1") // 移除行内代码
        .replace(/!\[.*?\]\(.*?\)/g, "") // 移除图片
        .replace(/<[^>]+>/g, "") // 移除HTML标签
        .trim();

      finalSummary =
        plainText.length > 150
          ? plainText.substring(0, 150) + "..."
          : plainText;
    }

    await article.update({
      title,
      content,
      html_content,
      summary: finalSummary,
      category_id,
      status: status || article.status,
      is_top: finalIsTop,
    });

    if (Array.isArray(tags)) {
      await article.setTags(tags);
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "更新文章失败", error: error.message });
  }
});

// Delete article (Admin or Owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "文章不存在" });
    }

    // 权限校验：管理员或者文章所有者
    if (req.user.role !== "admin" && article.user_id !== req.user.id) {
      return res.status(403).json({ message: "没有权限删除他人文章" });
    }

    await article.destroy();
    res.json({ message: "文章删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除文章失败", error: error.message });
  }
});

module.exports = router;
