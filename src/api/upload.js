/**
 * 文件上传相关 API
 */

import api from './index';

/**
 * 上传图片
 * @param {File} file - 图片文件
 * @param {string} bizType - 业务类型（如 'covers'）
 * @param {function} onProgress - 上传进度回调（可选）
 * @returns {Promise<{object_key: string, url: string}>}
 */
export const uploadImage = (file, bizType = 'covers', onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('biz_type', bizType);
  
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };
  
  // 如果提供了进度回调，添加上传进度监听
  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(percent);
    };
  }
  
  return api.post('/upload/image', formData, config);
};

/**
 * 获取文件访问 URL
 * @param {string} objectKey - 文件标识
 * @param {number} expires - URL 有效期（秒，可选）
 * @returns {Promise<{url: string}>}
 */
export const getFileUrl = (objectKey, expires = 3600) => {
  return api.get('/upload/url', {
    params: {
      object_key: objectKey,
      expires,
    },
  });
};
