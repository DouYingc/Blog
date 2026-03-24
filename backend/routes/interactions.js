const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const Like = require("../models/Like");
const Favorite = require("../models/Favorite");
const Article = require("../models/Article");
const NotificationService = require("../services/notificationService");

// 获取文章的点赞收藏状态
router.get("/status/:articleId", auth, async (req, res) => {
  try {
    const isLiked = await Like.findOne({
      where: { user_id: req.user.id, article_id: req.params.articleId },
    });
    const isFavorited = await Favorite.findOne({
      where: { user_id: req.user.id, article_id: req.params.articleId },
    });
    res.json({
      isLiked: !!isLiked,
      isFavorited: !!isFavorited,
    });
  } catch (error) {
    res.status(500).json({ message: "获取状态失败", error: error.message });
  }
});

// 点赞/取消点赞
router.post("/like", auth, async (req, res) => {
  const { article_id } = req.body;
  try {
    const existing = await Like.findOne({
      where: { user_id: req.user.id, article_id },
    });
    if (existing) {
      await existing.destroy();
      res.json({ message: "取消点赞成功", isLiked: false });
    } else {
      await Like.create({ user_id: req.user.id, article_id });

      // 获取文章信息并发送通知（异步处理，不影响点赞操作）
      try {
        const article = await Article.findByPk(article_id, {
          include: { model: require("../models/User") },
        });

        // 如果文章作者不是当前用户，发送通知
        if (article && article.user_id !== req.user.id) {
          await NotificationService.createNotification(
            article.user_id,
            req.user.id,
            "like",
            article_id,
            "article",
            `${req.user.username} 点赞了你的文章《${article.title}》`,
          );
        }
      } catch (notificationError) {
        console.error("创建通知失败:", notificationError);
        // 通知创建失败不影响点赞操作
      }

      res.json({ message: "点赞成功", isLiked: true });
    }
  } catch (error) {
    res.status(500).json({ message: "操作失败", error: error.message });
  }
});

// 收藏/取消收藏
router.post("/favorite", auth, async (req, res) => {
  const { article_id } = req.body;
  try {
    const existing = await Favorite.findOne({
      where: { user_id: req.user.id, article_id },
    });
    if (existing) {
      await existing.destroy();
      res.json({ message: "取消收藏成功", isFavorited: false });
    } else {
      await Favorite.create({ user_id: req.user.id, article_id });

      // 获取文章信息并发送通知（异步处理，不影响收藏操作）
      try {
        const article = await Article.findByPk(article_id, {
          include: { model: require("../models/User") },
        });

        // 如果文章作者不是当前用户，发送通知
        if (article && article.user_id !== req.user.id) {
          await NotificationService.createNotification(
            article.user_id,
            req.user.id,
            "favorite",
            article_id,
            "article",
            `${req.user.username} 收藏了你的文章《${article.title}》`,
          );
        }
      } catch (notificationError) {
        console.error("创建通知失败:", notificationError);
        // 通知创建失败不影响收藏操作
      }

      res.json({ message: "收藏成功", isFavorited: true });
    }
  } catch (error) {
    res.status(500).json({ message: "操作失败", error: error.message });
  }
});

// 获取我的收藏列表
router.get("/my-favorites", auth, async (req, res) => {
  try {
    const favorites = await Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: Article,
          include: ["Category", "User"],
        },
      ],
    });
    res.json(favorites.map((f) => f.Article));
  } catch (error) {
    res.status(500).json({ message: "获取收藏失败", error: error.message });
  }
});

module.exports = router;
