/**
 * 路由配置文件
 * 功能：定义系统所有路由和导航守卫
 */
import Vue from "vue";
import VueRouter from "vue-router";
// 导入视图组件
import Home from "../views/Home.vue"; // 首页
import Login from "../views/Login.vue"; // 登录页
import Register from "../views/Register.vue"; // 注册页
import UserCenter from "../views/UserCenter.vue"; // 用户中心
import UserProfile from "../views/UserProfile.vue"; // 用户个人资料
import MessageBoard from "../views/MessageBoard.vue"; // 留言板
import Admin from "../views/Admin.vue"; // 管理员后台主页面
import AdminDashboard from "../views/admin/AdminDashboard.vue"; // 管理员仪表盘
import ArticleDetail from "../views/ArticleDetail.vue"; // 文章详情页
import ArticleList from "../views/admin/ArticleList.vue"; // 文章管理列表
import ArticleEdit from "../views/admin/ArticleEdit.vue"; // 文章编辑/新建
import CategoryList from "../views/admin/CategoryList.vue"; // 分类管理
import TagList from "../views/admin/TagList.vue"; // 标签管理
import CommentList from "../views/admin/CommentList.vue"; // 评论管理
import MessageList from "../views/admin/MessageList.vue"; // 留言管理
import UserList from "../views/admin/UserList.vue"; // 用户管理
import AnnouncementList from "../views/admin/AnnouncementList.vue"; // 公告管理
import Archives from "../views/Archives.vue"; // 文章归档
import PrivateMessages from "../views/PrivateMessages.vue"; // 私信
import TagPage from "../views/TagPage.vue"; // 标签页面
import UserRank from "../views/UserRank.vue"; // 用户排行榜
import AIAssistant from "../views/AIAssistant.vue"; // AI助手

// 注册路由插件
Vue.use(VueRouter);

/**
 * 路由配置数组
 */
const routes = [
  // 公共路由
  {
    path: "/",
    name: "Home",
    component: Home, // 首页
  },
  {
    path: "/archives",
    name: "Archives",
    component: Archives, // 文章归档
  },
  {
    path: "/tags/:id",
    name: "TagPage",
    component: TagPage, // 标签页面
  },
  {
    path: "/users/rank",
    name: "UserRank",
    component: UserRank, // 用户排行榜
  },
  {
    path: "/ai-assistant",
    name: "AIAssistant",
    component: AIAssistant, // AI助手
  },

  // 需要认证的路由
  {
    path: "/article/new",
    name: "ArticleNew",
    component: ArticleEdit, // 新建文章
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/article/edit/:id",
    name: "ArticleEdit",
    component: ArticleEdit, // 编辑文章
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/article/:id",
    name: "ArticleDetail",
    component: ArticleDetail, // 文章详情
  },
  {
    path: "/messages",
    name: "MessageBoard",
    component: MessageBoard, // 留言板
  },
  {
    path: "/messages/private",
    name: "PrivateMessages",
    component: PrivateMessages, // 私信列表
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/messages/private/:userId",
    name: "PrivateMessagesWithUser",
    component: PrivateMessages, // 与特定用户的私信
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/login",
    name: "Login",
    component: Login, // 登录页
  },
  {
    path: "/register",
    name: "Register",
    component: Register, // 注册页
  },
  {
    path: "/user/center",
    name: "UserCenter",
    component: UserCenter, // 用户中心
    meta: { requiresAuth: true }, // 需要登录
  },
  {
    path: "/user/profile/:id",
    name: "UserProfile",
    component: UserProfile, // 用户个人资料
  },

  // 管理员路由
  {
    path: "/admin",
    component: Admin, // 管理员后台主页面
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: AdminDashboard, // 管理员仪表盘
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "articles",
        name: "AdminArticles",
        component: ArticleList, // 文章管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: CategoryList, // 分类管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "tags",
        name: "AdminTags",
        component: TagList, // 标签管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "comments",
        name: "AdminComments",
        component: CommentList, // 评论管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "messages",
        name: "AdminMessages",
        component: MessageList, // 留言管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "users",
        name: "AdminUsers",
        component: UserList, // 用户管理
        meta: { requiresAuth: true }, // 需要登录
      },
      {
        path: "announcements",
        name: "AdminAnnouncements",
        component: AnnouncementList, // 公告管理
        meta: { requiresAuth: true }, // 需要登录
      },
    ],
    meta: { requiresAuth: true }, // 需要登录
  },
];

/**
 * 创建路由实例
 */
const router = new VueRouter({
  mode: "history", // 使用history模式
  base: process.env.BASE_URL, // 基础路径
  routes, // 路由配置
});

/**
 * 导航守卫：认证检查
 */
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token"); // 获取token
  const user = JSON.parse(localStorage.getItem("user") || "{}"); // 获取用户信息

  // 检查是否需要认证
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    // 未登录，跳转到登录页
    if (!token) {
      next({ name: "Login" });
    } else {
      // 严格检查管理员后台权限
      const adminOnlyPaths = [
        "/admin",
        "/admin/categories",
        "/admin/tags",
        "/admin/comments",
        "/admin/articles",
        "/admin/users",
      ];
      // 非管理员访问管理员页面，跳转到用户中心
      if (adminOnlyPaths.includes(to.path) && user.role !== "admin") {
        Vue.prototype.$message.error("您不是管理员，无权进入后台管理页面");
        next({ name: "UserCenter" });
      } else {
        next(); // 允许访问
      }
    }
  } else {
    next(); // 无需认证，直接访问
  }
});

/**
 * 全局导航守卫：路由跳转时重置页面滚动位置
 */
router.afterEach(() => {
  window.scrollTo({ top: 0, behavior: "smooth" }); // 平滑滚动到顶部
});

// 导出路由实例
export default router;
