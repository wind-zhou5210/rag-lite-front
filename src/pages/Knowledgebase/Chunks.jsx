/**
 * 文档分块查看页面
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Breadcrumb,
  Typography,
  Space,
  Empty,
  Spin,
  Pagination,
  Input,
  Collapse,
  Tag,
  message,
} from 'antd';
import {
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import useKbStore from '../../store/useKbStore';
import { getDocument } from '../../api/knowledgebase';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const Chunks = () => {
  const { kbId, docId } = useParams();
  const navigate = useNavigate();
  
  // 状态
  const [documentInfo, setDocumentInfo] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  
  const { currentKb, fetchKnowledgebase, fetchDocumentChunks } = useKbStore();

  // 加载知识库信息
  useEffect(() => {
    if (kbId && !currentKb) {
      fetchKnowledgebase(kbId);
    }
  }, [kbId, currentKb, fetchKnowledgebase]);

  // 加载文档信息
  useEffect(() => {
    const loadDocumentInfo = async () => {
      if (kbId && docId) {
        try {
          const response = await getDocument(kbId, docId);
          setDocumentInfo(response.data || response);
        } catch {
          message.error('获取文档信息失败');
        }
      }
    };
    loadDocumentInfo();
  }, [kbId, docId]);

  // 加载分块列表
  useEffect(() => {
    const loadChunks = async () => {
      if (!kbId || !docId) return;
      
      setLoading(true);
      const result = await fetchDocumentChunks(kbId, docId, 1, 20);
      setLoading(false);
      
      if (result) {
        setChunks(result.items || []);
        setPagination({
          page: result.page,
          pageSize: result.pageSize,
          total: result.total,
        });
      }
    };
    
    loadChunks();
  }, [kbId, docId, fetchDocumentChunks]);

  // 分页变化时重新加载
  const handlePageChange = async (page, pageSize) => {
    setLoading(true);
    const result = await fetchDocumentChunks(kbId, docId, page, pageSize);
    setLoading(false);
    
    if (result) {
      setChunks(result.items || []);
      setPagination({
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
      });
    }
  };

  // 搜索过滤（前端过滤当前页）
  const filteredChunks = searchText
    ? chunks.filter(chunk => 
        chunk.content?.toLowerCase().includes(searchText.toLowerCase())
      )
    : chunks;

  // 复制内容
  const handleCopyContent = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      message.success('内容已复制到剪贴板');
    }).catch(() => {
      message.error('复制失败');
    });
  };

  // 高亮搜索词
  const highlightText = (text, search) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === search.toLowerCase() 
        ? <mark key={i} style={{ backgroundColor: '#ffe58f', padding: 0 }}>{part}</mark>
        : part
    );
  };

  // 生成 Collapse items
  const collapseItems = filteredChunks.map((chunk, index) => ({
    key: chunk.id || index,
    label: (
      <Space style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space>
          <Tag color="blue">#{chunk.chunk_index !== undefined ? chunk.chunk_index + 1 : index + 1}</Tag>
          <Text ellipsis style={{ maxWidth: 600 }}>
            {chunk.content?.substring(0, 100)}...
          </Text>
        </Space>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {chunk.content?.length || 0} 字符
        </Text>
      </Space>
    ),
    children: (
      <div>
        <div style={{ marginBottom: 12 }}>
          <Button
            size="small"
            icon={<CopyOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyContent(chunk.content);
            }}
          >
            复制内容
          </Button>
        </div>
        <Card size="small" style={{ backgroundColor: '#fafafa' }}>
          <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
            {searchText ? highlightText(chunk.content, searchText) : chunk.content}
          </Paragraph>
        </Card>
        {chunk.metadata && Object.keys(chunk.metadata).length > 0 && (
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>元数据：</Text>
            <pre style={{ 
              fontSize: 12, 
              backgroundColor: '#f5f5f5', 
              padding: 8, 
              borderRadius: 4,
              overflow: 'auto',
              maxHeight: 100 
            }}>
              {JSON.stringify(chunk.metadata, null, 2)}
            </pre>
          </div>
        )}
      </div>
    ),
  }));

  if (loading && chunks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: <Link to="/kb"><DatabaseOutlined /> 知识库管理</Link> },
          { title: <Link to={`/kb/${kbId}`}>{currentKb?.name || '知识库'}</Link> },
          { title: <><FileTextOutlined /> {documentInfo?.name || '文档分块'}</> },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* 返回按钮和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/kb/${kbId}`)}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          文档分块
        </Title>
      </div>

      {/* 文档信息 */}
      {documentInfo && (
        <Card style={{ marginBottom: 24 }} size="small">
          <Space split={<span style={{ color: '#d9d9d9' }}>|</span>}>
            <Text strong>{documentInfo.name}</Text>
            <Text type="secondary">状态：{documentInfo.status}</Text>
            <Text type="secondary">分块数：{pagination.total}</Text>
          </Space>
        </Card>
      )}

      {/* 分块列表 */}
      <Card
        title={`分块列表 (共 ${pagination.total} 个)`}
        extra={
          <Search
            placeholder="搜索分块内容"
            allowClear
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        }
      >
        {filteredChunks.length > 0 ? (
          <>
            <Collapse
              items={collapseItems}
              accordion
              expandIconPosition="start"
            />
            
            {/* 分页 */}
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Pagination
                current={pagination.page}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onChange={handlePageChange}
                showSizeChanger
                showQuickJumper
                showTotal={(total) => `共 ${total} 个分块`}
                pageSizeOptions={['10', '20', '50', '100']}
              />
            </div>
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchText ? '没有匹配的分块' : '暂无分块数据，请先处理文档'}
          />
        )}
      </Card>
    </div>
  );
};

export default Chunks;
