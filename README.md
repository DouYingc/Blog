# 个人技术博客系统

## 项目简介

这是一个基于 Vue.js 和 Node.js 开发的个人技术博客系统，作为毕业设计项目。系统包含完整的博客功能，支持文章发布、用户互动、私信聊天等功能。

## 技术栈

### 前端
- Vue.js 2.x
- Element UI
- Axios
- Vue Router

### 后端
- Node.js
- Express.js
- Sequelize ORM
- MySQL

## 功能特点

### 核心功能
- ✅ 用户认证系统（注册、登录、退出）
- ✅ 文章管理（发布、编辑、删除文章）
- ✅ 留言板功能（发表评论）
- ✅ 私信聊天系统
- ✅ 用户中心（个人信息、头像上传）
- ✅ 搜索功能
- ✅ 归档功能

### 特色功能
- 🎯 私信聊天系统
  - 实时消息显示
  - 未读消息提示
  - 消息时间格式化（今天/历史消息）
  - 头像位置区分（自己/对方）
- 🎯 用户体验优化
  - 响应式设计
  - 导航栏未读消息提醒
  - 消息自动滚动到底部

## 项目结构

```
Blog/
├── frontend/           # 前端项目
│   ├── src/
│   │   ├── components/  # Vue 组件
│   │   ├── views/       # 页面视图
│   │   ├── router/      # 路由配置
│   │   └── axios.js     # HTTP 请求配置
│   └── package.json
├── backend/            # 后端项目
│   ├── routes/         # API 路由
│   ├── models/         # 数据库模型
│   └── app.js          # 应用入口
└── README.md
```

## 安装和运行

### 环境要求
- Node.js 14.x 或更高版本
- MySQL 5.7 或更高版本

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/your-username/blog.git
cd blog
```

2. **安装依赖**
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

3. **配置数据库**
- 创建 MySQL 数据库
- 修改后端配置文件中的数据库连接信息

4. **启动项目**
```bash
# 启动前端开发服务器
cd frontend
npm run serve

# 启动后端服务器
cd ../backend
npm start
```

5. **访问地址**
- 前端：http://localhost:8080
- 后端 API：http://localhost:3000

## 项目截图

### 首页
![首页截图](https://github.com/your-username/blog/assets/12345678/screenshot-home.png)

### 文章详情
![文章详情](https://github.com/your-username/blog/assets/12345678/screenshot-article.png)

### 私信聊天
![私信聊天](https://github.com/your-username/blog/assets/12345678/screenshot-private-chat.png)

## 许可证

MIT License

## 作者

你的名字 - [GitHub](https://github.com/your-username) - your.email@example.com

---

*这是一个毕业设计项目，仅供学习参考。*