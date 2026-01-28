import React, { useContext, useState, useEffect } from 'react';
import { Card, Avatar, Typography, Button, Tabs, Tag, Input, message, Alert, Steps, Switch, Modal } from 'antd';
import {
  UserOutlined, SafetyCertificateFilled, UploadOutlined,
  CheckCircleFilled, ReloadOutlined, InstagramOutlined, CreditCardOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Step } = Steps;

const Profile = () => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [docUrl, setDocUrl] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // --- AUTO-REFRESH USER DATA ---
  useEffect(() => { fetchLatestUserData(); }, []);

  const fetchLatestUserData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`http://localhost:5000/api/auth/user/${userId}`);
      const freshUser = await res.json();
      if (freshUser && updateUser) updateUser(freshUser);
    } catch (err) { console.log("Refresh error"); }
    setRefreshing(false);
  };

  // --- 1. ROLE SWITCH ---
  const handleRoleSwitch = async (checked) => {
    const newRole = checked ? 'advisor' : 'traveler';
    try {
      const userId = user.id || user._id;
      await fetch('https://travekla-web-app.onrender.com/api/auth/switch-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      message.success(`Switched to ${newRole.toUpperCase()}`);
      fetchLatestUserData();
    } catch (err) { message.error("Failed to switch"); }
  };

  // --- 2. KYC SUBMIT ---
  const handleSubmitKYC = async () => {
    if (!docUrl) return message.error("Enter ID URL");
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch('https://travekla-web-app.onrender.com/api/auth/submit-kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, documentUrl: docUrl })
      });
      const data = await res.json();

      if (data.success) {
        // 👇 CORRECTED MESSAGE
        message.success("KYC Submitted! Waiting for Admin Approval.");
        fetchLatestUserData();
      }
    } catch (err) {
      message.error("Submission failed");
    }
    setLoading(false);
  };

  // --- 3. FINAL VERIFICATION ---
  const handleFinalVerification = async () => {
    setLoading(true);
    const userId = user.id || user._id;

    const res = await fetch('https://travekla-web-app.onrender.com/api/auth/verify-advisor', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        socialLink,
        paymentSuccess: true
      })
    });

    const data = await res.json();
    if (data.success) {
      message.success(data.message);
      setIsPaymentModalOpen(false);
      fetchLatestUserData();
    } else {
      message.error(data.message);
    }
    setLoading(false);
  };

  if (!user) return <div style={{ padding: 50 }}>Loading...</div>;

  const isAdvisor = user.role === 'advisor';
  // Check strict statuses
  const kycDone = user.kycStatus === 'verified';
  const kycPending = user.kycStatus === 'pending';

  let currentStep = 0;
  if (kycPending) currentStep = 0; // Stuck on step 0 until approved
  if (kycDone) currentStep = 1;
  if (user.isVerified) currentStep = 2;

  // --- VERIFICATION TAB CONTENT ---
  const VerificationTab = () => (
    <div style={{ padding: 20 }}>
      {isAdvisor ? (
        <>
          <Steps current={currentStep} style={{ marginBottom: 40 }}>
            <Step title="KYC" description={kycPending ? "In Review" : "Govt ID"} />
            <Step title="Social & Payment" description="Link + Fee" />
            <Step title="Verified" description="Blue Badge" />
          </Steps>

          {/* STEP 1: KYC Logic */}
          {!kycDone && (
            <Card title="Step 1: Identity Verification (Requirement D)">
              {kycPending ? (
                // 👇 SHOW THIS IF PENDING
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Alert
                    message="Verification Pending"
                    description="Your ID has been submitted and is waiting for Admin approval. You cannot proceed until approved."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 15 }}
                  />
                  <Button icon={<ReloadOutlined />} onClick={fetchLatestUserData}>Check Status</Button>
                </div>
              ) : (
                // 👇 SHOW FORM IF NEW OR REJECTED
                <>
                  <Text>Upload your Government ID to proceed.</Text>
                  <Input
                    prefix={<UploadOutlined />}
                    placeholder="Paste ID Link (e.g. Drive URL)"
                    value={docUrl} onChange={e => setDocUrl(e.target.value)}
                    style={{ marginTop: 10, marginBottom: 10 }}
                  />
                  <Button type="primary" onClick={handleSubmitKYC} loading={loading}>Submit ID</Button>
                </>
              )}
            </Card>
          )}

          {/* STEP 2: SOCIAL + PAYMENT */}
          {kycDone && !user.isVerified && (
            <Card title="Step 2: Social Media & Subscription (Requirement B & C)">
              <Alert message="KYC Verified! Proceed to Step 2." type="success" showIcon style={{ marginBottom: 15 }} />

              <Text strong>1. Social Media Profile</Text>
              <Input
                prefix={<InstagramOutlined />}
                placeholder="https://instagram.com/yourname"
                value={socialLink} onChange={e => setSocialLink(e.target.value)}
                style={{ marginTop: 5, marginBottom: 20 }}
              />

              <Text strong>2. Monthly Subscription (Requirement C)</Text>
              <div style={{ marginTop: 5 }}>
                <Tag color="orange">₹199 / Month</Tag>
                <Text type="secondary">Varies person to person</Text>
              </div>

              <Button
                type="primary"
                block
                icon={<CreditCardOutlined />}
                style={{ marginTop: 20, background: '#fa541c' }}
                onClick={() => setIsPaymentModalOpen(true)}
              >
                Pay & Get Verified
              </Button>
            </Card>
          )}

          {/* STEP 3: DONE */}
          {user.isVerified && (
            <Card style={{ textAlign: 'center', borderColor: '#52c41a', background: '#f6ffed' }}>
              <CheckCircleFilled style={{ fontSize: 50, color: '#52c41a', marginBottom: 10 }} />
              <Title level={3}>You are Verified!</Title>
              <Text>Your profile is now ranked higher in search results.</Text>
            </Card>
          )}
        </>
      ) : (
        <Alert message="Switch to Advisor Mode to access Verification." type="warning" showIcon />
      )}

      {/* PAYMENT MODAL */}
      <Modal
        title="Complete Payment"
        open={isPaymentModalOpen}
        onCancel={() => setIsPaymentModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>,
          <Button key="pay" type="primary" loading={loading} onClick={handleFinalVerification}>Confirm Payment of ₹199</Button>
        ]}
      >
        <p>You are paying <b>₹199</b> for the Monthly Verified Badge.</p>
        <p>Social Link: <b>{socialLink}</b></p>
        <Text type="secondary">(This is a simulated payment gateway)</Text>
      </Modal>
    </div>
  );

  return (
    <div style={{ maxWidth: 850, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <Avatar size={80} src={user.avatar} icon={<UserOutlined />} />
          <div style={{ flex: 1 }}>
            <Title level={3} style={{ margin: 0 }}>
              {user.name}
              {user.isVerified && <CheckCircleFilled style={{ color: '#1890ff', marginLeft: 8 }} />}
            </Title>
            <Tag color={isAdvisor ? "purple" : "blue"}>{user.role.toUpperCase()}</Tag>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <Switch
              checked={isAdvisor} onChange={handleRoleSwitch}
              checkedChildren="Advisor" unCheckedChildren="Traveler"
            />
            <Button icon={<ReloadOutlined />} onClick={fetchLatestUserData} loading={refreshing}>Refresh</Button>
          </div>
        </div>

        <Tabs defaultActiveKey="1" items={[
          { key: '1', label: 'Verification Center', children: <VerificationTab /> },
          { key: '2', label: 'My Settings', children: <div>Settings Content</div> },
        ]} />
      </Card>
    </div>
  );
};

export default Profile;