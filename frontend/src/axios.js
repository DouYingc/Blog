/**
 * Axios 网络请求配置
 * 功能：统一处理网络请求的配置、拦截器和错误处理
 */
import axios from "axios";

/**
 * 创建axios实例
 * @property {string} baseURL - API基础地址
 * @property {number} timeout - 请求超时时间（毫秒）
 */
const service = axios.create({
  baseURL: "http://localhost:3000/api", // API基础地址
  timeout: 90000, // 请求超时时间（90秒）
});

/**
 * 请求拦截器
 * 功能：在请求发送前添加认证信息
 */
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem("token");
    // 如果token存在，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 功能：统一处理响应错误，特别是401认证错误
 */
service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("响应错误:", error);
    // 处理401错误（未认证或token过期）
    if (error.response && error.response.status === 401) {
      // 清除localStorage中的token和user信息
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // 跳转到登录页面
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// 导出axios实例
export default service;
