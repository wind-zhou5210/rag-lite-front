/**
 * 图片上传组件
 * 
 * 功能：
 * - 文件选择（点击/拖拽）
 * - 前端校验（类型、大小）
 * - 图片预览
 * - 上传进度显示
 * - 上传成功/失败处理
 */

import { useState, useCallback, useEffect } from 'react';
import { Upload, message, Progress } from 'antd';
import { PlusOutlined, LoadingOutlined, DeleteOutlined } from '@ant-design/icons';
import { uploadImage } from '../api/upload';
import { IMAGE_UPLOAD_CONFIG } from '../utils/constants';

/**
 * 图片上传组件
 * 
 * @param {Object} props
 * @param {string} props.imageUrl - 当前图片的访问 URL（用于预览）
 * @param {function} props.onChange - 值变化回调，参数为 { objectKey, url }
 * @param {string} props.bizType - 业务类型，默认 'covers'
 * @param {boolean} props.disabled - 是否禁用
 */
const ImageUploader = ({ 
  imageUrl, 
  onChange, 
  bizType = 'covers',
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(imageUrl || '');

  /**
   * 前端校验文件
   */
  const validateFile = useCallback((file) => {
    // 校验文件类型
    if (!IMAGE_UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
      message.error(`不支持的图片格式，请上传 ${IMAGE_UPLOAD_CONFIG.acceptText} 格式的图片`);
      return false;
    }
    
    // 校验文件大小
    if (file.size > IMAGE_UPLOAD_CONFIG.maxSize) {
      message.error(`图片大小不能超过 ${IMAGE_UPLOAD_CONFIG.maxSizeText}`);
      return false;
    }
    
    return true;
  }, []);

  /**
   * 处理上传
   */
  const handleUpload = useCallback(async (file) => {
    // 前端校验
    if (!validateFile(file)) {
      return false;
    }

    setUploading(true);
    setProgress(0);

    try {
      // 创建本地预览
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      // 上传到服务器
      const response = await uploadImage(file, bizType, (percent) => {
        setProgress(percent);
      });

      const { object_key, url } = response.data || response;

      // 释放本地预览 URL
      URL.revokeObjectURL(localPreviewUrl);
      
      // 更新预览为服务器返回的 URL
      setPreviewUrl(url);

      // 通知父组件
      onChange?.({ objectKey: object_key, url });

      message.success('图片上传成功');
    } catch (error) {
      message.error(error.message || '图片上传失败');
      // 上传失败，清除预览
      setPreviewUrl(imageUrl || '');
    } finally {
      setUploading(false);
      setProgress(0);
    }

    // 阻止默认上传行为
    return false;
  }, [bizType, imageUrl, onChange, validateFile]);

  /**
   * 删除图片
   */
  const handleRemove = useCallback((e) => {
    e.stopPropagation();
    setPreviewUrl('');
    onChange?.({ objectKey: null, url: null });
  }, [onChange]);

  /**
   * 更新预览 URL（当外部 imageUrl 变化时）
   */
  useEffect(() => {
    // 当外部传入的 imageUrl 变化时，同步更新 previewUrl
    // 仅在 imageUrl 有值且与当前预览不同时更新，避免覆盖用户新上传的图片
    if (imageUrl && imageUrl !== previewUrl) {
      setPreviewUrl(imageUrl);
    } else if (!imageUrl && previewUrl && !uploading) {
      // 如果外部清空了 imageUrl，且不在上传中，也清空预览
      setPreviewUrl('');
    }
  }, [imageUrl]);

  /**
   * 渲染上传按钮
   */
  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {uploading ? '上传中...' : '上传封面'}
      </div>
    </div>
  );

  /**
   * 渲染图片预览
   */
  const imagePreview = (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <img
        src={previewUrl}
        alt="封面预览"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
      {!disabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s',
            cursor: 'pointer',
          }}
          className="image-overlay"
          onClick={handleRemove}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
        >
          <DeleteOutlined style={{ color: '#fff', fontSize: 24 }} />
        </div>
      )}
    </div>
  );

  return (
    <div>
      <Upload
        name="file"
        listType="picture-card"
        showUploadList={false}
        beforeUpload={handleUpload}
        accept={IMAGE_UPLOAD_CONFIG.allowedExtensions.join(',')}
        disabled={disabled || uploading}
      >
        {previewUrl ? imagePreview : uploadButton}
      </Upload>
      
      {/* 上传进度 */}
      {uploading && progress > 0 && (
        <Progress 
          percent={progress} 
          size="small" 
          style={{ marginTop: 8, width: 104 }}
        />
      )}
      
      {/* 提示文字 */}
      <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
        支持 {IMAGE_UPLOAD_CONFIG.acceptText}，最大 {IMAGE_UPLOAD_CONFIG.maxSizeText}
      </div>
    </div>
  );
};

export default ImageUploader;
