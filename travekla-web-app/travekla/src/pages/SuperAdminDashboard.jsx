import React, { useState } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Avatar, Typography, Space, Modal } from 'antd';
import { 
  DashboardOutlined, UserSwitchOutlined, SafetyCertificateOutlined, 
  FlagOutlined, CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const SuperAdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  // MOCK DATA: KYC REQUESTS
  const [kycRequests, setKycRequests] = useState([
    { key: 1, name: 'Rahul Agent', role: 'Advisor', status: 'Pending', doc: 'Aadhar Card' },
    { key: 2, name: 'Goa Trippers', role: 'Group Host', status: 'Pending', doc: 'Agency License' },
  ]);

  // MOCK DATA: FLAGGED CONTENT
  const flaggedContent = [
    { key: 1, type: 'Group', title: 'Midnight Rave Party', reason: 'Suspicious Description', reportedBy: 'Deepshikha' }
  ];

  const handleApprove = (id) => {
    // In real app, call API
    setKycRequests(kycRequests.map(item => item.key === id ? { ...item, status: 'Approved' } : item));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: text => <Tag color="blue">{text}</Tag> },
    { title: 'Document', dataIndex: 'doc', key: 'doc' },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => <Tag color={status === 'Approved' ? 'green' : 'orange'}>{status}</Tag> 
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
           <Button type="primary" size="small" icon={<CheckCircleOutlined />} onClick={() => handleApprove(record.key)} disabled={record.status === 'Approved'}>Approve</Button>
           <Button danger size="small" icon={<CloseCircleOutlined />} disabled={record.status === 'Approved'}>Reject</Button>
        </Space>
      )
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', color: 'white', textAlign: 'center', lineHeight: '32px' }}>
             Admin Panel
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={[
            { key: '1', icon: <DashboardOutlined />, label: 'Overview' },
            { key: '2', icon: <SafetyCertificateOutlined />, label: 'KYC & Approvals' },
            { key: '3', icon: <FlagOutlined />, label: 'Reports' },
        ]} />
      </Sider>
      <Layout>
        <Content style={{ margin: '16px' }}>
          
          {/* STATS ROW */}
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}><Card><Statistic title="Pending KYCs" value={kycRequests.length} prefix={<UserSwitchOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="Active Groups" value={142} prefix={<FlagOutlined />} /></Card></Col>
            <Col span={8}><Card><Statistic title="Total Revenue (Fees)" value={42500} prefix="₹" precision={2} /></Card></Col>
          </Row>

          {/* MAIN TABLES */}
          <Row gutter={16}>
            <Col span={16}>
               <Card title="Verification Queue">
                  <Table dataSource={kycRequests} columns={columns} pagination={false} />
               </Card>
            </Col>
            <Col span={8}>
               <Card title="Flagged Content">
                 <div style={{ color: 'red', marginBottom: 10 }}>Action Required</div>
                 {flaggedContent.map(item => (
                    <Card key={item.key} type="inner" title={item.type} size="small" style={{ marginBottom: 10 }}>
                        <Text strong>{item.title}</Text><br/>
                        <Text type="secondary">Reason: {item.reason}</Text>
                        <div style={{ marginTop: 10 }}><Button danger size="small">Remove</Button></div>
                    </Card>
                 ))}
               </Card>
            </Col>
          </Row>

        </Content>
      </Layout>
    </Layout>
  );
};

export default SuperAdminDashboard;