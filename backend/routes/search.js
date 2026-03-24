const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const Tag = require("../models/Tag");
const { Op } = require("sequelize");

// 获取搜索建议
router.get("/suggestions", async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword || keyword.length< 2) {
      return res.json({ articles: [], tags: [] });
    }

    // 搜索文章
    const articles = await Article.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ]
      },
      limit: 5,
      attributes: ["id", "title"]
    });

    // 搜索标签
    const tags = await Tag.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` }
      },
      limit: 5,
      attributes: ["id", "name"]
    });

    res.json({
      articles: articles.map(a => ({ ...a.toJSON(), type: "article" })),
      tags: tags.map(t => ({ ...t.toJSON(), type: "tag" }))
    });
  } catch (error) {
    res.status(500).json({ message: "获取搜索建议失败", error: error.message });
  }
});

// 搜索文章
router.get("/articles", async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ message: "搜索关键词不能为空" });
    }

    const offset = (page - 1) * limit;

    // 搜索文章
    const { count, rows: articles } = await Article.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${keyword}%` } },
          { content: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        { model: require("../models/User"), attributes: ["id", "username", "avatar"] },
        { model: require("../models/Category"), attributes: ["id", "name"] }
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // 高亮关键词
    const highlightedArticles = articles.map(article => {
      const articleData = article.toJSON();
      if (articleData.title) {
        articleData.title_highlight = articleData.title.replace(
          new RegExp(keyword, "gi"),
          match => `<mark>${match}</mark>`
        );
      }
      if (articleData.content) {
        // 提取摘要并高亮
        const summary = articleData.content.substring(0, 150);
        articleData.summary_highlight = summary.replace(
          new RegExp(keyword, "gi"),
          match => `<mark>${match}</mark>`
        );
      }
      return articleData;
    });

    res.json({
      articles: highlightedArticles,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: "搜索失败", error: error.message });
  }
});

module.exports = router;