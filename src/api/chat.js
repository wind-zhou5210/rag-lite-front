/**
 * 聊天相关 API
 */

import api from './index';
import { getToken } from '../utils/token';
import { API_BASE_URL } from '../utils/constants';

/**
 * 发送聊天消息
 * @param {Object} data - { kb_id, message, history }
 */
export const sendMessage = (data) => {
  return api.post('/chat', data);
};

/**
 * 发送流式聊天消息
 * @param {Object} data - { kb_id, message, history }
 * @param {Function} onMessage - 接收消息的回调
 * @param {Function} onError - 错误回调
 * @param {Function} onComplete - 完成回调
 */
export const sendStreamMessage = async (data, onMessage, onError, onComplete) => {
  try {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('请求失败');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onComplete?.();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            onMessage?.(parsed);
          } catch {
            // 非 JSON 数据，直接作为文本处理
            onMessage?.({ content: data });
          }
        }
      }
    }

    onComplete?.();
  } catch (error) {
    onError?.(error);
  }
};

/**
 * 获取聊天历史
 * @param {string} kbId - 知识库 ID
 */
export const getChatHistory = (kbId) => {
  return api.get(`/chat/history/${kbId}`);
};

/**
 * 清除聊天历史
 * @param {string} kbId - 知识库 ID
 */
export const clearChatHistory = (kbId) => {
  return api.delete(`/chat/history/${kbId}`);
};
