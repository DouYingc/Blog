const { sequelize } = require('./config/db');

async function createPrivateMessagesTable() {
  try {
    // 检查表是否存在
    const [rows] = await sequelize.query("SHOW TABLES LIKE 'private_messages'");
    if (rows.length === 0) {
      console.log('私信表不存在，创建新表');
      await sequelize.query(`
        CREATE TABLE private_messages (
          id INT AUTO_INCREMENT PRIMARY KEY,
          sender_id INT NOT NULL,
          receiver_id INT NOT NULL,
          content TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_sender_id (sender_id),
          INDEX idx_receiver_id (receiver_id),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('私信表创建成功');
    } else {
      console.log('私信表已存在');
    }
  } catch (error) {
    console.error('创建私信表失败:', error);
  } finally {
    await sequelize.close();
  }
}

createPrivateMessagesTable();
