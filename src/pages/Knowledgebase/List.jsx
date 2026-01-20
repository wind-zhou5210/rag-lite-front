/**
 * 知识库列表页面
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Button,
  Pagination,
  Empty,
  message,
  Popconfirm,
  Breadcrumb,
  Typography,
  Spin,
} from 'antd';
import {
  PlusCircleOutlined,
  FolderOutlined,
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  DatabaseOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import useKbStore from '../../store/useKbStore';
import KnowledgebaseFormModal from '../../components/KnowledgebaseFormModal';
import { DEFAULT_PAGE_SIZE } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const KbList = () => {
  // 统一的模态框状态
  const [modalState, setModalState] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    data: null,     // 编辑时的初始数据
  });
  const [submitting, setSubmitting] = useState(false);
  
  const {
    knowledgebases,
    loading,
    pagination,
    fetchKnowledgebases,
    createKnowledgebase,
    updateKnowledgebase,
    deleteKnowledgebase,
  } = useKbStore();

  // 加载知识库列表
  useEffect(() => {
    fetchKnowledgebases(1, DEFAULT_PAGE_SIZE);
  }, [fetchKnowledgebases]);

  // 打开创建模态框
  const handleOpenCreateModal = () => {
    setModalState({ open: true, mode: 'create', data: null });
  };

  // 打开编辑模态框
  const handleOpenEditModal = (kb) => {
    setModalState({ open: true, mode: 'edit', data: kb });
  };

  // 关闭模态框
  const handleCloseModal = () => {
    setModalState({ open: false, mode: 'create', data: null });
  };

  // 统一的表单提交处理
  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    
    try {
      if (modalState.mode === 'create') {
        // 创建知识库
        const result = await createKnowledgebase(formData);
        if (result.success) {
          message.success('知识库创建成功');
          handleCloseModal();
          fetchKnowledgebases(1, DEFAULT_PAGE_SIZE);
        } else {
          message.error(result.error || '创建失败，请稍后重试');
        }
      } else {
        // 更新知识库
        const result = await updateKnowledgebase(modalState.data.id, formData);
        if (result.success) {
          message.success('知识库更新成功');
          handleCloseModal();
        } else {
          message.error(result.error || '更新失败，请稍后重试');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 删除知识库
  const handleDelete = async (id, name) => {
    const result = await deleteKnowledgebase(id);
    if (result.success) {
      message.success(`知识库 "${name}" 已删除`);
    } else {
      message.error(result.error || '删除失败，请稍后重试');
    }
  };

  // 分页变化
  const handlePageChange = (page, pageSize) => {
    fetchKnowledgebases(page, pageSize);
  };

  return (
    <div>
      {/* 面包屑导航 */}
      <Breadcrumb
        items={[
          { title: <Link to="/"><HomeOutlined /> 首页</Link> },
          { title: '知识库管理' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* 标题和操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <DatabaseOutlined /> 知识库管理
        </Title>
        <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleOpenCreateModal}>
          创建知识库
        </Button>
      </div>

      {/* 知识库列表 */}
      <Spin spinning={loading}>
        {knowledgebases.length > 0 ? (
          <>
            <Row gutter={[16, 16]}>
              {knowledgebases.map((kb) => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={kb.id}>
                  <Card
                    hoverable
                    cover={
                      kb.cover_image_url ? (
                        <div
                          style={{
                            height: 120,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={kb.cover_image_url}
                            alt={kb.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            height: 120,
                            background: '#f5f5f5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <PictureOutlined style={{ fontSize: 48, color: '#999' }} />
                        </div>
                      )
                    }
                    actions={[
                      <Button
                        key="edit"
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEditModal(kb)}
                      >
                        编辑
                      </Button>,
                      <Popconfirm
                        key="delete"
                        title="确认删除"
                        description={`确定要删除知识库 "${kb.name}" 吗？此操作不可恢复！`}
                        onConfirm={() => handleDelete(kb.id, kb.name)}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" danger icon={<DeleteOutlined />}>
                          删除
                        </Button>
                      </Popconfirm>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <Link to={`/kb/${kb.id}`}>
                          <FolderOutlined /> {kb.name}
                        </Link>
                      }
                      description={
                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{ marginBottom: 0, minHeight: 44 }}
                        >
                          {kb.description || '无描述'}
                        </Paragraph>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* 分页 */}
            {pagination.total > pagination.pageSize && (
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Pagination
                  current={pagination.page}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total) => `共 ${total} 个知识库`}
                />
              </div>
            )}
          </>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text type="secondary">还没有知识库，点击上方按钮创建一个吧！</Text>
            }
          />
        )}
      </Spin>

      {/* 知识库表单模态框（创建/编辑共用） */}
      <KnowledgebaseFormModal
        open={modalState.open}
        mode={modalState.mode}
        initialData={modalState.data}
        loading={submitting}
        onCancel={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default KbList;
