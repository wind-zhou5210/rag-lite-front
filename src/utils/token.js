/**
 * Token 管理工具
 */

const TOKEN_KEY = 'rag_lite_token';
const USER_KEY = 'rag_lite_user';
const LAST_VERIFY_KEY = 'rag_lite_last_verify';

// Token 验证间隔（5分钟）
const VERIFY_INTERVAL = 5 * 60 * 1000;

/**
 * 获取 Token
 * 返回有效的 token 字符串，如果为空或无效则返回 null
 */
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  // 检查无效值：null, undefined, "", "undefined", "null"
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
};

/**
 * 设置 Token
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  // 防止存入无效值
  if (!token || typeof token !== 'string') {
    console.warn('setToken: 无效的 token 值', token);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
  // 设置 token 时记录验证时间
  localStorage.setItem(LAST_VERIFY_KEY, Date.now().toString());
};

/**
 * 清除 Token
 */
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_VERIFY_KEY);
};

/**
 * 获取用户信息
 * 返回解析后的用户对象，如果数据无效或解析失败则返回 null
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    // 检查无效值：null, undefined, "", "undefined", "null"
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    const user = JSON.parse(userStr);
    // 确保解析结果是对象
    if (!user || typeof user !== 'object') {
      return null;
    }
    return user;
  } catch (error) {
    // JSON 解析失败，清除损坏的数据
    console.warn('getStoredUser: 解析用户信息失败', error);
    localStorage.removeItem(USER_KEY);
    return null;
  }
};

/**
 * 设置用户信息
 * @param {object} user - 用户对象
 */
export const setStoredUser = (user) => {
  // 防止存入无效值
  if (!user || typeof user !== 'object') {
    console.warn('setStoredUser: 无效的 user 值', user);
    return;
  }
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('setStoredUser: 序列化用户信息失败', error);
  }
};

/**
 * 检查是否已认证（仅检查 token 是否存在且有效）
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

/**
 * 解析 JWT Token 获取 payload
 * @param {string} token - JWT token
 * @returns {object|null} - 解析后的 payload 或 null
 */
export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * 检查 Token 是否已过期
 * @returns {boolean} - true 表示已过期或无效，false 表示有效
 */
export const isTokenExpired = () => {
  const token = getToken();
  if (!token) return true;

  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    // 无法解析或没有过期时间，认为需要重新验证
    return true;
  }

  // exp 是 Unix 时间戳（秒），转换为毫秒比较
  // 提前 60 秒认为过期，给刷新留出窗口
  const expiryTime = payload.exp * 1000;
  const bufferTime = 60 * 1000; // 60秒缓冲
  
  return Date.now() >= expiryTime - bufferTime;
};

/**
 * 检查是否需要重新验证 Token
 * 场景：
 * 1. Token 已过期
 * 2. 距离上次验证超过 5 分钟
 * @returns {boolean}
 */
export const needsRevalidation = () => {
  // 先检查 token 是否过期
  if (isTokenExpired()) {
    return true;
  }

  // 检查距离上次验证的时间
  const lastVerify = localStorage.getItem(LAST_VERIFY_KEY);
  if (!lastVerify) {
    return true;
  }

  const timeSinceLastVerify = Date.now() - parseInt(lastVerify, 10);
  return timeSinceLastVerify >= VERIFY_INTERVAL;
};

/**
 * 记录验证时间
 */
export const markVerified = () => {
  localStorage.setItem(LAST_VERIFY_KEY, Date.now().toString());
};
