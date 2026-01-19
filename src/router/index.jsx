/**
 * 路由配置
 */

import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/Layout/MainLayout';
import AuthGuard from '../components/AuthGuard';

// 页面组件（懒加载）
import Home from '../pages/Home';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import KbList from '../pages/Knowledgebase/List';
import KbDetail from '../pages/Knowledgebase/Detail';
import Chat from '../pages/Chat';
import Settings from '../pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'kb',
        element: (
          <AuthGuard>
            <KbList />
          </AuthGuard>
        ),
      },
      {
        path: 'kb/:id',
        element: (
          <AuthGuard>
            <KbDetail />
          </AuthGuard>
        ),
      },
      {
        path: 'chat',
        element: (
          <AuthGuard>
            <Chat />
          </AuthGuard>
        ),
      },
      {
        path: 'settings',
        element: (
          <AuthGuard>
            <Settings />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
