/**
 * 常量定义
 */

// 应用名称
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'RAG Lite';

// API 基础地址
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 分页默认配置
export const DEFAULT_PAGE_SIZE = 10;

// 知识库默认配置
export const DEFAULT_CHUNK_SIZE = 512;
export const DEFAULT_CHUNK_OVERLAP = 50;

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  KB_LIST: '/kb',
  KB_DETAIL: '/kb/:id',
  CHAT: '/chat',
  SETTINGS: '/settings',
};
