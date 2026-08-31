import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Typography, Form, Input, DatePicker, InputNumber, 
  Button, Row, Col, Tabs, List, Avatar, Tag, message, Spin, Divider, Space 
} from 'antd';
import { 
  ArrowLeftOutlined, SaveOutlined, UserOutlined, 
  TeamOutlined, EditOutlined, 
  PlusOutlined, MinusCircleOutlined, CheckCircleOutlined, CloseCircleOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ManageTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // --- 1. FETCH DATA (FIXED 🛠️) ---
  const fetchTripData = async () => {
    try {
      // ✅ FIX 1: Fetch ONLY this trip by ID. 
      // This forces the backend to "populate" the member details.
      const res = await fetch(`${API_BASE_URL}/trips/${id}`);
      
      if (!res.ok) throw new Error("Trip not found");
      
      const foundTrip = await res.json();

      setTrip(foundTrip);
      
      // Pre-fill form
      form.setFieldsValue({
        ...foundTrip,
        date: foundTrip.date ? moment(foundTrip.date) : null,
        itinerary: foundTrip.itinerary || [{ day: 1, activity: "" }] 
      });
    } catch (error) {
      console.error("Error loading trip:", error);
      message.error("Trip not found!");
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTripData();
  }, [id, user, navigate, form]);

  // --- 2. HANDLE SAVE (Update Trip Details) ---
  const handleUpdate = async (values) => {
    try {
        message.loading({ content: "Saving changes...", key: "save" });
        const updateData = {
            ...values,
            date: values.date ? values.date.toISOString() : null,
        };

      const res = await fetch(`${API_BASE_URL}/trips/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (res.ok) {
            message.success({ content: "Trip Updated! ✅", key: "save" });
            fetchTripData(); // Refresh data
        } else {
            message.error({ content: "Update failed", key: "save" });
        }
    } catch (error) {
        message.error("Update Failed");
    }
  };

  // --- 3. HANDLE REQUESTS (Accept/Reject) ---
  const handleRequestAction = async (userId, action) => {
      try {
          message.loading({ content: "Processing...", key: "req" });
          const endpoint = action === 'accept' ? 'accept' : 'reject';
          
         const res = await fetch(`${API_BASE_URL}/trips/${id}/request/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId })
          });

          if (res.ok) {
              message.success({ content: `User ${action}ed!`, key: "req" });
              fetchTripData(); // 🌟 REFRESH DATA INSTANTLY
          } else {
              message.error("Action failed");
          }
      } catch (error) {
          console.error(error);
          message.error("Server Error");
      }
  };

  if (loading) return <div style={{textAlign:'center', marginTop: 100}}><Spin size="large" /></div>;

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '40px 20px' }}>
      
      {/* HEADER */}
      <div style={{ maxWidth: 1000, margin: '0 auto 20px', display:'flex', justifyContent:'space-between' }}>
         <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} type="text">Back</Button>
         <Tag color="purple">MANAGE MODE</Tag>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Row gutter={[24, 24]}>
            
            {/* LEFT: INFO CARD */}
            <Col xs={24} md={8}>
                <Card style={{ borderRadius: 12, textAlign: 'center', marginBottom: 20 }}>
                    <Avatar size={80} src={user?.avatar} icon={<UserOutlined />} style={{marginBottom: 15}} />
                    <Title level={4}>{trip?.to}</Title>
                    <Text type="secondary">Organizer: You</Text>
                    <Divider />
                    <div style={{textAlign:'left'}}>
                        <p><strong>📅 Date:</strong> {new Date(trip?.date).toLocaleDateString()}</p>
                        <p><strong>💰 Budget:</strong> ₹{trip?.budget}</p>
                        <p><strong>👥 Capacity:</strong> {trip?.capacity || 10}</p>
                    </div>
                </Card>
            </Col>

            {/* RIGHT: TABS */}
            <Col xs={24} md={16}>
                <Card style={{ borderRadius: 12 }}>
                    <Tabs defaultActiveKey="1">
                        
                        {/* TAB 1: EDIT DETAILS & ITINERARY */}
                        <TabPane tab={<span><EditOutlined /> Details</span>} key="1">
                            <Form form={form} layout="vertical" onFinish={handleUpdate}>
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="from" label="From"><Input /></Form.Item></Col>
                                    <Col span={12}><Form.Item name="to" label="To"><Input /></Form.Item></Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}><Form.Item name="date" label="Date"><DatePicker style={{width:'100%'}}/></Form.Item></Col>
                                    <Col span={12}><Form.Item name="budget" label="Budget (₹)"><InputNumber style={{width:'100%'}}/></Form.Item></Col>
                                </Row>
                                <Form.Item name="description" label="Description"><Input.TextArea rows={3}/></Form.Item>

                                <Divider orientation="left">Itinerary (Day by Day)</Divider>
                                <Form.List name="itinerary">
                                    {(fields, { add, remove }) => (
                                    <>
                                        {fields.map(({ key, name, ...restField }, index) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item {...restField} name={[name, 'day']} label={index === 0 ? "Day" : ""} initialValue={index + 1}>
                                                <InputNumber min={1} style={{width: 60}} />
                                            </Form.Item>
                                            <Form.Item {...restField} name={[name, 'activity']} label={index === 0 ? "Activity" : ""} rules={[{ required: true, message: 'Missing activity' }]}>
                                                <Input placeholder="e.g. Visit Hidimba Temple" style={{ width: 300 }} />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} style={{color: 'red'}} />
                                        </Space>
                                        ))}
                                        <Form.Item>
                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                Add Day
                                            </Button>
                                        </Form.Item>
                                    </>
                                    )}
                                </Form.List>

                                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} block size="large" style={{marginTop: 20}}>
                                    Save Changes
                                </Button>
                            </Form>
                        </TabPane>

                        {/* TAB 2: JOIN REQUESTS (FIXED NAME 🚀) */}
                        <TabPane 
                            // ✅ FIX 2: Use 'pendingMembers' here
                            tab={<span><TeamOutlined /> Requests <Tag color="red">{trip?.pendingMembers?.length || 0}</Tag></span>} 
                            key="2"
                        >
                            <List
                                // ✅ FIX 3: Use 'pendingMembers' as source
                                dataSource={trip?.pendingMembers || []}
                                locale={{ emptyText: "No pending requests." }}
                                renderItem={reqUser => (
                                    <List.Item actions={[
                                        <Button 
                                            type="text" 
                                            icon={<CheckCircleOutlined />} 
                                            style={{color:'green'}}
                                            onClick={() => handleRequestAction(reqUser._id, 'accept')}
                                        >
                                            Accept
                                        </Button>,
                                        <Button 
                                            type="text" 
                                            danger 
                                            icon={<CloseCircleOutlined />}
                                            onClick={() => handleRequestAction(reqUser._id, 'reject')}
                                        >
                                            Reject
                                        </Button>
                                    ]}>
                                        <List.Item.Meta
                                            avatar={<Avatar src={reqUser.avatar} icon={<UserOutlined />} style={{backgroundColor: '#87d068'}} />}
                                            title={reqUser.name || "Unknown User"}
                                            description={reqUser.email || "No email"}
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                         {/* TAB 3: MEMBERS */}
                         <TabPane tab={<span><UserOutlined /> Members ({trip?.members?.length || 0})</span>} key="3">
                            <List
                                dataSource={trip?.members || []}
                                locale={{emptyText: "No accepted members yet"}}
                                renderItem={member => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar src={member.avatar} icon={<UserOutlined />} />}
                                            title={member.name}
                                            description="Confirmed Traveler"
                                        />
                                    </List.Item>
                                )}
                            />
                        </TabPane>

                    </Tabs>
                </Card>
            </Col>
        </Row>
      </div>
    </div>
  );
};

export default ManageTrip;