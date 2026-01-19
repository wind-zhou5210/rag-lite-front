/**
 * 路由守卫组件
 * 用于保护需要登录才能访问的路由
 * 
 * 安全说明：
 * - 前端验证只是用户体验层，不是真正的安全屏障
 * - 真正的安全验证在后端 API 层（JWT 签名验证）
 * - 此组件会检查 token 过期时间，并定期向后端验证
 */

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import useAuthStore from '../store/useAuthStore';
import { getToken, isTokenExpired, needsRevalidation, markVerified, clearToken } from '../utils/token';

const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, loading, fetchCurrentUser, logout } = useAuthStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = getToken();
      
      // 1. 没有 token，清理状态并跳转登录
      if (!token) {
        logout();  // 清理 Store 状态，保持一致性
        setIsValid(false);
        setIsVerifying(false);
        return;
      }

      // 2. 检查 token 是否已过期（前端解析 JWT exp 字段）
      if (isTokenExpired()) {
        console.log('Token 已过期，清除登录状态');
        clearToken();
        logout();
        setIsValid(false);
        setIsVerifying(false);
        return;
      }

      // 3. 如果 store 中有用户信息，且不需要重新验证，直接通过
      if (isAuthenticated && !needsRevalidation()) {
        setIsValid(true);
        setIsVerifying(false);
        return;
      }

      // 4. 需要向后端验证 token 有效性
      try {
        const user = await fetchCurrentUser();
        if (user) {
          markVerified(); // 记录验证时间
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch {
        clearToken();
        logout();
        setIsValid(false);
      }
      setIsVerifying(false);
    };

    verifyToken();
  }, [isAuthenticated, fetchCurrentUser, logout]);

  // 正在验证
  if (isVerifying || loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="验证登录状态..." />
      </div>
    );
  }

  // 未登录或 token 无效
  if (!isValid) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default AuthGuard;
