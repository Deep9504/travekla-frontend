import React, { useContext, useEffect, useState } from 'react';
import { Card, Avatar, Typography, Tabs, Row, Col, Button, Tag, Empty, Spin } from 'antd';
import { UserOutlined, LogoutOutlined, RocketOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { GroupContext } from '../context/GroupContext';
import { Link, useNavigate } from 'react-router-dom';
import GroupCard from '../components/group/GroupCard';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const { getUserTrips, getJoinedTrips } = useContext(GroupContext);
  const navigate = useNavigate();

  const [myTrips, setMyTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Fetch Data on Load
  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const created = await getUserTrips(user.id || user._id);
        const joined = await getJoinedTrips(user.id || user._id);
        setMyTrips(created);
        setJoinedTrips(joined);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]); // Run whenever 'user' changes

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      
      {/* 1. PROFILE HEADER */}
      <Card style={{ borderRadius: 16, marginBottom: 30, background: 'linear-gradient(to right, #ffffff, #f0f2f5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <Avatar size={100} src={user.avatar} icon={<UserOutlined />} style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          
          <div style={{ flex: 1 }}>
            <Title level={2} style={{ marginBottom: 0 }}>{user.name}</Title>
            <Text type="secondary" style={{ fontSize: 16 }}>{user.email}</Text>
            <div style={{ marginTop: 10 }}>
              <Tag color="blue">{user.role.toUpperCase()}</Tag>
              <Tag color="gold">Level 1 Traveler</Tag>
            </div>
          </div>

          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </Card>

      {/* 2. TABS: CREATED vs JOINED */}
      <Tabs 
        defaultActiveKey="1" 
        size="large"
        items={[
          // TAB 1: TRIPS I JOINED
          {
            key: '1',
            label: <span><EnvironmentOutlined /> Trips I Joined ({joinedTrips.length})</span>,
            children: loading ? <Spin /> : (
              <Row gutter={[24, 24]}>
                {joinedTrips.length === 0 ? (
                  <Col span={24}><Empty description="You haven't joined any trips yet." /></Col>
                ) : (
                  joinedTrips.map(group => (
                    <Col xs={24} sm={12} md={8} key={group._id}>
                      <Link to={`/group/${group._id}`}>
                        <GroupCard groupData={group} />
                      </Link>
                    </Col>
                  ))
                )}
              </Row>
            )
          },
          // TAB 2: TRIPS I CREATED
          {
            key: '2',
            label: <span><RocketOutlined /> Trips I Created ({myTrips.length})</span>,
            children: loading ? <Spin /> : (
              <Row gutter={[24, 24]}>
                {myTrips.length === 0 ? (
                   <Col span={24}>
                     <Empty description="You haven't hosted any trips yet.">
                       <Link to="/create-group"><Button type="primary">Create One</Button></Link>
                     </Empty>
                   </Col>
                ) : (
                  myTrips.map(group => (
                    <Col xs={24} sm={12} md={8} key={group._id}>
                      <Link to={`/group/${group._id}`}>
                        <GroupCard groupData={group} />
                      </Link>
                    </Col>
                  ))
                )}
              </Row>
            )
          }
        ]}
      />
    </div>
  );
};

export default Profile;