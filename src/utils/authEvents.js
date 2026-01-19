/**
 * 认证事件管理器
 * 
 * 用于在登录过期时通知各个组件，实现优雅的状态处理
 * 
 * 使用场景：
 * 1. 表单组件：保存草稿后再跳转
 * 2. 聊天组件：停止流式响应
 * 3. 其他组件：清理状态
 */

// 事件类型
export const AUTH_EVENTS = {
  SESSION_EXPIRED: 'auth:session_expired',
  LOGOUT: 'auth:logout',
};

// 订阅者列表
const subscribers = new Map();

/**
 * 订阅认证事件
 * @param {string} event - 事件类型
 * @param {Function} callback - 回调函数
 * @returns {Function} - 取消订阅函数
 */
export const subscribe = (event, callback) => {
  if (!subscribers.has(event)) {
    subscribers.set(event, new Set());
  }
  subscribers.get(event).add(callback);

  // 返回取消订阅函数
  return () => {
    subscribers.get(event)?.delete(callback);
  };
};

/**
 * 发布认证事件
 * @param {string} event - 事件类型
 * @param {any} data - 事件数据
 */
export const publish = (event, data = {}) => {
  const callbacks = subscribers.get(event);
  if (callbacks) {
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Auth event callback error:', error);
      }
    });
  }
};

/**
 * 创建会话过期处理器
 * 返回一个可以被多个 401 响应安全调用的函数
 */
export const createSessionExpiredHandler = () => {
  let isHandling = false;
  let pendingRedirect = null;

  return {
    /**
     * 处理会话过期
     * @param {Object} options - 选项
     * @param {boolean} options.immediate - 是否立即跳转
     * @param {string} options.returnUrl - 登录后返回的 URL
     */
    handle: (options = {}) => {
      if (isHandling) return;
      isHandling = true;

      const { immediate = false, returnUrl } = options;
      
      // 通知所有订阅者
      publish(AUTH_EVENTS.SESSION_EXPIRED, { returnUrl });

      // 如果不是立即跳转，给组件一点时间处理
      const delay = immediate ? 0 : 500;
      
      if (pendingRedirect) {
        clearTimeout(pendingRedirect);
      }

      pendingRedirect = setTimeout(() => {
        const currentPath = returnUrl || window.location.pathname;
        const redirectParam = currentPath !== '/login' 
          ? `?redirect=${encodeURIComponent(currentPath)}` 
          : '';
        window.location.href = `/login${redirectParam}`;
      }, delay);
    },

    /**
     * 取消跳转（比如用户选择继续停留）
     */
    cancel: () => {
      if (pendingRedirect) {
        clearTimeout(pendingRedirect);
        pendingRedirect = null;
      }
      isHandling = false;
    },

    /**
     * 重置状态
     */
    reset: () => {
      isHandling = false;
      pendingRedirect = null;
    },
  };
};

// 导出单例处理器
export const sessionExpiredHandler = createSessionExpiredHandler();
