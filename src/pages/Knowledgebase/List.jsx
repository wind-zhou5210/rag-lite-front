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
  Modal,
  Form,
  Input,
  InputNumber,
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
} from '@ant-design/icons';
import useKbStore from '../../store/useKbStore';
import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP, DEFAULT_PAGE_SIZE } from '../../utils/constants';

const { Title, Text, Paragraph } = Typography;

const KbList = () => {
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingKb, setEditingKb] = useState(null);
  const [updating, setUpdating] = useState(false);
  
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
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // 关闭创建模态框
  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
  };

  // 创建知识库
  const handleCreate = async (values) => {
    setCreating(true);
    const result = await createKnowledgebase(values);
    setCreating(false);
    
    if (result.success) {
      message.success('知识库创建成功');
      handleCloseCreateModal();
      fetchKnowledgebases(1, DEFAULT_PAGE_SIZE);
    } else {
      message.error(result.error || '创建失败，请稍后重试');
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

  // 打开编辑模态框
  const handleOpenEditModal = (kb) => {
    setEditingKb(kb);
    editForm.setFieldsValue({
      name: kb.name,
      description: kb.description || '',
      chunk_size: kb.chunk_size,
      chunk_overlap: kb.chunk_overlap,
    });
    setEditModalVisible(true);
  };

  // 关闭编辑模态框
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingKb(null);
    editForm.resetFields();
  };

  // 更新知识库
  const handleUpdate = async (values) => {
    if (!editingKb) return;
    setUpdating(true);
    const result = await updateKnowledgebase(editingKb.id, values);
    setUpdating(false);
    
    if (result.success) {
      message.success('知识库更新成功');
      handleCloseEditModal();
    } else {
      message.error(result.error || '更新失败，请稍后重试');
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
                      <div
                        style={{
                          height: 120,
                          background: '#f5f5f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FolderOutlined style={{ fontSize: 48, color: '#999' }} />
                      </div>
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

      {/* 创建知识库模态框 */}
      <Modal
        title="创建知识库"
        open={createModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreate}
          initialValues={{
            chunk_size: DEFAULT_CHUNK_SIZE,
            chunk_overlap: DEFAULT_CHUNK_OVERLAP,
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入知识库描述（可选）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chunk_size"
                label="分块大小"
                rules={[{ required: true, message: '请输入分块大小' }]}
                extra="每个文本块的最大字符数，建议 512-1024"
              >
                <InputNumber min={100} max={2000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chunk_overlap"
                label="分块重叠"
                rules={[{ required: true, message: '请输入分块重叠大小' }]}
                extra="相邻块之间的重叠字符数，建议 50-100"
              >
                <InputNumber min={0} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleCloseCreateModal} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={creating}>
              创建
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑知识库模态框 */}
      <Modal
        title="编辑知识库"
        open={editModalVisible}
        onCancel={handleCloseEditModal}
        footer={null}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入知识库名称' }]}
          >
            <Input placeholder="请输入知识库名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="请输入知识库描述（可选）" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="chunk_size"
                label="分块大小"
                rules={[{ required: true, message: '请输入分块大小' }]}
                extra="每个文本块的最大字符数，建议 512-1024"
              >
                <InputNumber min={100} max={2000} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chunk_overlap"
                label="分块重叠"
                rules={[{ required: true, message: '请输入分块重叠大小' }]}
                extra="相邻块之间的重叠字符数，建议 50-100"
              >
                <InputNumber min={0} max={200} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Button onClick={handleCloseEditModal} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={updating}>
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KbList;
