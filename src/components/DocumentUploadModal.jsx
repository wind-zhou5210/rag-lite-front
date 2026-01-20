/**
 * 文档上传模态框组件
 */

import { useState } from 'react';
import { Modal, Upload, Input, Form, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../utils/constants';
import { getToken } from '../utils/token';

const { Dragger } = Upload;

const DocumentUploadModal = ({ open, kbId, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 重置表单状态
  const resetForm = () => {
    form.resetFields();
    setFileList([]);
    setUploadProgress(0);
  };

  // 关闭模态框
  const handleCancel = () => {
    if (uploading) {
      message.warning('正在上传中，请稍候...');
      return;
    }
    resetForm();
    onCancel();
  };

  // 提交上传
  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.error('请选择要上传的文件');
      return;
    }

    const values = await form.validateFields();
    const file = fileList[0].originFileObj || fileList[0];

    // 构建 FormData
    const formData = new FormData();
    formData.append('file', file);
    if (values.name && values.name.trim()) {
      formData.append('name', values.name.trim());
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await fetch(`${API_BASE_URL}/kb/${kbId}/documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      });

      // 安全解析 JSON
      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error('服务器响应格式错误');
      }

      if (response.ok && result.code === 200) {
        message.success('文档上传成功');
        resetForm();
        onSuccess && onSuccess(result.data);
      } else {
        message.error(result.message || '上传失败');
      }
    } catch (error) {
      message.error('上传失败: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // 上传前校验
  const beforeUpload = (file) => {
    // 校验文件名是否有扩展名
    if (!file.name || !file.name.includes('.')) {
      message.error('文件名必须包含扩展名');
      return Upload.LIST_IGNORE;
    }

    // 校验文件类型
    const allowedTypes = ['pdf', 'docx', 'txt', 'md'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExt)) {
      message.error(`不支持的文件格式: .${fileExt}，允许的格式: ${allowedTypes.join(', ')}`);
      return Upload.LIST_IGNORE;
    }

    // 校验文件大小 (100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      message.error('文件大小不能超过 100MB');
      return Upload.LIST_IGNORE;
    }

    return false; // 阻止自动上传
  };

  // 文件列表变化
  const handleChange = ({ fileList: newFileList }) => {
    // 只保留最后一个文件
    setFileList(newFileList.slice(-1));
  };

  // 移除文件
  const handleRemove = () => {
    setFileList([]);
  };

  return (
    <Modal
      title="上传文档"
      open={open}
      onCancel={handleCancel}
      onOk={handleSubmit}
      okText="上传"
      cancelText="取消"
      confirmLoading={uploading}
      destroyOnClose
      width={520}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="选择文件"
          required
          style={{ marginBottom: 16 }}
        >
          <Dragger
            name="file"
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            onRemove={handleRemove}
            maxCount={1}
            accept=".pdf,.docx,.txt,.md"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持 PDF、DOCX、TXT、MD 格式，单个文件不超过 100MB
            </p>
          </Dragger>
        </Form.Item>

        <Form.Item
          name="name"
          label="文档名称"
          tooltip="可选，留空则使用原文件名"
        >
          <Input placeholder="输入自定义文档名称（可选）" maxLength={255} />
        </Form.Item>

        {uploading && uploadProgress > 0 && (
          <Progress percent={uploadProgress} status="active" />
        )}
      </Form>
    </Modal>
  );
};

export default DocumentUploadModal;
