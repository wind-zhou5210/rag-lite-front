/**
 * 设置页面
 */

import { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Divider,
  InputNumber,
  Select,
} from 'antd';
import {
  SettingOutlined,
  KeyOutlined,
  RobotOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 从 localStorage 加载设置
  const loadSettings = () => {
    try {
      const settings = localStorage.getItem('rag_lite_settings');
      return settings ? JSON.parse(settings) : {};
    } catch {
      return {};
    }
  };

  // 保存设置
  const handleSave = async (values) => {
    setLoading(true);
    try {
      localStorage.setItem('rag_lite_settings', JSON.stringify(values));
      message.success('设置已保存');
    } catch {
      message.error('保存失败');
    }
    setLoading(false);
  };

  // 初始值
  const initialValues = {
    api_key: '',
    model: 'deepseek-chat',
    temperature: 0.7,
    max_tokens: 2048,
    top_k: 5,
    ...loadSettings(),
  };

  return (
    <div>
      <Title level={2}>
        <SettingOutlined /> 系统设置
      </Title>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={initialValues}
        style={{ maxWidth: 600 }}
      >
        {/* API 配置 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <KeyOutlined /> API 配置
          </Title>
          <Paragraph type="secondary">
            配置用于 RAG 问答的 AI 模型 API
          </Paragraph>
          <Divider />

          <Form.Item
            name="api_key"
            label="API Key"
            extra="请输入您的 DeepSeek API Key（将保存在本地浏览器中）"
          >
            <Input.Password placeholder="sk-xxxxxxxxxxxxxxxx" />
          </Form.Item>

          <Form.Item
            name="api_base_url"
            label="API Base URL"
            extra="如果使用自定义的 API 地址，请在此填写"
          >
            <Input placeholder="https://api.deepseek.com" />
          </Form.Item>
        </Card>

        {/* 模型配置 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <RobotOutlined /> 模型配置
          </Title>
          <Paragraph type="secondary">
            配置 AI 模型的参数
          </Paragraph>
          <Divider />

          <Form.Item
            name="model"
            label="模型选择"
          >
            <Select
              options={[
                { label: 'DeepSeek Chat', value: 'deepseek-chat' },
                { label: 'DeepSeek Coder', value: 'deepseek-coder' },
                { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
                { label: 'GPT-4', value: 'gpt-4' },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="temperature"
            label="Temperature"
            extra="控制输出的随机性，值越高输出越随机（0-2）"
          >
            <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="max_tokens"
            label="Max Tokens"
            extra="单次回复的最大 token 数量"
          >
            <InputNumber min={100} max={8192} step={100} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        {/* 检索配置 */}
        <Card style={{ marginBottom: 24 }}>
          <Title level={4}>
            <SettingOutlined /> 检索配置
          </Title>
          <Paragraph type="secondary">
            配置文档检索的参数
          </Paragraph>
          <Divider />

          <Form.Item
            name="top_k"
            label="Top K"
            extra="检索相关文档的数量"
          >
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="score_threshold"
            label="Score Threshold"
            extra="相似度阈值，低于此值的结果将被过滤（0-1）"
          >
            <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Card>

        {/* 保存按钮 */}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
            保存设置
          </Button>
          <Text type="secondary" style={{ marginLeft: 16 }}>
            设置保存在本地浏览器中
          </Text>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
