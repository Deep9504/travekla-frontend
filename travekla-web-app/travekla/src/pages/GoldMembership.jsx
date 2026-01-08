import React from 'react';
import { Card, Row, Col, Typography, Button, List, Badge, Tag, Switch } from 'antd';
import { CheckCircleFilled, CloseCircleOutlined, CrownFilled, RocketOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const benefits = [
  { text: "Join Public Groups", free: true, gold: true, plat: true },
  { text: "Create Your Own Trips", free: true, gold: true, plat: true },
  { text: "Zero Platform Fees (Save ₹49/trip)", free: false, gold: true, plat: true },
  { text: "Verified 'Gold' Badge", free: false, gold: true, plat: true },
  { text: "Early Access to Popular Trips", free: false, gold: true, plat: true },
  { text: "Free Medical Insurance", free: false, gold: false, plat: true },
  { text: "24/7 Personal Travel Concierge", free: false, gold: false, plat: true },
];

const GoldMembership = () => {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#f0f2f5', minHeight: '90vh' }}>
      
      {/* HERO HEADER */}
      <div style={{ marginBottom: 50 }}>
        <CrownFilled style={{ fontSize: 60, color: '#faad14', marginBottom: 20 }} />
        <Title level={1} style={{ margin: 0 }}>Upgrade your Adventure</Title>
        <Text type="secondary" style={{ fontSize: 18 }}>Save money and travel smarter with Travekla Gold.</Text>
      </div>

      <Row gutter={[24, 24]} justify="center" align="middle">
        
        {/* 1. FREE PLAN */}
        <Col xs={24} md={7}>
          <Card hoverable style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}>
            <Title level={3}>Starter</Title>
            <Title level={2}>₹0</Title>
            <Text type="secondary">Forever Free</Text>
            <div style={{ marginTop: 30, textAlign: 'left' }}>
              <List
                dataSource={benefits}
                renderItem={item => (
                  <List.Item style={{ padding: '10px 0', border: 'none' }}>
                    {item.free ? <CheckCircleFilled style={{ color: '#52c41a', marginRight: 10 }} /> : <CloseCircleOutlined style={{ color: '#ccc', marginRight: 10 }} />}
                    <Text delete={!item.free} type={!item.free ? 'secondary' : ''}>{item.text}</Text>
                  </List.Item>
                )}
              />
            </div>
            <Button size="large" block style={{ marginTop: 20 }}>Current Plan</Button>
          </Card>
        </Col>

        {/* 2. GOLD PLAN (HIGHLIGHTED) */}
        <Col xs={24} md={8}>
          <Badge.Ribbon text="MOST POPULAR" color="gold">
            <Card 
              hoverable 
              style={{ 
                borderRadius: 16, 
                border: '2px solid #faad14', 
                transform: 'scale(1.05)', 
                boxShadow: '0 10px 30px rgba(250, 173, 20, 0.3)' 
              }}
            >
              <div style={{ background: 'linear-gradient(90deg, #FFD700 0%, #FDB931 100%)', margin: '-25px -25px 20px -25px', padding: 20, borderRadius: '14px 14px 0 0' }}>
                 <Title level={3} style={{ color: 'white', margin: 0 }}><CrownFilled /> GOLD</Title>
              </div>
              
              <Title level={2}>₹199<span style={{ fontSize: 16, fontWeight: 'normal' }}>/mo</span></Title>
              <Tag color="gold">Save ₹500+ per trip</Tag>

              <div style={{ marginTop: 30, textAlign: 'left' }}>
                <List
                  dataSource={benefits}
                  renderItem={item => (
                    <List.Item style={{ padding: '10px 0', border: 'none' }}>
                      {item.gold ? <CheckCircleFilled style={{ color: '#faad14', marginRight: 10 }} /> : <CloseCircleOutlined style={{ color: '#ccc', marginRight: 10 }} />}
                      <Text delete={!item.gold} strong={item.gold}>{item.text}</Text>
                    </List.Item>
                  )}
                />
              </div>
              <Button type="primary" size="large" block style={{ marginTop: 20, background: '#faad14', borderColor: '#faad14', height: 50, fontSize: 18 }}>
                Get Gold
              </Button>
            </Card>
          </Badge.Ribbon>
        </Col>

        {/* 3. PLATINUM PLAN */}
        <Col xs={24} md={7}>
          <Card hoverable style={{ borderRadius: 16, background: '#1f1f1f' }}>
            <Title level={3} style={{ color: 'white' }}>Platinum</Title>
            <Title level={2} style={{ color: 'white' }}>₹999<span style={{ fontSize: 16, fontWeight: 'normal', color: '#888' }}>/mo</span></Title>
            <Text style={{ color: '#888' }}>For VIP Travelers</Text>
            <div style={{ marginTop: 30, textAlign: 'left' }}>
              <List
                dataSource={benefits}
                renderItem={item => (
                  <List.Item style={{ padding: '10px 0', border: 'none' }}>
                    {item.plat ? <CheckCircleFilled style={{ color: 'white', marginRight: 10 }} /> : <CloseCircleOutlined style={{ color: '#555', marginRight: 10 }} />}
                    <Text style={{ color: item.plat ? 'white' : '#555' }}>{item.text}</Text>
                  </List.Item>
                )}
              />
            </div>
            <Button size="large" block ghost style={{ marginTop: 20, color: 'white', borderColor: 'white' }}>Go Platinum</Button>
          </Card>
        </Col>

      </Row>
      
      <div style={{ marginTop: 50 }}>
          <Text type="secondary">Cancel anytime. Secure payment via UPI/Card.</Text>
      </div>

    </div>
  );
};

export default GoldMembership;