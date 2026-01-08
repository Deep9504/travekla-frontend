import React, { useState, useContext } from 'react';
import { Card, Tabs, Form, Input, Button, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, GlobalOutlined, SolutionOutlined, SmileOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Login = () => {
  const { loginUser, registerUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State to toggle between "Traveler" and "Advisor" tabs
  const [activeRole, setActiveRole] = useState('traveler'); 
  // State to toggle between "Login" and "Sign Up" modes
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    setLoading(true);
    let success = false;

    if (isSignup) {
      // --- REGISTER ---
      success = await registerUser(values.name, values.email, values.password, activeRole);
      if (success) {
        setIsSignup(false); // Switch to login view after successful signup
      }
    } else {
      // --- LOGIN ---
      success = await loginUser(values.email, values.password);
      if (success) {
        // Redirect based on role
        if (activeRole === 'advisor') navigate('/advisor-dashboard');
        else navigate('/profile');
      }
    }
    setLoading(false);
  };

  const AuthForm = () => (
    <Form layout="vertical" onFinish={handleFinish}>
      
      {/* Name field is only visible during Sign Up */}
      {isSignup && (
        <Form.Item name="name" rules={[{ required: true, message: 'Please input your Name!' }]}>
          <Input prefix={<SmileOutlined />} placeholder="Full Name" size="large" />
        </Form.Item>
      )}

      <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
        <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
      </Form.Item>
      
      <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
      </Form.Item>

      <Button type="primary" htmlType="submit" size="large" block loading={loading}>
        {isSignup ? "Create Account" : "Log In"}
      </Button>
    </Form>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Title level={2}>Travekla</Title>
          <Text type="secondary">
            {isSignup ? `Join as a ${activeRole}` : "Welcome back"}
          </Text>
        </div>

        <Tabs 
          activeKey={activeRole} 
          onChange={setActiveRole}
          centered
          items={[
            { key: 'traveler', label: <span><GlobalOutlined /> Traveler</span>, children: <AuthForm /> },
            { key: 'advisor', label: <span><SolutionOutlined /> Advisor</span>, children: <AuthForm /> },
          ]}
        />

        <div style={{ textAlign: 'center', marginTop: 15 }}>
          <Button type="link" onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Already have an account? Log In" : "New here? Create Account"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;