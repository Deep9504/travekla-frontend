import React, { useState, useContext } from 'react';
import { Row, Col, Typography, Button, Input, Card, Carousel, Tabs, Tag, Alert, Empty, Avatar, Progress, Modal, message } from 'antd';
import { 
  SearchOutlined, RocketOutlined, FireOutlined, DeleteOutlined,
  BankOutlined, CrownOutlined, SafetyCertificateOutlined,
  CalendarOutlined, TeamOutlined, CheckCircleFilled, SettingOutlined, ClockCircleOutlined, HistoryOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { GroupContext } from '../context/GroupContext'; 
import { AuthContext } from '../context/AuthContext'; 
import { getBestForSeason } from '../utils/travelLogic'; // Optional: keep if you have it

const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;
const { Search } = Input;

// --- MOCK DATA: LIVE ACTIVITY TICKER ---
const liveActivities = [
  "🔥 Rohan just joined 'Mumbai to Goa' trip!",
  "🌿 New trip 'Kerala Backwaters' was just published.",
  "⭐ Sanya reached Level 5 Traveler status!",
  "💰 'Manali Trek' pot size reached ₹3,000."
];

const Home = () => {
  const { groups, loading, searchGroups, deleteGroup } = useContext(GroupContext); 
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Safe fallback if utility function is missing
  const bestPlaces = typeof getBestForSeason === 'function' ? getBestForSeason() : ["Goa", "Manali", "Kerala"];

  // --- HELPER: Normalize IDs (Prevents ID mismatch bugs) ---
  const normalizeId = (val) => {
    if (!val) return "undefined";
    if (typeof val === 'string') return val;
    if (val._id) return normalizeId(val._id);
    if (val.id) return normalizeId(val.id);
    return String(val);
  };

  // --- DELETE HANDLER (Admin/Creator) ---
  const handleDelete = (e, groupId) => {
    e.stopPropagation(); // Stop click from opening the trip details
    Modal.confirm({
      title: 'Delete this trip?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      onOk: async () => {
        if (deleteGroup) {
             const res = await deleteGroup(groupId);
             if(res.success) message.success("Trip deleted successfully");
             else message.error("Failed to delete trip");
        } else {
             message.error("Delete function not connected yet");
        }
      }
    });
  };

  // 1. HANDLE SEARCH
  const handleSearch = (value) => {
    searchGroups(value);
  };

  const onInputChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (value === "") searchGroups(""); 
  };

  // --- FILTER & SPLIT LOGIC ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight for accurate comparison

  // 1. Filter by Search & Category
  const filteredGroups = groups?.filter(group => {
    if (activeCategory === 'All') return true;
    const content = (group.description + " " + group.to + " " + group.from).toLowerCase();
    return content.includes(activeCategory.toLowerCase());
  });

  // 2. Split into Upcoming vs Past
  const upcomingGroups = filteredGroups?.filter(g => new Date(g.date) >= today);
  const pastGroups = filteredGroups?.filter(g => new Date(g.date) < today);

  // --- RENDER CARD FUNCTION ---
  const renderTripCard = (group, isPast = false) => {
    // --- 🔒 CARD STATUS LOGIC ---
    const currentUserId = normalizeId(user);
    const creatorId = normalizeId(group.creator?.id || group.creator);
    
    // 1. IS GUEST? (Not Logged In)
    const isGuest = !user; 

    // 2. IS CREATOR?
    const isCreator = !isGuest && (currentUserId === creatorId);
    
    // 3. IS ADMIN?
    const isAdmin = user?.role === 'admin';

    // 4. IS MEMBER?
    const isMember = !isGuest && group.members?.some(m => normalizeId(m) === currentUserId);
    
    // 5. IS PENDING?
    const isPending = !isGuest && group.pendingMembers?.some(m => normalizeId(m) === currentUserId);
    
    // 6. IS FULL?
    const isFull = (group.members?.length || 0) >= group.capacity;

    return (
    <Col key={group._id || group.id} xs={24} sm={12} md={8}>
        <Card
            hoverable
            style={{ 
                borderRadius: 12, 
                overflow: 'hidden', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                height: '100%',
                opacity: isPast ? 0.7 : 1, // 👈 Fade out past trips
                filter: isPast ? 'grayscale(80%)' : 'none' // 👈 Greyscale past trips
            }}
            cover={
            <div style={{ height: 200, background: '#f0f0f0', position: 'relative' }}>
                <img 
                alt={group.to} 
                src={group.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
                
                {/* PRICE TAG */}
                <Tag color="#fa541c" style={{ position: 'absolute', top: 15, right: 15, borderRadius: 20, border: 'none', padding: '2px 10px', fontWeight: 'bold' }}>
                ₹{group.price || 5000}
                </Tag>

                {/* 🗑️ ADMIN DELETE BUTTON (Only if Admin or Creator) */}
                {(isAdmin || isCreator) && (
                    <Button 
                        danger 
                        shape="circle" 
                        icon={<DeleteOutlined />} 
                        style={{ position: 'absolute', top: 15, left: 15, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', zIndex: 10 }}
                        onClick={(e) => handleDelete(e, group._id || group.id)}
                    />
                )}

                {/* PAST TRIP OVERLAY */}
                {isPast && (
                    <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '5px 10px', textAlign: 'center', fontWeight: 'bold' }}>
                        COMPLETED
                    </div>
                )}
            </div>
            }
            actions={[
            // --- BUTTON LOGIC START ---
            isPast ? (
                <Button type="text" icon={<HistoryOutlined />} disabled>Finished</Button>
            ) : isCreator ? (
                // 👇 FIX: Redirect Creator to DETAILS PAGE (so they can see Chat/Gallery)
                <Button type="text" style={{ color: '#faad14', fontWeight: 'bold' }} onClick={() => navigate(`/group/${group._id || group.id}`)}>
                    View Trip ➜
                </Button>
            ) : isMember ? (
                <Button type="text" icon={<CheckCircleFilled />} style={{ color: 'green' }} onClick={() => navigate(`/group/${group._id || group.id}`)}>
                    Joined
                </Button>
            ) : isPending ? (
                <Button type="text" icon={<ClockCircleOutlined />} style={{ color: 'orange' }} disabled>
                    Requested
                </Button>
            ) : isFull ? (
                    <Button type="text" disabled>Full</Button>
            ) : (
                <Button type="primary" ghost style={{ borderColor: '#fa541c', color: '#fa541c' }} onClick={() => navigate(`/group/${group._id || group.id}`)}>
                    View Details
                </Button>
            )
            // --- BUTTON LOGIC END ---
            ]}
        >
            <Meta
            avatar={<Avatar src={group.creator?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=creator"} />}
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{group.to}</span>
                    <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
                        <TeamOutlined /> {group.members?.length || 0}/{group.capacity}
                    </span>
                </div>
            }
            description={
                <div>
                    <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <CalendarOutlined /> {new Date(group.date || Date.now()).toLocaleDateString()}
                    </div>
                    <Progress percent={Math.round(((group.members?.length || 0) / group.capacity) * 100)} size="small" showInfo={false} strokeColor={isPast ? "#bfbfbf" : "#fa541c"} />
                </div>
            }
            />
        </Card>
    </Col>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #fa541c 0%, #ffbb96 100%)', // Travekla Orange Theme
        padding: '60px 20px 100px 20px', 
        textAlign: 'center',
        color: 'white',
        borderRadius: '0 0 50px 50px',
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
                    <Tag 
                        color="green" 
                        key={place} 
                        style={{ marginLeft: 5, cursor: 'pointer', border: 'none' }} 
                        onClick={() => { setSearchText(place); searchGroups(place); }}
                    >
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
          <Search 
            placeholder="Search destination (e.g. Goa, Manali)" 
            allowClear
            enterButton="Search"
            size="large"
            onSearch={handleSearch}
            onChange={onInputChange}
            value={searchText}
            style={{ maxWidth: 500 }}
          />
        </div>

        {/* CREATE GROUP CTA */}
        <div style={{ marginTop: 20 }}>
            <Link to="/create-group">
                <Button type="dashed" ghost size="large" icon={<RocketOutlined />}>Start Your Own Group</Button>
            </Link>
        </div>
      </div>

      {/* 2. LIVE TICKER & CATEGORIES */}
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

      {/* 3. TRIP GRID (SPLIT INTO UPCOMING & PAST) */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 40px' }}>
        
        {loading ? (
             <div style={{textAlign: 'center', padding: 50}}>Loading trips...</div>
        ) : (
            /* TABS FOR UPCOMING VS FINISHED */
            <Tabs defaultActiveKey="upcoming" centered items={[
                {
                    key: 'upcoming',
                    label: <span style={{fontSize: 16}}>🚀 Upcoming ({upcomingGroups?.length || 0})</span>,
                    children: (
                        <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                            {upcomingGroups?.length > 0 ? upcomingGroups.map(g => renderTripCard(g, false)) : (
                                <Col span={24} style={{ textAlign: 'center', padding: 40 }}>
                                    <Empty description="No upcoming trips found." />
                                    <Button onClick={() => { setSearchText(""); searchGroups(""); }}>Clear Search</Button>
                                </Col>
                            )}
                        </Row>
                    )
                },
                {
                    key: 'past',
                    label: <span style={{fontSize: 16}}>🏁 Finished Trips ({pastGroups?.length || 0})</span>,
                    children: (
                        <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                            {pastGroups?.length > 0 ? pastGroups.map(g => renderTripCard(g, true)) : <Empty description="No history yet" />}
                        </Row>
                    )
                }
            ]} />
        )}
      </div>

      {/* 4. WHY TRAVEKLA */}
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