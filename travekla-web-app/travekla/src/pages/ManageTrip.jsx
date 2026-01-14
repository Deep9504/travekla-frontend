import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, List, Button, Typography, Avatar, Tabs, Tag, message, Spin, Empty } from 'antd';
import { CheckOutlined, CloseOutlined, UserOutlined, ArrowLeftOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { GroupContext } from '../context/GroupContext';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

// --- HELPER: Normalize IDs (The same fix we used before) ---
const normalizeId = (val) => {
  if (!val) return "";
  if (typeof val === 'string') return val;
  if (val._id) return normalizeId(val._id);
  if (val.id) return normalizeId(val.id);
  return String(val);
};

const ManageTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { groups, approveMember, removeMember } = useContext(GroupContext);
  const { user } = useContext(AuthContext);
  
  const [trip, setTrip] = useState(null);

  // 1. Find the Trip (using robust ID check)
  useEffect(() => {
    if (groups.length > 0) {
      const foundTrip = groups.find(g => normalizeId(g) === normalizeId(id));
      setTrip(foundTrip);
    }
  }, [groups, id]);

  if (!trip) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;

  // 2. SECURITY CHECK: Are you the Creator?
  const currentUserId = normalizeId(user);
  const creatorId = normalizeId(trip.creator);

  if (currentUserId !== creatorId) {
    return (
      <div style={{ padding: 50, textAlign: 'center', marginTop: 50 }}>
        <SafetyCertificateOutlined style={{ fontSize: 60, color: 'red' }} />
        <Title level={3}>Access Denied</Title>
        <Text type="secondary">
          You are logged in as ID: {currentUserId.slice(0,5)}...<br/>
          This trip belongs to ID: {creatorId.slice(0,5)}...
        </Text>
        <br />
        <Button type="primary" onClick={() => navigate('/')} style={{ marginTop: 20 }}>Go Home</Button>
      </div>
    );
  }

  // --- MEMBER LIST COMPONENT ---
  const MemberList = ({ list, isPending }) => (
    <List
      itemLayout="horizontal"
      dataSource={list} 
      locale={{ emptyText: <Empty description={isPending ? "No new requests" : "No members yet"} /> }}
      renderItem={(member) => {
        // Handle member being an ID string OR an Object
        const memberName = member.name || "Unknown User";
        const memberId = normalizeId(member);
        const memberAvatar = member.avatar || member.avatarUrl;

        return (
          <List.Item
            actions={isPending ? [
              <Button type="primary" shape="circle" icon={<CheckOutlined />} onClick={() => approveMember(trip._id, memberId)} />,
              <Button danger shape="circle" icon={<CloseOutlined />} onClick={() => removeMember(trip._id, memberId)} />
            ] : [
              <Button danger type="text" onClick={() => removeMember(trip._id, memberId)}>Remove</Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} src={memberAvatar} />}
              title={<Text strong>{memberName}</Text>}
              description={isPending ? "Wants to join your trip" : "Confirmed Traveler"}
            />
          </List.Item>
        );
      }}
    />
  );

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>Back</Button>
      
      <Card 
        title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Manage: {trip.to}</span>
            <Tag color="blue">{trip.pendingMembers?.length || 0} New Requests</Tag>
            </div>
        }
        style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <Tabs defaultActiveKey="1" items={[
          {
            key: '1',
            label: `Pending Requests (${trip.pendingMembers?.length || 0})`,
            children: <MemberList list={trip.pendingMembers || []} isPending={true} />
          },
          {
            key: '2',
            label: `Approved Members (${trip.members?.length || 0})`,
            children: <MemberList list={trip.members || []} isPending={false} />
          }
        ]} />
      </Card>
    </div>
  );
};

export default ManageTrip;