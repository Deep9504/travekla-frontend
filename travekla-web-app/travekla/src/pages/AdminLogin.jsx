import React, { useContext } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAdminLogin = (values) => {
    // Hardcoded check for demo
    if(values.code === 'admin123') {
        login('admin', 'admin@travekla.com');
        navigate('/super-admin');
    } else {
        message.error("Invalid Admin Code");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#001529' }}>
       <Card style={{ width: 350, textAlign: 'center' }}>
          <LockOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 20 }} />
          <Title level={3}>Admin Portal</Title>
          <Form onFinish={handleAdminLogin}>
            <Form.Item name="code" rules={[{ required: true, message: 'Enter Security Code' }]}>
               <Input.Password placeholder="Admin Security Code" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block danger>Access Control Panel</Button>
          </Form>
       </Card>
    </div>
  );
};

export default AdminLogin;