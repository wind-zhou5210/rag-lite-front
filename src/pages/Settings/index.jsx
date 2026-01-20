/**
 * 设置页面
 * 
 * 包含四个标签页：
 * 1. 向量嵌入模型 (Embedding)
 * 2. 大语言模型 (LLM)
 * 3. 提示词设置
 * 4. 检索设置
 */

import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Typography,
  Tabs,
  InputNumber,
  Select,
  Spin,
  Alert,
} from 'antd';
import {
  SettingOutlined,
  RobotOutlined,
  MessageOutlined,
  SearchOutlined,
  SaveOutlined,
  ReloadOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { getAvailableModels, getSettings, updateSettings } from '../../api/settings';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [availableModels, setAvailableModels] = useState(null);
  
  // 当前选中的 provider（用于动态显示/隐藏字段）
  const [embeddingProvider, setEmbeddingProvider] = useState('huggingface');
  const [llmProvider, setLlmProvider] = useState('deepseek');
  const [retrievalMode, setRetrievalMode] = useState('vector');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 并行加载模型列表和设置
        const [modelsRes, settingsRes] = await Promise.all([
          getAvailableModels(),
          getSettings()
        ]);

        if (modelsRes.code === 200) {
          setAvailableModels(modelsRes.data);
        }

        if (settingsRes.code === 200) {
          const settings = settingsRes.data;
          form.setFieldsValue(settings);
          // 更新动态状态
          setEmbeddingProvider(settings.embedding_provider || 'huggingface');
          setLlmProvider(settings.llm_provider || 'deepseek');
          setRetrievalMode(settings.retrieval_mode || 'vector');
        }
      } catch (error) {
        message.error('加载设置失败: ' + error.message);
      }
      setLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 保存设置
  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await updateSettings(values);
      if (res.code === 200) {
        message.success('保存设置成功');
      } else {
        message.error(res.message || '保存失败');
      }
    } catch (error) {
      message.error('保存设置失败: ' + error.message);
    }
    setSaving(false);
  };

  // 重置为默认设置（与后端默认值保持一致）
  const handleReset = () => {
    const defaultSettings = {
      embedding_provider: 'huggingface',
      embedding_model_name: 'sentence-transformers/all-MiniLM-L6-v2',
      embedding_api_key: '',
      embedding_base_url: '',
      llm_provider: 'deepseek',
      llm_model_name: 'deepseek-chat',
      llm_api_key: '',
      llm_base_url: 'https://api.deepseek.com',
      llm_temperature: 0.7,
      chat_system_prompt: '你是一个专业的AI助手。请友好、准确地回答用户的问题。',
      rag_system_prompt: '你是一个专业的AI助手。请基于文档内容回答问题。',
      rag_query_prompt: '文档内容：\n{context}\n\n问题：{question}\n\n请基于文档内容回答问题。如果文档中没有相关信息，请明确说明。',
      retrieval_mode: 'vector',
      vector_threshold: 0.2,
      keyword_threshold: 0.2,
      vector_weight: 0.5,
      top_k: 5,
    };
    form.setFieldsValue(defaultSettings);
    setEmbeddingProvider('huggingface');
    setLlmProvider('deepseek');
    setRetrievalMode('vector');
    message.info('已重置为默认设置，请点击保存以应用更改');
  };

  // 获取 Embedding 提供商选项（从后端动态获取）
  const getEmbeddingProviderOptions = () => {
    if (!availableModels?.embedding_models) return [];
    return Object.entries(availableModels.embedding_models).map(([key, value]) => ({
      label: value.name,
      value: key,
    }));
  };

  // 获取 LLM 提供商选项（从后端动态获取）
  const getLlmProviderOptions = () => {
    if (!availableModels?.llm_models) return [];
    return Object.entries(availableModels.llm_models).map(([key, value]) => ({
      label: value.name,
      value: key,
    }));
  };

  // 获取 Embedding 模型选项
  const getEmbeddingModelOptions = () => {
    if (!availableModels?.embedding_models?.[embeddingProvider]) return [];
    const providerInfo = availableModels.embedding_models[embeddingProvider];
    return providerInfo.models.map(model => ({
      label: `${model.name}${model.dimension ? ` (维度: ${model.dimension})` : ''}`,
      value: model.path || model.name,
    }));
  };

  // 获取 LLM 模型选项
  const getLlmModelOptions = () => {
    if (!availableModels?.llm_models?.[llmProvider]) return [];
    const providerInfo = availableModels.llm_models[llmProvider];
    return providerInfo.models.map(model => ({
      label: model.name,
      value: model.name,
    }));
  };

  // 判断 Embedding provider 是否需要 API Key
  const embeddingRequiresApiKey = () => {
    return availableModels?.embedding_models?.[embeddingProvider]?.requires_api_key || false;
  };

  // 判断 Embedding provider 是否需要 Base URL
  const embeddingRequiresBaseUrl = () => {
    return availableModels?.embedding_models?.[embeddingProvider]?.requires_base_url || false;
  };

  // 判断 LLM provider 是否需要 API Key
  const llmRequiresApiKey = () => {
    return availableModels?.llm_models?.[llmProvider]?.requires_api_key || false;
  };

  // 判断 LLM provider 是否需要 Base URL
  const llmRequiresBaseUrl = () => {
    return availableModels?.llm_models?.[llmProvider]?.requires_base_url || false;
  };

  // Embedding provider 变更时更新状态
  const handleEmbeddingProviderChange = (value) => {
    setEmbeddingProvider(value);
    // 清空模型名称
    form.setFieldValue('embedding_model_name', '');
  };

  // LLM provider 变更时更新状态
  const handleLlmProviderChange = (value) => {
    setLlmProvider(value);
    // 清空模型名称
    form.setFieldValue('llm_model_name', '');
  };

  // Tab 1: 向量嵌入模型
  const EmbeddingTab = (
    <Card>
      <Title level={5}><ApiOutlined /> 向量嵌入模型（Embedding）</Title>
      <Paragraph type="secondary">配置文档向量化使用的嵌入模型</Paragraph>

      <Form.Item
        name="embedding_provider"
        label="提供商"
        rules={[{ required: true, message: '请选择提供商' }]}
      >
        <Select
          options={getEmbeddingProviderOptions()}
          placeholder="请选择提供商"
          onChange={handleEmbeddingProviderChange}
        />
      </Form.Item>

      <Form.Item
        name="embedding_model_name"
        label="模型名称"
        extra="选择或输入模型名称/路径"
        rules={[{ required: true, message: '请选择向量嵌入模型' }]}
      >
        <Select
          options={getEmbeddingModelOptions()}
          placeholder="请选择模型"
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="embedding_api_key"
        label="API Key"
        extra="某些提供商需要 API Key"
        hidden={!embeddingRequiresApiKey()}
      >
        <Input.Password placeholder="输入 API Key" />
      </Form.Item>

      <Form.Item
        name="embedding_base_url"
        label="Base URL"
        extra="API Base URL（Ollama 需要）"
        hidden={!embeddingRequiresBaseUrl()}
      >
        <Input placeholder="例如: http://localhost:11434" />
      </Form.Item>
    </Card>
  );

  // Tab 2: 大语言模型
  const LlmTab = (
    <Card>
      <Title level={5}><RobotOutlined /> 大语言模型（LLM）</Title>
      <Paragraph type="secondary">配置问答对话使用的大语言模型</Paragraph>

      <Form.Item
        name="llm_provider"
        label="提供商"
        rules={[{ required: true, message: '请选择提供商' }]}
      >
        <Select
          options={getLlmProviderOptions()}
          placeholder="请选择提供商"
          onChange={handleLlmProviderChange}
        />
      </Form.Item>

      <Form.Item
        name="llm_model_name"
        label="模型名称"
        extra="选择模型名称"
      >
        <Select
          options={getLlmModelOptions()}
          placeholder="请选择模型"
          allowClear
        />
      </Form.Item>

      <Form.Item
        name="llm_api_key"
        label="API Key"
        extra="某些提供商需要 API Key"
        hidden={!llmRequiresApiKey()}
      >
        <Input.Password placeholder="输入 API Key" />
      </Form.Item>

      <Form.Item
        name="llm_base_url"
        label="Base URL"
        extra="API Base URL"
        hidden={!llmRequiresBaseUrl()}
      >
        <Input placeholder="例如: https://api.deepseek.com" />
      </Form.Item>

      <Form.Item
        name="llm_temperature"
        label="温度 (Temperature)"
        extra="控制输出的随机性，值越大越随机（0-2）"
      >
        <InputNumber min={0} max={2} step={0.1} style={{ width: '100%' }} />
      </Form.Item>
    </Card>
  );

  // Tab 3: 提示词设置
  const PromptTab = (
    <Card>
      <Tabs
        defaultActiveKey="chat"
        items={[
          {
            key: 'chat',
            label: '普通聊天提示词',
            children: (
              <>
                <Form.Item
                  name="chat_system_prompt"
                  label="普通聊天系统提示词"
                  extra={
                    <Text type="secondary">
                      普通聊天提示词用于指导AI助手在普通聊天（未选择知识库）时的回答风格和行为。
                      <br />
                      <strong>注意：</strong>这是系统消息的内容，不能使用变量。
                    </Text>
                  }
                >
                  <TextArea rows={10} placeholder="输入普通聊天提示词..." />
                </Form.Item>
              </>
            ),
          },
          {
            key: 'rag',
            label: '知识库聊天提示词',
            children: (
              <>
                <Form.Item
                  name="rag_system_prompt"
                  label="知识库聊天系统提示词"
                  extra={
                    <Text type="secondary">
                      知识库聊天系统提示词用于在会话开始时设置AI助手的角色和行为。
                      <br />
                      <strong>注意：</strong>这是系统消息的内容，不能使用变量。
                    </Text>
                  }
                >
                  <TextArea rows={6} placeholder="输入知识库聊天系统提示词..." />
                </Form.Item>

                <Form.Item
                  name="rag_query_prompt"
                  label="知识库聊天查询提示词"
                  extra={
                    <>
                      <Text type="secondary">
                        知识库聊天查询提示词用于每次提问时构建提示，指导AI助手如何基于文档内容回答问题。
                      </Text>
                      <br />
                      <Text strong>必须使用以下变量：</Text>
                      <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li><code>{'{context}'}</code> - 检索到的文档内容（必需）</li>
                        <li><code>{'{question}'}</code> - 用户的问题（必需）</li>
                      </ul>
                    </>
                  }
                >
                  <TextArea
                    rows={10}
                    placeholder="例如：文档内容：&#10;{context}&#10;&#10;问题：{question}&#10;&#10;请基于文档内容回答问题。如果文档中没有相关信息，请明确说明。"
                  />
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </Card>
  );

  // Tab 4: 检索设置
  const RetrievalTab = (
    <Card>
      <Title level={5}><SearchOutlined /> 检索设置</Title>
      <Paragraph type="secondary">配置文档检索的参数</Paragraph>

      <Form.Item
        name="retrieval_mode"
        label="检索模式"
        rules={[{ required: true, message: '请选择检索模式' }]}
      >
        <Select
          options={[
            { label: '向量检索', value: 'vector' },
            { label: '全文检索', value: 'keyword' },
            { label: '混合检索', value: 'hybrid' },
          ]}
          onChange={setRetrievalMode}
        />
      </Form.Item>

      <Form.Item
        name="vector_threshold"
        label="向量检索阈值"
        extra="向量相似度阈值，低于此值的文档将被过滤（0-1）"
        hidden={!(retrievalMode === 'vector' || retrievalMode === 'hybrid')}
      >
        <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="keyword_threshold"
        label="全文检索阈值"
        extra="关键词匹配阈值（0-1）"
        hidden={!(retrievalMode === 'keyword' || retrievalMode === 'hybrid')}
      >
        <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="vector_weight"
        label="向量检索权重"
        extra="混合检索时向量检索的权重（0-1），关键词检索权重 = 1 - 向量权重"
        hidden={retrievalMode !== 'hybrid'}
      >
        <InputNumber min={0} max={1} step={0.1} style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item
        name="top_k"
        label="TopK 结果数量"
        extra="返回的文档数量（1-50）"
      >
        <InputNumber min={1} max={50} style={{ width: '100%' }} />
      </Form.Item>

      <Alert
        type="info"
        showIcon
        message="说明"
        description={
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li><strong>向量检索：</strong>基于语义相似度检索，适合理解问题意图</li>
            <li><strong>全文检索：</strong>基于关键词匹配检索，适合精确匹配</li>
            <li><strong>混合检索：</strong>结合向量和关键词检索，综合两者的优势</li>
          </ul>
        }
      />
    </Card>
  );

  // 标签页配置
  const tabItems = [
    {
      key: 'embedding',
      label: (
        <span>
          <ApiOutlined /> 向量嵌入模型
        </span>
      ),
      children: EmbeddingTab,
    },
    {
      key: 'llm',
      label: (
        <span>
          <RobotOutlined /> 大语言模型
        </span>
      ),
      children: LlmTab,
    },
    {
      key: 'prompt',
      label: (
        <span>
          <MessageOutlined /> 提示词设置
        </span>
      ),
      children: PromptTab,
    },
    {
      key: 'retrieval',
      label: (
        <span>
          <SearchOutlined /> 检索设置
        </span>
      ),
      children: RetrievalTab,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载设置中..." />
      </div>
    );
  }

  return (
    <div>
      <Title level={2}>
        <SettingOutlined /> 系统设置
      </Title>
      <Paragraph type="secondary">配置模型、提示词和检索参数</Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        style={{ maxWidth: 800 }}
      >
        <Tabs items={tabItems} />

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            重置
          </Button>
          <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>
            保存设置
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default Settings;
