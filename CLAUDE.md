# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

RAG Lite 前端 - 一个基于 React + Ant Design 的 RAG（检索增强生成）应用前端，支持用户认证、知识库管理、智能问答功能。

## 常用命令

```bash
npm run dev      # 启动开发服务器 (localhost:5173)
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
npm run lint     # 运行 ESLint 检查
```

## 环境配置

复制 `.env.example` 为 `.env`，配置后端 API 地址：
```
VITE_API_BASE_URL=http://localhost:5000/api
```

## 架构概览

```
src/
├── api/           # API 层，index.js 是 Axios 实例（含拦截器）
├── components/    # 通用组件，Layout/ 为布局组件
├── pages/         # 页面组件（Auth、Knowledgebase、Chat、Settings）
├── store/         # Zustand 状态管理（useAuthStore、useKbStore）
├── hooks/         # 自定义 Hooks
├── utils/         # 工具函数（token.js JWT管理、authEvents.js 认证事件）
├── router/        # React Router 路由配置
└── constants.js   # 常量定义
```

### 认证流程

- JWT Token 存储在 localStorage，由 `utils/token.js` 管理
- `AuthGuard` 组件保护需要登录的路由
- Axios 拦截器自动添加 Authorization 头，统一处理 401 响应
- 前端解析 JWT exp 快速判断过期，定期调用后端 `/api/auth/me` 验证

### 路由保护

需要认证的路由使用 `AuthGuard` 包裹：
```jsx
<AuthGuard>
  <KbList />
</AuthGuard>
```

### 状态管理

使用 Zustand：
- `useAuthStore` - 用户认证状态
- `useKbStore` - 知识库状态

### API 调用

所有 API 调用通过 `src/api/` 下的模块，使用统一的 Axios 实例：
```javascript
import api from './index';
// api 已配置好 baseURL、拦截器
```

## 后端 API 要求

后端需实现 `/api/auth/*`、`/api/kb/*`、`/api/chat/*` 等接口，详见 AGENTS.md。

JWT payload 必须包含 `user_id`、`username`、`exp` 字段。
