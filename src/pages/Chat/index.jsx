/**
 * 聊天页面
 */

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Empty,
  message,
  Typography,
  Space,
  Spin,
  Avatar,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  RobotOutlined,
  ClearOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import useKbStore from '../../store/useKbStore';
import { sendStreamMessage } from '../../api/chat';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Chat = () => {
  const [selectedKb, setSelectedKb] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef(null);

  const { knowledgebases, fetchKnowledgebases } = useKbStore();

  // 加载知识库列表
  useEffect(() => {
    fetchKnowledgebases(1, 100);
  }, [fetchKnowledgebases]);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSend = async () => {
    if (!selectedKb) {
      message.warning('请先选择知识库');
      return;
    }
    if (!inputMessage.trim()) {
      message.warning('请输入问题');
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setLoading(true);
    setStreaming(true);

    // 添加用户消息
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: userMessage },
    ]);

    // 添加 AI 消息占位
    const aiMessageIndex = messages.length + 1;
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', loading: true },
    ]);

    // 构建历史消息
    const history = messages.slice(-10).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 发送流式请求
    let fullContent = '';
    
    await sendStreamMessage(
      {
        kb_id: selectedKb,
        message: userMessage,
        history,
      },
      // onMessage
      (data) => {
        const content = data.content || data.text || '';
        fullContent += content;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[aiMessageIndex] = {
            role: 'assistant',
            content: fullContent,
            loading: false,
          };
          return newMessages;
        });
      },
      // onError
      (error) => {
        message.error(error.message || '请求失败');
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[aiMessageIndex] = {
            role: 'assistant',
            content: '抱歉，发生了错误，请稍后重试。',
            loading: false,
            error: true,
          };
          return newMessages;
        });
      },
      // onComplete
      () => {
        setLoading(false);
        setStreaming(false);
      }
    );

    setLoading(false);
    setStreaming(false);
  };

  // 清除对话
  const handleClear = () => {
    setMessages([]);
    message.success('对话已清除');
  };

  // 按下 Enter 发送（Shift+Enter 换行）
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 知识库选项
  const kbOptions = knowledgebases.map((kb) => ({
    label: kb.name,
    value: kb.id,
  }));

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column' }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>
          <RobotOutlined /> 智能问答
        </Title>
        <Space>
          <Select
            style={{ width: 200 }}
            placeholder="选择知识库"
            options={kbOptions}
            value={selectedKb}
            onChange={setSelectedKb}
            suffixIcon={<DatabaseOutlined />}
          />
          <Button icon={<ClearOutlined />} onClick={handleClear} disabled={messages.length === 0}>
            清除对话
          </Button>
        </Space>
      </div>

      {/* 聊天区域 */}
      <Card
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        bodyStyle={{ flex: 1, overflow: 'auto', padding: 16 }}
      >
        {messages.length === 0 ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Empty
              description={
                <Text type="secondary">
                  {selectedKb ? '开始提问吧！' : '请先选择一个知识库'}
                </Text>
              }
            />
          </div>
        ) : (
          <div style={{ minHeight: '100%' }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  marginBottom: 16,
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  icon={msg.role === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#1890ff' : '#52c41a',
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    maxWidth: '70%',
                    marginLeft: msg.role === 'user' ? 0 : 12,
                    marginRight: msg.role === 'user' ? 12 : 0,
                    padding: '12px 16px',
                    borderRadius: 8,
                    backgroundColor: msg.role === 'user' ? '#e6f7ff' : '#f5f5f5',
                    borderLeft: msg.role === 'assistant' ? '3px solid #1890ff' : 'none',
                  }}
                >
                  {msg.loading ? (
                    <Spin size="small" />
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </Card>

      {/* 输入区域 */}
      <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
        <TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedKb ? '输入您的问题... (Enter 发送，Shift+Enter 换行)' : '请先选择知识库'}
          disabled={!selectedKb || streaming}
          autoSize={{ minRows: 2, maxRows: 4 }}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={loading}
          disabled={!selectedKb || !inputMessage.trim()}
          style={{ height: 'auto', minHeight: 60 }}
        >
          发送
        </Button>
      </div>
    </div>
  );
};

export default Chat;
