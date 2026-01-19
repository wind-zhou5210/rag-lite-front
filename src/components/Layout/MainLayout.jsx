/**
 * 主布局组件
 */

import { Outlet } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Header from './Header';

const { Content, Footer } = Layout;

const MainLayout = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout style={{ minHeight: '100vh' }}>
        <Header />
        <Content style={{ padding: '24px', background: '#f5f5f5' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center', background: '#fff' }}>
          RAG Lite ©{new Date().getFullYear()} - 基于 LangChain 和 DeepSeek API 构建
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default MainLayout;
