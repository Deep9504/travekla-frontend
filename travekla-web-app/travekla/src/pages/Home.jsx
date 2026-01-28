import React, { useState, useEffect, useContext } from 'react';
import { Row, Col, Typography, Button, Input, Card, Carousel, Tag, Empty, Avatar, Spin, Modal, message } from 'antd';
import { 
  SearchOutlined, RocketOutlined, FireOutlined, DeleteOutlined,
  BankOutlined, CrownOutlined, SafetyCertificateOutlined,
  CheckCircleFilled, UserOutlined, ArrowRightOutlined, EnvironmentOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const { Title, Text, Paragraph } = Typography;

// --- MOCK DATA ---
const liveActivities = [
  "🔥 Rohan just joined 'Mumbai to Goa' trip!",
  "🌿 New trip 'Kerala Backwaters' was just published.",
  "⭐ Sanya reached Level 5 Traveler status!",
  "💰 'Manali Trek' pot size reached ₹3,000."
];

const bestPlaces = ["Goa", "Manali", "Kerala", "Ladakh"];

const Home = () => {
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  
  // STATE
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // --- FETCH TRIPS ---
  const fetchTrips = async (search = "") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/trips?search=${search}`);
      const data = await res.json();
      setTrips(data);
    } catch (error) {
      console.error("Failed to fetch trips");
      message.error("Failed to load global feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const normalizeId = (val) => {
    if (!val) return "undefined";
    if (typeof val === 'string') return val;
    if (val._id) return normalizeId(val._id);
    if (val.id) return normalizeId(val.id);
    return String(val);
  };

  // --- HANDLE DELETE TRIP ---
  const handleDelete = async (e, tripId) => {
    e.preventDefault(); // Stop clicking the card link
    e.stopPropagation();

    if(!window.confirm("Are you sure you want to delete this trip?")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        message.success("Trip deleted!");
        fetchTrips(); // Refresh the list instantly
      } else {
        message.error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
     const value = typeof e === 'string' ? e : e.target.value;
     setSearchText(value);
     fetchTrips(value);
  };

  // --- FILTER LOGIC ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredGroups = trips?.filter(group => {
    if (activeCategory === 'All') return true;
    const content = (group.description + " " + group.to + " " + group.from).toLowerCase();
    return content.includes(activeCategory.toLowerCase());
  });

  const upcomingGroups = filteredGroups?.filter(g => new Date(g.date) >= today);
  const pastGroups = filteredGroups?.filter(g => new Date(g.date) < today);

  // --- RENDER CARD ---
  const renderTripCard = (group, isPast = false) => {
    const currentUserId = normalizeId(user);
    const creatorId = normalizeId(group.creator);
    
    const isGuest = !user; 
    const isCreator = !isGuest && (currentUserId === creatorId);
    const isAdmin = user?.role === 'admin';
    const isMember = !isGuest && group.members?.some(m => normalizeId(m) === currentUserId);
    const isAdvisorTrip = group.creator?.role === 'advisor';

    return (
    <Col key={group._id} xs={24} sm={12} lg={8} xl={6}>
        <Card
            hoverable
            style={{ 
                borderRadius: 16, 
                border: '1px solid #e0e0e0', // Added subtle border for contrast
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)', // Stronger shadow
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                opacity: isPast ? 0.7 : 1,
                filter: isPast ? 'grayscale(80%)' : 'none',
            }}
            bodyStyle={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}
            cover={
            <div style={{ 
                height: 180, 
                background: isAdvisorTrip ? 'linear-gradient(135deg, #531dab 0%, #9254de 100%)' : 'linear-gradient(135deg, #003a8c 0%, #1890ff 100%)', // Darker gradients
                position: 'relative', 
                display:'flex', 
                flexDirection: 'column',
                alignItems:'center', 
                justifyContent:'center',
                padding: 20
            }}>
                <h2 style={{color:'white', margin:0, fontSize: 24, fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>
                    {group.to.toUpperCase()}
                </h2>
                <div style={{color:'rgba(255,255,255,0.95)', marginTop: 5, display:'flex', alignItems:'center', fontWeight: 600}}>
                    <EnvironmentOutlined style={{marginRight: 5}}/> {group.from}
                </div>
                
                <Tag color="#fa541c" style={{ position: 'absolute', top: 15, right: 15, borderRadius: 20, padding: '4px 12px', fontWeight: 'bold', fontSize: 14, border:'2px solid white' }}>
                ₹{group.budget || group.price || 0}
                </Tag>

                <Tag color={isAdvisorTrip ? "#22075e" : "#002766"} style={{ position: 'absolute', top: 15, left: 15, borderRadius: 4, border: 'none', fontWeight: 700, color:'white' }}>
                    {isAdvisorTrip ? "🔥 GUIDED" : "🎒 COMMUNITY"}
                </Tag>

                <div style={{ position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.6)', padding: '8px 15px', color:'white', fontSize: 13, display:'flex', justifyContent:'space-between' }}>
                    <span>📅 {new Date(group.date).toLocaleDateString()}</span>
                    <span>{group.capacity || 10} Spots</span>
                </div>

                {(isAdmin || isCreator) && (
                    <Button 
                        danger 
                        shape="circle" 
                        icon={<DeleteOutlined />} 
                        size="small"
                        style={{ position: 'absolute', bottom: 40, right: 15, zIndex: 10 }}
                        onClick={(e) => handleDelete(e, group._id)}
                    />
                )}
            </div>
            }
        >
            <div style={{flex: 1}}>
                <div style={{display:'flex', alignItems:'center', marginBottom: 15}}>
                    <Avatar src={group.creator?.avatar} icon={<UserOutlined />} size={40} style={{border: '1px solid #d9d9d9', backgroundColor: '#f0f0f0'}} />
                    <div style={{marginLeft: 12}}>
                        <Text strong style={{fontSize: 15, display:'block', color:'#262626'}}>{group.creator?.name || "Unknown"}</Text>
                        <Text type="secondary" style={{fontSize: 12}}>Organizer {group.creator?.isVerified && <CheckCircleFilled style={{color:'#1890ff'}}/>}</Text>
                    </div>
                </div>
                <Paragraph ellipsis={{ rows: 2 }} style={{fontSize: 14, marginBottom: 0, color: '#595959'}}>
                    {group.description || "Join us for an amazing adventure to " + group.to + "!"}
                </Paragraph>
            </div>

            {/* 🌟 ACTION BUTTONS (NOW WITH LINKS!) */}
            <div style={{marginTop: 20}}>
                {isPast ? (
                     <Button block disabled style={{borderRadius: 8}}>Trip Finished</Button>
                ) : isCreator ? (
                    <Link to={`/manage-trip/${group._id}`}>
                        <Button block style={{ borderColor: '#faad14', color: '#faad14', fontWeight:'bold', borderRadius: 8 }}>Manage Trip</Button>
                    </Link>
                ) : isMember ? (
                    <Button block type="primary" icon={<CheckCircleFilled />} style={{ background: '#52c41a', borderColor: '#52c41a', borderRadius: 8 }}>Joined</Button>
                ) : (
                    <Link to={`/trip/${group._id}`}>
                        <Button block type="primary" style={{ background: '#262626', borderColor: '#262626', borderRadius: 8, height: 40, fontWeight: 600 }}>
                            View Details <ArrowRightOutlined />
                        </Button>
                    </Link>
                )}
            </div>
        </Card>
    </Col>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}> {/* Slightly darker background */}
      
      {/* 1. HERO SECTION */}
      <div style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '80px 20px 140px 20px', 
        textAlign: 'center',
        position: 'relative',
      }}>
        {/* DARKER Overlay for Better Contrast */}
        <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.65)'}}></div>

        <div style={{position: 'relative', zIndex: 2}}>
            <Title style={{ color: 'white', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', margin: 0, fontWeight: 800, letterSpacing: 1 }}>
                Find Your Tribe.
            </Title>
            <Text style={{ color: 'rgba(255,255,255,0.95)', fontSize: '1.5rem', display:'block', marginTop: 10, fontWeight: 500 }}>
              Don't travel solo. Travel <span style={{fontWeight:'800', color:'#fa541c', textDecoration:'underline'}}>Ekla</span>, together.
            </Text>
            
            <div style={{ marginTop: 30 }}>
                <Link to="/create-trip">
                    <Button type="primary" size="large" icon={<RocketOutlined />} style={{ height: 52, padding: '0 45px', fontSize: 18, borderRadius: 30, background: '#fa541c', borderColor: '#fa541c', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(250, 84, 28, 0.4)' }}>
                        Create a Trip
                    </Button>
                </Link>
            </div>
        </div>
      </div>

      {/* 2. FLOATING SEARCH BOX (High Contrast) */}
      <div style={{ maxWidth: 900, margin: '-50px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 5 }}>
        <Card style={{ borderRadius: 16, boxShadow: '0 15px 40px rgba(0,0,0,0.15)', border: 'none' }} bodyStyle={{padding: '25px 30px'}}>
          
          <Input 
            size="large" 
            placeholder="Search destination (e.g. Goa, Manali)" 
            prefix={<SearchOutlined style={{color: '#262626', fontSize: 20, fontWeight: 'bold'}} />}
            value={searchText}
            onChange={handleSearch}
            style={{ borderRadius: 8, background: '#f0f2f5', border: '1px solid #d9d9d9', padding: '12px 20px', fontSize: 16, color: '#262626' }}
          />

          <div style={{ marginTop: 15, display:'flex', gap: 10, flexWrap: 'wrap', alignItems:'center' }}>
            <Text strong style={{color: '#262626'}}><FireOutlined style={{color: '#fa541c'}}/> Trending:</Text>
            {bestPlaces.map(place => (
                <Tag key={place} style={{ cursor: 'pointer', borderRadius: 6, border: '1px solid #ffbb96', background: '#fff2e8', color: '#d4380d', padding: '4px 12px', fontWeight: 600 }} onClick={() => handleSearch(place)}>
                    {place}
                </Tag>
            ))}
          </div>
        </Card>
      </div>

      {/* 3. LIVE TICKER (High Visibility Dark Bar) */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
         <div style={{ 
             background: '#262626', // Dark background
             color: 'white', 
             borderRadius: 8, 
             padding: '12px 20px', 
             marginBottom: 40,
             display: 'flex',
             alignItems: 'center',
             boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
         }}>
            <Tag color="#f5222d" style={{borderRadius: 4, marginRight: 15, fontWeight: 'bold', padding: '2px 10px', border:'none'}}>🔴 LIVE NOW</Tag>
            <div style={{flex: 1, overflow:'hidden'}}>
                <Carousel autoplay dots={false} effect="fade" autoplaySpeed={3000} style={{width: '100%'}}>
                    {liveActivities.map((msg, i) => (
                        <div key={i}><Text style={{color: 'white', fontSize: 15, fontWeight: 500}}>{msg}</Text></div>
                    ))}
                </Carousel>
            </div>
         </div>

        {/* Categories */}
        <div style={{textAlign:'center', marginBottom: 30}}>
             {['All', 'Beach', 'Trek', 'Temple', 'Road'].map(cat => (
                 <Button 
                    key={cat}
                    shape="round" 
                    size="large"
                    type={activeCategory === (cat === 'All' ? 'All' : cat.toLowerCase()) ? 'primary' : 'text'}
                    onClick={() => setActiveCategory(cat === 'All' ? 'All' : cat.toLowerCase())}
                    style={{ margin: '0 5px', fontWeight: 600, color: activeCategory === (cat === 'All' ? 'All' : cat.toLowerCase()) ? 'white' : '#595959' }}
                 >
                    {cat}
                 </Button>
             ))}
        </div>
      </div>

      {/* 4. TRIP GRID */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }}>
        {loading ? (
             <div style={{textAlign:'center', padding: 50}}><Spin size="large" tip="Loading trips..." /></div>
        ) : (
            <>
                <Title level={3} style={{marginBottom: 20, color: '#262626'}}>🚀 Upcoming Adventures</Title>
                <Row gutter={[24, 24]}>
                    {upcomingGroups?.length > 0 ? upcomingGroups.map(g => renderTripCard(g, false)) : (
                        <Col span={24}><Empty description="No trips found matching your search." /></Col>
                    )}
                </Row>

                {pastGroups?.length > 0 && (
                    <>
                        <Title level={3} style={{marginTop: 60, marginBottom: 20, color: '#8c8c8c'}}>🏁 Past Trips</Title>
                        <Row gutter={[24, 24]}>
                            {pastGroups.map(g => renderTripCard(g, true))}
                        </Row>
                    </>
                )}
            </>
        )}
      </div>

      {/* 5. WHY TRAVEKLA */}
      <div style={{ background: 'white', padding: '80px 20px', borderTop: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <Title level={2} style={{ marginBottom: 50, color: '#262626' }}>Why Travel with Us?</Title>
          <Row gutter={[32, 32]}>
            {[
                { icon: <BankOutlined />, color: '#1890ff', title: 'No-Flake Pot', desc: 'Secure deposits ensure no last-minute cancellations.' },
                { icon: <SafetyCertificateOutlined />, color: '#52c41a', title: 'Verified & Safe', desc: 'ID checks & Video KYC for 100% real travelers.' },
                { icon: <CrownOutlined />, color: '#faad14', title: 'Vibe Match', desc: 'Find people who match your energy.' }
            ].map((feature, i) => (
                <Col xs={24} md={8} key={i}>
                    <Card hoverable style={{ border: '1px solid #f0f0f0', boxShadow: 'none', borderRadius: 16, height: '100%' }}>
                        <div style={{ fontSize: 40, color: feature.color, marginBottom: 15 }}>{feature.icon}</div>
                        <Title level={4} style={{color: '#262626'}}>{feature.title}</Title>
                        <Paragraph type="secondary">{feature.desc}</Paragraph>
                    </Card>
                </Col>
            ))}
          </Row>
        </div>
      </div>

    </div>
  );
};

export default Home;