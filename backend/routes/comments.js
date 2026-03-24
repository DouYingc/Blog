const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");
const Article = require("../models/Article");
const User = require("../models/User");
const CommentLike = require("../models/CommentLike");
const { auth, adminAuth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const NotificationService = require("../services/notificationService");
require("dotenv").config();

// 获取文章的所有评论 (公开)
router.get("/article/:articleId", async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { article_id: req.params.articleId },
      include: [{ model: User, attributes: ["id", "username", "avatar"] }],
      order: [["created_at", "ASC"]], // 顺序排列，方便查看对话
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "获取评论失败", error: error.message });
  }
});

// 获取用户点赞的评论列表 (需要登录)
router.get("/likes", auth, async (req, res) => {
  try {
    const likes = await CommentLike.findAll({
      where: { user_id: req.user.id },
    });

    const likedCommentIds = likes.map((like) => like.comment_id);
    res.json({ likedCommentIds });
  } catch (error) {
    res.status(500).json({ message: "获取点赞记录失败", error: error.message });
  }
});

// 获取单个评论的点赞状态 (需要登录)
router.get("/likes/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const like = await CommentLike.findOne({
      where: {
        user_id: req.user.id,
        comment_id: id,
      },
    });
    res.json({ isLiked: !!like });
  } catch (error) {
    res.status(500).json({ message: "获取点赞状态失败", error: error.message });
  }
});

// 获取单个评论 (公开)
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "评论不存在" });
    }
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: "获取评论失败", error: error.message });
  }
});

// 发布评论 (公开)
router.post("/", async (req, res) => {
  const { article_id, nickname, email, content, parent_id } = req.body;

  // 尝试获取当前登录用户
  let user_id = null;
  let username = nickname;
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user_id = decoded.id;
      const user = await User.findByPk(user_id);
      if (user) {
        username = user.username;
      }
    } catch (e) {
      // 忽略 token 错误，继续作为匿名留言
    }
  }

  try {
    const comment = await Comment.create({
      article_id,
      nickname,
      email,
      content,
      parent_id,
      user_id,
    });

    // 如果是回复其他评论，发送通知给被回复的用户（异步处理）
    if (parent_id) {
      try {
        const parentComment = await Comment.findByPk(parent_id);
        if (
          parentComment &&
          parentComment.user_id &&
          parentComment.user_id !== user_id
        ) {
          await NotificationService.createNotification(
            parentComment.user_id,
            user_id || null,
            "comment_reply",
            comment.id,
            "comment",
            `${username} 回复了你的评论`,
          );
        }
      } catch (notificationError) {
        console.error("创建回复通知失败:", notificationError);
        // 通知创建失败不影响评论操作
      }
    }

    // 发送通知给文章作者（异步处理）
    try {
      const article = await Article.findByPk(article_id);
      if (article && article.user_id && article.user_id !== user_id) {
        await NotificationService.createNotification(
          article.user_id,
          user_id || null,
          "comment_reply",
          comment.id,
          "comment",
          `${username} 在你的文章《${article.title}》下发表了评论`,
        );
      }
    } catch (notificationError) {
      console.error("创建评论通知失败:", notificationError);
      // 通知创建失败不影响评论操作
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "发布评论失败", error: error.message });
  }
});

// 获取所有评论 (仅管理员)
router.get("/", adminAuth, async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [{ model: Article, attributes: ["id", "title"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: "获取评论列表失败", error: error.message });
  }
});

// 删除评论 (管理员或文章作者可删除评论逻辑可以更复杂，目前设定仅管理员)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "评论不存在" });
    }
    await comment.destroy();
    res.json({ message: "评论删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除评论失败", error: error.message });
  }
});

// 点赞评论 (需要登录)
router.post("/:id/like", auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: "评论不存在" });
    }

    // 检查是否已经点赞
    const existingLike = await CommentLike.findOne({
      where: {
        user_id: req.user.id,
        comment_id: req.params.id,
      },
    });

    if (existingLike) {
      return res.status(400).json({ message: "已经点赞过了" });
    }

    // 创建点赞记录
    await CommentLike.create({
      user_id: req.user.id,
      comment_id: req.params.id,
    });

    // 更新点赞数
    const updatedComment = await comment.update({
      likes_count: comment.likes_count + 1,
    });

    // 发送通知给评论作者
    if (comment.user_id && comment.user_id !== req.user.id) {
      await NotificationService.createNotification(
        comment.user_id,
        req.user.id,
        "comment_like",
        comment.id,
        "comment",
        `${req.user.username} 点赞了你的评论`,
      );
    }

    res.json({ message: "点赞成功", likes_count: updatedComment.likes_count });
  } catch (error) {
    res.status(500).json({ message: "点赞失败", error: error.message });
  }
});

module.exports = router;