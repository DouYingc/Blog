/**
 * 标签管理路由
 * 功能：处理标签的CRUD操作，支持热门标签查询
 */
const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");
const { sequelize } = require("../config/db");
const { adminAuth } = require("../middleware/auth");

/**
 * 获取所有标签
 * @route GET /api/tags
 * @returns {array} 标签列表
 */
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "获取标签失败", error: error.message });
  }
});

/**
 * 获取热门标签（标签云）
 * @route GET /api/tags/popular
 * @param {number} limit - 限制返回数量，默认20
 * @returns {array} 热门标签列表，包含文章数量
 */
router.get("/popular", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // 查询标签及其文章数量
    const popularTags = await Tag.findAll({
      attributes: [
        "id",
        "name",
        [sequelize.literal("COUNT(article_tags.article_id)"), "article_count"],
      ],
      include: [
        {
          model: require("../models/Article"),
          through: "article_tags",
          attributes: [],
          where: { status: "published" },
          required: true,
        },
      ],
      group: ["Tag.id"],
      order: [[sequelize.literal("article_count"), "DESC"]],
      limit: limit,
    });

    res.json(popularTags);
  } catch (error) {
    res.status(500).json({ message: "获取热门标签失败", error: error.message });
  }
});

/**
 * 创建标签 (仅管理员)
 * @route POST /api/tags
 * @param {string} name - 标签名称
 * @returns {object} 创建的标签
 */
router.post("/", adminAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: "创建标签失败", error: error.message });
  }
});

/**
 * 更新标签 (仅管理员)
 * @route PUT /api/tags/:id
 * @param {number} id - 标签ID
 * @param {string} name - 标签名称
 * @returns {object} 更新后的标签
 */
router.put("/:id", adminAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "标签不存在" });
    }
    await tag.update({ name });
    res.json(tag);
  } catch (error) {
    res.status(500).json({ message: "更新标签失败", error: error.message });
  }
});

/**
 * 删除标签 (仅管理员)
 * @route DELETE /api/tags/:id
 * @param {number} id - 标签ID
 * @returns {object} 操作结果
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "标签不存在" });
    }
    await tag.destroy();
    res.json({ message: "标签删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除标签失败", error: error.message });
  }
});

// 导出路由
module.exports = router;
