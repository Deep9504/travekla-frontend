import React, { useState, useContext } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Card, Typography, Row, Col, message, Upload, Modal } from 'antd';
import { RocketOutlined, UploadOutlined, EnvironmentOutlined, BulbOutlined } from '@ant-design/icons';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs'; // Ant Design uses dayjs for dates

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateGroup = () => {
  // --- 1. HOOKS (MUST BE INSIDE HERE) ---
  const { addGroup } = useContext(GroupContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form Hook (Required for AI to auto-fill fields)
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // State for AI button loading

  // --- 2. AI GENERATE FUNCTION (UPDATED) ---
  const handleAIGenerate = async () => {
    let prompt = window.prompt("Describe your trip idea (e.g., 'Cheap Goa trip for students'):");
    if (!prompt) return;

    setAiLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      // 👇 DEBUG LOG: Check your browser console (F12) to see this!
      console.log("AI Data Received:", data);

      if (data) {
        // Auto-fill the form (Handling lowercase AND Capital letters)
        form.setFieldsValue({
          from: data.from || data.From,
          to: data.to || data.To,
          description: data.description || data.Description,
          price: data.price || data.Price || 5000,
          capacity: data.capacity || data.Capacity || 10,
          date: data.date ? dayjs(data.date) : null
        });
        message.success("✨ AI created your trip plan!");
      }
    } catch (error) {
      console.error("Frontend Error:", error);
      message.error("AI failed. Check console.");
    } finally {
      setAiLoading(false);
    }
  };

  // --- 3. FORM SUBMIT HANDLER ---
  const onFinish = async (values) => {
    if (!user) {
      message.error("You must be logged in to create a group!");
      navigate('/login');
      return;
    }

    setLoading(true);

    const newTrip = {
      from: values.from,
      to: values.to,
      date: values.date.format('YYYY-MM-DD'),
      description: values.description,
      price: values.price || 0,
      capacity: values.capacity,
      membersJoined: 1,
      gallery: [
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop"
      ],
      creator: {
        id: user.id || user._id,
        name: user.name,
        avatar: user.avatar
      }
    };

    const success = await addGroup(newTrip);
    setLoading(false);

    if (success) {
      navigate('/');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Card style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2}><RocketOutlined style={{ color: 'var(--secondary)' }} /> Create a New Trip</Title>
          <Text type="secondary">Plan it, Post it, Travel it.</Text>
        </div>

        {/* AI BUTTON */}
        <div style={{ textAlign: 'center', marginBottom: 25 }}>
          <Button
            type="dashed"
            icon={<BulbOutlined />}
            onClick={handleAIGenerate}
            loading={aiLoading}
            size="large"
            style={{
              background: '#f9f0ff',
              borderColor: '#722ed1',
              color: '#722ed1',
              borderRadius: 20
            }}
          >
            Auto-Fill with AI
          </Button>
        </div>

        {/* FORM STARTS HERE */}
        <Form
          layout="vertical"
          onFinish={onFinish}
          size="large"
          form={form} // 👈 This connects the form hook
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="from" label="Starting From" rules={[{ required: true, message: 'Where does it start?' }]}>
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Mumbai" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="to" label="Destination" rules={[{ required: true, message: 'Where are you going?' }]}>
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Goa" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Travel Date" rules={[{ required: true, message: 'When are we leaving?' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="capacity" label="Group Size" initialValue={10}>
                <InputNumber min={2} max={50} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Est. Budget (₹)" initialValue={5000}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Trip Description" rules={[{ required: true, message: 'Tell us about the vibe!' }]}>
            <TextArea rows={4} placeholder="e.g. A chill weekend trip with beach vibes and seafood..." />
          </Form.Item>

          <Form.Item label="Cover Photo (Optional)">
            <Upload>
              <Button icon={<UploadOutlined />}>Click to Upload (Demo)</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 20, background: 'var(--primary)', borderColor: 'var(--primary)' }}>
            🚀 Publish Trip
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateGroup;