/**
 * 知识库详情页面
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Upload,
  Table,
  message,
  Popconfirm,
  Breadcrumb,
  Typography,
  Descriptions,
  Space,
  Empty,
  Spin,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  HomeOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  ArrowLeftOutlined,
  EditOutlined,
} from '@ant-design/icons';
import useKbStore from '../../store/useKbStore';
import KnowledgebaseFormModal from '../../components/KnowledgebaseFormModal';
import { API_BASE_URL } from '../../utils/constants';
import { getToken } from '../../utils/token';

const { Title, Text } = Typography;

const KbDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  // 编辑模态框状态
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  const {
    currentKb,
    documents,
    loading,
    fetchKnowledgebase,
    fetchDocuments,
    updateKnowledgebase,
    deleteDocument,
  } = useKbStore();

  // 加载知识库详情和文档列表
  useEffect(() => {
    if (id) {
      fetchKnowledgebase(id);
      fetchDocuments(id);
    }
  }, [id, fetchKnowledgebase, fetchDocuments]);

  // 上传配置
  const uploadProps = {
    name: 'file',
    action: `${API_BASE_URL}/kb/${id}/documents`,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    accept: '.pdf,.docx,.txt,.md',
    showUploadList: false,
    beforeUpload: () => {
      setUploading(true);
      return true;
    },
    onChange: (info) => {
      if (info.file.status === 'done') {
        setUploading(false);
        message.success(`${info.file.name} 上传成功`);
        fetchDocuments(id);
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 上传失败`);
      }
    },
  };

  // 删除文档
  const handleDeleteDocument = async (docId, docName) => {
    const result = await deleteDocument(id, docId);
    if (result.success) {
      message.success(`文档 "${docName}" 已删除`);
    } else {
      message.error(result.error || '删除失败');
    }
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

  // 文档表格列定义
  const columns = [
    {
      title: '文件名',
      dataIndex: 'filename',
      key: 'filename',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: '文件大小',
      dataIndex: 'file_size',
      key: 'file_size',
      width: 120,
      render: (size) => {
        if (!size) return '-';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / 1024 / 1024).toFixed(1)} MB`;
      },
    },
    {
      title: '上传时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="确认删除"
          description={`确定要删除文档 "${record.filename}" 吗？`}
          onConfirm={() => handleDeleteDocument(record.id, record.filename)}
          okText="确定"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Popconfirm>
      ),
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
          <Upload {...uploadProps}>
            <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
              上传文档
            </Button>
          </Upload>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            支持的文件格式：PDF、DOCX、TXT、MD
          </Text>
        </div>
        
        <Table
          columns={columns}
          dataSource={documents}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="暂无文档，点击上方按钮上传"
              />
            ),
          }}
        />
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
    </div>
  );
};

export default KbDetail;
