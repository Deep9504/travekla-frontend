import React from 'react';
import { Row, Col, Card, Typography, Button, List, Tag, Badge } from 'antd';
import { CheckCircleFilled, CrownFilled, StarFilled, RocketOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const GoldMembership = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Free Traveler",
      price: "₹0",
      color: "#8c8c8c", // Grey
      features: [
        "Join Public Groups",
        "Create 1 Trip per Month",
        "Basic Profile",
        "Community Support"
      ],
      btnText: "Current Plan",
      btnType: "default",
      recommended: false
    },
    {
      name: "Gold Member",
      price: "₹499",
      period: "/ month",
      color: "#faad14", // Gold
      features: [
        "Unlimited Trip Creation",
        "Verified 'Gold' Badge 🏆",
        "Access to Exclusive Trips",
        "Priority Support",
        "No Booking Fees"
      ],
      btnText: "Upgrade to Gold",
      btnType: "primary",
      recommended: true
    },
    {
      name: "Platinum Pro",
      price: "₹999",
      period: "/ month",
      color: "#333", // Black
      features: [
        "All Gold Features",
        "Personal Travel Advisor",
        "Free Merch Kit 🎒",
        "Vibe Match Priority",
        "Featured Profile"
      ],
      btnText: "Go Platinum",
      btnType: "primary",
      recommended: false
    }
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '60px 20px' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={1} style={{ marginBottom: 10 }}>
          <CrownFilled style={{ color: '#faad14', marginRight: 10 }} />
          Upgrade Your Journey
        </Title>
        <Text type="secondary" style={{ fontSize: 18 }}>
          Unlock exclusive experiences and travel smarter with Travekla Gold.
        </Text>
      </div>

      {/* PRICING CARDS */}
      <Row gutter={[24, 24]} justify="center">
        {plans.map((plan, index) => (
          <Col xs={24} md={8} lg={7} key={index}>
            <Badge.Ribbon 
              text="Recommended" 
              color="red" 
              style={{ display: plan.recommended ? 'block' : 'none' }}
            >
              <Card 
                hoverable 
                style={{ 
                  borderRadius: 16, 
                  textAlign: 'center', 
                  border: plan.recommended ? '2px solid #faad14' : 'none',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <Title level={3} style={{ color: plan.color }}>{plan.name}</Title>
                <Title level={1} style={{ margin: '10px 0' }}>
                  {plan.price}
                  <span style={{ fontSize: 16, color: '#999', fontWeight: 'normal' }}>{plan.period}</span>
                </Title>
                
                <div style={{ marginTop: 20, flex: 1, textAlign: 'left' }}>
                  <List
                    dataSource={plan.features}
                    renderItem={item => (
                      <List.Item style={{ border: 'none', padding: '8px 0' }}>
                        <CheckCircleFilled style={{ color: '#52c41a', marginRight: 10 }} />
                        {item}
                      </List.Item>
                    )}
                  />
                </div>

                <Button 
                  type={plan.btnType} 
                  size="large" 
                  block 
                  style={{ 
                    marginTop: 30, 
                    background: plan.recommended ? '#faad14' : undefined,
                    borderColor: plan.recommended ? '#faad14' : undefined,
                    color: plan.recommended ? 'white' : undefined
                  }}
                  onClick={() => alert(`You clicked ${plan.name}!`)}
                >
                  {plan.btnText}
                </Button>
              </Card>
            </Badge.Ribbon>
          </Col>
        ))}
      </Row>

      {/* TRUST BANNER */}
      <div style={{ marginTop: 60, textAlign: 'center', background: 'white', padding: 40, borderRadius: 16 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <RocketOutlined style={{ fontSize: 30, color: '#fa541c' }} />
            <Title level={4}>Cancel Anytime</Title>
            <Text type="secondary">No lock-in contracts.</Text>
          </Col>
          <Col xs={24} md={8}>
            <StarFilled style={{ fontSize: 30, color: '#fa541c' }} />
            <Title level={4}>Best Price Guarantee</Title>
            <Text type="secondary">We match any other travel club.</Text>
          </Col>
          <Col xs={24} md={8}>
            <CrownFilled style={{ fontSize: 30, color: '#fa541c' }} />
            <Title level={4}>VIP Treatment</Title>
            <Text type="secondary">Get access to hidden events.</Text>
          </Col>
        </Row>
      </div>

    </div>
  );
};

export default GoldMembership;