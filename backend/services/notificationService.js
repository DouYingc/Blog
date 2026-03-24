const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
  static async createNotification(user_id, sender_id, type, target_id, target_type, content) {
    try {
      const notification = await Notification.create({
        user_id,
        sender_id,
        type,
        target_id,
        target_type,
        content,
        is_read: false
      });
      return notification;
    } catch (error) {
      console.error('创建通知失败:', error);
      throw error;
    }
  }

  static async getNotificationsByUserId(user_id, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const notifications = await Notification.findAll({
        where: { user_id },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      const total = await Notification.count({ where: { user_id } });

      return { notifications, total };
    } catch (error) {
      console.error('获取通知失败:', error);
      throw error;
    }
  }

  static async markAsRead(notification_id) {
    try {
      const notification = await Notification.findByPk(notification_id);
      if (notification) {
        notification.is_read = true;
        await notification.save();
      }
      return notification;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  static async markAllAsRead(user_id) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id, is_read: false } }
      );
      return true;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      throw error;
    }
  }

  static async getUnreadCount(user_id) {
    try {
      const count = await Notification.count({
        where: { user_id, is_read: false }
      });
      return count;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;