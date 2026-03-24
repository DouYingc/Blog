const express = require("express");
const router = express.Router();
const Follow = require("../models/Follow");
const User = require("../models/User");
const { auth } = require("../middleware/auth");

// 关注用户
router.post("/follow/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 不能关注自己
    if (req.user.id == userId) {
      return res.status(400).json({ message: "不能关注自己" });
    }
    
    // 检查用户是否存在
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "用户不存在" });
    }
    
    // 检查是否已经关注
    const existingFollow = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: userId
      }
    });
    
    if (existingFollow) {
      return res.status(400).json({ message: "已经关注过该用户" });
    }
    
    // 创建关注记录
    await Follow.create({
      follower_id: req.user.id,
      following_id: userId
    });
    
    res.json({ message: "关注成功" });
  } catch (error) {
    res.status(500).json({ message: "关注失败", error: error.message });
  }
});

// 取消关注
router.delete("/unfollow/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 检查用户是否存在
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "用户不存在" });
    }
    
    // 删除关注记录
    const result = await Follow.destroy({
      where: {
        follower_id: req.user.id,
        following_id: userId
      }
    });
    
    if (result === 0) {
      return res.status(400).json({ message: "未关注该用户" });
    }
    
    res.json({ message: "取消关注成功" });
  } catch (error) {
    res.status(500).json({ message: "取消关注失败", error: error.message });
  }
});

// 获取用户的关注列表
router.get("/following/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    
    const { count, rows } = await Follow.findAndCountAll({
      where: { follower_id: userId },
      include: [{
        model: User,
        as: 'Following',
        attributes: ['id', 'username', 'avatar']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      following: rows.map(f => f.Following),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: "获取关注列表失败", error: error.message });
  }
});

// 获取用户的粉丝列表
router.get("/followers/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // 检查用户是否存在
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    
    const { count, rows } = await Follow.findAndCountAll({
      where: { following_id: userId },
      include: [{
        model: User,
        as: 'Follower',
        attributes: ['id', 'username', 'avatar']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      followers: rows.map(f => f.Follower),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: "获取粉丝列表失败", error: error.message });
  }
});

// 检查是否关注
router.get("/check/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const isFollowing = await Follow.findOne({
      where: {
        follower_id: req.user.id,
        following_id: userId
      }
    });
    
    res.json({ isFollowing: !!isFollowing });
  } catch (error) {
    res.status(500).json({ message: "检查关注状态失败", error: error.message });
  }
});

module.exports = router;