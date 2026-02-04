import React, { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Avatar, Button, Tag, Typography, Spin, Empty, Badge, Rate } from 'antd';
import { SearchOutlined, UserOutlined, CheckCircleFilled, MessageOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;

const FindAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [filteredAdvisors, setFilteredAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. FETCH REAL ADVISORS FROM BACKEND
  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/advisors`);
        const data = await res.json();
        setAdvisors(data);
        setFilteredAdvisors(data);
      } catch (error) {
        console.error("Failed to fetch advisors");
      } finally {
        setLoading(false);
      }
    };
    fetchAdvisors();
  }, []);

  // 2. SEARCH FILTER
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = advisors.filter(advisor => 
      advisor.name.toLowerCase().includes(value) || 
      (advisor.location && advisor.location.toLowerCase().includes(value))
    );
    setFilteredAdvisors(filtered);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto', background: '#f9f9f9', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ textAlign: 'center', marginBottom: 50 }}>
        <Title level={2}>Find Your Travel Guru 🧘‍♂️</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
            Connect with verified experts for Visa, Itinerary, and Local Hacks.
        </Text>
        <br /><br />
        <Input 
          size="large" 
          placeholder="Search by name or location (e.g., 'Goa')" 
          prefix={<SearchOutlined />} 
          style={{ maxWidth: 500, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
          onChange={handleSearch}
        />
      </div>

      {/* ADVISOR GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
      ) : filteredAdvisors.length === 0 ? (
        <Empty description="No advisors found. Be the first!" />
      ) : (
        <Row gutter={[30, 30]}>
          {filteredAdvisors.map(advisor => (
            <Col xs={24} sm={12} md={8} lg={6} key={advisor._id}>
              
              {/* ✨ THE "VERIFIED PRO" BADGE ✨ */}
              <Badge.Ribbon text="Verified Pro" color="gold">
                <Card
                  hoverable
                  style={{ borderRadius: 12, textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
                  bodyStyle={{ padding: '30px 20px' }}
                  actions={[
                    // BOTTOM ACTION BAR
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', alignItems: 'center' }}>
                       <div style={{ textAlign: 'left' }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>Hourly Rate</Text>
                          <div style={{ fontWeight: 'bold', fontSize: 16 }}>₹599</div>
                       </div>
                       <Button 
                            type="primary" 
                            shape="round" 
                            icon={<MessageOutlined />} 
                            style={{ background: '#2f3542', border: 'none' }} 
                            onClick={() => navigate(`/profile/${advisor._id}`)} // 👈 Links to Real Profile!
                        >
                          Hire Now
                       </Button>
                    </div>
                  ]}
                >
                  {/* 1. REAL AVATAR */}
                  <Avatar 
                    size={100} 
                    src={advisor.avatar || "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"} 
                    icon={<UserOutlined />} 
                    style={{ marginBottom: 15, border: '4px solid #f0f2f5' }} 
                  />

                  {/* 2. REAL NAME + BLUE TICK */}
                  <Title level={4} style={{ marginBottom: 5 }}>
                    {advisor.name} <CheckCircleFilled style={{ color: '#1890ff', fontSize: 18 }} />
                  </Title>

                  {/* 3. RATINGS (Static for now) */}
                  <div style={{ marginBottom: 10 }}>
                     <Rate disabled defaultValue={5} style={{ fontSize: 14, color: '#fadb14' }} />
                     <Text type="secondary" style={{ marginLeft: 5 }}>(12)</Text>
                  </div>

                  {/* 4. REAL BIO */}
                  <p style={{ color: '#666', height: 42, overflow: 'hidden', fontSize: 14, lineHeight: '1.4' }}>
                    {advisor.bio || "Expert in local hidden gems & itineraries."}
                  </p>

                  {/* 5. TAGS (Location + Category) */}
                  <div style={{ marginTop: 15 }}>
                    <Tag color="blue">{advisor.location || "Global"}</Tag>
                    <Tag color="cyan">Trekking</Tag>
                  </div>

                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default FindAdvisor;