import axios from "axios";

// 创建axios实例
const service = axios.create({
  baseURL: "http://localhost:3000/api",
  timeout: 90000,
});

// 请求拦截器
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

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("响应错误:", error);
    return Promise.reject(error);
  },
);

export default service;
