import React, { useState, useEffect, useContext } from 'react';
import { Layout, Typography, Card, Tabs, List, Tag, Button, Spin, Avatar, Empty, Row, Col } from 'antd';
import { 
  RocketOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CalendarOutlined, UserOutlined, ArrowRightOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MyTrips = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate(); // Hook to redirect
  
  const [hosting, setHosting] = useState([]);
  const [joined, setJoined] = useState([]);
  const [pending, setPending] = useState([]);
  
  // 🌟 FIX: If user is missing, don't get stuck loading forever
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    if (user) {
        setLoading(true); // Start loading ONLY when we have a user
        fetchAllMyTrips();
    } else {
        // If no user after 1 second, stop loading (Safety Check)
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchAllMyTrips = async () => {
    try {
      // 1. Fetch Trips I Created (Hosting)
      const resHost = await fetch(`http://localhost:5000/api/trips/my-trips/${user._id}`);
      const dataHost = await resHost.json();
      setHosting(Array.isArray(dataHost) ? dataHost : []);

      // 2. Fetch Trips I Joined/Requested (Traveling)
      const resBooked = await fetch(`http://localhost:5000/api/trips/booked-trips/${user._id}`);
      const dataBooked = await resBooked.json();

      if(Array.isArray(dataBooked)) {
          const joinedTrips = [];
          const pendingTrips = [];

          dataBooked.forEach(trip => {
            // Check if I am in the members list
            // Handle both Object IDs and String IDs safely
            const isMember = trip.members.some(m => {
                const id = typeof m === 'object' ? m._id : m;
                return id === user._id;
            });

            if (isMember) {
                joinedTrips.push(trip);
            } else {
                pendingTrips.push(trip);
            }
          });

          setJoined(joinedTrips);
          setPending(pendingTrips);
      }

    } catch (error) {
      console.error("Error loading trips:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- REUSABLE TRIP CARD ---
  const renderTripList = (trips, type) => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3 }}
      dataSource={trips}
      locale={{ emptyText: <Empty description="No trips found here" /> }}
      renderItem={trip => (
        <List.Item>
          <Card 
            hoverable 
            style={{borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0'}}
            cover={
                <div style={{height: 120, background: type === 'hosting' ? '#722ed1' : '#096dd9', padding: 20, color: 'white'}}>
                    <Title level={4} style={{color:'white', margin:0}}>{trip.to}</Title>
                    <Text style={{color:'rgba(255,255,255,0.8)'}}>From {trip.from}</Text>
                </div>
            }
          >
            <div style={{display:'flex', justifyContent:'space-between', marginBottom: 15}}>
                <span><CalendarOutlined /> {new Date(trip.date).toLocaleDateString()}</span>
                <Tag color={type === 'pending' ? 'orange' : type === 'hosting' ? 'purple' : 'green'}>
                    {type.toUpperCase()}
                </Tag>
            </div>
            
            {type !== 'hosting' && (
                <div style={{display:'flex', alignItems:'center', marginBottom: 15}}>
                    <Avatar size="small" src={trip.creator?.avatar} icon={<UserOutlined />} />
                    <Text type="secondary" style={{marginLeft: 8, fontSize: 12}}>Hosted by {trip.creator?.name}</Text>
                </div>
            )}

            {type === 'hosting' ? (
                 <Link to={`/manage-trip/${trip._id}`}>
                    <Button block style={{borderColor:'#722ed1', color:'#722ed1'}}>Manage Trip</Button>
                 </Link>
            ) : (
                 <Link to={`/trip/${trip._id}`}>
                    <Button block type={type === 'joined' ? "primary" : "default"}>
                        {type === 'joined' ? "View Ticket" : "Check Status"}
                    </Button>
                 </Link>
            )}
          </Card>
        </List.Item>
      )}
    />
  );

  // 🛑 IF NOT LOGGED IN SHOW LOGIN BUTTON
  if (!user && !loading) {
      return (
          <div style={{textAlign:'center', marginTop: 100}}>
              <h2>Please Login to see your trips 🔒</h2>
              <Link to="/login"><Button type="primary" size="large">Login Now</Button></Link>
          </div>
      );
  }

  if (loading) return <div style={{textAlign:'center', marginTop: 100}}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <Title level={2}>My Adventures 🌍</Title>
      
      <Tabs defaultActiveKey="1" type="card" size="large" style={{marginTop: 30}}>
        
        {/* TAB 1: JOINED (Confirmed Trips) */}
        <TabPane tab={<span><CheckCircleOutlined /> Confirmed ({joined.length})</span>} key="1">
            {renderTripList(joined, 'joined')}
        </TabPane>

        {/* TAB 2: PENDING (Waiting List) */}
        <TabPane tab={<span><ClockCircleOutlined /> Pending Requests ({pending.length})</span>} key="2">
            {renderTripList(pending, 'pending')}
        </TabPane>

        {/* TAB 3: HOSTING (My Created Trips) */}
        <TabPane tab={<span><RocketOutlined /> Hosting ({hosting.length})</span>} key="3">
            {renderTripList(hosting, 'hosting')}
        </TabPane>

      </Tabs>
    </div>
  );
};

export default MyTrips;