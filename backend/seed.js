const { sequelize } = require('./config/db')
const User = require('./models/User')
const Article = require('./models/Article')
const Category = require('./models/Category')
const Tag = require('./models/Tag')
const Comment = require('./models/Comment')
const Message = require('./models/Message')
const bcrypt = require('bcryptjs')

const categories = [
  { name: '前端开发', description: 'HTML, CSS, JavaScript, Vue, React 等前端技术' },
  { name: '后端开发', description: 'Node.js, Java, Python, Go 等后端架构' },
  { name: '人工智能', description: '机器学习, 深度学习, LLM, AIGC' },
  { name: '数据库', description: 'MySQL, MongoDB, Redis, 数据库优化' },
  { name: 'DevOps', description: 'Docker, K8s, CI/CD, 自动化部署' },
  { name: '生活随笔', description: '记录生活点滴，分享感悟' }
]

const tags = ['Vue', 'React', 'Node.js', 'Express', 'Sequelize', 'MySQL', 'Web开发', '算法', '面试', '架构']

const users = [
  { username: 'tech_guru', email: 'guru@example.com', role: 'visitor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guru' },
  { username: 'code_master', email: 'master@example.com', role: 'visitor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=master' },
  { username: 'ai_enthusiast', email: 'ai@example.com', role: 'visitor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai' },
  { username: 'traveler', email: 'travel@example.com', role: 'visitor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=travel' }
]

const articleTemplates = [
  {
    title: 'Vue 3.0 核心源码解析：响应式系统',
    summary: '深入探讨 Vue 3.0 的响应式系统实现原理，包括 Proxy 的使用和依赖收集机制。',
    content: `# Vue 3.0 核心源码解析：响应式系统

Vue 3.0 使用 Proxy 替代了 Object.defineProperty 来实现响应式系统，这带来了性能上的提升和对数组、Map 等数据结构的更好支持。

## Proxy vs Object.defineProperty

Object.defineProperty 只能劫持对象的属性，因此需要遍历对象的每个属性。而 Proxy 可以直接劫持整个对象。

\`\`\`javascript
const handler = {
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
}
\`\`\`

## 依赖收集

依赖收集的核心在于 track 函数...
`,
    category: '前端开发',
    tags: ['Vue', 'Web开发', '源码']
  },
  {
    title: 'Node.js 高性能服务最佳实践',
    summary: '如何构建高并发、低延迟的 Node.js 服务？本文分享了一些生产环境的最佳实践。',
    content: `# Node.js 高性能服务最佳实践

Node.js 以其事件驱动、非阻塞 I/O 模型而闻名，非常适合构建高并发的网络应用。

## 1. 使用集群模式 (Cluster)

利用多核 CPU...

## 2. 异步编程与 Promise

避免回调地狱...

## 3. 内存泄漏排查

使用 heapdump 和 chrome devtools...
`,
    category: '后端开发',
    tags: ['Node.js', 'Express', '架构']
  },
  {
    title: '2025 年人工智能发展趋势预测',
    summary: 'AI 正在改变世界。本文预测了 2025 年 AI 领域的几个关键发展方向。',
    content: `# 2025 年人工智能发展趋势预测

## 多模态大模型

未来的模型将不仅仅理解文本，还能同时处理图像、音频和视频...

## AI Agent 的普及

AI 将不仅仅是助手，而是能够独立完成任务的 Agent...

## 具身智能

机器人将更加智能化...
`,
    category: '人工智能',
    tags: ['算法', 'Web开发'] // 稍微混搭一下
  },
  {
    title: 'MySQL 索引优化实战',
    summary: '数据库查询慢？可能是索引没用对。本文通过几个真实案例讲解 MySQL 索引优化技巧。',
    content: `# MySQL 索引优化实战

## Explain 命令详解

使用 Explain 可以分析 SQL 语句的执行计划...

## 最左前缀原则

联合索引需要遵循最左前缀原则...

## 覆盖索引

尽量使用覆盖索引减少回表...
`,
    category: '数据库',
    tags: ['MySQL', '面试']
  },
  {
    title: 'Docker 容器化部署入门教程',
    summary: '从零开始学习 Docker，掌握容器化部署的基本概念和操作。',
    content: `# Docker 容器化部署入门教程

## 什么是 Docker？

Docker 是一个开源的应用容器引擎...

## Dockerfile 编写

\`\`\`dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
\`\`\`

## Docker Compose

使用 docker-compose 管理多容器应用...
`,
    category: 'DevOps',
    tags: ['Web开发', '架构']
  },
  {
    title: '记一次难忘的云南之旅',
    summary: '大理的风，丽江的夜，还有玉龙雪山的雪。',
    content: `# 记一次难忘的云南之旅

## 大理

苍山洱海...

## 丽江

古城夜景...

## 美食

过桥米线...
`,
    category: '生活随笔',
    tags: []
  }
]

const generateRandomData = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected...')

    // Define associations manually for seed script if not defined in index.js
    Article.belongsToMany(Tag, { through: 'article_tags', foreignKey: 'article_id', timestamps: false })
    Tag.belongsToMany(Article, { through: 'article_tags', foreignKey: 'tag_id', timestamps: false })

    // Sync models (optional, but good to ensure tables exist)
    await sequelize.sync({ alter: true })

    // 1. Create Categories
    const createdCategories = []
    for (const cat of categories) {
      const [category] = await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      })
      createdCategories.push(category)
    }
    console.log(`Synced ${createdCategories.length} categories.`)

    // 2. Create Tags
    const createdTags = []
    for (const tagName of tags) {
      const [tag] = await Tag.findOrCreate({
        where: { name: tagName }
      })
      createdTags.push(tag)
    }
    console.log(`Synced ${createdTags.length} tags.`)

    // 3. Create Users
    const password = await bcrypt.hash('123456', 10)
    const createdUsers = []

    // Ensure admin exists
    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@blog.com',
        password: password,
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
      }
    })
    createdUsers.push(admin)

    for (const u of users) {
      const [user] = await User.findOrCreate({
        where: { username: u.username },
        defaults: { ...u, password }
      })
      createdUsers.push(user)
    }
    console.log(`Synced ${createdUsers.length} users.`)

    // 4. Create Articles
    // Generate 15 more random articles based on templates
    const totalArticles = 15
    for (let i = 0; i < totalArticles; i++) {
      const template = articleTemplates[Math.floor(Math.random() * articleTemplates.length)]
      const author = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const category = createdCategories.find(c => c.name === template.category) || createdCategories[0]

      const article = await Article.create({
        title: `${template.title} - ${Math.floor(Math.random() * 1000)}`, // Unique title
        content: template.content,
        html_content: require('markdown-it')().render(template.content),
        summary: template.summary,
        category_id: category.id,
        user_id: author.id,
        views: Math.floor(Math.random() * 10000),
        status: 'published',
        is_top: Math.random() > 0.9, // 10% chance to be top
        created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random time in past
      })

      // Add random tags
      const randomTags = createdTags.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1)
      await article.setTags(randomTags)

      console.log(`Created article: ${article.title}`)
    }

    // 5. Create Messages (Message Board)
    const messages = [
      "博主的文章写得真好！",
      "学到了很多，感谢分享。",
      "期待更多关于 Vue 的教程。",
      "网站做得不错，界面很清爽。",
      "能不能加个友链？"
    ]

    for (let i = 0; i < 10; i++) {
      const user = createdUsers[Math.floor(Math.random() * createdUsers.length)]
      const content = messages[Math.floor(Math.random() * messages.length)]
      await Message.create({
        nickname: user.username,
        content: content,
        avatar: user.avatar,
        user_id: user.id,
        created_at: new Date(Date.now() - Math.floor(Math.random() * 1000000000))
      })
    }
    console.log('Created random messages.')

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

generateRandomData()
