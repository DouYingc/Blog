const { sequelize } = require('./config/db');

async function createFollowsTable() {
  try {
    // 检查表是否存在
    const [rows] = await sequelize.query("SHOW TABLES LIKE 'follows'");
    if (rows.length === 0) {
      console.log('关注表不存在，创建新表');
      await sequelize.query(`
        CREATE TABLE follows (
          id INT AUTO_INCREMENT PRIMARY KEY,
          follower_id INT NOT NULL,
          following_id INT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE KEY idx_follower_following (follower_id, following_id),
          INDEX idx_follower_id (follower_id),
          INDEX idx_following_id (following_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('关注表创建成功');
    } else {
      console.log('关注表已存在');
    }
  } catch (error) {
    console.error('创建关注表失败:', error);
  } finally {
    await sequelize.close();
  }
}

createFollowsTable();
