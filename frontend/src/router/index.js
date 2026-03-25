import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import UserCenter from "../views/UserCenter.vue";
import UserProfile from "../views/UserProfile.vue";
import MessageBoard from "../views/MessageBoard.vue";
import Admin from "../views/Admin.vue";
import AdminDashboard from "../views/admin/AdminDashboard.vue";
import ArticleDetail from "../views/ArticleDetail.vue";
import ArticleList from "../views/admin/ArticleList.vue";
import ArticleEdit from "../views/admin/ArticleEdit.vue";
import CategoryList from "../views/admin/CategoryList.vue";
import TagList from "../views/admin/TagList.vue";
import CommentList from "../views/admin/CommentList.vue";
import MessageList from "../views/admin/MessageList.vue";
import Archives from "../views/Archives.vue";
import PrivateMessages from "../views/PrivateMessages.vue";
import TagPage from "../views/TagPage.vue";
import UserRank from "../views/UserRank.vue";
import AIAssistant from "../views/AIAssistant.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/archives",
    name: "Archives",
    component: Archives,
  },
  {
    path: "/tags/:id",
    name: "TagPage",
    component: TagPage,
  },
  {
    path: "/users/rank",
    name: "UserRank",
    component: UserRank,
  },
  {
    path: "/ai-assistant",
    name: "AIAssistant",
    component: AIAssistant,
  },

  {
    path: "/article/new",
    name: "ArticleNew",
    component: ArticleEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/article/edit/:id",
    name: "ArticleEdit",
    component: ArticleEdit,
    meta: { requiresAuth: true },
  },
  {
    path: "/article/:id",
    name: "ArticleDetail",
    component: ArticleDetail,
  },
  {
    path: "/messages",
    name: "MessageBoard",
    component: MessageBoard,
  },
  {
    path: "/messages/private",
    name: "PrivateMessages",
    component: PrivateMessages,
    meta: { requiresAuth: true },
  },
  {
    path: "/messages/private/:userId",
    name: "PrivateMessagesWithUser",
    component: PrivateMessages,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/user/center",
    name: "UserCenter",
    component: UserCenter,
    meta: { requiresAuth: true },
  },
  {
    path: "/user/profile/:id",
    name: "UserProfile",
    component: UserProfile,
  },
  {
    path: "/admin",
    component: Admin,
    children: [
      {
        path: "",
        name: "AdminDashboard",
        component: AdminDashboard,
        meta: { requiresAuth: true },
      },
      {
        path: "articles",
        name: "AdminArticles",
        component: ArticleList,
        meta: { requiresAuth: true },
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: CategoryList,
        meta: { requiresAuth: true },
      },
      {
        path: "tags",
        name: "AdminTags",
        component: TagList,
        meta: { requiresAuth: true },
      },
      {
        path: "comments",
        name: "AdminComments",
        component: CommentList,
        meta: { requiresAuth: true },
      },
      {
        path: "messages",
        name: "AdminMessages",
        component: MessageList,
        meta: { requiresAuth: true },
      },
    ],
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

// Auth guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({ name: "Login" });
    } else {
      // 严格检查管理员后台权限：只有 Dashboard/分类/标签/全站文章列表 需要管理员
      const adminOnlyPaths = [
        "/admin",
        "/admin/categories",
        "/admin/tags",
        "/admin/comments",
        "/admin/articles",
      ];
      if (adminOnlyPaths.includes(to.path) && user.role !== "admin") {
        Vue.prototype.$message.error("您不是管理员，无权进入后台管理页面");
        next({ name: "UserCenter" });
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

// 全局导航守卫：路由跳转时重置页面滚动位置
router.afterEach(() => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

export default router;
