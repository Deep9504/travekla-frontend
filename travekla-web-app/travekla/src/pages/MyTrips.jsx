import React, { useState, useEffect, useContext } from 'react';
import { Layout, Typography, Card, Tabs, List, Tag, Button, Spin, Avatar, Empty, Row, Col } from 'antd';
import { 
  RocketOutlined, CheckCircleOutlined, ClockCircleOutlined, 
  CalendarOutlined, UserOutlined, MessageOutlined, SettingOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const MyTrips = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [hosting, setHosting] = useState([]);
  const [joined, setJoined] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState("1"); 

  useEffect(() => {
    if (user && user._id) {
        setLoading(true);
        fetchAllMyTrips();
    } else if (user === null) {
        setLoading(false);
    }
  }, [user]);

  const fetchAllMyTrips = async () => {
    try {
      const resHost = await fetch(`${API_BASE_URL}/trips/my-trips/${user._id}`);
      const dataHost = await resHost.json();
      const hostTrips = Array.isArray(dataHost) ? dataHost : [];
      setHosting(hostTrips);

      const resBooked = await fetch(`${API_BASE_URL}/trips/booked-trips/${user._id}`);
      const dataBooked = await resBooked.json();

      let joinedTrips = [];
      let pendingTrips = [];

      if(Array.isArray(dataBooked)) {
          dataBooked.forEach(trip => {
            const isMember = trip.members.some(m => {
                const id = typeof m === 'object' ? m._id : m;
                return id === user._id;
            });
            if (isMember) joinedTrips.push(trip);
            else pendingTrips.push(trip);
          });
          setJoined(joinedTrips);
          setPending(pendingTrips);
      }

      if (joinedTrips.length > 0) setActiveTab("1");
      else if (pendingTrips.length > 0) setActiveTab("2");
      else if (hostTrips.length > 0) setActiveTab("3");

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

            {/* 🌟 HOSTING ACTIONS (Updated) */}
            {type === 'hosting' ? (
                 <Row gutter={8}>
                    <Col span={12}>
                        <Link to={`/manage-trip/${trip._id}`}>
                            <Button block icon={<SettingOutlined />} style={{borderColor:'#722ed1', color:'#722ed1'}}>Manage</Button>
                        </Link>
                    </Col>
                    <Col span={12}>
                        {/* 🆕 This Button takes you to the Chat! */}
                        <Link to={`/trip/${trip._id}`}>
                            <Button block type="primary" icon={<MessageOutlined />} style={{background:'#722ed1', borderColor:'#722ed1'}}>Chat</Button>
                        </Link>
                    </Col>
                 </Row>
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

  if (!user && !loading) return <div style={{textAlign:'center', marginTop: 100}}><Spin size="large" /></div>;
  if (loading) return <div style={{textAlign:'center', marginTop: 100}}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <Title level={2}>My Adventures 🌍</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large" style={{marginTop: 30}}>
        <TabPane tab={<span><CheckCircleOutlined /> Confirmed ({joined.length})</span>} key="1">
            {renderTripList(joined, 'joined')}
        </TabPane>
        <TabPane tab={<span><ClockCircleOutlined /> Pending Requests ({pending.length})</span>} key="2">
            {renderTripList(pending, 'pending')}
        </TabPane>
        <TabPane tab={<span><RocketOutlined /> Hosting ({hosting.length})</span>} key="3">
            {renderTripList(hosting, 'hosting')}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default MyTrips;