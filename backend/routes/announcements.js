const express = require("express");
const router = express.Router();
const Announcement = require("../models/Announcement");
const { auth } = require("../middleware/auth");

// 获取公告列表
router.get("/", async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { is_active: true },
      order: [["created_at", "DESC"]]
    });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: "获取公告失败", error: error.message });
  }
});

// 管理后台：获取所有公告（包括非活跃）
router.get("/admin", auth, async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      order: [["created_at", "DESC"]]
    });
    res.json({ announcements });
  } catch (error) {
    res.status(500).json({ message: "获取公告失败", error: error.message });
  }
});

// 创建公告
router.post("/", auth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await Announcement.create({
      title,
      content
    });
    res.status(201).json({ message: "公告创建成功", announcement });
  } catch (error) {
    res.status(500).json({ message: "创建公告失败", error: error.message });
  }
});

// 更新公告
router.put("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, is_active } = req.body;
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: "公告不存在" });
    }
    await announcement.update({
      title,
      content,
      is_active
    });
    res.json({ message: "公告更新成功", announcement });
  } catch (error) {
    res.status(500).json({ message: "更新公告失败", error: error.message });
  }
});

// 删除公告
router.delete("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const announcement = await Announcement.findByPk(id);
    if (!announcement) {
      return res.status(404).json({ message: "公告不存在" });
    }
    await announcement.destroy();
    res.json({ message: "公告删除成功" });
  } catch (error) {
    res.status(500).json({ message: "删除公告失败", error: error.message });
  }
});

module.exports = router;