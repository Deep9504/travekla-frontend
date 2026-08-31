import React from 'react';
import { Card, Row, Col, Statistic, Button, List, Tag, Avatar, Typography } from 'antd';
import { DollarOutlined, VideoCameraOutlined, CalendarOutlined, StarFilled } from '@ant-design/icons';

const { Title, Text } = Typography;

const AdvisorDashboard = () => {
  const upcomingSessions = [
    { id: 1, user: 'Rohan', time: 'Today, 4:00 PM', topic: 'Goa Itinerary Review' },
    { id: 2, user: 'Sanya', time: 'Tomorrow, 10:00 AM', topic: 'Safety Tips' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
           <Title level={2} style={{ margin: 0 }}>Advisor Dashboard</Title>
           <Text type="secondary">Manage your sessions and earnings.</Text>
        </div>
        <Tag color="gold" style={{ padding: '5px 10px', fontSize: 14 }} icon={<StarFilled />}>Super Advisor</Tag>
      </div>

      {/* STATS */}
      <Row gutter={16} style={{ marginBottom: 30 }}>
        <Col span={8}><Card><Statistic title="Total Earnings" value={12500} prefix="₹" /></Card></Col>
        <Col span={8}><Card><Statistic title="Sessions Completed" value={42} prefix={<VideoCameraOutlined />} /></Card></Col>
        <Col span={8}><Card><Statistic title="Rating" value={4.9} prefix={<StarFilled style={{color:'orange'}}/>} /></Card></Col>
      </Row>

      <Row gutter={24}>
        <Col span={16}>
           <Card title="Upcoming Video Sessions">
             <List
               dataSource={upcomingSessions}
               renderItem={item => (
                 <List.Item actions={[<Button type="primary" icon={<VideoCameraOutlined />}>Join Call</Button>]}>
                   <List.Item.Meta
                     avatar={<Avatar style={{ backgroundColor: '#1890ff' }}>{item.user[0]}</Avatar>}
                     title={`Session with ${item.user}`}
                     description={<div><CalendarOutlined /> {item.time} • {item.topic}</div>}
                   />
                 </List.Item>
               )}
             />
           </Card>
        </Col>
        <Col span={8}>
           <Card title="Availability">
              <div style={{ textAlign: 'center', padding: 20 }}>
                 <Button block style={{ marginBottom: 10 }}>Edit Slots</Button>
                 <Button block type="dashed">Sync Calendar</Button>
              </div>
           </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdvisorDashboard;