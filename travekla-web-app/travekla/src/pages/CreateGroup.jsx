import React, { useState, useContext } from 'react';
import { Form, Input, Button, DatePicker, InputNumber, Card, Typography, Row, Col, message, Upload } from 'antd';
import { RocketOutlined, UploadOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { GroupContext } from '../context/GroupContext'; 
import { AuthContext } from '../context/AuthContext'; // Need this to attach the Creator Name
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateGroup = () => {
  const { addGroup } = useContext(GroupContext);
  const { user } = useContext(AuthContext); // Get logged-in user
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!user) {
      message.error("You must be logged in to create a group!");
      navigate('/login');
      return;
    }

    setLoading(true);

    // 1. Format data for the Backend
    const newTrip = {
      from: values.from,
      to: values.to,
      date: values.date.format('YYYY-MM-DD'), // Format date object to string
      description: values.description,
      price: 0, // Default for now
      capacity: values.capacity,
      membersJoined: 1, // You are the first member
      gallery: [
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop", // Default placeholder image
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop"
      ],
      creator: {
        id: user.id || user._id, // Handle both ID formats
        name: user.name,
        avatar: user.avatar
      }
    };

    // 2. Send to Server via Context
    const success = await addGroup(newTrip);

    setLoading(false);

    if (success) {
      navigate('/'); // Redirect to Home Page on success
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Card style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Title level={2}><RocketOutlined style={{ color: '#fa541c' }} /> Create a New Trip</Title>
          <Text type="secondary">Plan it, Post it, Travel it.</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish} size="large">
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

          <Form.Item name="description" label="Trip Description" rules={[{ required: true, message: 'Tell us about the vibe!' }]}>
            <TextArea rows={4} placeholder="e.g. A chill weekend trip with beach vibes and seafood..." />
          </Form.Item>

          {/* Image Upload Placeholder (Functional logic requires S3/Cloudinary, skipping for now) */}
          <Form.Item label="Cover Photo (Optional)">
             <Upload>
                <Button icon={<UploadOutlined />}>Click to Upload (Demo)</Button>
             </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ marginTop: 20, background: '#fa541c', borderColor: '#fa541c' }}>
            🚀 Publish Trip
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default CreateGroup;