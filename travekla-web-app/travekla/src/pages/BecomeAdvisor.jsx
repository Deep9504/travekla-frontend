import React, { useState, useContext } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { RocketOutlined, InstagramOutlined, UserOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const BecomeAdvisor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!user) {
      message.error("Please login first!");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      // 👇 Call the Backend
      await axios.put(`https://travekla-web-app.onrender.com/api/users/apply-advisor/${user._id}`, {
        socialLink: values.socialLink,
        about: values.about
      });
      
      message.success("Application Submitted! 🚀 The Admin will review it shortly.");
      navigate("/"); 
    } catch (err) {
      console.error(err);
      message.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      background: '#f0f2f5',
      padding: '20px'
    }}>
      <Card 
        style={{ width: '100%', maxWidth: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <RocketOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          <Title level={2} style={{ marginBottom: 0 }}>Become an Advisor</Title>
          <Paragraph type="secondary">
            Share your travel expertise and earn money planning trips!
          </Paragraph>
        </div>

        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          {/* Social Media Link */}
          <Form.Item
            name="socialLink"
            label="Instagram / YouTube Link"
            rules={[{ required: true, message: 'Please paste your social media link!' }]}
          >
            <Input prefix={<InstagramOutlined />} placeholder="https://instagram.com/yourname" />
          </Form.Item>

          {/* Bio / About */}
          <Form.Item
            name="about"
            label="Why are you a pro?"
            rules={[{ required: true, message: 'Please tell us about your experience!' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="I have traveled to 15 countries and know the best local food spots..." 
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} icon={<RocketOutlined />}>
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BecomeAdvisor;