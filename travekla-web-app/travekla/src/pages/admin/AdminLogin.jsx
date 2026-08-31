import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Go up 2 levels

const { Title, Text } = Typography;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    
    if (result.success) {
      if (result.user.role !== 'admin') {
        message.error("Access Denied: You are not an Admin!");
        setLoading(false);
        return;
      }
      message.success("Welcome, Super Admin 🛡️");
      navigate('/admin/dashboard');
    } else {
      message.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#001529' // Dark Admin Theme
    }}>
      <Card style={{ width: 400, borderRadius: 8, textAlign: 'center' }}>
        <Title level={3}>Travekla Admin</Title>
        <Text type="secondary">Restricted Access</Text>
        
        <Form onFinish={onFinish} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item name="email" rules={[{ required: true, message: 'Email required' }]}>
            <Input prefix={<MailOutlined />} placeholder="Admin Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password required' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} style={{ background: '#001529' }}>
            Enter Control Panel
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLogin;