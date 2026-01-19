/**
 * 认证相关 API
 */

import api from './index';

/**
 * 用户注册
 * @param {Object} data - { username, password, email }
 */
export const register = (data) => {
  return api.post('/auth/register', data);
};

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export const login = (data) => {
  return api.post('/auth/login', data);
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return api.get('/auth/me');
};

/**
 * 用户登出
 */
export const logout = () => {
  return api.post('/auth/logout');
};
