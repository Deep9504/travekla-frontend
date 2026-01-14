import React, { useContext, useState } from 'react';
import { Card, Avatar, Tag, Button, Typography, Space, Badge, Tooltip, Progress, message } from 'antd';
import { UserOutlined, CalendarOutlined, EnvironmentOutlined, CheckCircleFilled, FireOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';
import { GroupContext } from '../../context/GroupContext';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Optional utility import
import { getCrowdStats } from '../../utils/travelLogic'; 

const { Text } = Typography;

const GroupCard = ({ groupData }) => {
  const { groups, joinGroup } = useContext(GroupContext); 
  const { user } = useContext(AuthContext); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Safe ID handling
  const groupId = groupData._id || groupData.id;
  const { creator, from, to, date, description, members = [], pendingMembers = [], capacity, isVerified } = groupData;

  // --- 1. DETERMINE USER STATUS ---
  const currentUserId = user?.id || user?._id;
  
  const isCreator = currentUserId === (creator.id || creator._id);
  const isMember = members.some(id => id === currentUserId || id._id === currentUserId);
  const isPending = pendingMembers.some(id => id === currentUserId || id._id === currentUserId);
  const isFull = members.length >= capacity;

  // --- 2. HANDLE ACTIONS ---
  const handleJoin = async () => {
    if (!user) {
      message.error("Please login to join a trip!");
      navigate('/login');
      return;
    }

    setLoading(true);
    const result = await joinGroup(groupId);
    if (result.success) {
      message.success("Request sent! Waiting for approval.");
    } else {
      message.warning(result.message); // e.g., "Already joined"
    }
    setLoading(false);
  };

  const handleManage = () => {
    navigate(`/manage-trip/${groupId}`);
  };

  // --- 3. CROWD LOGIC (Optional fallback) ---
  const crowd = (typeof getCrowdStats === 'function' && groups) 
    ? getCrowdStats(to, groups) 
    : { status: 'Open', color: 'green', percent: (members.length / capacity) * 100 };

  return (
    <Card
      hoverable
      style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}
      actions={[
        // 👇 SMART BUTTON LOGIC
        isCreator ? (
          <Button type="dashed" block icon={<SettingOutlined />} onClick={handleManage} style={{ color: '#faad14', borderColor: '#faad14' }}>
            Manage Trip
          </Button>
        ) : isMember ? (
          <Button type="text" block icon={<CheckCircleFilled style={{ color: '#52c41a' }} />} disabled>
            Joined
          </Button>
        ) : isPending ? (
          <Button type="text" block style={{ color: 'orange' }} disabled>
            Request Sent ⏳
          </Button>
        ) : isFull ? (
          <Button danger block disabled>Full ⛔</Button>
        ) : (
          <Button type="primary" block loading={loading} onClick={handleJoin}>
            Request to Join
          </Button>
        )
      ]}
    >
      {/* CROWD/STATUS BADGE */}
      <Tooltip title={`${crowd.status}: ${members.length}/${capacity} spots taken`}>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
           <Tag color={crowd.color} style={{ borderRadius: 12, fontWeight: 'bold' }}>
             {crowd.status === 'Overcrowded' ? <FireOutlined /> : <TeamOutlined />} {members.length}/{capacity}
           </Tag>
        </div>
      </Tooltip>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Badge count={isVerified ? <CheckCircleFilled style={{ color: '#52c41a' }} /> : 0} offset={[-5, 30]}>
          <Avatar size={48} icon={<UserOutlined />} src={creator.avatar || creator.avatarUrl} />
        </Badge>
        <div style={{ marginLeft: 12 }}>
          <Text strong style={{ fontSize: 16 }}>{creator.name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {isCreator ? "You (Host)" : "Group Host"}
          </Text>
        </div>
      </div>

      {/* DETAILS */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EnvironmentOutlined style={{ color: '#fa541c' }} />
          <Text strong>{from} → {to}</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#1890ff' }} />
          <Text>{new Date(date).toDateString()}</Text>
        </div>
        
        {/* PROGRESS BAR */}
        <div style={{ marginTop: 5 }}>
           <div style={{ display: 'flex', justifyContent: 'space-between' }}>
             <Text type="secondary" style={{ fontSize: 10 }}>Capacity</Text>
             <Text type="secondary" style={{ fontSize: 10 }}>{members.length}/{capacity}</Text>
           </div>
           <Progress percent={(members.length / capacity) * 100} showInfo={false} strokeColor={crowd.color} size="small" />
        </div>

        <div style={{ marginTop: 8, background: '#f5f5f5', padding: '8px', borderRadius: '6px' }}>
          <Text type="secondary" ellipsis={{ rows: 2 }}>{description}</Text>
        </div>
      </Space>
    </Card>
  );
};

export default GroupCard;