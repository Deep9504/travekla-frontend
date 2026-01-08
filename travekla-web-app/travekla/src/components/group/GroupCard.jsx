import React, { useContext } from 'react';
import { Card, Avatar, Tag, Button, Typography, Space, Badge, Tooltip, Progress } from 'antd';
import { UserOutlined, CalendarOutlined, EnvironmentOutlined, CheckCircleFilled, FireOutlined } from '@ant-design/icons';
import { GroupContext } from '../../context/GroupContext';
import { getCrowdStats } from '../../utils/travelLogic'; // Import the logic

const { Text } = Typography;

const GroupCard = ({ groupData }) => {
  const { groups } = useContext(GroupContext); // We need full list to calculate crowd
  const { creator, from, to, date, description, membersJoined, capacity, isVerified } = groupData;
  
  // Calculate Crowd Level for this Destination
  const crowd = getCrowdStats(to, groups);

  return (
    <Card
      hoverable
      style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}
      actions={[
        <Button type="primary" block>View Details</Button>
      ]}
    >
      {/* CROWD BADGE (New Feature) */}
      <Tooltip title={`${crowd.status}: Many people are traveling to ${to} right now.`}>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
           <Tag color={crowd.color} style={{ borderRadius: 12, fontWeight: 'bold' }}>
             {crowd.status === 'Overcrowded' && <FireOutlined />} {crowd.status}
           </Tag>
        </div>
      </Tooltip>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Badge count={isVerified ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : 0} offset={[-5, 30]}>
          <Avatar size={48} icon={<UserOutlined />} src={creator.avatarUrl} />
        </Badge>
        <div style={{ marginLeft: 12 }}>
          <Text strong style={{ fontSize: 16 }}>{creator.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>Group Admin</Text>
        </div>
      </div>

      {/* Route & Date */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#fa541c' }} />
          <Text strong>{from} → {to}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{date}</Text>
        </div>
        
        {/* Crowd Bar (Visual) */}
        <div style={{ marginTop: 5 }}>
           <Text type="secondary" style={{ fontSize: 10 }}>Destination Traffic: {crowd.status}</Text>
           <Progress percent={crowd.percent} showInfo={false} strokeColor={crowd.color} size="small" />
        </div>

        <div style={{ marginTop: 8, background: '#f5f5f5', padding: '8px', borderRadius: '6px' }}>
          <Text type="secondary" ellipsis={{ rows: 2 }}>{description}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default GroupCard;