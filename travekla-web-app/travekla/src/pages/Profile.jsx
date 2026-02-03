import React, { useContext, useState, useEffect } from 'react';
import { Card, Avatar, Typography, Button, Tabs, Tag, Input, message, Alert, Steps, Switch, Modal, Form } from 'antd';
import {
  UserOutlined, UploadOutlined, CheckCircleFilled, ReloadOutlined, 
  InstagramOutlined, CreditCardOutlined, EditOutlined, 
  EnvironmentOutlined, SaveOutlined 
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// ✅ IMPORT SMART URL
import { API_BASE_URL } from '../config';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // States
  const [docUrl, setDocUrl] = useState("");
  const [socialLink, setSocialLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // 🌟 NEW: PROFILE EDIT STATES
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => { 
      if (user) {
          fetchLatestUserData(); 
      }
  }, [user?._id]); // Only run if ID changes

  // --- 🌟 CRITICAL FIX: ONLY FILL FORM WHEN MODAL OPENS ---
  // This prevents the form from resetting while you are typing!
  useEffect(() => {
      if (isEditModalOpen && user) {
          form.setFieldsValue({
              name: user.name,
              bio: user.bio,
              location: user.location,
              avatar: user.avatar
          });
      }
  }, [isEditModalOpen]); 

  const fetchLatestUserData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`${API_BASE_URL}/users/${userId}`);
      const freshUser = await res.json();
      if (freshUser && updateUser) {
          updateUser(freshUser);
      }
    } catch (err) { console.log("Refresh error"); }
    setRefreshing(false);
  };

  // --- UPDATE PROFILE FUNCTION ---
  const handleUpdateProfile = async (values) => {
      setLoading(true);
      try {
          const userId = user.id || user._id;
          
          const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(values)
          });
          
          if (res.ok) {
              const updatedUser = await res.json();
              updateUser(updatedUser); // Update Context instantly
              message.success("Profile Updated! ✨");
              setIsEditModalOpen(false);
          } else {
              message.error("Update Failed");
          }
      } catch (error) {
          console.error(error);
          message.error("Server Error");
      }
      setLoading(false);
  };

  // 👇 NEW: Handle Delete
  const handleDeleteAccount = async () => {
    try {
      const userId = user.id || user._id;
      await fetch(`${API_BASE_URL}/users/${userId}`, { method: 'DELETE' });
      message.success("Account Deleted");
      
      // Logout logic (assuming you have a logout function in Context)
      localStorage.removeItem("user");
      window.location.href = "/login"; 
    } catch (err) {
      message.error("Failed to delete");
    }
  };

  // --- HANDLERS ---
  const handleRoleSwitch = async (checked) => {
    const newRole = checked ? 'advisor' : 'traveler';
    try {
      const userId = user.id || user._id;
      await fetch(`${API_BASE_URL}/users/${userId}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      message.success(`Switched to ${newRole.toUpperCase()}`);
      fetchLatestUserData();
    } catch (err) { message.error("Failed to switch"); }
  };

  const handleSubmitKYC = async () => {
    if (!docUrl) return message.error("Enter ID URL");
    setLoading(true);
    try {
      const userId = user.id || user._id;
      const res = await fetch(`${API_BASE_URL}/users/apply-advisor/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLink: docUrl, about: user.bio }) 
      });
      
      if (res.ok) {
        message.success("KYC Submitted! Waiting for Admin Approval.");
        fetchLatestUserData();
      }
    } catch (err) { message.error("Submission failed"); }
    setLoading(false);
  };

 // --- 3. FINAL VERIFICATION (REAL RAZORPAY) ---
  const handleFinalVerification = async () => {
    setLoading(true);
    try {
      const userId = user.id || user._id;

      // 1. Create Order
      const orderRes = await fetch(`${API_BASE_URL}/payment/orders`, {
          method: 'POST',
      });
      const orderData = await orderRes.json();

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_S9inWIWBAG8Kn0", // 👈 PASTE KEY ID ONLY (No Secret)
        amount: orderData.amount,
        currency: "INR",
        name: "Travekla Verified",
        description: "Get the Blue Tick Badge",
        order_id: orderData.id, 
        handler: async function (response) {
            
            // 3. Verify Payment
            message.loading("Verifying Payment...");
            const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    userId: userId
                })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
                message.success("Payment Successful! You are Verified ✅");
                setIsPaymentModalOpen(false);
                fetchLatestUserData(); 
            } else {
                message.error("Verification Failed");
            }
        },
        theme: { color: "#1890ff" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (e) { 
        console.error(e);
        message.error("Payment Failed"); 
    }
    setLoading(false);
  };

  if (!user) return <div style={{ padding: 50 }}>Loading...</div>;

  const isAdvisor = user.role === 'advisor';
  const kycDone = user.kycStatus === 'verified';
  const kycPending = user.kycStatus === 'pending';
  let currentStep = 0;
  if (kycPending) currentStep = 0;
  if (kycDone) currentStep = 1;
  if (user.isVerified) currentStep = 2;

  const VerificationTab = () => (
    <div style={{ padding: 20 }}>
      {isAdvisor ? (
        <>
          <Steps current={currentStep} style={{ marginBottom: 40 }}>
            <Step title="KYC" description={kycPending ? "In Review" : "Govt ID"} />
            <Step title="Social & Payment" description="Link + Fee" />
            <Step title="Verified" description="Blue Badge" />
          </Steps>

          {!kycDone && !user.isVerified && (
            <Card title="Step 1: Identity Verification">
              {kycPending ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Alert message="Verification Pending" type="warning" showIcon style={{ marginBottom: 15 }} />
                  <Button icon={<ReloadOutlined />} onClick={fetchLatestUserData}>Check Status</Button>
                </div>
              ) : (
                <>
                  <Text>Upload your Government ID.</Text>
                  <Input prefix={<UploadOutlined />} placeholder="Paste ID Link" value={docUrl} onChange={e => setDocUrl(e.target.value)} style={{ marginTop: 10, marginBottom: 10 }} />
                  <Button type="primary" onClick={handleSubmitKYC} loading={loading}>Submit ID</Button>
                </>
              )}
            </Card>
          )}

          {kycDone && !user.isVerified && (
            <Card title="Step 2: Social & Payment">
              <Alert message="KYC Verified!" type="success" showIcon style={{ marginBottom: 15 }} />
              <Input prefix={<InstagramOutlined />} placeholder="Instagram Link" value={socialLink} onChange={e => setSocialLink(e.target.value)} style={{ marginTop: 5, marginBottom: 20 }} />
              <Button type="primary" block icon={<CreditCardOutlined />} style={{ background: '#fa541c' }} onClick={() => setIsPaymentModalOpen(true)}>Pay & Get Verified</Button>
            </Card>
          )}

          {user.isVerified && (
            <Card style={{ textAlign: 'center', borderColor: '#52c41a', background: '#f6ffed' }}>
              <CheckCircleFilled style={{ fontSize: 50, color: '#52c41a' }} />
              <Title level={3}>You are Verified!</Title>
            </Card>
          )}
        </>
      ) : (
        <Alert message="Switch to Advisor Mode to access Verification." type="warning" showIcon />
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: 850, margin: '40px auto', padding: '0 20px' }}>
      <Card>
        {/* HEADER */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <Avatar size={100} src={user.avatar} icon={<UserOutlined />} />
          
          <div style={{ flex: 1 }}>
            <div style={{display:'flex', alignItems:'center'}}>
                <Title level={3} style={{ margin: 0, marginRight: 10 }}>{user.name}</Title>
                {user.isVerified && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 20 }} />}
            </div>
            
            <Tag color={isAdvisor ? "purple" : "blue"} style={{marginTop: 5}}>{user.role.toUpperCase()}</Tag>
            
            <div style={{ marginTop: 8, color: '#666' }}>
                <EnvironmentOutlined /> {user.location || "Add Location"}
            </div>
            <Paragraph ellipsis={{ rows: 2 }} style={{ marginTop: 5, color: '#888' }}>
                {user.bio || "No bio yet."}
            </Paragraph>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>

            {user.role === 'admin' && (
                <Button 
                    type="primary" 
                    style={{ background: '#722ed1', borderColor: '#722ed1' }} 
                    onClick={() => navigate('/admin')}
                >
                    Admin Dashboard
                </Button>
            )}
            <Button type="primary" icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>Edit Profile</Button>
            <Switch checked={isAdvisor} onChange={handleRoleSwitch} checkedChildren="Advisor" unCheckedChildren="Traveler" />
          </div>
        </div>

       <Tabs defaultActiveKey="1" items={[
      { key: '1', label: 'Verification Center', children: <VerificationTab /> },
      
      // 👇 UPDATED SETTINGS TAB
      { key: '2', label: 'My Settings', children: (
          <div style={{ padding: 20 }}>
              <Title level={4} type="danger">Danger Zone</Title>
              <Paragraph>
                  Once you delete your account, there is no going back. Please be certain.
              </Paragraph>
              <Button 
                  type="primary" danger 
                  onClick={() => {
                      Modal.confirm({
                          title: 'Are you sure?',
                          content: 'This action cannot be undone.',
                          okText: 'Yes, Delete My Account',
                          okType: 'danger',
                          onOk: handleDeleteAccount
                      });
                  }}
              >
                  Delete Account
              </Button>
          </div>
      )},
    ]} />
      </Card>

      {/* EDIT MODAL */}
      <Modal 
        title="Edit Profile" 
        open={isEditModalOpen} 
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
            <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} />
            </Form.Item>
            <Form.Item name="location" label="Location">
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g. Mumbai, India" />
            </Form.Item>
            <Form.Item name="bio" label="Bio">
                <Input.TextArea rows={3} placeholder="Tell us about yourself..." />
            </Form.Item>
            <Form.Item name="avatar" label="Profile Picture URL">
                <Input placeholder="Paste image link here..." />
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" icon={<SaveOutlined />} loading={loading}>
                Save Changes
            </Button>
        </Form>
      </Modal>

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
      </Modal>

    </div>
  );
};

export default Profile;