/**
 * 应用主入口文件
 * 功能：初始化Vue应用，导入必要的插件和配置
 */
import Vue from 'vue'; // 导入Vue核心库
import App from './App.vue'; // 导入根组件
import router from './router'; // 导入路由配置
import store from './store'; // 导入状态管理
import ElementUI from 'element-ui'; // 导入Element UI组件库
import 'element-ui/lib/theme-chalk/index.css'; // 导入Element UI样式
import mavonEditor from 'mavon-editor'; // 导入Markdown编辑器
import 'mavon-editor/dist/css/index.css'; // 导入Markdown编辑器样式

// 关闭生产环境提示
Vue.config.productionTip = false;

// 注册Element UI组件库
Vue.use(ElementUI);

// 注册Markdown编辑器组件
Vue.use(mavonEditor);

/**
 * 创建Vue应用实例
 * @property {object} router - 路由配置
 * @property {object} store - 状态管理
 * @property {function} render - 渲染函数
 */
new Vue({
  router, // 注入路由
  store, // 注入状态管理
  render: h => h(App) // 渲染根组件
}).$mount('#app'); // 挂载到DOM元素
