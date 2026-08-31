import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google'; // 👈 IMPORT GOOGLE COMPONENT

const { Title, Text } = Typography;

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // --- NORMAL EMAIL/PASSWORD LOGIN ---
  const onFinish = async (values) => {
    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);

    if (result.success) {
      message.success("Welcome back!");

      // 🌟 NEW LOGIC: Check Role for Redirect
      if (result.user?.role === 'admin') {
        navigate('/admin'); // Send Admins to Dashboard
      } else {
        navigate('/');      // Send everyone else to Home
      }

    } else {
      message.error(result.message);
    }
  };

  // --- 🔥 GOOGLE LOGIN HANDLER ---
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the token we got from Google to OUR Backend
      const res = await fetch('https://travekla-web-app.onrender.com/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await res.json();

      if (data.success) {
        // Manually save to storage & force refresh to update Context
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success("Google Login Successful! 🎉");

        // 🌟 NEW LOGIC: Check Role for Redirect (with page refresh)
        if (data.user?.role === 'admin') {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }

      } else {
        message.error("Google Login Failed");
      }
    } catch (error) {
      console.error(error);
      message.error("Server Error");
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <Card style={{ width: '100%', maxWidth: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', borderRadius: 10 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2} style={{ color: 'var(--primary)' }}>Travekla</Title>
          <Text type="secondary">Welcome back, traveler!</Text>
        </div>

        <Form name="login_form" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Please input your Password!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }}>
              Log in
            </Button>
          </Form.Item>
        </Form>

        {/* 👇 DIVIDER & GOOGLE BUTTON */}
        <Divider plain>OR</Divider>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => message.error('Login Failed')}
            theme="filled_blue"
            shape="pill"
            width="350"
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <Text>Don't have an account? <Link to="/register">Sign up now</Link></Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;