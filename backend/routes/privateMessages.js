/**
 * 私信路由
 * 功能：处理私信相关的API请求，包括发送私信、获取对话列表、标记已读等
 */
const express = require("express");
const router = express.Router();
const PrivateMessage = require("../models/PrivateMessage"); // 私信模型
const User = require("../models/User"); // 用户模型
const { auth } = require("../middleware/auth"); // 认证中间件
const NotificationService = require("../services/notificationService"); // 通知服务

/**
 * 发送私信
 * @route POST /api/privateMessages/send
 * @description 向指定用户发送私信
 * @access 私有 (需要登录)
 * @param {number} receiver_id - 接收者ID
 * @param {string} content - 私信内容
 */
router.post("/send", auth, async (req, res) => {
  try {
    const { receiver_id, content } = req.body;

    // 不能给自己发私信
    if (req.user.id == receiver_id) {
      return res.status(400).json({ message: "不能给自己发私信" });
    }

    // 检查接收者是否存在
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: "接收者不存在" });
    }

    // 创建私信
    const message = await PrivateMessage.create({
      sender_id: req.user.id,
      receiver_id,
      content,
    });

    // 发送通知（异步处理）
    try {
      await NotificationService.createNotification(
        receiver_id,
        req.user.id,
        "message",
        message.id,
        "private_message",
        `${req.user.username} 给你发了一条私信`,
      );
    } catch (notificationError) {
      console.error("创建私信通知失败:", notificationError);
    }

    res.status(201).json({ message: "私信发送成功" });
  } catch (error) {
    res.status(500).json({ message: "私信发送失败", error: error.message });
  }
});

/**
 * 获取私信列表（与特定用户的对话）
 * @route GET /api/privateMessages/conversation/:userId
 * @description 获取与指定用户的私信列表
 * @access 私有 (需要登录)
 * @param {number} userId - 用户ID
 * @param {number} page - 页码，默认1
 * @param {number} limit - 每页数量，默认20
 */
router.get("/conversation/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 获取与该用户的所有私信
    const messages = await PrivateMessage.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { sender_id: req.user.id, receiver_id: userId },
          { sender_id: userId, receiver_id: req.user.id },
        ],
      },
      include: [
        { model: User, as: "Sender", attributes: ["id", "username", "avatar"] },
        {
          model: User,
          as: "Receiver",
          attributes: ["id", "username", "avatar"],
        },
      ],
      order: [["created_at", "ASC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // 将对方发送的消息标记为已读
    await PrivateMessage.update(
      { is_read: true },
      {
        where: {
          sender_id: userId,
          receiver_id: req.user.id,
          is_read: false,
        },
      },
    );

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: "获取私信失败", error: error.message });
  }
});

/**
 * 获取私信会话列表（所有有过私信的用户）
 * @route GET /api/privateMessages/conversations
 * @description 获取所有有过私信的用户列表
 * @access 私有 (需要登录)
 */
router.get("/conversations", auth, async (req, res) => {
  try {
    // 获取所有与当前用户有私信的用户ID
    const [senderIds, receiverIds] = await Promise.all([
      PrivateMessage.findAll({
        where: { receiver_id: req.user.id },
        attributes: ["sender_id"],
        group: ["sender_id"],
      }),
      PrivateMessage.findAll({
        where: { sender_id: req.user.id },
        attributes: ["receiver_id"],
        group: ["receiver_id"],
      }),
    ]);

    // 提取所有相关用户ID
    const userIds = new Set();
    senderIds.forEach((msg) => userIds.add(msg.sender_id));
    receiverIds.forEach((msg) => userIds.add(msg.receiver_id));

    // 获取用户信息并添加未读消息数量和最新消息预览
    const conversations = [];

    for (const userId of Array.from(userIds)) {
      const user = await User.findByPk(userId, {
        attributes: ["id", "username", "avatar"],
      });

      if (user) {
        // 获取该用户的未读消息数量
        const unreadCount = await PrivateMessage.count({
          where: {
            sender_id: userId,
            receiver_id: req.user.id,
            is_read: false,
          },
        });

        // 获取最新的一条消息
        const latestMessage = await PrivateMessage.findOne({
          where: {
            [require("sequelize").Op.or]: [
              { sender_id: userId, receiver_id: req.user.id },
              { sender_id: req.user.id, receiver_id: userId },
            ],
          },
          order: [["created_at", "DESC"]],
          attributes: ["content", "created_at", "sender_id"],
        });

        let lastMessage = "";
        if (latestMessage) {
          // 限制消息长度为10个字符
          lastMessage =
            latestMessage.content.length > 10
              ? latestMessage.content.substring(0, 15) + "..."
              : latestMessage.content;
        }

        conversations.push({
          ...user.toJSON(),
          unread_count: unreadCount,
          last_message: lastMessage,
        });
      }
    }

    res.json({ conversations });
  } catch (error) {
    res.status(500).json({ message: "获取会话列表失败", error: error.message });
  }
});

/**
 * 获取未读私信数量
 * @route GET /api/privateMessages/unread-count
 * @description 获取当前用户的未读私信数量
 * @access 私有 (需要登录)
 */
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await PrivateMessage.count({
      where: {
        receiver_id: req.user.id,
        is_read: false,
      },
    });

    res.json({ unreadCount: count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "获取未读私信数量失败", error: error.message });
  }
});

/**
 * 标记私信为已读
 * @route PATCH /api/privateMessages/mark-read/:messageId
 * @description 标记指定私信为已读
 * @access 私有 (需要登录)
 * @param {number} messageId - 私信ID
 */
router.patch("/mark-read/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await PrivateMessage.update(
      { is_read: true },
      {
        where: {
          id: messageId,
          receiver_id: req.user.id,
          is_read: false,
        },
      },
    );

    if (result[0] === 0) {
      return res.status(404).json({ message: "私信不存在或不是你的私信" });
    }

    res.json({ message: "标记已读成功" });
  } catch (error) {
    res.status(500).json({ message: "标记已读失败", error: error.message });
  }
});

/**
 * 批量标记某个用户的所有未读消息为已读
 * @route PATCH /api/privateMessages/mark-all-read/:userId
 * @description 标记指定用户的所有未读消息为已读
 * @access 私有 (需要登录)
 * @param {number} userId - 用户ID
 */
router.patch("/mark-all-read/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await PrivateMessage.update(
      { is_read: true },
      {
        where: {
          sender_id: userId,
          receiver_id: req.user.id,
          is_read: false,
        },
      },
    );

    res.json({ message: "标记已读成功", updatedCount: result[0] });
  } catch (error) {
    res.status(500).json({ message: "批量标记已读失败", error: error.message });
  }
});

module.exports = router;
