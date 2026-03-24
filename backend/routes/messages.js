const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const { adminAuth } = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const NotificationService = require("../services/notificationService");
require("dotenv").config();

// 获取留言列表（支持分页）
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Message.findAndCountAll({
      include: [{ model: User, attributes: ["id", "username", "avatar"] }],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({ rows, count });
  } catch (error) {
    res.status(500).json({ message: "获取留言失败", error: error.message });
  }
});

// 发表留言
router.post("/", async (req, res) => {
  const { nickname, content, avatar, parent_id } = req.body;

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
    const message = await Message.create({
      nickname,
      content,
      avatar,
      user_id,
      parent_id,
    });

    // 如果是回复其他留言，发送通知给被回复的用户
    if (parent_id) {
      const parentMessage = await Message.findByPk(parent_id);
      if (
        parentMessage &&
        parentMessage.user_id &&
        parentMessage.user_id !== user_id
      ) {
        await NotificationService.createNotification(
          parentMessage.user_id,
          user_id || null,
          "message_reply",
          message.id,
          "message",
          `${username} 回复了你的留言`,
        );
      }
    }

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "发表留言失败", error: error.message });
  }
});

// 删除留言 (仅管理员)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: "留言不存在" });
    await message.destroy();
    res.json({ message: "删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除失败", error: error.message });
  }
});

// 获取留言统计数据
router.get("/stats", async (req, res) => {
  try {
    const totalMessages = await Message.count();
    const activeUsers = await Message.count({
      distinct: true,
      col: "user_id",
    });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMessages = await Message.count({
      where: {
        created_at: {
          [require("sequelize").Op.gte]: today,
        },
      },
    });

    res.json({
      totalMessages,
      activeUsers,
      todayMessages,
    });
  } catch (error) {
    console.error("获取统计数据失败:", error);
    res.status(500).json({ message: "获取统计数据失败", error: error.message });
  }
});

module.exports = router;
