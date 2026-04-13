/**
 * 通知路由
 * 功能：处理用户通知相关的API请求，包括获取通知列表、未读通知数量、标记通知为已读等
 */
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth"); // 认证中间件
const NotificationService = require("../services/notificationService"); // 通知服务

/**
 * 获取通知列表
 * @route GET /api/notifications
 * @description 获取当前登录用户的通知列表，支持分页
 * @access 私有 (需要登录)
 * @param {number} page - 页码，默认1
 * @param {number} limit - 每页数量，默认20
 */
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { notifications, total } = await NotificationService.getNotificationsByUserId(
      req.user.id,
      page,
      limit
    );
    res.json({ notifications, total });
  } catch (error) {
    res.status(500).json({ message: "获取通知失败", error: error.message });
  }
});

/**
 * 获取未读通知数量
 * @route GET /api/notifications/unread-count
 * @description 获取当前登录用户的未读通知数量
 * @access 私有 (需要登录)
 */
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "获取未读通知数量失败", error: error.message });
  }
});

/**
 * 标记通知为已读
 * @route PUT /api/notifications/:id/read
 * @description 标记指定通知为已读
 * @access 私有 (需要登录)
 * @param {number} id - 通知ID
 */
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await NotificationService.markAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: "通知不存在" });
    }
    res.json({ message: "标记已读成功" });
  } catch (error) {
    res.status(500).json({ message: "标记已读失败", error: error.message });
  }
});

/**
 * 标记所有通知为已读
 * @route PUT /api/notifications/read-all
 * @description 标记当前登录用户的所有通知为已读
 * @access 私有 (需要登录)
 */
router.put("/read-all", auth, async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ message: "标记所有通知已读成功" });
  } catch (error) {
    res.status(500).json({ message: "标记所有通知已读失败", error: error.message });
  }
});

module.exports = router;
