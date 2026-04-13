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
- 在 `backend` 目录下创建 `.env` 文件，配置数据库连接信息：
  ```env
  # 数据库配置
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=blog
  
  # JWT 配置
  JWT_SECRET=your_jwt_secret_key
  
  # AI API 配置
  DEEPSEEK_API_KEY=your_deepseek_api_key
  ```
- 启动后端服务时会自动创建数据库表结构

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

## API 文档

### 认证相关接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户个人资料

### 文章相关接口
- `GET /api/articles` - 获取文章列表（支持分页和筛选）
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章
- `GET /api/articles/:id/related` - 获取相关文章

### 用户相关接口
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `PUT /api/users/:id/role` - 更新用户角色
- `DELETE /api/users/:id` - 删除用户

### 评论相关接口
- `GET /api/comments` - 获取评论列表
- `POST /api/comments` - 创建评论
- `DELETE /api/comments/:id` - 删除评论

### AI 相关接口
- `POST /api/ai/chat` - AI 对话
- `POST /api/ai/generate-article` - 生成文章

### 私信相关接口
- `GET /api/privateMessages` - 获取私信列表
- `POST /api/privateMessages/send` - 发送私信
- `PUT /api/privateMessages/:id/read` - 标记私信为已读

### 通知相关接口
- `GET /api/notifications` - 获取通知列表
- `PUT /api/notifications/:id/read` - 标记通知为已读

## 部署指南

### 开发环境
- 按照上面的安装步骤启动项目
- 前端使用 `npm run serve` 启动开发服务器
- 后端使用 `npm start` 启动服务器

### 生产环境

1. **构建前端项目**
```bash
cd frontend
npm run build
```

2. **部署前端**
- 将 `frontend/dist` 目录下的文件部署到 Nginx 或 Apache 服务器

3. **部署后端**
- 使用 PM2 管理后端进程：
  ```bash
  cd backend
  npm install pm2 -g
  pm2 start index.js --name blog-backend
  pm2 save
  ```

4. **Nginx 配置示例**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 测试指南

### 前端测试
```bash
cd frontend
npm run test
```

### 后端测试
```bash
cd backend
npm run test
```

## 常见问题

### 1. 数据库连接失败
- 检查 `.env` 文件中的数据库配置
- 确保 MySQL 服务正在运行
- 确保数据库用户有正确的权限

### 2. AI 功能无法使用
- 检查 `DEEPSEEK_API_KEY` 是否配置正确
- 确保网络连接正常，能够访问 DeepSeek API

### 3. 401 授权错误
- 检查 token 是否过期
- 确保请求头中包含正确的 Authorization 头

### 4. 图片上传失败
- 确保 `backend/uploads` 目录存在且有写权限
- 检查文件大小是否超过限制

## 项目特点

1. **现代化技术栈**：使用 Vue.js 2.x + Node.js + Express + MySQL，构建高效、可维护的全栈应用

2. **完整的博客功能**：支持文章发布、编辑、删除、分类、标签等核心功能

3. **丰富的社交互动**：实现了评论、点赞、收藏、关注、私信等社交功能

4. **AI 智能助手**：集成 DeepSeek API，提供智能对话和文章生成功能

5. **响应式设计**：适配各种设备，提供良好的用户体验

6. **安全可靠**：使用 JWT 认证、密码加密、权限控制等安全措施

7. **易于部署**：提供详细的部署指南，支持开发环境和生产环境

8. **代码质量**：遵循代码规范，添加详细注释，确保代码可维护性

## 技术亮点

1. **流式 AI 响应**：实现了 AI 对话的流式输出，提供实时交互体验

2. **代码高亮与复制**：自动识别代码并添加语法高亮和复制按钮

3. **实时消息通知**：使用 WebSocket 实现实时消息推送

4. **智能推荐系统**：基于文章标签和用户行为推荐相关内容

5. **数据可视化**：在管理后台提供数据统计和可视化图表

6. **模块化设计**：前端组件化开发，后端模块化架构，提高代码复用性

7. **错误处理机制**：完善的错误处理和日志记录，提高系统稳定性

8. **性能优化**：图片懒加载、分页加载、缓存策略等性能优化措施

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