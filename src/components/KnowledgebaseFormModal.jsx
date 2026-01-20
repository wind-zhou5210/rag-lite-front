/**
 * 知识库表单模态框组件
 * 
 * 统一处理知识库的创建和编辑功能
 * 通过 mode 参数区分不同模式
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  Row,
  Col,
} from 'antd';
import ImageUploader from './ImageUploader';
import { DEFAULT_CHUNK_SIZE, DEFAULT_CHUNK_OVERLAP } from '../utils/constants';

/**
 * 知识库表单模态框
 * 
 * @param {Object} props
 * @param {boolean} props.open - 是否显示模态框
 * @param {function} props.onCancel - 取消/关闭回调
 * @param {function} props.onSubmit - 提交回调，参数为表单数据
 * @param {'create'|'edit'} props.mode - 模式：创建或编辑
 * @param {Object} props.initialData - 编辑模式下的初始数据
 * @param {boolean} props.loading - 提交按钮加载状态
 */
const KnowledgebaseFormModal = ({
  open,
  onCancel,
  onSubmit,
  mode = 'create',
  initialData = null,
  loading = false,
}) => {
  const [form] = Form.useForm();
  
  // 是否为编辑模式
  const isEdit = mode === 'edit';

  // 计算初始封面图片状态 - 仅在 initialData 变化时重新计算
  const initialCoverImage = useMemo(() => {
    if (isEdit && initialData) {
      return {
        objectKey: initialData.cover_image || null,
        url: initialData.cover_image_url || null,
      };
    }
    return { objectKey: null, url: null };
  }, [isEdit, initialData]);

  // 封面图片状态 - 使用 key 强制重置
  const [coverImage, setCoverImage] = useState(initialCoverImage);

  // 模态框配置
  const modalConfig = {
    create: {
      title: '创建知识库',
      submitText: '创建',
    },
    edit: {
      title: '编辑知识库',
      submitText: '保存',
    },
  };

  const config = modalConfig[mode] || modalConfig.create;

  /**
   * 重置表单状态
   */
  const resetForm = useCallback(() => {
    form.resetFields();
    setCoverImage({ objectKey: null, url: null });
  }, [form]);

  /**
   * 处理关闭
   */
  const handleCancel = useCallback(() => {
    resetForm();
    onCancel?.();
  }, [resetForm, onCancel]);

  /**
   * 处理提交
   */
  const handleFinish = useCallback((values) => {
    const submitData = {
      ...values,
      cover_image: coverImage.objectKey,
    };
    onSubmit?.(submitData);
  }, [coverImage.objectKey, onSubmit]);

  /**
   * 处理封面图片变化
   */
  const handleCoverImageChange = useCallback((imageData) => {
    setCoverImage(imageData);
  }, []);

  // 计算表单初始值
  const formInitialValues = useMemo(() => {
    if (isEdit && initialData) {
      return {
        name: initialData.name,
        description: initialData.description || '',
        chunk_size: initialData.chunk_size,
        chunk_overlap: initialData.chunk_overlap,
      };
    }
    return {
      chunk_size: DEFAULT_CHUNK_SIZE,
      chunk_overlap: DEFAULT_CHUNK_OVERLAP,
    };
  }, [isEdit, initialData]);

  // 生成一个唯一的 key 用于强制重置 Modal 内部状态
  const modalKey = useMemo(() => {
    if (!open) return 'closed';
    return isEdit ? `edit-${initialData?.id}` : 'create';
  }, [open, isEdit, initialData?.id]);

  return (
    <Modal
      key={modalKey}
      title={config.title}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnHidden={true}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={formInitialValues}
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

        <Form.Item label="封面图片">
          <ImageUploader
            key={modalKey}
            imageUrl={initialCoverImage.url}
            onChange={handleCoverImageChange}
            bizType="covers"
          />
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
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {config.submitText}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default KnowledgebaseFormModal;
