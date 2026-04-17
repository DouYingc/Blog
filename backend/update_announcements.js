const { sequelize } = require("./config/db");
const Announcement = require("./models/Announcement");

async function updateAnnouncements() {
  try {
    // 连接数据库
    await sequelize.authenticate();
    console.log("数据库连接成功");

    // 更新公告数据
    await Announcement.update(
      {
        title: "系统更新通知",
        content:
          "我们的博客系统已经完成了全面更新，新增了AI助手功能和私信聊天功能，欢迎大家体验！",
      },
      { where: { id: 1 } },
    );

    await Announcement.update(
      {
        title: "假期安排",
        content:
          "本系统将于2026年5月1日至5月7日进行维护，期间可能会出现短暂的服务中断，敬请谅解。",
      },
      { where: { id: 2 } },
    );

    await Announcement.update(
      {
        title: "使用指南",
        content:
          '为了帮助大家更好地使用本博客系统，我们已经编写了详细的使用指南，可在"帮助中心"查看。',
      },
      { where: { id: 3 } },
    );

    await Announcement.update(
      {
        title: "安全提示",
        content:
          "请大家注意保护好自己的账号密码，不要轻易泄露给他人，定期修改密码以保障账号安全。",
      },
      { where: { id: 4 } },
    );

    await Announcement.update(
      {
        title: "功能预告",
        content:
          "我们正在开发新的功能模块，包括用户积分系统和文章推荐系统，敬请期待！",
      },
      { where: { id: 5 } },
    );

    console.log("公告数据更新成功");
  } catch (error) {
    console.error("更新公告数据失败:", error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

updateAnnouncements();
