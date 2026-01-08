import React, { useState, useContext, useEffect } from 'react';
import { Row, Col, Input, Typography, Button, Alert, Tag, Carousel, Card, Tabs, Empty } from 'antd';
import { 
  SearchOutlined, RocketOutlined, InfoCircleOutlined, FireOutlined, 
  EnvironmentOutlined, TeamOutlined, SafetyCertificateOutlined, 
  BankOutlined, CrownOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import GroupCard from '../components/group/GroupCard';
import { GroupContext } from '../context/GroupContext'; 
// Ensure this file exists, otherwise remove this import and the 'bestPlaces' logic
import { getBestForSeason } from '../utils/travelLogic'; 

const { Title, Text, Paragraph } = Typography;

// --- MOCK DATA: LIVE ACTIVITY TICKER ---
const liveActivities = [
  "🔥 Rohan just joined 'Mumbai to Goa' trip!",
  "🌿 New trip 'Kerala Backwaters' was just published.",
  "⭐ Sanya reached Level 5 Traveler status!",
  "💰 'Manali Trek' pot size reached ₹3,000."
];

const Home = () => {
  const contextData = useContext(GroupContext);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // If you deleted 'travelLogic.js', remove this line and set bestPlaces = []
  const bestPlaces = getBestForSeason ? getBestForSeason() : ["Goa", "Manali", "Kerala"];

  if (!contextData) return <div style={{ padding: 50, textAlign: 'center' }}>Loading...</div>;
  const { groups } = contextData;

  // --- FILTER LOGIC: SEARCH + CATEGORY ---
  const filteredGroups = groups?.filter(group => {
    // Safety check: ensure fields exist before calling toLowerCase()
    const from = group.from || "";
    const to = group.to || "";
    const desc = group.description || "";

    const matchesSearch = to.toLowerCase().includes(searchText.toLowerCase()) || 
                          from.toLowerCase().includes(searchText.toLowerCase());
    
    // Category matching (Simulated based on description/location keywords)
    const matchesCategory = activeCategory === 'All' ? true : 
                            (desc + to).toLowerCase().includes(activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* 1. HERO SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
        padding: '60px 20px 100px 20px', // Extra padding bottom for overlap
        textAlign: 'center',
        color: 'white',
        borderRadius: '0 0 50px 50px',
        marginBottom: 0,
        position: 'relative'
      }}>
        <Title style={{ color: 'white', fontSize: 'clamp(2rem, 5vw, 3.5rem)', margin: 0 }}>Travekla</Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem' }}>
          Don't just travel. Travel Ekla, together.
        </Text>
        
        {/* SEASONAL ALERT */}
        <div style={{ marginTop: 20, maxWidth: 600, margin: '20px auto' }}>
           <Alert
             message={
               <span>
                 <b>🌿 Best in {new Date().toLocaleString('default', { month: 'long' })}:</b> 
                 {bestPlaces.map(place => (
                    <Tag color="green" key={place} style={{ marginLeft: 5, cursor: 'pointer', border: 'none' }} onClick={() => setSearchText(place)}>
                       {place}
                    </Tag>
                 ))}
               </span>
             }
             type="success"
             showIcon
             style={{ borderRadius: 20, textAlign: 'left', border: 'none', background: 'rgba(255,255,255,0.9)' }}
           />
        </div>

        {/* SEARCH BAR */}
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <Input 
            size="large" 
            placeholder="Search destination (e.g. Goa, Manali)" 
            prefix={<SearchOutlined style={{ color: '#aaa' }} />} 
            style={{ maxWidth: 500, borderRadius: '50px', height: 50, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText} 
          />
        </div>

        {/* CREATE GROUP CTA */}
        <div style={{ marginTop: 20 }}>
            <Link to="/create-group">
                <Button type="dashed" ghost size="large" icon={<RocketOutlined />}>Start Your Own Group</Button>
            </Link>
        </div>
      </div>

      {/* 2. LIVE TICKER & CATEGORIES (Floating Card Effect) */}
      <div style={{ maxWidth: 1000, margin: '-50px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 2 }}>
        <Card style={{ borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.1)', border: 'none' }}>
          
          {/* LIVE TICKER */}
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 10, marginBottom: 15 }}>
            <Tag color="red" style={{ borderRadius: 20 }}><FireOutlined /> LIVE</Tag>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Carousel autoplay dots={false} effect="fade" autoplaySpeed={3000}>
                {liveActivities.map((msg, i) => (
                  <div key={i}><Text strong style={{ marginLeft: 10 }}>{msg}</Text></div>
                ))}
              </Carousel>
            </div>
          </div>

          {/* VISUAL CATEGORIES */}
          <Tabs 
            defaultActiveKey="All" 
            centered
            onChange={setActiveCategory}
            items={[
              { label: <span>🌎 All</span>, key: 'All' },
              { label: <span>🏖️ Beach</span>, key: 'beach' },
              { label: <span>🏔️ Mountains</span>, key: 'trek' },
              { label: <span>🧘 Spiritual</span>, key: 'temple' },
              { label: <span>🏍️ Road Trip</span>, key: 'road' },
            ]}
          />
        </Card>
      </div>

      {/* 3. TRIP GRID (REAL DATA) */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Title level={3} style={{ borderLeft: '4px solid #fa541c', paddingLeft: 10, margin: 0 }}>
            Upcoming Trips
          </Title>
          <Text type="secondary">{filteredGroups?.length || 0} trips found</Text>
        </div>
        
        <Row gutter={[24, 24]}>
          {filteredGroups?.map(group => (
            <Col key={group._id || group.id} xs={24} sm={12} md={8}>
              {/* 👇 UPDATED LINK: Uses _id (MongoDB) instead of id */}
              <Link to={`/group/${group._id || group.id}`}>
                <GroupCard groupData={group} />
              </Link>
            </Col>
          ))}
          
          {filteredGroups?.length === 0 && (
             <Col span={24} style={{ textAlign: 'center', padding: 40 }}>
               <Empty description="No trips found. Be the first to create one!" />
               <Link to="/create-group">
                  <Button type="primary" style={{ marginTop: 10 }}>Create Trip</Button>
               </Link>
             </Col>
          )}
        </Row>
      </div>

      {/* 4. WHY TRAVEKLA (Trust Signals) */}
      <div style={{ background: '#f0f5ff', padding: '60px 20px', marginTop: 40 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2}>Why Travel with Travekla?</Title>
          <Row gutter={[48, 48]} style={{ marginTop: 40 }}>
            <Col xs={24} md={8}>
              <BankOutlined style={{ fontSize: 40, color: '#1890ff' }} />
              <Title level={4}>No-Flake Pot</Title>
              <Paragraph type="secondary">
                We collect a small deposit to ensure your travel buddies don't cancel last minute.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <SafetyCertificateOutlined style={{ fontSize: 40, color: '#52c41a' }} />
              <Title level={4}>Verified & Safe</Title>
              <Paragraph type="secondary">
                ID checks, "Guardian" alerts, and Video KYC ensure you travel with real people.
              </Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <CrownOutlined style={{ fontSize: 40, color: '#faad14' }} />
              <Title level={4}>Vibe Match AI</Title>
              <Paragraph type="secondary">
                Our algorithm matches you with travelers who share your style (Party vs. Zen).
              </Paragraph>
            </Col>
          </Row>
        </div>
      </div>

    </div>
  );
};

export default Home;