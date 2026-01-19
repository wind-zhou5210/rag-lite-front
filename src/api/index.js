/**
 * Axios 实例配置
 * 
 * 安全设计：
 * 1. 请求拦截器：自动添加 JWT Token
 * 2. 响应拦截器：统一处理 401，防止并发 401 重复跳转
 */

import axios from 'axios';
import { getToken, clearToken, isTokenExpired } from '../utils/token';
import { API_BASE_URL } from '../utils/constants';

// 创建 Axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 用于防止多个 401 响应同时触发多次跳转
let isRedirecting = false;

/**
 * 处理登录过期，跳转到登录页
 * 使用防护标志防止并发 401 重复跳转
 */
const handleAuthExpired = () => {
  if (isRedirecting) return;
  isRedirecting = true;

  // 清除 token
  clearToken();

  // 保存当前路径，登录后可以跳回
  const currentPath = window.location.pathname;
  const returnUrl = currentPath !== '/login' ? `?redirect=${encodeURIComponent(currentPath)}` : '';

  // 延迟跳转，给用户一个缓冲
  setTimeout(() => {
    window.location.href = `/login${returnUrl}`;
    // 重置标志（实际上跳转后页面会刷新，这行不会执行）
    isRedirecting = false;
  }, 100);
};

// 请求拦截器：自动添加 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    // 可选：请求前快速检查 token 是否过期
    // 这只是优化，避免发送必定失败的请求
    if (token && isTokenExpired()) {
      // Token 已过期，不发送请求，直接跳转登录
      handleAuthExpired();
      return Promise.reject(new Error('Token 已过期'));
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一处理响应和错误
api.interceptors.response.use(
  (response) => {
    // 返回响应数据
    return response.data;
  },
  (error) => {
    const requestUrl = error.config?.url || '';
    
    // 判断是否是认证相关接口（登录/注册）
    const isAuthEndpoint = requestUrl.includes('/auth/login') || 
                           requestUrl.includes('/auth/register');
    
    // 处理 401 未授权
    if (error.response?.status === 401) {
      // 登录/注册接口的 401 不跳转，只返回错误信息
      if (isAuthEndpoint) {
        const message = error.response?.data?.message || '用户名或密码错误';
        return Promise.reject(new Error(message));
      }
      
      // 其他接口的 401 表示 Token 过期，跳转登录页
      handleAuthExpired();
      return Promise.reject(new Error('登录已过期，请重新登录'));
    }

    // 处理 403 禁止访问
    if (error.response?.status === 403) {
      return Promise.reject(new Error('没有权限访问该资源'));
    }

    // 提取错误信息
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export default api;
