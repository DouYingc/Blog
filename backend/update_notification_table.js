const { sequelize } = require('./config/db');

async function updateNotificationTable() {
  try {
    // 检查表是否存在
    const [rows] = await sequelize.query("SHOW TABLES LIKE 'notifications'");
    if (rows.length === 0) {
      console.log('通知表不存在，创建新表');
      await sequelize.query(`
        CREATE TABLE notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          sender_id INT NOT NULL,
          type ENUM('like', 'favorite', 'comment_reply', 'comment_like', 'message_reply') NOT NULL,
          target_id INT NOT NULL,
          target_type ENUM('article', 'comment', 'message') NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_user_id (user_id),
          INDEX idx_is_read (is_read),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('通知表创建成功');
    } else {
      // 检查表结构，添加缺失的字段
      console.log('通知表已存在，检查并更新表结构');
      
      // 检查 target_id 字段是否存在
      const [columns] = await sequelize.query("SHOW COLUMNS FROM notifications");
      const columnNames = columns.map(col => col.Field);
      
      if (!columnNames.includes('target_id')) {
        await sequelize.query("ALTER TABLE notifications ADD COLUMN target_id INT NOT NULL");
        console.log('添加 target_id 字段成功');
      }
      
      if (!columnNames.includes('target_type')) {
        await sequelize.query("ALTER TABLE notifications ADD COLUMN target_type ENUM('article', 'comment', 'message') NOT NULL");
        console.log('添加 target_type 字段成功');
      }
      
      console.log('通知表结构更新完成');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('更新通知表失败:', error);
    process.exit(1);
  }
}

updateNotificationTable();