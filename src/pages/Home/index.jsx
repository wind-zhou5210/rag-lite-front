/**
 * 首页组件
 */

import { Link } from 'react-router-dom';
import { Card, Row, Col, Button, Alert, Typography, Steps } from 'antd';
import {
  BookOutlined,
  FileTextOutlined,
  SearchOutlined,
  RobotOutlined,
  DatabaseOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import useAuthStore from '../../store/useAuthStore';
import { APP_NAME } from '../../utils/constants';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  // 功能特性数据
  const features = [
    {
      icon: <FileTextOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: '文档管理',
      description: '支持 PDF、DOCX、TXT、MD 等多种格式文档上传和管理',
    },
    {
      icon: <SearchOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: '智能检索',
      description: '基于向量相似度的智能文档检索，快速找到相关内容',
    },
    {
      icon: <RobotOutlined style={{ fontSize: 48, color: '#1890ff' }} />,
      title: '智能问答',
      description: '基于文档内容的智能问答，支持流式输出和 Markdown 渲染',
    },
  ];

  // 快速开始步骤
  const quickStartSteps = [
    {
      title: '创建知识库',
      description: '在知识库管理页面创建新的知识库，设置分块参数和检索参数',
    },
    {
      title: '上传文档',
      description: '在知识库详情页面上传文档，系统会自动解析、分块和向量化',
    },
    {
      title: '开始问答',
      description: '在聊天页面选择知识库，输入问题即可获得基于文档内容的智能回答',
    },
  ];

  return (
    <div>
      {/* 未登录提示 */}
      {!isAuthenticated && (
        <Alert
          message="提示"
          description={
            <span>
              访问知识库管理和聊天功能需要先{' '}
              <Link to="/login">登录</Link> 或 <Link to="/register">注册</Link>。
            </span>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* 项目介绍 */}
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <div style={{ padding: '40px 0' }}>
          <BookOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 16 }} />
          <Title level={1} style={{ marginBottom: 16 }}>
            {APP_NAME}
          </Title>
          <Paragraph style={{ fontSize: 18, color: '#666', marginBottom: 8 }}>
            RAG（检索增强生成）系统
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 16 }}>
            基于 LangChain 和 DeepSeek API 构建的轻量级知识库问答系统
          </Text>
          
          <div style={{ marginTop: 32 }}>
            <Link to="/kb">
              <Button type="primary" size="large" icon={<DatabaseOutlined />} style={{ marginRight: 16 }}>
                知识库管理
              </Button>
            </Link>
            <Link to="/chat">
              <Button size="large" icon={<MessageOutlined />}>
                开始聊天
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 功能特性 */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {features.map((feature, index) => (
          <Col xs={24} md={8} key={index}>
            <Card hoverable style={{ height: '100%', textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}>{feature.icon}</div>
              <Title level={4}>{feature.title}</Title>
              <Text type="secondary">{feature.description}</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 快速开始 */}
      <Card
        title={
          <span>
            <RobotOutlined /> 快速开始
          </span>
        }
      >
        <Steps
          direction="vertical"
          items={quickStartSteps.map((step) => ({
            title: <Text strong>{step.title}</Text>,
            description: <Text type="secondary">{step.description}</Text>,
            status: 'process',
          }))}
        />
      </Card>
    </div>
  );
};

export default Home;
