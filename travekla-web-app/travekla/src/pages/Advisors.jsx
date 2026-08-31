import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Card, Typography, Button, Avatar, Tag, Rate, Badge, Skeleton, message } from 'antd';
import {
  UserOutlined, LockOutlined, MessageOutlined, CheckCircleFilled 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// 👇 Make sure this path is correct!
import BookingModal from '../components/advisor/BookingModal'; 

const { Title, Text, Paragraph } = Typography;

const Advisors = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- BOOKING STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  // --- FETCH ADVISORS ---
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await fetch('https://travekla-web-app.onrender.com/api/users/advisors'); // 👈 Check if this is the right endpoint
        const data = await res.json();
        // If data is array, set it. If wrapped in object, extract it.
        setAdvisors(Array.isArray(data) ? data : []); 
      } catch (err) {
        console.error("Failed to load advisors", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  // --- HANDLE HIRE CLICK ---
  const handleHireClick = (advisor) => {
    if (!user) {
        message.warning("Please login to hire an advisor!");
        navigate("/login");
        return;
    }
    setSelectedAdvisor(advisor);
    setIsModalOpen(true);
  };

  // --- RENDER ADVISOR CARD ---
  const renderAdvisorCard = (advisor) => {
    const isGuest = !user; 

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={advisor._id || Math.random()}>
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
                backdropFilter: 'blur(6px)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 16
              }}>
                <LockOutlined style={{ fontSize: 30, color: 'var(--secondary)', marginBottom: 10 }} />
                <Title level={4} style={{ margin: 0 }}>Hidden Profile</Title>
                <Text type="secondary">Login to view details</Text>
                <Button
                  type="primary"
                  shape="round"
                  style={{ marginTop: 15, background: 'var(--primary)', borderColor: 'var(--primary)' }}
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

              <Title level={4} style={{ marginTop: 15, marginBottom: 5, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                {advisor.name}
                {advisor.isVerified && (
                  <CheckCircleFilled style={{ color: '#1890ff', fontSize: 18 }} title="Verified Advisor" />
                )}
              </Title>

              <div style={{ marginBottom: 15 }}>
                <Rate disabled defaultValue={advisor.rating || 4.5} style={{ fontSize: 14 }} />
                <Text type="secondary" style={{ marginLeft: 5 }}>({advisor.reviews || 12})</Text>
              </div>

              <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ padding: '0 10px' }}>
                {advisor.bio || "Hi! I help travelers plan the perfect trip based on their budget and vibe."}
              </Paragraph>

              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 5, marginBottom: 20 }}>
                {(advisor.expertise?.length > 0 ? advisor.expertise : ['Visa', 'Budget', 'Solo']).map((tag, i) => (
                  <Tag key={i} color="blue">{tag}</Tag>
                ))}
              </div>

              <div style={{ background: '#f9f9f9', margin: '-24px -24px 0', padding: 15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Hourly Rate</Text>
                  <Title level={5} style={{ margin: 0, color: 'var(--primary)' }}>₹{advisor.hourlyRate || 499}</Title>
                </div>
                <Button type="primary" icon={<MessageOutlined />} onClick={() => handleHireClick(advisor)}>
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
            // Dummy data if empty
            [1, 2, 3, 4].map(i => renderAdvisorCard({
              _id: i,
              name: `Advisor ${i}`,
              rating: 4.8,
              reviews: 24,
              bio: "Expert in mountain treks and hidden gems.",
              expertise: ["Trekking", "Budget"],
              hourlyRate: 599,
              isVerified: true 
            }))
          )}
        </Row>
      )}

      {/* 👇 NEW BOOKING MODAL (Replaces the old manual one) */}
      <BookingModal 
        visible={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        advisor={selectedAdvisor || {}} 
      />
      
    </div>
  );
};

export default Advisors;