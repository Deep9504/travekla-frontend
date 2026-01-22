import React, { useContext, useState } from 'react';
import { Form, Input, Button, Typography, Card, message, Checkbox } from 'antd'; // 👈 Added Checkbox
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const { Title, Text } = Typography;

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    
    // 👇 LOGIC: Set role based on Checkbox
    const role = values.isAdvisor ? 'advisor' : 'traveler';

    // 👇 Pass 'role' as the 4th argument
    const result = await register(values.name, values.email, values.password, role);
    
    if (result.success) {
      message.success("Registration Successful! Welcome aboard. 🚀");
      navigate('/'); 
    } else {
      message.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' 
    }}>
      <Card 
        style={{ width: 400, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2}>Join Travekla</Title>
          <Text type="secondary">Create your account to start traveling</Text>
        </div>

        <Form
          name="register_form"
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input your Name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your Email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          {/* 👇 NEW: ADVISOR CHECKBOX */}
          <Form.Item name="isAdvisor" valuePropName="checked">
            <Checkbox>I want to sign up as a <b>Travel Advisor</b></Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} icon={<UserAddOutlined />} style={{ background: '#fa541c', borderColor: '#fa541c' }}>
              Register
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? <Link to="/login">Login here</Link></Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;