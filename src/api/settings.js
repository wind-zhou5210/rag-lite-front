/**
 * 设置相关 API
 */

import api from './index';

/**
 * 获取可用的模型列表
 * @returns {Promise} { embedding_models, llm_models }
 */
export const getAvailableModels = () => {
  return api.get('/settings/models');
};

/**
 * 获取当前设置
 * @returns {Promise} 设置对象
 */
export const getSettings = () => {
  return api.get('/settings');
};

/**
 * 更新设置
 * @param {Object} data - 设置数据
 * @returns {Promise} 更新后的设置对象
 */
export const updateSettings = (data) => {
  return api.put('/settings', data);
};
