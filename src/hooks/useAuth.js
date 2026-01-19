/**
 * 认证相关 Hook
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { isAuthenticated as checkAuth } from '../utils/token';

/**
 * 认证 Hook
 * 用于检查用户登录状态和自动跳转
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading, login, logout, register, fetchCurrentUser } = useAuthStore();

  // 组件挂载时检查登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (checkAuth() && !user) {
        await fetchCurrentUser();
      }
    };
    checkAuthStatus();
  }, []);

  // 登录成功后跳转
  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    if (result.success) {
      // 获取重定向目标
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
    return result;
  };

  // 注册成功后跳转到登录页
  const handleRegister = async (username, password, email) => {
    const result = await register(username, password, email);
    if (result.success) {
      navigate('/login');
    }
    return result;
  };

  // 登出后跳转到首页
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return {
    user,
    isAuthenticated,
    loading,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  };
};

export default useAuth;
