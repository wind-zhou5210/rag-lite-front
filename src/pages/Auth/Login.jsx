/**
 * 登录页面
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Alert } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import useAuthStore from '../../store/useAuthStore';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState(null);

  // 如果已登录，跳转到首页或之前的页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 清除错误状态
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // 处理登录
  const handleSubmit = async (values) => {
    setSubmitError(null);
    const result = await login(values.username, values.password);
    
    if (result.success) {
      message.success('登录成功');
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } else {
      setSubmitError(result.error || '登录失败，请稍后重试');
    }
  };

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
            <LoginOutlined /> 用户登录
          </span>
        }
        style={{ width: 400 }}
        headStyle={{ 
          background: '#1890ff', 
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
          name="login"
          onFinish={handleSubmit}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
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
            >
              <LoginOutlined /> 登录
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center' }}>
          还没有账号？ <Link to="/register">立即注册</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
