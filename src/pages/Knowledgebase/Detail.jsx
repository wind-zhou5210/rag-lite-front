/**
 * 知识库详情页面
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Table,
  message,
  Popconfirm,
  Breadcrumb,
  Typography,
  Descriptions,
  Space,
  Empty,
  Spin,
  Tag,
  Tooltip,
  Pagination,
} from 'antd';
import {
  DeleteOutlined,
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EditOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  UnorderedListOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileMarkdownOutlined,
} from '@ant-design/icons';
import useKbStore from '../../store/useKbStore';
import KnowledgebaseFormModal from '../../components/KnowledgebaseFormModal';
import DocumentUploadModal from '../../components/DocumentUploadModal';

const { Title, Text } = Typography;

// 文档状态配置
const STATUS_CONFIG = {
  pending: { label: '待处理', color: 'default' },
  processing: { label: '处理中', color: 'processing' },
  completed: { label: '已完成', color: 'success' },
  failed: { label: '失败', color: 'error' },
};

// 文件类型图标
const FILE_TYPE_ICONS = {
  pdf: <FilePdfOutlined style={{ color: '#ff4d4f' }} />,
  docx: <FileWordOutlined style={{ color: '#1890ff' }} />,
  txt: <FileTextOutlined style={{ color: '#52c41a' }} />,
  md: <FileMarkdownOutlined style={{ color: '#722ed1' }} />,
};

const KbDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 编辑模态框状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // 上传模态框状态
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const {
    currentKb,
    documents,
    loading,
    docPagination,
    fetchKnowledgebase,
    fetchDocuments,
    updateKnowledgebase,
    deleteDocument,
    processDocument,
    reprocessDocument,
  } = useKbStore();

  // 加载知识库详情和文档列表
  useEffect(() => {
    if (id) {
      fetchKnowledgebase(id);
      fetchDocuments(id);
    }
  }, [id, fetchKnowledgebase, fetchDocuments]);

  // 删除文档
  const handleDeleteDocument = async (docId, docName) => {
    const result = await deleteDocument(id, docId);
    if (result.success) {
      message.success(`文档 "${docName}" 已删除`);
    } else {
      message.error(result.error || '删除失败');
    }
  };

  // 处理文档
  const handleProcessDocument = async (docId, docName) => {
    const result = await processDocument(id, docId);
    if (result.success) {
      message.success(`文档 "${docName}" 处理请求已提交`);
      fetchDocuments(id);
    } else {
      message.info(result.message || '处理失败');
    }
  };

  // 重新处理文档
  const handleReprocessDocument = async (docId, docName) => {
    const result = await reprocessDocument(id, docId);
    if (result.success) {
      message.success(`文档 "${docName}" 重新处理请求已提交`);
      fetchDocuments(id);
    } else {
      message.info(result.message || '重新处理失败');
    }
  };

  // 查看分块（预留功能）
  // eslint-disable-next-line no-unused-vars
  const handleViewChunks = (docId, docName) => {
    message.info(`分块查看功能即将上线，敬请期待`);
    // TODO: 后续实现跳转到分块详情页
    // navigate(`/kb/${id}/documents/${docId}/chunks`);
  };

  // 打开编辑模态框
  const handleOpenEditModal = () => {
    setEditModalOpen(true);
  };

  // 关闭编辑模态框
  const handleCloseEditModal = () => {
    setEditModalOpen(false);
  };

  // 更新知识库
  const handleUpdate = async (formData) => {
    setUpdating(true);
    const result = await updateKnowledgebase(id, formData);
    setUpdating(false);
    
    if (result.success) {
      message.success('知识库更新成功');
      handleCloseEditModal();
    } else {
      message.error(result.error || '更新失败，请稍后重试');
    }
  };

  // 上传成功回调
  const handleUploadSuccess = () => {
    setUploadModalOpen(false);
    fetchDocuments(id);
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    fetchDocuments(id, page, pageSize);
  };

  // 格式化文件大小
  const formatFileSize = (size) => {
    if (!size) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  // 渲染操作按钮
  const renderActions = (record) => {
    const { id: docId, name: docName, status } = record;
    const actions = [];

    // 根据状态显示不同操作
    if (status === 'pending') {
      actions.push(
        <Tooltip title="处理文档" key="process">
          <Button
            type="link"
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => handleProcessDocument(docId, docName)}
          >
            处理
          </Button>
        </Tooltip>
      );
    } else if (status === 'processing') {
      actions.push(
        <Button
          type="link"
          size="small"
          icon={<ReloadOutlined spin />}
          disabled
          key="processing"
        >
          处理中
        </Button>
      );
    } else if (status === 'completed') {
      actions.push(
        <Tooltip title="查看文档分块" key="chunks">
          <Button
            type="link"
            size="small"
            icon={<UnorderedListOutlined />}
            onClick={() => handleViewChunks(docId, docName)}
          >
            分块
          </Button>
        </Tooltip>
      );
      actions.push(
        <Tooltip title="重新处理" key="reprocess">
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleReprocessDocument(docId, docName)}
          >
            重处理
          </Button>
        </Tooltip>
      );
    } else if (status === 'failed') {
      actions.push(
        <Tooltip title="重新处理" key="reprocess">
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => handleReprocessDocument(docId, docName)}
          >
            重处理
          </Button>
        </Tooltip>
      );
    }

    // 删除按钮（处理中的文档不允许删除）
    if (status !== 'processing') {
      actions.push(
        <Popconfirm
          key="delete"
          title="确认删除"
          description={`确定要删除文档 "${docName}" 吗？`}
          onConfirm={() => handleDeleteDocument(docId, docName)}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger size="small" icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      );
    }

    return <Space size="small">{actions}</Space>;
  };

  // 文档表格列定义
  const columns = [
    {
      title: '文档名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <Space>
          {FILE_TYPE_ICONS[record.file_type] || <FileTextOutlined />}
          <Tooltip title={text}>
            <span>{text}</span>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = STATUS_CONFIG[status] || { label: status, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '分块数',
      dataIndex: 'chunk_count',
      key: 'chunk_count',
      width: 80,
      align: 'center',
      render: (count) => count || '-',
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 100,
      render: (size) => formatFileSize(size),
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 170,
      render: (time) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => renderActions(record),
    },
  ];

  if (loading && !currentKb) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!currentKb) {
    return (
      <Empty description="知识库不存在或已被删除">
        <Button type="primary" onClick={() => navigate('/kb')}>
          返回知识库列表
        </Button>
      </Empty>
    );
  }

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: <Link to="/kb"><DatabaseOutlined /> 知识库管理</Link> },
          { title: currentKb.name },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* 返回按钮和标题 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/kb')}
          style={{ marginRight: 16 }}
        >
          返回
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          {currentKb.name}
        </Title>
      </div>

      {/* 知识库信息 */}
      <Card 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={handleOpenEditModal}
          >
            编辑
          </Button>
        }
      >
        {/* 封面图片显示 */}
        {currentKb.cover_image_url && (
          <div style={{ marginBottom: 16, textAlign: 'center' }}>
            <img
              src={currentKb.cover_image_url}
              alt="知识库封面"
              style={{
                maxWidth: '100%',
                maxHeight: 200,
                objectFit: 'cover',
                borderRadius: 8,
              }}
            />
          </div>
        )}
        <Descriptions title="知识库信息" column={{ xs: 1, sm: 2, md: 3 }}>
          <Descriptions.Item label="名称">{currentKb.name}</Descriptions.Item>
          <Descriptions.Item label="分块大小">{currentKb.chunk_size}</Descriptions.Item>
          <Descriptions.Item label="分块重叠">{currentKb.chunk_overlap}</Descriptions.Item>
          <Descriptions.Item label="描述" span={3}>
            {currentKb.description || <Text type="secondary">无描述</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {currentKb.created_at ? new Date(currentKb.created_at).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 文档管理 */}
      <Card
        title="文档管理"
        extra={
          <Button
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => setUploadModalOpen(true)}
          >
            上传文档
          </Button>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            支持的文件格式：PDF、DOCX、TXT、MD，单个文件不超过 100MB
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无文档，点击上方按钮上传"
              />
            ),
          }}
        />
        
        {/* 分页 */}
        {docPagination.total > 0 && (
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Pagination
              current={docPagination.page}
              pageSize={docPagination.pageSize}
              total={docPagination.total}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 个文档`}
            />
          </div>
        )}
      </Card>

      {/* 编辑知识库模态框 */}
      <KnowledgebaseFormModal
        open={editModalOpen}
        mode="edit"
        initialData={currentKb}
        loading={updating}
        onCancel={handleCloseEditModal}
        onSubmit={handleUpdate}
      />

      {/* 上传文档模态框 */}
      <DocumentUploadModal
        open={uploadModalOpen}
        kbId={id}
        onCancel={() => setUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default KbDetail;
