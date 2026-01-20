/**
 * 知识库相关 API
 */

import api from './index';

/**
 * 获取知识库列表
 * @param {Object} params - { page, page_size }
 */
export const getKnowledgebases = (params = {}) => {
  return api.get('/kb', { params });
};

/**
 * 获取单个知识库详情
 * @param {string} id - 知识库 ID
 */
export const getKnowledgebase = (id) => {
  return api.get(`/kb/${id}`);
};

/**
 * 创建知识库
 * @param {Object} data - { name, description, chunk_size, chunk_overlap }
 */
export const createKnowledgebase = (data) => {
  return api.post('/kb', data);
};

/**
 * 更新知识库
 * @param {string} id - 知识库 ID
 * @param {Object} data - 更新数据
 */
export const updateKnowledgebase = (id, data) => {
  return api.put(`/kb/${id}`, data);
};

/**
 * 删除知识库
 * @param {string} id - 知识库 ID
 */
export const deleteKnowledgebase = (id) => {
  return api.delete(`/kb/${id}`);
};

/**
 * 上传文档到知识库
 * @param {string} kbId - 知识库 ID
 * @param {FormData} formData - 包含文件的 FormData
 */
export const uploadDocument = (kbId, formData) => {
  return api.post(`/kb/${kbId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/**
 * 获取知识库的文档列表
 * @param {string} kbId - 知识库 ID
 * @param {Object} params - 分页参数
 */
export const getDocuments = (kbId, params = {}) => {
  return api.get(`/kb/${kbId}/documents`, { params });
};

/**
 * 删除文档
 * @param {string} kbId - 知识库 ID
 * @param {string} docId - 文档 ID
 */
export const deleteDocument = (kbId, docId) => {
  return api.delete(`/kb/${kbId}/documents/${docId}`);
};

/**
 * 获取文档详情
 * @param {string} kbId - 知识库 ID
 * @param {string} docId - 文档 ID
 */
export const getDocument = (kbId, docId) => {
  return api.get(`/kb/${kbId}/documents/${docId}`);
};

/**
 * 处理文档（预留接口）
 * @param {string} kbId - 知识库 ID
 * @param {string} docId - 文档 ID
 */
// eslint-disable-next-line no-unused-vars
export const processDocument = (kbId, docId) => {
  // 预留接口，后续实现具体处理逻辑
  return Promise.resolve({ success: true, message: '处理功能暂未实现' });
};

/**
 * 重新处理文档（预留接口）
 * @param {string} kbId - 知识库 ID
 * @param {string} docId - 文档 ID
 */
// eslint-disable-next-line no-unused-vars
export const reprocessDocument = (kbId, docId) => {
  // 预留接口，后续实现具体处理逻辑
  return Promise.resolve({ success: true, message: '重新处理功能暂未实现' });
};

/**
 * 获取文档分块列表（预留接口）
 * @param {string} kbId - 知识库 ID
 * @param {string} docId - 文档 ID
 * @param {Object} params - 分页参数
 */
// eslint-disable-next-line no-unused-vars
export const getDocumentChunks = (kbId, docId, params = {}) => {
  // 预留接口，后续实现分块查询功能
  return Promise.resolve({ 
    data: { 
      items: [], 
      page: 1, 
      page_size: 10, 
      total: 0 
    } 
  });
};
