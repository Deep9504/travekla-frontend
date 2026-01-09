import React, { useEffect, useState } from 'react';
import { Card, Button, Avatar, Tag, Typography, Row, Col, Rate, Spin, message, Badge } from 'antd';
import { UserOutlined, CheckCircleFilled, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const AdvisorProfile = () => {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH ADVISORS FROM BACKEND
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/advisors');
        const data = await response.json();
        setAdvisors(data);
      } catch (error) {
        console.error("Error fetching advisors:", error);
        message.error("Failed to load advisors.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvisors();
  }, []);

  const handleConnect = (name) => {
    message.success(`Request sent to ${name}! They will contact you shortly.`);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* HEADER SECTION */}
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={2}>Expert Travel Advisors</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Connect with locals and experts to plan your perfect trip.
        </Text>
      </div>

      {/* ADVISOR GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>
      ) : (
        <Row gutter={[24, 24]}>
          {advisors.map((advisor) => (
            <Col xs={24} sm={12} md={8} key={advisor._id}>
              <Badge.Ribbon text="Verified" color="blue" style={{ display: advisor.isVerified ? 'block' : 'none' }}>
                <Card 
                  hoverable 
                  style={{ borderRadius: 16, textAlign: 'center', height: '100%' }}
                  actions={[
                    <Button type="text" key="profile">View Profile</Button>,
                    <Button type="primary" key="connect" onClick={() => handleConnect(advisor.name)}>Connect</Button>
                  ]}
                >
                  <div style={{ marginBottom: 20 }}>
                    <Avatar 
                      size={100} 
                      src={advisor.image} 
                      icon={<UserOutlined />} 
                      style={{ border: '4px solid #f0f0f0' }}
                    />
                  </div>
                  
                  <Title level={4} style={{ marginBottom: 5 }}>
                    {advisor.name} {advisor.isVerified && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 16 }} />}
                  </Title>
                  
                  <Tag color="gold" style={{ marginBottom: 15 }}>{advisor.specialty}</Tag>
                  
                  <div style={{ marginBottom: 15, color: '#666' }}>
                    <EnvironmentOutlined /> {advisor.location}
                  </div>

                  <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 20, minHeight: 44 }}>
                    {advisor.bio}
                  </Paragraph>

                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <Rate disabled defaultValue={advisor.rating} style={{ fontSize: 14 }} />
                    <Text type="secondary">({advisor.reviews})</Text>
                  </div>

                  <Title level={5} style={{ margin: 0, color: '#fa541c' }}>
                    ₹{advisor.price} <span style={{ fontSize: 12, fontWeight: 'normal', color: '#999' }}>/ consultation</span>
                  </Title>

                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default AdvisorProfile;