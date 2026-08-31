import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Avatar, Typography, Button, Tag, Row, Col, Card, Spin, message, Divider, Modal, Form, Input, DatePicker } from 'antd';
import { UserOutlined, CheckCircleFilled, EnvironmentOutlined, CalendarOutlined, SafetyCertificateFilled } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';

// 👇 We removed the config import and just defined it directly here:
const API_BASE_URL = "http://localhost:5000/api";

const { Title, Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const AdvisorProfile = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext); 
  const [advisor, setAdvisor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchAdvisor = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/user/${id}`);
        const data = await res.json();
        setAdvisor(data);
      } catch (error) {
        console.error("Error fetching advisor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisor();
  }, [id]);

  const handleBookingSubmit = async (values) => {
    if (!user) return message.error("Please login to book a session!");
    
    setConfirmLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                travelerId: user._id || user.id,
                advisorId: advisor._id,
                advisorName: advisor.name,
                dates: values.dates,
                message: values.message
            })
        });

        if (res.ok) {
            const advisorName = advisor?.name || "the Advisor";
            message.success(`Request sent to ${advisorName}! Check 'My Trips' for status.`);
            setIsModalOpen(false);
            form.resetFields();
        } else {
            message.error("Booking failed. Please try again.");
        }
    } catch (error) {
        console.error(error);
        message.error("Server error.");
    }
    setConfirmLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
  if (!advisor) return <div style={{ textAlign: 'center', padding: 50 }}><Title level={3}>Advisor not found</Title></div>;

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      <Card style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }} styles={{ body: { padding: 0 } }}>
        <div style={{ background: 'linear-gradient(90deg, #001529 0%, #0050b3 100%)', height: 160 }}></div>
        
        <div style={{ padding: '0 30px', paddingBottom: 30 }}>
            <div style={{ marginTop: -60, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20 }}>
                    <Avatar 
                        size={140} 
                        src={advisor.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + advisor.name} 
                        icon={<UserOutlined />} 
                        style={{ border: '5px solid white', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }} 
                    />
                    <div style={{ marginBottom: 10 }}>
                        <Title level={2} style={{ margin: 0 }}>
                            {advisor.name} <CheckCircleFilled style={{ color: '#1890ff', fontSize: 24 }} />
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            <EnvironmentOutlined /> {advisor.location || "Global Citizen"}
                        </Text>
                    </div>
                </div>
                
                <div style={{ marginBottom: 15 }}>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<CalendarOutlined />} 
                        style={{ borderRadius: 8, height: 50, padding: '0 30px', fontSize: 16, background: '#fa541c', borderColor: '#fa541c' }}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Book Consultation
                    </Button>
                </div>
            </div>

            <Divider />

            <Row gutter={[40, 40]}>
                <Col xs={24} md={16}>
                    <Title level={4}>About Me</Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: '1.8', color: '#555' }}>
                        {advisor.bio || "This advisor hasn't written a bio yet, but they are verified and ready to help!"}
                    </Paragraph>

                    <Title level={4} style={{ marginTop: 30 }}>Expertise</Title>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <Tag color="purple">Trekking</Tag>
                        <Tag color="cyan">Budget Travel</Tag>
                        <Tag color="gold">Visa Assistance</Tag>
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <Card style={{ background: '#f9f9f9', border: 'none', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                            <SafetyCertificateFilled style={{ fontSize: 24, color: '#52c41a' }} />
                            <Title level={5} style={{ margin: 0 }}>Verified Identity</Title>
                        </div>
                        <Text type="secondary">Passed KYC Verification</Text>
                        <Divider style={{ margin: '12px 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text>Hourly Rate</Text>
                            <Text strong>₹599</Text>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text>Response Time</Text>
                            <Text strong>~ 1 Hour</Text>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
      </Card>

      <Modal
        title={`Book a session with ${advisor.name}`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleBookingSubmit}>
            <Form.Item label="Select Dates" name="dates" rules={[{ required: true, message: 'Please select dates!' }]}>
                <RangePicker style={{ width: '100%' }} />
            </Form.Item>
            
            <Form.Item label="Message / Trip Plan" name="message" rules={[{ required: true, message: 'Tell the advisor what you need!' }]}>
                <Input.TextArea rows={4} placeholder="Hi, I am planning a trip to..." />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" block loading={confirmLoading} size="large" style={{ background: '#fa541c' }}>
                    Send Request 🚀
                </Button>
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdvisorProfile;