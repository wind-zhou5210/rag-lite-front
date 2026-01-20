/**
 * 知识库状态管理
 */

import { create } from 'zustand';
import * as kbApi from '../api/knowledgebase';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

const useKbStore = create((set, get) => ({
  // 状态
  knowledgebases: [],
  currentKb: null,
  documents: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  },
  // 文档分页状态
  docPagination: {
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  },

  // 获取知识库列表
  fetchKnowledgebases: async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.getKnowledgebases({ page, page_size: pageSize });
      const data = response.data || response;
      set({
        knowledgebases: data.items || [],
        pagination: {
          page: data.page || page,
          pageSize: data.page_size || pageSize,
          total: data.total || 0,
        },
        loading: false,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  // 获取单个知识库
  fetchKnowledgebase: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.getKnowledgebase(id);
      const kb = response.data || response;
      set({ currentKb: kb, loading: false });
      return kb;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  // 创建知识库
  createKnowledgebase: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.createKnowledgebase(data);
      const newKb = response.data || response;
      set((state) => ({
        knowledgebases: [newKb, ...state.knowledgebases],
        loading: false,
      }));
      return { success: true, data: newKb };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 删除知识库
  deleteKnowledgebase: async (id) => {
    set({ loading: true, error: null });
    try {
      await kbApi.deleteKnowledgebase(id);
      set((state) => ({
        knowledgebases: state.knowledgebases.filter((kb) => kb.id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 更新知识库
  updateKnowledgebase: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.updateKnowledgebase(id, data);
      const updatedKb = response.data || response;
      set((state) => ({
        knowledgebases: state.knowledgebases.map((kb) =>
          kb.id === id ? { ...kb, ...updatedKb } : kb
        ),
        currentKb: state.currentKb?.id === id ? { ...state.currentKb, ...updatedKb } : state.currentKb,
        loading: false,
      }));
      return { success: true, data: updatedKb };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 获取文档列表
  fetchDocuments: async (kbId, page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.getDocuments(kbId, { page, page_size: pageSize });
      const data = response.data || response;
      set({
        documents: data.items || [],
        docPagination: {
          page: data.page || page,
          pageSize: data.page_size || pageSize,
          total: data.total || 0,
        },
        loading: false,
      });
      return data;
    } catch (error) {
      set({ loading: false, error: error.message });
      return null;
    }
  },

  // 上传文档
  uploadDocument: async (kbId, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await kbApi.uploadDocument(kbId, formData);
      // 上传成功后刷新文档列表
      await get().fetchDocuments(kbId);
      set({ loading: false });
      return { success: true, data: response.data || response };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 删除文档
  deleteDocument: async (kbId, docId) => {
    set({ loading: true, error: null });
    try {
      await kbApi.deleteDocument(kbId, docId);
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== docId),
        docPagination: {
          ...state.docPagination,
          total: Math.max(0, state.docPagination.total - 1),
        },
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ loading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // 处理文档（预留，仅提示）
  // eslint-disable-next-line no-unused-vars
  processDocument: async (kbId, docId) => {
    // 预留功能，待后续实现
    return { success: false, message: '处理功能即将上线，敬请期待' };
  },

  // 重新处理文档（预留，仅提示）
  // eslint-disable-next-line no-unused-vars
  reprocessDocument: async (kbId, docId) => {
    // 预留功能，待后续实现
    return { success: false, message: '重新处理功能即将上线，敬请期待' };
  },

  // 设置当前知识库
  setCurrentKb: (kb) => set({ currentKb: kb }),

  // 清除错误
  clearError: () => set({ error: null }),
}));

export default useKbStore;
