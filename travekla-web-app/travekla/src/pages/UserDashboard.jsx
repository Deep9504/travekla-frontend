import React from 'react';
import { 
  Row, Col, Card, Avatar, Typography, Button, Tabs, List, Tag, 
  Statistic, Progress, Divider, Empty, Timeline 
} from 'antd';
// 👇 FIX: Added CalendarOutlined to imports
import { 
  UserOutlined, TrophyFilled, RocketOutlined, WalletOutlined, 
  CheckCircleFilled, ClockCircleOutlined, EnvironmentOutlined,
  BankOutlined, CrownOutlined, SettingOutlined, CalendarOutlined,
  LockOutlined // Also added LockOutlined just in case
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

// --- MOCK DATA ---
const userStats = {
  name: "Deepshikha Singh",
  level: "Level 3 Nomad",
  xp: 75,
  joinedDate: "Sept 2025",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Deepshikha",
  badges: [
    { id: 1, name: "Goa Explorer", icon: "🏖️", unlocked: true, date: "Oct 2025" },
    { id: 2, name: "Himalayan Trekker", icon: "🏔️", unlocked: true, date: "Dec 2025" },
    { id: 3, name: "Road Trip King", icon: "🏍️", unlocked: false },
    { id: 4, name: "Super Host", icon: "⭐", unlocked: false },
  ],
  wallet: {
    balance: 500,
    history: [
      { id: 1, type: 'Deposit', amount: -500, detail: 'Mumbai to Goa Trip', date: '10 Jan 2026', status: 'Locked' },
      { id: 2, type: 'Refund', amount: +500, detail: 'Manali Trip (Completed)', date: '12 Dec 2025', status: 'Refunded' },
    ]
  },
  trips: [
    { id: 101, from: 'Mumbai', to: 'Goa', date: '14 Feb 2026', status: 'Upcoming' },
    { id: 102, from: 'Delhi', to: 'Manali', date: '10 Dec 2025', status: 'Completed' }
  ]
};

const UserDashboard = () => {

  // --- TAB 1: MY TRIPS ---
  const MyTripsTab = () => (
    <List
      itemLayout="horizontal"
      dataSource={userStats.trips}
      renderItem={trip => (
        <List.Item
          actions={[
             trip.status === 'Upcoming' ? <Button type="primary" size="small">Manage</Button> : <Button size="small">View Memory</Button>
          ]}
        >
          <List.Item.Meta
            avatar={<Avatar icon={<RocketOutlined />} style={{ backgroundColor: trip.status === 'Upcoming' ? '#1890ff' : '#52c41a' }} />}
            title={<Text strong>{trip.from} to {trip.to}</Text>}
            description={
              <div>
                <CalendarOutlined style={{ marginRight: 5 }} /> {trip.date}
                <Tag color={trip.status === 'Upcoming' ? 'blue' : 'green'} style={{ marginLeft: 10 }}>{trip.status}</Tag>
              </div>
            }
          />
        </List.Item>
      )}
    />
  );

  // --- TAB 2: BADGE COLLECTION ---
  const BadgesTab = () => (
    <Row gutter={[16, 16]}>
      {userStats.badges.map(badge => (
        <Col xs={12} sm={8} md={6} key={badge.id}>
          <Card 
            hoverable 
            style={{ 
              textAlign: 'center', 
              opacity: badge.unlocked ? 1 : 0.5, 
              background: badge.unlocked ? '#fffbe6' : '#f5f5f5',
              borderColor: badge.unlocked ? '#ffe58f' : '#d9d9d9'
            }}
          >
             <div style={{ fontSize: '3rem', marginBottom: 10 }}>{badge.icon}</div>
             <Text strong>{badge.name}</Text>
             <div>
               {badge.unlocked ? 
                 <Tag color="gold" style={{ marginTop: 5 }}>Unlocked</Tag> : 
                 <Tag icon={<LockOutlined />} style={{ marginTop: 5 }}>Locked</Tag>
               }
             </div>
          </Card>
        </Col>
      ))}
    </Row>
  );

  // --- TAB 3: WALLET ---
  const WalletTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
         <Col span={12}>
           <Statistic title="Active Deposits (Locked)" value={userStats.wallet.balance} prefix="₹" valueStyle={{ color: '#faad14' }} />
         </Col>
         <Col span={12}>
           <Statistic title="Total Refunded" value={5000} prefix="₹" valueStyle={{ color: '#52c41a' }} />
         </Col>
      </Row>
      <Divider orientation="left">Transaction History</Divider>
      <Timeline mode="left">
        {userStats.wallet.history.map(tx => (
          <Timeline.Item 
            key={tx.id} 
            color={tx.type === 'Refund' ? 'green' : 'orange'}
            dot={tx.type === 'Refund' ? <CheckCircleFilled /> : <ClockCircleOutlined />}
          >
            <Text strong>₹{Math.abs(tx.amount)}</Text> - {tx.detail} <br/>
            <Text type="secondary" style={{ fontSize: 12 }}>{tx.date} • {tx.status}</Text>
          </Timeline.Item>
        ))}
      </Timeline>
    </div>
  );

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      
      {/* 1. PROFILE HEADER */}
      <Card style={{ borderRadius: 16, marginBottom: 30, background: 'linear-gradient(to right, #ffffff, #f0f5ff)' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ position: 'relative' }}>
             <Avatar size={100} src={userStats.avatar} />
             <Tag color="gold" style={{ position: 'absolute', bottom: 0, right: -10, borderRadius: 10 }}>
                {userStats.level}
             </Tag>
          </div>
          <div style={{ flex: 1 }}>
             <Title level={2} style={{ margin: 0 }}>{userStats.name}</Title>
             <Text type="secondary"><EnvironmentOutlined /> Bangalore, India • Member since {userStats.joinedDate}</Text>
             
             <div style={{ marginTop: 15, maxWidth: 300 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <Text strong>XP Progress</Text>
                  <Text type="secondary">{userStats.xp}/100</Text>
               </div>
               <Progress percent={userStats.xp} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
             </div>
          </div>
          <div>
             <Button icon={<SettingOutlined />}>Edit Profile</Button>
          </div>
        </div>
      </Card>

      {/* 2. DASHBOARD TABS */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 16, minHeight: 400 }}>
             <Tabs 
               defaultActiveKey="1"
               items={[
                 { key: '1', label: <span><RocketOutlined /> My Trips</span>, children: <MyTripsTab /> },
                 { key: '2', label: <span><TrophyFilled /> Badges</span>, children: <BadgesTab /> },
                 { key: '3', label: <span><WalletOutlined /> Wallet</span>, children: <WalletTab /> },
               ]} 
             />
          </Card>
        </Col>

        {/* 3. SIDEBAR STATS */}
        <Col xs={24} md={8}>
           <Card title="Quick Stats" style={{ borderRadius: 16, marginBottom: 20 }}>
              <Row gutter={[16, 16]}>
                 <Col span={12} style={{ textAlign: 'center' }}>
                    <Statistic title="Trips" value={12} prefix={<RocketOutlined />} />
                 </Col>
                 <Col span={12} style={{ textAlign: 'center' }}>
                    <Statistic title="Reviews" value={4.8} prefix={<CrownOutlined style={{color:'#faad14'}} />} />
                 </Col>
              </Row>
           </Card>

           <Card style={{ borderRadius: 16, background: '#fff7e6', borderColor: '#ffd591' }}>
              <Title level={5}><BankOutlined /> Money Saved</Title>
              <Paragraph>
                 By sharing rooms and splitting cabs on Travekla, you have saved approximately:
              </Paragraph>
              <Title level={3} style={{ color: '#d46b08', margin: 0 }}>₹12,400</Title>
           </Card>
        </Col>
      </Row>

    </div>
  );
};

export default UserDashboard;