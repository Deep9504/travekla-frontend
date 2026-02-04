import React, { useState, useEffect } from 'react';
import { Card, Input, Row, Col, Avatar, Button, Tag, Typography, Spin, Empty } from 'antd';
import { SearchOutlined, UserOutlined, EnvironmentOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const { Meta } = Card;
const { Title, Text } = Typography;

const FindAdvisor = () => {
  const [advisors, setAdvisors] = useState([]);
  const [filteredAdvisors, setFilteredAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // 1. FETCH ADVISORS
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

  // 2. SEARCH FUNCTION
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = advisors.filter(advisor => 
      advisor.name.toLowerCase().includes(value) || 
      (advisor.location && advisor.location.toLowerCase().includes(value))
    );
    setFilteredAdvisors(filtered);
  };

  return (
    <div style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* HEADER & SEARCH */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Find Your Local Expert 🌍</Title>
        <Text type="secondary">Connect with verified advisors for your next trip.</Text>
        <br /><br />
        <Input 
          size="large" 
          placeholder="Search by name or location (e.g., 'Goa')" 
          prefix={<SearchOutlined />} 
          style={{ maxWidth: 500 }}
          onChange={handleSearch}
        />
      </div>

      {/* ADVISOR GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>
      ) : filteredAdvisors.length === 0 ? (
        <Empty description="No advisors found matching your search." />
      ) : (
        <Row gutter={[24, 24]}>
          {filteredAdvisors.map(advisor => (
            <Col xs={24} sm={12} md={8} lg={6} key={advisor._id}>
              <Card
                hoverable
                cover={
                  <div style={{ height: 150, background: 'linear-gradient(135deg, #1890ff 0%, #0050b3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Avatar size={100} src={advisor.avatar} icon={<UserOutlined />} style={{ border: '4px solid white' }} />
                  </div>
                }
                actions={[
                    <Button type="link" onClick={() => navigate(`/profile/${advisor._id}`)}>View Profile</Button>
                ]}
              >
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ marginBottom: 5 }}>
                        {advisor.name} <CheckCircleFilled style={{ color: '#1890ff', fontSize: 16 }} />
                    </Title>
                    <Tag color="purple">ADVISOR</Tag>
                    <div style={{ marginTop: 10, color: '#666' }}>
                        <EnvironmentOutlined /> {advisor.location || "Global"}
                    </div>
                    <p style={{ marginTop: 10, color: '#888', height: 40, overflow: 'hidden' }}>
                        {advisor.bio || "Ready to help you plan!"}
                    </p>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default FindAdvisor;