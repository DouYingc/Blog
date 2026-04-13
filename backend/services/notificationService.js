/**
 * 通知服务
 * 功能：处理通知相关的业务逻辑，包括创建通知、获取通知列表、标记通知为已读等
 */
const Notification = require('../models/Notification'); // 通知模型
const User = require('../models/User'); // 用户模型

class NotificationService {
  /**
   * 创建通知
   * @param {number} user_id - 接收通知的用户ID
   * @param {number} sender_id - 发送通知的用户ID
   * @param {string} type - 通知类型
   * @param {number} target_id - 目标ID（如文章ID、评论ID等）
   * @param {string} target_type - 目标类型（如article、comment等）
   * @param {string} content - 通知内容
   * @returns {Promise<object>} 创建的通知对象
   */
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

  /**
   * 获取用户的通知列表
   * @param {number} user_id - 用户ID
   * @param {number} page - 页码，默认1
   * @param {number} limit - 每页数量，默认20
   * @returns {Promise<object>} 包含通知列表和总数的对象
   */
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

  /**
   * 标记通知为已读
   * @param {number} notification_id - 通知ID
   * @returns {Promise<object>} 标记后的通知对象
   */
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

  /**
   * 标记用户的所有通知为已读
   * @param {number} user_id - 用户ID
   * @returns {Promise<boolean>} 操作是否成功
   */
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

  /**
   * 获取用户的未读通知数量
   * @param {number} user_id - 用户ID
   * @returns {Promise<number>} 未读通知数量
   */
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