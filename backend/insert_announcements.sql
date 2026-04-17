-- 插入公告数据
INSERT INTO announcements (title, content, is_active, created_at, updated_at) VALUES
('System Update', 'Our blog system has been fully updated with new AI assistant and private messaging features. Welcome to experience!', 1, NOW(), NOW()),
('Holiday Schedule', 'The system will be maintained from May 1 to May 7, 2026. There may be brief service interruptions during this period. Thank you for your understanding.', 1, NOW(), NOW()),
('User Guide', 'To help you better use this blog system, we have prepared a detailed user guide, which can be viewed in the "Help Center".', 1, NOW(), NOW()),
('Security Tips', 'Please protect your account password, do not easily share it with others, and regularly change your password to ensure account security.', 1, NOW(), NOW()),
('Feature Preview', 'We are developing new feature modules, including user points system and article recommendation system. Stay tuned!', 1, NOW(), NOW());
