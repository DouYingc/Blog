-- 更新公告数据为中文
UPDATE announcements SET title='系统更新通知', content='我们的博客系统已经完成了全面更新，新增了AI助手功能和私信聊天功能，欢迎大家体验！' WHERE id=1;
UPDATE announcements SET title='假期安排', content='本系统将于2026年5月1日至5月7日进行维护，期间可能会出现短暂的服务中断，敬请谅解。' WHERE id=2;
UPDATE announcements SET title='使用指南', content='为了帮助大家更好地使用本博客系统，我们已经编写了详细的使用指南，可在"帮助中心"查看。' WHERE id=3;
UPDATE announcements SET title='安全提示', content='请大家注意保护好自己的账号密码，不要轻易泄露给他人，定期修改密码以保障账号安全。' WHERE id=4;
UPDATE announcements SET title='功能预告', content='我们正在开发新的功能模块，包括用户积分系统和文章推荐系统，敬请期待！' WHERE id=5;
