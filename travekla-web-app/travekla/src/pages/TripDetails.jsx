import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Row, Col, Typography, Button, Card, Tag, Avatar, Timeline, 
  message, Spin, Divider, Affix, Space 
} from 'antd';
import { 
  ClockCircleOutlined, TeamOutlined, EnvironmentOutlined, 
  CheckCircleFilled, UserOutlined, ArrowLeftOutlined, 
  SafetyCertificateOutlined, HeartFilled, ShareAltOutlined,
  ClockCircleFilled // 👈 Imported this icon
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;

const TripDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);

  // --- FETCH TRIP DETAILS ---
  const fetchTrip = async () => {
    try {
      const res = await fetch(`https://travekla-web-app.onrender.com/api/trips`); 
      const data = await res.json();
      const foundTrip = data.find(t => t._id === id);
      
      if (foundTrip) {
          setTrip(foundTrip);
      } else {
          message.error("Trip not found");
      }
    } catch (error) {
      console.error("Error fetching trip:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  // --- JOIN LOGIC ---
  const handleJoin = async () => {
      if(!user) {
          message.warning("Please login to join this trip!");
          return;
      }

      setJoinLoading(true);

      try {
          const res = await fetch(`https://travekla-web-app.onrender.com/api/trips/${id}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user._id })
          });
          
          const data = await res.json();

          if (res.ok) {
              message.success("Request sent successfully! 📩");
              fetchTrip(); // Refresh to update button
          } else {
              message.warning(data.message || "Failed to join");
          }
      } catch (error) {
          console.error(error);
          message.error("Connection Failed. Is Server Running?");
      } finally {
          setJoinLoading(false);
      }
  };

  if (loading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" tip="Loading Adventure..." /></div>;
  
  if (!trip) return (
      <div style={{textAlign:'center', marginTop: 100}}>
          <h2>Trip not found</h2>
          <Link to="/"><Button>Go Home</Button></Link>
      </div>
  );

  // --- 🛡️ ULTRA-SAFE DATA HANDLING ---
  const creator = trip.creator || {}; 
  const isAdvisor = creator.role === 'advisor';
  const userId = user?._id ? user._id.toString() : "";
  
  // 1. IS MEMBER?
  const isMember = Array.isArray(trip.members) && trip.members.some(member => {
      if (!member) return false;
      const mId = typeof member === 'object' && member._id ? member._id.toString() : member.toString();
      return mId === userId;
  });

  // 2. IS PENDING? (New Check!)
  const isPending = Array.isArray(trip.joinRequests) && trip.joinRequests.some(req => {
      if (!req) return false;
      const rId = typeof req === 'object' && req._id ? req._id.toString() : req.toString();
      return rId === userId;
  });

  const isCreator = (creator._id === user?._id) || (trip.creator === user?._id);

  const bgImage = isAdvisor 
    ? "https://images.unsplash.com/photo-1518182170546-0766aa6f6914?q=80&w=2000&auto=format&fit=crop" 
    : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2000&auto=format&fit=crop";

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* HERO HEADER */}
      <div style={{ 
          height: 400, 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
      }}>
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.8) 100%)'}}></div>
          
          <div style={{position:'absolute', top: 20, left: 20, zIndex: 10}}>
            <Link to="/">
                <Button shape="circle" icon={<ArrowLeftOutlined />} size="large" style={{background: 'rgba(255,255,255,0.2)', border:'none', color:'white'}} />
            </Link>
          </div>

          <div style={{position:'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, padding: '0 20px'}}>
             <Tag color={isAdvisor ? "#722ed1" : "#1890ff"} style={{border:'none', padding: '5px 15px', fontSize: 14, fontWeight:'bold', marginBottom: 10}}>
                {isAdvisor ? "🔥 GUIDED TOUR" : "🎒 COMMUNITY TRIP"}
             </Tag>
             <Title style={{color:'white', margin: 0, fontSize: 'clamp(2rem, 5vw, 3.5rem)', textShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                {trip.to ? trip.to.toUpperCase() : "UNKNOWN"}
             </Title>
             <Text style={{color:'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: 500}}>
                 <EnvironmentOutlined /> Starting from {trip.from} • {trip.date ? new Date(trip.date).toLocaleDateString() : "Date TBA"}
             </Text>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        <Row gutter={[40, 40]}>
            
            {/* LEFT COLUMN */}
            <Col xs={24} md={16}>
                <Card style={{borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 30}}>
                    <Row gutter={[16, 16]} justify="space-around" style={{textAlign:'center'}}>
                        <Col span={6}>
                            <ClockCircleOutlined style={{fontSize: 24, color: '#fa541c'}} />
                            <div style={{fontWeight:'bold', marginTop: 5}}>3 Days</div>
                            <Text type="secondary" style={{fontSize: 12}}>Duration</Text>
                        </Col>
                        <Col span={6}>
                            <TeamOutlined style={{fontSize: 24, color: '#1890ff'}} />
                            <div style={{fontWeight:'bold', marginTop: 5}}>{trip.capacity || 10} Spots</div>
                            <Text type="secondary" style={{fontSize: 12}}>Group Size</Text>
                        </Col>
                        <Col span={6}>
                            <SafetyCertificateOutlined style={{fontSize: 24, color: '#52c41a'}} />
                            <div style={{fontWeight:'bold', marginTop: 5}}>Verified</div>
                            <Text type="secondary" style={{fontSize: 12}}>Organizer</Text>
                        </Col>
                    </Row>
                </Card>

                <div style={{marginBottom: 40}}>
                    <Title level={3}>About this Trip</Title>
                    <Paragraph style={{fontSize: 16, lineHeight: 1.8, color: '#595959'}}>
                        {trip.description || "No description provided."}
                    </Paragraph>
                </div>

                <div style={{marginBottom: 40}}>
                    <Title level={3}>Itinerary</Title>
                    <Card style={{borderRadius: 16, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}}>
                        <Timeline mode="left" style={{marginTop: 20}}>
                            {trip.itinerary && trip.itinerary.length > 0 ? (
                                trip.itinerary.map((item, index) => (
                                    <Timeline.Item key={index} label={<span style={{fontWeight:'bold'}}>Day {item.day}</span>}>
                                        <Text strong style={{fontSize: 16}}>{item.activity}</Text>
                                    </Timeline.Item>
                                ))
                            ) : (
                                <Timeline.Item color="gray">No itinerary added yet.</Timeline.Item>
                            )}
                        </Timeline>
                    </Card>
                </div>
            </Col>

            {/* RIGHT COLUMN */}
            <Col xs={24} md={8}>
                <Affix offsetTop={100}>
                    <Card style={{borderRadius: 16, border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', overflow:'hidden'}}>
                        <div style={{background: '#f5f5f5', padding: 20, textAlign:'center', borderBottom:'1px solid #f0f0f0'}}>
                            <Text type="secondary">Total Price Per Person</Text>
                            <Title level={2} style={{margin:0, color: '#fa541c'}}>₹{trip.budget || 0}</Title>
                        </div>
                        
                        <div style={{padding: 20, textAlign:'center'}}>
                            <Space align="center" style={{marginBottom: 20}}>
                                <Avatar size={64} src={creator.avatar} icon={<UserOutlined />} style={{border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} />
                                <div style={{textAlign:'left'}}>
                                    <div style={{fontWeight:'bold', fontSize: 16}}>{creator.name || "Unknown"}</div>
                                    <Tag color="blue" style={{borderRadius: 10}}>{isAdvisor ? "Expert Guide" : "Trip Host"}</Tag>
                                </div>
                            </Space>

                            {/* SMART BUTTON LOGIC */}
                            {isCreator ? (
                                <Link to={`/manage-trip/${id}`}>
                                    <Button block size="large" style={{height: 50, fontSize: 16, fontWeight:'bold', borderColor:'#faad14', color:'#faad14'}}>
                                        Manage Your Trip
                                    </Button>
                                </Link>
                            ) : isMember ? (
                                <Button block type="primary" size="large" style={{height: 50, fontSize: 16, background: '#52c41a', borderColor: '#52c41a'}} icon={<CheckCircleFilled />}>
                                    Already Joined
                                </Button>
                            ) : isPending ? (
                                /* 🚀 SHOW PENDING STATE */
                                <Button block size="large" disabled style={{height: 50, fontSize: 16, fontWeight: 'bold', background: '#f0f2f5', color: '#faad14', borderColor: '#d9d9d9'}} icon={<ClockCircleFilled />}>
                                    Approval Pending
                                </Button>
                            ) : (
                                <Button 
                                    type="primary" 
                                    size="large" 
                                    block 
                                    loading={joinLoading}
                                    onClick={handleJoin} 
                                    style={{height: 50, fontSize: 18, background: '#fa541c', borderColor: '#fa541c', boxShadow: '0 4px 15px rgba(250, 84, 28, 0.4)'}}
                                >
                                    Request to Join
                                </Button>
                            )}

                            <div style={{marginTop: 15, display:'flex', justifyContent:'center', gap: 10}}>
                                <Button shape="circle" icon={<HeartFilled />} />
                                <Button shape="circle" icon={<ShareAltOutlined />} />
                            </div>

                            <Divider />
                            <div style={{fontSize: 12, color: '#8c8c8c'}}>
                                <SafetyCertificateOutlined style={{color: '#52c41a'}} /> Secure Payment
                            </div>
                        </div>
                    </Card>
                </Affix>
            </Col>

        </Row>
      </div>
    </div>
  );
};

export default TripDetails;