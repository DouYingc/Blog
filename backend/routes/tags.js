const express = require("express");
const router = express.Router();
const Tag = require("../models/Tag");
const { sequelize } = require("../config/db");
const { adminAuth } = require("../middleware/auth");

// 获取所有标签
router.get("/", async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: "获取标签失败", error: error.message });
  }
});

// 获取热门标签（标签云）
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

// 创建标签 (仅管理员)
router.post("/", adminAuth, async (req, res) => {
  const { name } = req.body;
  try {
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: "创建标签失败", error: error.message });
  }
});

// 更新标签 (仅管理员)
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

// 删除标签 (仅管理员)
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

module.exports = router;
