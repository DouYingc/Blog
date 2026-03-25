# 个人技术博客系统

## 项目简介

这是一个基于 Vue.js 和 Node.js 开发的现代化个人技术博客系统，作为毕业设计项目。系统集成了完整的博客功能和AI智能助手，支持文章发布、用户社交互动、私信聊天、AI对话等功能。

## 技术栈

### 前端
- Vue.js 2.x
- Element UI
- Axios
- Vue Router
- highlight.js (代码高亮)
- MarkdownIt (Markdown渲染)

### 后端
- Node.js
- Express.js
- Sequelize ORM
- MySQL
- JWT 认证

## 功能特点

### 核心功能
- ✅ 用户认证系统（注册、登录、权限管理）
- ✅ 文章管理（发布、编辑、删除、分类、标签）
- ✅ 用户社交（评论、点赞、收藏、关注）
- ✅ 消息系统（私信聊天、通知提醒、留言板）
- ✅ 内容发现（搜索、标签页面、归档、排行榜）
- ✅ 用户中心（个人资料、头像上传、数据统计）

### AI智能功能
- 🤖 AI助手对话
  - 代码语法高亮显示
  - 代码块一键复制功能
  - 多用户独立对话历史
  - 流式输出与停止功能
- 🤖 文章生成功能
  - 基于主题自动生成文章
  - 支持多种文章类型

### 管理员功能
- 🔧 后台管理面板
- 🔧 文章审核与管理
- 🔧 用户管理
- 🔧 评论管理

### 用户体验优化
- 🎨 响应式设计，适配各种设备
- 🎨 实时消息通知与未读提示
- 🎨 自动滚动与加载优化
- 🎨 代码块美观展示

## 项目结构

```
Blog/
├── frontend/                   # 前端项目
│   ├── src/
│   │   ├── assets/            # 静态资源和样式
│   │   ├── components/        # Vue 组件
│   │   ├── views/             # 页面视图
│   │   │   ├── admin/         # 管理员页面
│   │   │   └── AIAssistant.vue # AI助手页面
│   │   ├── router/            # 路由配置
│   │   ├── store/             # Vuex状态管理
│   │   └── axios.js           # HTTP 请求配置
│   └── package.json
├── backend/                    # 后端项目
│   ├── config/                # 配置文件
│   ├── middleware/            # 中间件（认证等）
│   ├── models/                # 数据库模型
│   │   ├── User.js            # 用户模型
│   │   ├── Article.js         # 文章模型
│   │   ├── Comment.js         # 评论模型
│   │   ├── Message.js         # 消息模型
│   │   └── associations.js    # 模型关联
│   ├── routes/                # API路由
│   │   ├── ai.js              # AI相关接口
│   │   ├── articles.js        # 文章接口
│   │   ├── auth.js            # 认证接口
│   │   └── users.js           # 用户接口
│   ├── services/              # 业务服务
│   ├── uploads/               # 文件上传目录
│   └── index.js               # 应用入口
└── README.md
```

## 安装和运行

### 环境要求
- Node.js 16.x 或更高版本
- MySQL 5.7 或更高版本
- npm 6.x 或更高版本

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
- 修改 `backend/.env` 文件中的数据库连接信息
- 导入数据库表结构（执行 `schema.sql`）

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

## 功能演示

### 文章功能
- 支持 Markdown 格式编辑
- 代码语法高亮显示
- 文章分类和标签管理
- 相关文章推荐

### 用户互动
- 实时评论系统
- 点赞和收藏功能
- 用户关注系统
- 私信聊天功能

### AI助手
- 智能对话交互
- 代码自动高亮
- 代码一键复制
- 多用户独立对话

## 项目截图

### 首页
![首页截图](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20blog%20homepage%20with%20article%20list%20and%20navigation&image_size=landscape_16_9)

### 文章详情
![文章详情](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=blog%20article%20detail%20page%20with%20code%20highlighting%20and%20comments&image_size=landscape_16_9)

### AI助手
![AI助手](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20assistant%20chat%20interface%20with%20code%20blocks%20and%20copy%20buttons&image_size=landscape_16_9)

### 私信聊天
![私信聊天](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=private%20message%20chat%20interface%20with%20user%20avatars&image_size=landscape_16_9)

## 许可证

MIT License

## 作者

DouYingC - [GitHub](https://github.com/DouYingc/) - 1367358755@qq.com - xiayiji0720@outlook.com

---

*这是一个毕业设计项目，仅供学习参考。*