/**
 * 注册页面
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import useAuthStore from '../../store/useAuthStore';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState(null);

  // 如果已登录，跳转到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 清除错误状态
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // 处理注册
  const handleSubmit = async (values) => {
    setSubmitError(null);
    const result = await register(values.username, values.password, values.email);
    
    if (result.success) {
      message.success('注册成功，请登录');
      navigate('/login');
    } else {
      setSubmitError(result.error || '注册失败，请稍后重试');
    }
  };

  // 确认密码验证
  const validateConfirmPassword = ({ getFieldValue }) => ({
    validator(_, value) {
      if (!value || getFieldValue('password') === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error('两次输入的密码不一致'));
    },
  });

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 200px)' 
    }}>
      <Card
        title={
          <span>
            <UserAddOutlined /> 用户注册
          </span>
        }
        style={{ width: 400 }}
        headStyle={{ 
          background: '#52c41a', 
          color: '#fff',
          fontSize: 18,
        }}
      >
        {(submitError || error) && (
          <Alert
            message={submitError || error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => {
              setSubmitError(null);
              clearError();
            }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少需要3个字符' },
            ]}
            extra="用户名将用于登录，至少需要3个字符"
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
            extra="邮箱为可选，用于找回密码等"
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="example@email.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少需要6个字符' },
            ]}
            extra="密码至少需要6个字符"
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              <UserAddOutlined /> 注册
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          已有账号？ <Link to="/login">立即登录</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
