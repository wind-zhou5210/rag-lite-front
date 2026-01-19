/**
 * 用户认证状态管理
 */

import { create } from 'zustand';
import { getStoredUser, setStoredUser, clearToken, setToken, getToken } from '../utils/token';
import * as authApi from '../api/auth';

// 初始化时检查 token 和 user 是否都存在，保持状态一致性
const getInitialAuthState = () => {
  const token = getToken();
  const user = getStoredUser();
  
  // 只有当 token 和 user 都存在时才认为已认证
  if (token && user) {
    return { user, isAuthenticated: true };
  }
  
  // 否则清理残留数据
  if (!token && user) {
    // token 不存在但 user 存在，清理 user
    clearToken();
  }
  
  return { user: null, isAuthenticated: false };
};

const initialState = getInitialAuthState();

const useAuthStore = create((set) => ({
  // 状态
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  loading: false,
  error: null,

  // 设置用户
  setUser: (user) => {
    setStoredUser(user);
    set({ user, isAuthenticated: !!user, error: null });
  },

  // 登录
  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authApi.login({ username, password });
      const user = response.data ;
      const token = response.token;
      
      // 保存 token 和用户信息
      setToken(token);
      setStoredUser(user);
      
      set({ user, isAuthenticated: true, loading: false });
      return { success: true, user };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 注册
  register: async (username, password, email) => {
    set({ loading: true, error: null });
    try {
      await authApi.register({ username, password, email });
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 登出
  logout: () => {
    clearToken();
    set({ user: null, isAuthenticated: false, error: null });
  },

  // 获取当前用户信息
  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const response = await authApi.getCurrentUser();
      const user = response.data ;
      setStoredUser(user);
      set({ user, isAuthenticated: true, loading: false });
      return user;
    } catch {
      // 获取用户信息失败，清除登录状态
      clearToken();
      set({ user: null, isAuthenticated: false, loading: false });
      return null;
    }
  },

  // 清除错误
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
