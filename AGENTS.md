# RAG Lite Frontend - 技术架构文档

## 项目概述

RAG Lite 前端是一个基于 React + Ant Design + JWT 的前后端分离应用，实现用户认证、知识库管理、智能问答等核心功能。

### 技术栈

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | React 18 + Vite | 现代化构建工具 |
| UI 组件库 | Ant Design 5.x | 企业级 UI 组件库 |
| 路由 | React Router v6 | 声明式路由管理 |
| 状态管理 | Zustand | 轻量级状态管理 |
| HTTP 客户端 | Axios | 请求拦截、响应处理 |
| 认证方案 | JWT Token | 前后端分离认证 |

### 项目结构

```
rag_lite_frontend/
├── src/
│   ├── api/                   # API 接口层
│   │   ├── index.js           # Axios 实例配置（含拦截器）
│   │   ├── auth.js            # 认证相关 API
│   │   ├── knowledgebase.js   # 知识库相关 API
│   │   └── chat.js            # 聊天相关 API
│   ├── components/            # 通用组件
│   │   ├── Layout/            # 布局组件
│   │   ├── AuthGuard.jsx      # 路由守卫组件
│   │   └── Loading.jsx        # 加载组件
│   ├── pages/                 # 页面组件
│   ├── store/                 # Zustand 状态管理
│   ├── hooks/                 # 自定义 Hooks
│   ├── utils/                 # 工具函数
│   │   ├── token.js           # Token 管理（含 JWT 解析）
│   │   ├── authEvents.js      # 认证事件管理器
│   │   └── constants.js       # 常量定义
│   └── router/                # 路由配置
└── .env                       # 环境变量
```

---

## 登录验证架构设计

### 核心原则

> **永远不要信任前端**。所有敏感操作的安全验证必须在后端完成。前端验证只是为了更好的用户体验。

### 验证职责分工

| 校验位置 | 职责 | 安全级别 |
|---------|------|---------|
| **后端（必须）** | JWT 签名验证、过期检查、黑名单、用户状态 | 真正的安全屏障 |
| **前端（可选）** | 解析 exp 快速判断、避免无效请求 | 用户体验优化 |

### AuthGuard 验证流程

```
访问受保护页面
       │
       ▼
┌──────────────────────────────────────┐
│ 1. 检查 localStorage 是否有 token    │
└──────────────────────────────────────┘
       │
   ┌───┴───┐
   │       │
  无       有
   │       │
   ▼       ▼
 跳转   ┌──────────────────────────────┐
 登录   │ 2. 前端解析 JWT 检查 exp 过期  │
       │    (无需请求后端，快速判断)     │
       └──────────────────────────────┘
              │
         ┌────┴────┐
         │         │
       过期      未过期
         │         │
         ▼         ▼
     清除token  ┌────────────────────────────┐
     跳转登录   │ 3. 检查是否需要向后端验证    │
               │   - store 无用户信息？       │
               │   - 上次验证超过 5 分钟？     │
               └────────────────────────────┘
                      │
                 ┌────┴────┐
                 │         │
               需要      不需要
                 │         │
                 ▼         ▼
          调用 /api/auth/me   直接放行
                 │
            ┌────┴────┐
            │         │
          成功       失败
            │         │
            ▼         ▼
       记录验证时间   清除token
         放行       跳转登录
```

### 三层防护机制

| 层级 | 检查内容 | 耗时 |
|------|----------|------|
| **第1层** | localStorage 有无 token | 0ms |
| **第2层** | JWT exp 过期时间（前端解析） | 0ms |
| **第3层** | 调用后端 `/api/auth/me` 验证 | ~100ms |

---

## JWT Token 过期校验

### 前端 Token 管理 (`utils/token.js`)

```javascript
// 核心功能
getToken()           // 获取 Token
setToken(token)      // 设置 Token（同时记录验证时间）
clearToken()         // 清除 Token 和用户信息
isTokenExpired()     // 解析 JWT exp 字段检查是否过期
needsRevalidation()  // 检查是否需要向后端重新验证
markVerified()       // 记录验证时间
parseJwt(token)      // 解析 JWT payload
```

### JWT 解析说明

```javascript
// JWT 结构：header.payload.signature
// 前端只能解析 payload（base64），无法验证签名

export const parseJwt = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64)...);
  return JSON.parse(jsonPayload);
};

// payload 示例
{
  "user_id": "abc123",
  "username": "test",
  "exp": 1705312800,  // 过期时间戳（秒）
  "iat": 1705226400   // 签发时间戳（秒）
}
```

### 过期检查逻辑

```javascript
export const isTokenExpired = () => {
  const payload = parseJwt(getToken());
  if (!payload?.exp) return true;
  
  // 提前 60 秒认为过期，给刷新留出窗口
  const expiryTime = payload.exp * 1000;
  const bufferTime = 60 * 1000;
  
  return Date.now() >= expiryTime - bufferTime;
};
```

---

## Axios 拦截器设计 (`api/index.js`)

### 请求生命周期

```
发起请求
   │
   ▼
[请求拦截器]
├─ 检查本地 token 是否存在
├─ 可选：解析 exp 快速判断是否过期
└─ 添加 Authorization 头
   │
   ▼
发送到后端
   │
   ▼
[响应拦截器]
├─ 200: 正常返回
├─ 401: 触发 handleAuthExpired()
│       ├─ 防护标志防止并发重复跳转
│       ├─ 通知订阅者（表单保存草稿等）
│       └─ 延迟跳转登录页
└─ 其他: 返回错误
```

### 并发 401 防护

```javascript
let isRedirecting = false;

const handleAuthExpired = () => {
  if (isRedirecting) return;  // 防止重复跳转
  isRedirecting = true;
  
  clearToken();
  
  // 保存当前路径用于登录后跳回
  const currentPath = window.location.pathname;
  const returnUrl = `?redirect=${encodeURIComponent(currentPath)}`;
  
  setTimeout(() => {
    window.location.href = `/login${returnUrl}`;
  }, 100);
};
```

---

## 认证事件管理器 (`utils/authEvents.js`)

用于在登录过期时通知各组件优雅处理：

### 使用场景

| 场景 | 处理方式 |
|------|---------|
| **表单填写中** | 监听事件 → 自动保存草稿 → 跳转 |
| **聊天流式响应** | 监听事件 → abort 请求 → 保存对话 → 跳转 |
| **并发 401** | 防护标志保证只跳转一次 |

### 使用示例

```javascript
import { subscribe, AUTH_EVENTS } from '../utils/authEvents';

useEffect(() => {
  const unsubscribe = subscribe(AUTH_EVENTS.SESSION_EXPIRED, () => {
    // 停止流式响应
    abortController?.abort();
    // 保存聊天记录
    saveChatDraft();
  });

  return () => unsubscribe();
}, []);
```

---

## 安全性分析

### 手动修改 localStorage 能否绕过验证？

```
攻击者修改 localStorage 中的 token
        │
        ▼
┌─────────────────────────────────────┐
│ 场景1: 修改 exp 延长过期时间         │
│        前端被骗 ✓                   │
│        后端验证签名失败 ✗ → 401      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 场景2: 伪造整个 token               │
│        前端被骗 ✓                   │
│        后端验证签名失败 ✗ → 401      │
└─────────────────────────────────────┘

结论：攻击者只能看到空壳页面，无法获取真实数据
```

### 当前方案优缺点

| 优点 | 缺点/风险 |
|------|----------|
| ✓ 前端解析 exp 快速判断 | ✗ exp 可被篡改（但后端会验证） |
| ✓ 定期向后端验证 | ✗ 验证间隔内 token 可能已被拉黑 |
| ✓ 401 统一处理 | ✗ 流式请求需要特殊处理 |
| ✓ 防并发重复跳转 | |

---

## 后端 API 接口要求

前端已预置以下 API 调用，后端需实现对应接口：

| 方法 | 路径 | 说明 | 响应格式 |
|------|------|------|---------|
| POST | `/api/auth/register` | 用户注册 | `{ code, message, data }` |
| POST | `/api/auth/login` | 登录 | `{ token, user }` |
| GET | `/api/auth/me` | 获取当前用户 | `{ id, username, email }` |
| GET | `/api/kb` | 知识库列表 | `{ items, total, page, page_size }` |
| POST | `/api/kb` | 创建知识库 | `{ id, name, ... }` |
| DELETE | `/api/kb/:id` | 删除知识库 | `{ code, message }` |
| POST | `/api/kb/:id/documents` | 上传文档 | multipart/form-data |
| POST | `/api/chat/stream` | 流式聊天 | SSE 流式响应 |

### JWT Token 要求

后端签发的 JWT payload 必须包含：

```json
{
  "user_id": "string",
  "username": "string",
  "exp": 1705312800,    // 过期时间戳（秒），必须
  "iat": 1705226400     // 签发时间戳（秒），可选
}
```

---

## 生产环境检查清单

| 级别 | 措施 | 状态 |
|------|------|------|
| **必须** | 后端验证 JWT 签名 | 需后端实现 |
| **必须** | 后端检查 exp 过期 | 需后端实现 |
| **推荐** | Token 黑名单机制（Redis） | 需后端实现 |
| **推荐** | Refresh Token 自动续期 | 未实现 |
| **可选** | 前端解析 exp 快速判断 | ✅ 已实现 |
| **可选** | 前端定期验证 | ✅ 已实现 |
| **可选** | 并发 401 防护 | ✅ 已实现 |
| **可选** | 认证事件通知机制 | ✅ 已实现 |

---

## 启动命令

```bash
# 开发环境
cd /Users/wind-zhou/Desktop/rag-project/rag_lite_frontend
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

项目默认运行在 `http://localhost:5173`，API 默认指向 `http://localhost:5000/api`（可在 `.env` 中修改）。
