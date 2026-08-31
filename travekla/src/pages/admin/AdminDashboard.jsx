import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Tabs, message, Spin } from 'antd';
import { 
  DashboardOutlined, 
  IdcardOutlined, 
  GlobalOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  LogoutOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // REAL DATA STATES
  const [stats, setStats] = useState({ revenue: 0, pendingKYC: 0, pendingTrips: 0 });
  const [kycRequests, setKycRequests] = useState([]);
  const [tripRequests, setTripRequests] = useState([]);

  // --- FETCH DATA ---
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Get Stats
      const statRes = await fetch('http://localhost:5000/api/admin/stats');
      const statData = await statRes.json();
      setStats(statData);

      // 2. Get Pending KYCs
      const kycRes = await fetch('http://localhost:5000/api/admin/kyc-pending');
      const kycData = await kycRes.json();
      setKycRequests(kycData);

      // 3. Get Pending Trips
      const tripRes = await fetch('http://localhost:5000/api/admin/trips-pending');
      const tripData = await tripRes.json();
      setTripRequests(tripData);

    } catch (error) {
      console.error("Admin Fetch Error:", error);
      message.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/admin');
  };

  // --- ACTIONS ---

  const handleKYCAction = async (userId, action) => {
    try {
      await fetch('http://localhost:5000/api/admin/kyc-action', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      });
      message.success(`User ${action === 'approve' ? 'Verified' : 'Rejected'}`);
      fetchAllData(); // Refresh list
    } catch (error) {
      message.error("Action failed");
    }
  };

  const verifyTrip = async (tripId) => {
    try {
      await fetch(`http://localhost:5000/api/admin/trip-verify/${tripId}`, {
        method: 'PUT'
      });
      message.success("Trip Verified & Published! ✅");
      fetchAllData(); // Refresh list
    } catch (error) {
      message.error("Action failed");
    }
  };

  // --- TABS ---

  const OverviewTab = () => (
    <Row gutter={16}>
      <Col span={8}>
        <Card>
          <Statistic title="Total Revenue (Est.)" value={stats.revenue} prefix="₹" valueStyle={{ color: '#3f8600' }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="Pending KYCs" value={stats.pendingKYC} prefix={<IdcardOutlined />} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="Pending Trips" value={stats.pendingTrips} prefix={<GlobalOutlined />} />
        </Card>
      </Col>
    </Row>
  );

 const KycTab = () => (
    <Table 
      dataSource={kycRequests}
      rowKey="_id"
      locale={{ emptyText: "No pending KYC requests" }}
      columns={[
        { title: 'Name', dataIndex: 'name' },
        { title: 'Email', dataIndex: 'email' },
        { title: 'Document', render: (_, r) => (
             r.kycDocument ? 
             <a href={r.kycDocument} target="_blank" rel="noopener noreferrer">View Doc 🔗</a> 
             : <span style={{color:'red'}}>No Link</span>
        )},
        { title: 'Status', render: () => <Tag color="orange">Pending</Tag> },
        { title: 'Action', render: (_, r) => (
            <>
               <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleKYCAction(r._id, 'approve')} style={{ marginRight: 5 }}>Approve</Button>
               <Button danger size="small" icon={<CloseCircleOutlined />} onClick={() => handleKYCAction(r._id, 'reject')}>Reject</Button>
            </>
        )}
      ]}
    />
  );

  const TripsTab = () => (
    <Table 
      dataSource={tripRequests}
      rowKey="_id"
      locale={{ emptyText: "All trips are verified!" }}
      columns={[
        { title: 'Trip Name', render: (_, r) => `${r.from} to ${r.to}` },
        { title: 'Creator', render: (_, r) => r.creator?.name || "Unknown" },
        { title: 'Status', render: () => <Tag color="gold">Unverified</Tag> },
        { title: 'Action', render: (_, r) => (
            <Button type="primary" size="small" onClick={() => verifyTrip(r._id)}>Verify & Publish</Button>
        )}
      ]}
    />
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, color:'white', fontWeight:'bold', textAlign:'center', lineHeight:'32px' }}>ADMIN PANEL</div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '2', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout }
        ]} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>Super Admin Control</span>
            <Button icon={<ReloadOutlined />} onClick={fetchAllData}>Refresh Data</Button>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
             {loading ? <Spin size="large" style={{ display:'block', margin:'50px auto' }} /> : (
               <Tabs defaultActiveKey="1" items={[
                  { key: '1', label: 'Overview', children: <OverviewTab /> },
                  { key: '2', label: 'KYC Requests', children: <KycTab /> },
                  { key: '3', label: 'Trip Verification', children: <TripsTab /> },
               ]} />
             )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;