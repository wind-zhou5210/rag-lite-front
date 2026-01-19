/**
 * 顶部导航栏组件
 */

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Space, message } from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserAddOutlined,
  BookOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../store/useAuthStore';
import { clearToken } from '../../utils/token';
import { APP_NAME } from '../../utils/constants';

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  // 获取当前激活的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/kb')) return 'kb';
    if (path === '/chat') return 'chat';
    if (path === '/settings') return 'settings';
    if (path === '/login') return 'login';
    if (path === '/register') return 'register';
    return '';
  };

  // 处理登出
  const handleLogout = () => {
    clearToken();
    logout();
    message.success('已成功退出');
    navigate('/');
  };

  // 左侧导航菜单项
  const leftMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">首页</Link>,
    },
    ...(isAuthenticated
      ? [
          {
            key: 'kb',
            icon: <DatabaseOutlined />,
            label: <Link to="/kb">知识库</Link>,
          },
          {
            key: 'chat',
            icon: <MessageOutlined />,
            label: <Link to="/chat">聊天</Link>,
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: <Link to="/settings">设置</Link>,
          },
        ]
      : []),
  ];

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: '#001529',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginRight: 24,
          color: '#fff',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        <BookOutlined style={{ fontSize: 24, marginRight: 8 }} />
        {APP_NAME}
      </Link>

      {/* 左侧导航菜单 */}
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
        items={leftMenuItems}
        style={{ flex: 1, minWidth: 0 }}
      />

      {/* 右侧用户菜单 */}
      <div style={{ marginLeft: 'auto' }}>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer', color: '#fff' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user?.username || '用户'}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space size="middle">
            <Link to="/login" style={{ color: '#fff' }}>
              <LoginOutlined /> 登录
            </Link>
            <Link to="/register" style={{ color: '#fff' }}>
              <UserAddOutlined /> 注册
            </Link>
          </Space>
        )}
      </div>
    </AntHeader>
  );
};

export default Header;
