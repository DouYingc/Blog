/**
 * 文章管理路由
 * 功能：处理文章的CRUD操作、相关推荐、热门文章、随机文章等
 */
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

/**
 * 从内容中提取摘要
 * @param {string} content - 文章内容
 * @returns {string} 提取的摘要
 */
function extractSummary(content) {
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

  return plainText.length > 150
    ? plainText.substring(0, 150) + "..."
    : plainText;
}

/**
 * 获取文章列表（支持分页和筛选）
 * @route GET /api/articles
 * @param {number} page - 页码，默认1
 * @param {number} limit - 每页数量，默认10
 * @param {number} category_id - 分类ID
 * @param {number} tag_id - 标签ID
 * @param {string} keyword - 搜索关键词
 * @param {number} user_id - 作者ID
 * @param {string} order - 排序方式，date或views
 * @param {string} type - 类型，archives表示归档
 * @returns {object} 文章列表和分页信息
 */
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

/**
 * 获取相关文章（同分类或同标签）
 * @route GET /api/articles/:id/related
 * @param {number} id - 文章ID
 * @returns {array} 相关文章列表
 */
router.get("/:id/related", async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await Article.findByPk(articleId, {
      include: [
        { model: Tag, attributes: ["id"], through: { attributes: [] } },
      ],
    });

    if (!article) {
      return res.status(404).json({ message: "文章不存在" });
    }

    const tagIds = article.Tags.map((tag) => tag.id);

    const whereCondition = {
      id: { [Op.ne]: articleId },
      [Op.or]: [],
    };

    if (article.category_id) {
      whereCondition[Op.or].push({ category_id: article.category_id });
    }

    if (tagIds.length > 0) {
      whereCondition[Op.or].push({
        id: {
          [Op.in]: sequelize.literal(`
            (SELECT DISTINCT article_id FROM article_tags WHERE tag_id IN (${tagIds.join(",")}))
          `),
        },
      });
    }

    if (whereCondition[Op.or].length === 0) {
      return res.json([]);
    }

    const related = await Article.findAll({
      where: whereCondition,
      limit: 5,
      order: [["views", "DESC"]],
      attributes: ["id", "title", "cover", "created_at", "views"],
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
      ],
    });

    res.json(related);
  } catch (error) {
    res.status(500).json({ message: "获取相关推荐失败", error: error.message });
  }
});

/**
 * 获取热门文章（基于浏览量和点赞数）
 * @route GET /api/articles/popular
 * @param {number} limit - 数量限制，默认10
 * @returns {array} 热门文章列表
 */
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularArticles = await Article.findAll({
      where: { status: "published" },
      limit: parseInt(limit),
      order: [
        ["views", "DESC"],
        [
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.article_id = Article.id)",
          ),
          "DESC",
        ],
        ["created_at", "DESC"],
      ],
      attributes: {
        include: [
          [
            sequelize.literal(
              "(SELECT COUNT(*) FROM likes WHERE likes.article_id = Article.id)",
            ),
            "likes_count",
          ],
        ],
      },
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
        { model: User, attributes: ["id", "username"] },
      ],
    });

    res.json(popularArticles);
  } catch (error) {
    res.status(500).json({ message: "获取热门文章失败", error: error.message });
  }
});

/**
 * 获取随机文章
 * @route GET /api/articles/random
 * @param {number} limit - 数量限制，默认5
 * @returns {array} 随机文章列表
 */
router.get("/random", async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const randomArticles = await Article.findAll({
      where: { status: "published" },
      limit: parseInt(limit),
      order: sequelize.literal("RAND()"),
      attributes: ["id", "title", "cover", "created_at", "views"],
      include: [
        { model: Category, attributes: ["id", "name"] },
        { model: Tag, attributes: ["id", "name"], through: { attributes: [] } },
        { model: User, attributes: ["id", "username"] },
      ],
    });

    res.json(randomArticles);
  } catch (error) {
    res.status(500).json({ message: "获取随机文章失败", error: error.message });
  }
});

/**
 * 获取文章详情
 * @route GET /api/articles/:id
 * @param {number} id - 文章ID
 * @returns {object} 文章详情
 */
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

/**
 * 创建文章
 * @route POST /api/articles
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容（Markdown）
 * @param {string} html_content - 文章内容（HTML）
 * @param {string} summary - 文章摘要
 * @param {number} category_id - 分类ID
 * @param {array} tags - 标签ID数组
 * @param {string} status - 文章状态
 * @param {boolean} is_top - 是否置顶
 * @param {string} cover - 文章封面
 * @returns {object} 创建的文章
 */
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
    cover,
  } = req.body;
  try {
    // 权限校验：只有管理员可以设置置顶
    const finalIsTop = req.user.role === "admin" ? is_top : false;

    // 如果没有提供摘要，自动从内容中提取
    let finalSummary = summary;
    if (!finalSummary && content) {
      finalSummary = extractSummary(content);
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
      cover,
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

/**
 * 更新文章（仅管理员或文章所有者）
 * @route PUT /api/articles/:id
 * @param {number} id - 文章ID
 * @param {string} title - 文章标题
 * @param {string} content - 文章内容（Markdown）
 * @param {string} html_content - 文章内容（HTML）
 * @param {string} summary - 文章摘要
 * @param {number} category_id - 分类ID
 * @param {array} tags - 标签ID数组
 * @param {string} status - 文章状态
 * @param {boolean} is_top - 是否置顶
 * @param {string} cover - 文章封面
 * @returns {object} 更新后的文章
 */
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
    cover,
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
      finalSummary = extractSummary(content);
    }

    await article.update({
      title,
      content,
      html_content,
      summary: finalSummary,
      category_id,
      status: status || article.status,
      is_top: finalIsTop,
      cover,
    });

    if (Array.isArray(tags)) {
      await article.setTags(tags);
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ message: "更新文章失败", error: error.message });
  }
});

/**
 * 删除文章（仅管理员或文章所有者）
 * @route DELETE /api/articles/:id
 * @param {number} id - 文章ID
 * @returns {object} 操作结果
 */
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
