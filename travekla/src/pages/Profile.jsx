import React, { useContext, useState, useEffect } from 'react';
import { Card, Avatar, Typography, Button, Tabs, Tag, Input, message, Alert, Result, Spin } from 'antd';
import { UserOutlined, SafetyCertificateFilled, UploadOutlined, CheckCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [docUrl, setDocUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // State for refresh spinner

  // --- 🔥 AUTO-REFRESH USER DATA ON LOAD 🔥 ---
  useEffect(() => {
    fetchLatestUserData();
  }, []);

  const fetchLatestUserData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
        const userId = user.id || user._id;
        const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
        const freshUser = await res.json();
        
        if (freshUser && updateUser) {
            updateUser(freshUser); // Update Context with fresh DB data
        }
    } catch (err) {
        console.log("Failed to refresh user data");
    }
    setRefreshing(false);
  };
  // ---------------------------------------------

  if (!user) return <div style={{padding:50, textAlign:'center'}}>Please Login</div>;

  const handleSubmitKYC = async () => {
    if (!docUrl) return message.error("Please enter a document URL");
    setLoading(true);

    try {
      const userId = user.id || user._id;
      const res = await fetch('http://localhost:5000/api/auth/submit-kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, documentUrl: docUrl })
      });
      const data = await res.json();
      
      if (data.success) {
        message.success("KYC Submitted!");
        if (updateUser) updateUser(data.user);
        setDocUrl(""); 
      }
    } catch (err) {
      message.error("Submission failed");
    }
    setLoading(false);
  };

  const kycStatus = user.kycStatus ? user.kycStatus.toLowerCase() : 'new';

  const KYCTab = () => (
    <div style={{ textAlign: 'center', maxWidth: 400, margin: '0 auto' }}>
      {kycStatus === 'verified' ? (
        <Result 
          status="success" 
          icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
          title="You are Verified!" 
          subTitle="You can now host trips and access advisor features." 
        />
      ) : kycStatus === 'pending' ? (
        <Alert 
          message="Verification Pending" 
          description="Admin is reviewing your documents." 
          type="info" 
          showIcon 
        />
      ) : (
        <>
          <SafetyCertificateFilled style={{ fontSize: 40, color: '#faad14', marginBottom: 15 }} />
          <Title level={4}>Verify Your Identity</Title>
          <Text type="secondary">Paste a link to your ID (Google Drive / Image URL)</Text>
          
          <Input 
            prefix={<UploadOutlined />} 
            placeholder="https://example.com/my-id.jpg" 
            style={{ marginTop: 20 }} 
            value={docUrl} 
            onChange={(e) => setDocUrl(e.target.value)} 
          />
          
          <Button type="primary" block style={{ marginTop: 15 }} loading={loading} onClick={handleSubmitKYC}>
            Submit for Review
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <Avatar size={80} src={user.avatar} icon={<UserOutlined />} />
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {user.name} 
              {kycStatus === 'verified' && <SafetyCertificateFilled style={{ color: '#52c41a', marginLeft: 10, fontSize: 20 }} />}
            </Title>
            <Text type="secondary">{user.email}</Text> <br />
            
            <div style={{ marginTop: 5 }}>
                <Tag color="blue">{(user.role || 'USER').toUpperCase()}</Tag>
                {kycStatus === 'verified' ? (
                    <Tag color="green">KYC VERIFIED</Tag>
                ) : (
                    <Tag color="orange">KYC: {(kycStatus || 'NEW').toUpperCase()}</Tag>
                )}
            </div>
          </div>
          
          <div style={{ marginLeft: 'auto', display:'flex', gap: 10 }}>
            {/* Manual Refresh Button */}
            <Button icon={<ReloadOutlined />} onClick={fetchLatestUserData} loading={refreshing}>
                Refresh
            </Button>
            <Button danger onClick={() => { logout(); navigate('/'); }}>Logout</Button>
          </div>
        </div>

        <Tabs defaultActiveKey="1" items={[
          { key: '1', label: 'My KYC', children: <KYCTab /> },
          { key: '2', label: 'My Trips', children: <div style={{padding:20, textAlign:'center'}}>Trip History Coming Soon...</div> },
        ]} />
      </Card>
    </div>
  );
};

export default Profile;