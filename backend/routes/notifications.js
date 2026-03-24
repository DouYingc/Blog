const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const NotificationService = require("../services/notificationService");

// 获取通知列表
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

// 获取未读通知数量
router.get("/unread-count", auth, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "获取未读通知数量失败", error: error.message });
  }
});

// 标记通知为已读
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

// 标记所有通知为已读
router.put("/read-all", auth, async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ message: "标记所有通知已读成功" });
  } catch (error) {
    res.status(500).json({ message: "标记所有通知已读失败", error: error.message });
  }
});

module.exports = router;
