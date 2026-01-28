import React, { useState, useContext } from 'react';
import { Form, Input, DatePicker, InputNumber, Button, Card, message, Typography } from 'antd';
import { RocketOutlined, DollarOutlined, CalendarOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateTrip = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    if (!user) return message.error("You must be logged in!");
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/trips/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          creatorId: user.id || user._id, // Attach the logged-in user's ID
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Trip Created Successfully! 🚀");
        // Redirect to My Trips dashboard to see the status
        navigate('/my-trips'); 
      } else {
        message.error(data.message || "Failed to create trip");
      }
    } catch (error) {
      console.error("Create Trip Error:", error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: '0 20px' }}>
      <Card hoverable style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
           <RocketOutlined style={{ fontSize: 40, color: '#1890ff' }} />
           <Title level={2}>Plan a New Trip</Title>
           <Text type="secondary">
             {user?.role === 'advisor' 
               ? "Launch a new Verified Tour for travelers." 
               : "Start a Community Plan and find travel buddies."}
           </Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          
          <div style={{ display: 'flex', gap: 10 }}>
             <Form.Item label="From (Origin)" name="from" rules={[{ required: true }]} style={{ flex: 1 }}>
               <Input placeholder="e.g. Delhi" size="large" />
             </Form.Item>
             <Form.Item label="To (Destination)" name="to" rules={[{ required: true }]} style={{ flex: 1 }}>
               <Input placeholder="e.g. Manali" size="large" />
             </Form.Item>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
             <Form.Item label="Start Date" name="date" rules={[{ required: true }]} style={{ flex: 1 }}>
               <DatePicker style={{ width: '100%' }} size="large" />
             </Form.Item>
             <Form.Item label="Estimated Budget (₹)" name="budget" rules={[{ required: true }]} style={{ flex: 1 }}>
               <InputNumber 
                 style={{ width: '100%' }} 
                 size="large" 
                 prefix="₹" 
                 placeholder="5000" 
               />
             </Form.Item>
          </div>

          <Form.Item label="Description / Itinerary" name="description" rules={[{ required: true }]}>
            <TextArea rows={4} placeholder="Describe the plan... (e.g. We will trek to Hidimba temple, stay in Old Manali...)" />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} style={{ height: 50, fontSize: 18 }}>
            {user?.role === 'advisor' ? "Submit for Approval" : "Publish Trip"}
          </Button>

        </Form>
      </Card>
    </div>
  );
};

export default CreateTrip;