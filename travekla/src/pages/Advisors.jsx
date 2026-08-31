import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Typography, Button, Avatar, Tag, Rate, Badge, Skeleton, message } from 'antd';
import { 
  UserOutlined, LockOutlined, GlobalOutlined, 
  DollarOutlined, MessageOutlined, StarFilled 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const Advisors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH ADVISORS ---
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/advisors');
        const data = await res.json();
        setAdvisors(data);
      } catch (err) {
        console.error("Failed to load advisors");
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  // --- RENDER ADVISOR CARD ---
  const renderAdvisorCard = (advisor) => {
    const isGuest = !user; // Check if user is logged in

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={advisor._id}>
        <Badge.Ribbon text="Verified Pro" color="gold">
          <Card
            hoverable
            style={{ 
                borderRadius: 16, 
                overflow: 'hidden', 
                textAlign: 'center', 
                position: 'relative',
                border: '1px solid #f0f0f0',
                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
            }}
            bodyStyle={{ padding: 0 }}
          >
            {/* --- 🔒 BLUR OVERLAY FOR GUESTS --- */}
            {isGuest && (
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(6px)', // 👈 THE BLUR EFFECT
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 16
                    
                }}>
                    <LockOutlined style={{ fontSize: 30, color: '#fa541c', marginBottom: 10 }} />
                    <Title level={4} style={{ margin: 0 }}>Hidden Profile</Title>
                    <Text type="secondary">Login to view details</Text>
                    <Button 
                        type="primary" 
                        shape="round" 
                        style={{ marginTop: 15, background: '#fa541c', borderColor: '#fa541c' }}
                        onClick={() => navigate('/login')}
                    >
                        Login to Unlock
                    </Button>
                </div>
            )}

            {/* --- CARD CONTENT --- */}
            <div style={{ padding: 24, paddingTop: 40 }}>
                <Avatar 
                    size={100} 
                    src={advisor.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${advisor.name}`} 
                    icon={<UserOutlined />}
                    style={{ border: '4px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                />
                
                <Title level={4} style={{ marginTop: 15, marginBottom: 5 }}>{advisor.name}</Title>
                <div style={{ marginBottom: 15 }}>
                     <Rate disabled defaultValue={advisor.rating || 4.5} style={{ fontSize: 14 }} />
                     <Text type="secondary" style={{ marginLeft: 5 }}>({advisor.reviews || 12})</Text>
                </div>

                <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ padding: '0 10px' }}>
                    {advisor.bio || "Hi! I help travelers plan the perfect trip based on their budget and vibe."}
                </Paragraph>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 20 }}>
                    {(advisor.expertise?.length > 0 ? advisor.expertise : ['Visa', 'Budget', 'Solo']).map(tag => (
                        <Tag key={tag} color="blue">{tag}</Tag>
                    ))}
                </div>

                <div style={{ background: '#f9f9f9', margin: '-24px -24px 0', padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
                    <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>Hourly Rate</Text>
                        <Title level={5} style={{ margin: 0, color: '#fa541c' }}>₹{advisor.hourlyRate || 499}</Title>
                    </div>
                    <Button 
                              type="primary" 
                              icon={<MessageOutlined />} 
                              onClick={() => navigate(`/profile/${advisor._id}`)} 
                          >
                              Hire Now
                    </Button>
                </div>
            </div>

          </Card>
        </Badge.Ribbon>
      </Col>
    );
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={2}>Find Your Travel Guru 🧘‍♂️</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
            Connect with verified experts for Visa, Itinerary, and Local Hacks.
        </Text>
      </div>

      {loading ? (
        <div style={{ padding: 50, textAlign: 'center' }}><Skeleton active /></div>
      ) : (
        <Row gutter={[24, 24]}>
          {advisors.length > 0 ? advisors.map(renderAdvisorCard) : (
              // --- DUMMY ADVISORS IF DATABASE IS EMPTY ---
              // (Just so you see something on the screen immediately)
              [1,2,3,4].map(i => renderAdvisorCard({
                  _id: i,
                  name: `Advisor ${i}`,
                  rating: 4.8,
                  reviews: 24,
                  bio: "Expert in mountain treks and hidden gems in North India.",
                  expertise: ["Trekking", "Photography", "Budget"],
                  hourlyRate: 599
              }))
          )}
        </Row>
      )}
    </div>
  );
};

export default Advisors;