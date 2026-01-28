import React, { useState, useContext, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Row, Col, Typography, Button, Tabs, List, Avatar, Tag,
  message, Badge, Collapse, Empty, Progress, Statistic,
  Modal, Result, Alert, FloatButton, Drawer, Skeleton, Input,
  Table, Form, InputNumber, Rate, Image, Tooltip
} from "antd";
import {
  UserOutlined, LeftOutlined, CheckCircleFilled, TeamOutlined, LockOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, DollarOutlined,
  HeartFilled, TrophyFilled, StarFilled, BankOutlined,
  CameraOutlined, ThunderboltFilled, RobotOutlined,
  SkinOutlined, CoffeeOutlined, SettingOutlined, SendOutlined, PlusOutlined
} from "@ant-design/icons";
import { GroupContext } from "../context/GroupContext";
import { AuthContext } from "../context/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { joinGroup, addExpense } = useContext(GroupContext);
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [expenseForm] = Form.useForm();

  // --- ID HELPER (Handles objects, strings, and missing IDs) ---
  const getIdString = (val) => {
    if (!val) return "undefined";
    if (typeof val === 'string') return val;
    if (val._id) return getIdString(val._id);
    if (val.id) return getIdString(val.id);
    return String(val);
  };

  // --- FETCH GROUP DETAILS ---
  const fetchGroupDetails = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/groups/${id}`);
      const data = await res.json();
      setGroup(data);
    } catch (err) {
      console.error("Failed to fetch group details");
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    const interval = setInterval(fetchGroupDetails, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // STATES
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [isJoinPaymentVisible, setIsJoinPaymentVisible] = useState(false);

  const [chatMsg, setChatMsg] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const chatEndRef = useRef(null);

  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState("itinerary");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiItinerary, setAiItinerary] = useState([]);
  const [aiPackingList, setAiPackingList] = useState([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group?.chat]);

  if (!group) return <div style={{ padding: 50, textAlign: "center" }}><Skeleton active /></div>;

  // ---------------------------------------------------------
  // 🔥 ROBUST PERMISSION CHECKS 🔥
  // ---------------------------------------------------------
  const currentUserId = getIdString(user);

  // Handle Creator ID: It might be a direct ID string OR an object inside group.creator
  const rawCreator = group.creator;
  const creatorId = getIdString(rawCreator?.id || rawCreator);

  // Check if YOU are the Creator
  const isCreator = (currentUserId !== "undefined") &&
    (creatorId !== "undefined") &&
    (currentUserId.toLowerCase() === creatorId.toLowerCase());

  // Check if YOU are a Member
  const isMember = group.members?.some(m => getIdString(m) === currentUserId);
  const isPending = group.pendingMembers?.some(m => getIdString(m) === currentUserId);
  const isFull = (group.members?.length || 0) >= group.capacity;

  // ✅ MASTER SWITCH: If you are Creator OR Member, you have access
  const isJoined = isCreator || isMember;

  // DEBUGGING (Check console F12 if things are still broken)
  // console.log("Me:", currentUserId, "Creator:", creatorId, "IsCreator:", isCreator, "IsJoined:", isJoined);

  // ---------------------------------------------------------
  // ACTIONS
  // ---------------------------------------------------------

  const handleJoinClick = () => {
    if (!user) {
      message.error("Please login to join!");
      navigate("/login");
      return;
    }
    setIsJoinPaymentVisible(true);
  };

  const confirmPaymentAndJoin = async () => {
    setIsJoinPaymentVisible(false);
    setLoading(true);
    const result = await joinGroup(group._id || group.id);
    setLoading(false);

    if (result.success) {
      message.success("Deposit Secured! Request sent.");
      setIsBadgeModalVisible(true);
      fetchGroupDetails();
    } else {
      message.warning(result.message);
    }
  };

  const handleManageTrip = () => {
    navigate(`/manage-trip/${group._id || group.id}`);
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    try {
      await fetch(`https://travekla-web-app.onrender.com/api/groups/${group._id}/gallery`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, photoUrl: newPhotoUrl })
      });
      message.success("Memory added!");
      setNewPhotoUrl("");
      setIsPhotoModalVisible(false);
      fetchGroupDetails();
    } catch (err) {
      message.error("Failed to upload");
    }
  };

  const handleAddExpense = async (values) => {
    if (!user) return;
    const expenseData = {
      title: values.item,
      amount: values.amount,
      payerId: currentUserId
    };
    const success = await addExpense(group._id || group.id, expenseData);
    if (success) {
      expenseForm.resetFields();
      fetchGroupDetails();
    }
  };

  const handleSendChat = async () => {
    if (!chatMsg.trim()) return;
    try {
      await fetch(`https://travekla-web-app.onrender.com/api/groups/${group._id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, message: chatMsg })
      });
      setChatMsg("");
      fetchGroupDetails();
    } catch (err) { message.error("Failed to send"); }
  };

  const handleSubmitReview = async () => {
    try {
      const res = await fetch(`https://travekla-web-app.onrender.com/api/groups/${group._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, rating: reviewRating, comment: reviewComment })
      });
      const data = await res.json();
      if (res.ok) {
        message.success("Review posted!");
        fetchGroupDetails();
        setReviewComment("");
      } else {
        message.error(data.message);
      }
    } catch (err) { message.error("Review failed"); }
  };

  const triggerAI = (type) => {
    setAiDrawerVisible(true);
    setActiveAiTab(type);
    setIsAiLoading(true);
    setTimeout(() => {
      if (type === 'itinerary') setAiItinerary([{ time: "09:00 AM", activity: "Yoga", icon: <CoffeeOutlined /> }]);
      if (type === 'packing') setAiPackingList([{ item: "Sunscreen", required: true }]);
      setIsAiLoading(false);
    }, 1500);
  };

  // ---------------------------------------------------------
  // TAB CONTENT COMPONENTS
  // ---------------------------------------------------------

  const DetailsTab = () => (
    <Collapse defaultActiveKey={["1"]} ghost>
      <Panel header={<span><InfoCircleOutlined /> About Tour</span>} key="1">
        <Paragraph>{group.description}</Paragraph>
      </Panel>
      <Panel header={<span><SafetyCertificateOutlined /> Safety</span>} key="2">
        <Paragraph>Verified profiles only. Admin approval required.</Paragraph>
      </Panel>
      <Panel header={<span><TeamOutlined /> Members</span>} key="3">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* 1. Show HOST (Creator) first */}
          <Tooltip title={`${group.creator?.name} (Host)`}>
            <Badge dot color="gold" offset={[-5, 5]}>
              <Avatar src={group.creator?.avatar} icon={<UserOutlined />} style={{ border: '2px solid #faad14' }} />
            </Badge>
          </Tooltip>

          {/* 2. Show Other Members */}
          {group.members?.map((m, i) => {
            // Don't show creator twice if they are also in the list
            if (getIdString(m) === creatorId) return null;
            return (
              <Tooltip title={m.name} key={i}>
                <Avatar src={m.avatar} icon={<UserOutlined />} />
              </Tooltip>
            );
          })}

          {group.members?.length === 0 && <Text type="secondary" style={{ marginLeft: 10, alignSelf: 'center' }}>Join to be the first traveler!</Text>}
        </div>
      </Panel>
    </Collapse>
  );

  // 📸 GALLERY
  const GalleryTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <Title level={5}>Trip Memories 📸</Title>
        {isJoined && (
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsPhotoModalVisible(true)}>
            Add Photo
          </Button>
        )}
      </div>

      {!group.gallery || group.gallery.length === 0 ? (
        <Empty description="No photos shared yet. Join and be the first!" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 }}>
          {group.gallery.map((pic, idx) => (
            <Image
              key={idx}
              width="100%"
              src={pic.url}
              style={{ borderRadius: 8, objectFit: 'cover', height: 120, cursor: 'pointer' }}
              preview={{ mask: <div style={{ color: 'white' }}><CameraOutlined /> View</div> }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ⭐ REVIEWS
  const ReviewTab = () => (
    <div>
      {isJoined ? (
        <Card size="small" style={{ marginBottom: 20, background: '#f9f9f9', borderColor: '#f0f0f0' }}>
          <Text strong>How was the trip?</Text> <br />
          <Rate value={reviewRating} onChange={setReviewRating} style={{ marginBottom: 10, fontSize: 16 }} />
          <TextArea
            rows={2}
            placeholder="Share your experience..."
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            style={{ marginBottom: 10 }}
          />
          <Button type="primary" size="small" onClick={handleSubmitReview}>Post Review</Button>
        </Card>
      ) : (
        <Alert message="Join this trip to leave a review!" type="info" showIcon style={{ marginBottom: 20 }} />
      )}

      <List
        itemLayout="horizontal"
        dataSource={group.reviews || []}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={item.user?.avatar} />}
              title={<span>{item.user?.name} <Rate disabled defaultValue={item.rating} style={{ fontSize: 12, marginLeft: 5 }} /></span>}
              description={item.comment}
            />
          </List.Item>
        )}
        locale={{ emptyText: "No reviews yet." }}
      />
    </div>
  );

  // 🔒 LOCKED TABS
  const LockedTab = ({ title }) => (
    <Empty
      image={<LockOutlined style={{ fontSize: 60, color: "#d9d9d9" }} />}
      description={<span><Title level={5}>Members Only</Title><Text type="secondary">Join the group to access {title}.</Text></span>}
    >
      {!user && <Button type="primary" onClick={() => navigate("/login")}>Login Now</Button>}
    </Empty>
  );

  const ChatTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: 400 }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 10, background: '#f5f5f5', borderRadius: 8, marginBottom: 10 }}>
        {(!group.chat || group.chat.length === 0) ? <Empty description="Say Hi! 👋" image={Empty.PRESENTED_IMAGE_SIMPLE} /> :
          group.chat.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: getIdString(msg.user?._id || msg.user) === currentUserId ? 'flex-end' : 'flex-start',
              marginBottom: 10
            }}>
              <div style={{
                background: getIdString(msg.user?._id || msg.user) === currentUserId ? '#fa541c' : '#fff',
                color: getIdString(msg.user?._id || msg.user) === currentUserId ? '#fff' : '#000',
                padding: '8px 12px',
                borderRadius: 12,
                maxWidth: '70%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}>
                <Text style={{ fontSize: 10, color: getIdString(msg.user?._id || msg.user) === currentUserId ? '#ffd8c2' : '#888', display: 'block' }}>
                  {msg.user?.name || "Unknown"}
                </Text>
                {msg.message}
              </div>
            </div>
          ))
        }
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Input
          placeholder="Type a message..."
          value={chatMsg}
          onChange={e => setChatMsg(e.target.value)}
          onPressEnter={handleSendChat}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSendChat} />
      </div>
    </div>
  );

  const ExpensesTab = () => {
    const realExpenses = group.expenses || [];
    const totalExpense = realExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    const memberCount = (group.members?.length || 0);
    const perPerson = memberCount > 0 ? (totalExpense / memberCount).toFixed(0) : 0;

    return (
      <div>
        <Row gutter={16} style={{ marginBottom: 20 }}>
          <Col span={12}>
            <Statistic title="Total Spent" value={totalExpense} prefix="₹" />
          </Col>
          <Col span={12}>
            <Statistic title="Per Person (Approx)" value={perPerson} prefix="₹" valueStyle={{ color: "#cf1322" }} />
          </Col>
        </Row>

        <Table
          dataSource={realExpenses}
          rowKey={(record) => record._id || Math.random()}
          pagination={{ pageSize: 5 }}
          size="small"
          columns={[
            { title: "Item", dataIndex: "title" },
            { title: "₹", dataIndex: "amount" },
            { title: "Paid By", render: (_, r) => getIdString(r.paidBy) === currentUserId ? "You" : "Member" },
          ]}
        />

        <div style={{ marginTop: 20, background: "#f5f5f5", padding: 15, borderRadius: 8 }}>
          <Title level={5}>Add New Expense</Title>
          <Form layout="inline" form={expenseForm} onFinish={handleAddExpense}>
            <Form.Item name="item" rules={[{ required: true, message: 'Item name?' }]}>
              <Input placeholder="e.g. Taxi" />
            </Form.Item>
            <Form.Item name="amount" rules={[{ required: true, message: 'Amount?' }]}>
              <InputNumber placeholder="₹" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<DollarOutlined />}>Add</Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------
  const items = [
    { key: "1", label: "Details", children: <DetailsTab /> },
    { key: "2", label: "Gallery", children: <GalleryTab /> },
    { key: "3", label: "Reviews", children: <ReviewTab /> },
  ];

  // ✅ IF CREATOR OR MEMBER -> SHOW UNLOCKED TABS
  if (isJoined) {
    items.push({ key: "4", label: <span><DollarOutlined /> Split Bill</span>, children: <ExpensesTab /> });
    items.push({ key: "5", label: "Chat", children: <ChatTab /> });
  } else {
    items.push({ key: "4", label: <span><LockOutlined /> Split Bill</span>, children: <LockedTab title="Expenses" /> });
    items.push({ key: "5", label: <span><LockOutlined /> Chat</span>, children: <LockedTab title="Chat" /> });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
      <Button icon={<LeftOutlined />} type="text" onClick={() => navigate(-1)} style={{ marginBottom: 10 }}>Back</Button>

      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Tag color="orange">Group Tour</Tag>
            <Title level={2} style={{ marginTop: 10, marginBottom: 5 }}>{group.from} to {group.to}</Title>

            <div style={{ display: "flex", alignItems: "center", gap: 15, margin: "15px 0" }}>
              <Text strong><HeartFilled style={{ color: "#eb2f96" }} /> Vibe Match:</Text>
              <Progress percent={85} steps={5} strokeColor="#52c41a" size="small" style={{ width: 150 }} />
            </div>

            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Tag icon={<TeamOutlined />} color={isFull ? "red" : "green"}>
                {group.members?.length || 0} / {group.capacity} Joined
              </Tag>
              {/* MEMBER AVATARS (Only first 4) */}
              <Avatar.Group maxCount={4}>
                <Tooltip title="Host">
                  <Avatar src={group.creator?.avatar} style={{ border: '2px solid #faad14' }} />
                </Tooltip>
                {group.members?.map((m, i) => (
                  <Avatar key={i} src={m.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                ))}
              </Avatar.Group>
            </div>
          </Col>

          {/* 🔥 BUTTON SECTION 🔥 */}
          <Col xs={24} md={8} style={{ textAlign: "right" }}>

            {isCreator ? (
              <Button
                type="primary"
                size="large"
                block
                icon={<SettingOutlined />}
                style={{ marginTop: 20, height: 50, background: '#faad14', borderColor: '#faad14', fontWeight: 'bold' }}
                onClick={handleManageTrip}
              >
                Manage Trip
              </Button>
            ) : isMember ? (
              <Button size="large" block disabled style={{ marginTop: 20, height: 50, color: 'green', borderColor: 'green' }} icon={<CheckCircleFilled />}>
                You are Going!
              </Button>
            ) : isPending ? (
              <Button size="large" block disabled style={{ marginTop: 20, height: 50, color: 'orange', borderColor: 'orange' }}>
                Request Sent ⏳
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                disabled={isFull}
                style={{ marginTop: 20, height: 50, fontSize: 18, background: isFull ? "#ccc" : "#fa541c" }}
                onClick={handleJoinClick}
              >
                {isFull ? "Trip Full" : "Join This Trip"}
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card style={{ borderRadius: 12, minHeight: 500 }}>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card style={{ textAlign: "center", borderRadius: 12, background: "#f9f9f9", marginBottom: 20 }}>
            <Badge count={<CheckCircleFilled style={{ color: "#52c41a" }} />}>
              <Avatar size={80} src={group.creator?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=Host`} icon={<UserOutlined />} />
            </Badge>
            <Title level={4} style={{ margin: "10px 0 0 0" }}>{group.creator?.name || "Host"}</Title>
            <Tag color="gold" icon={<StarFilled />}>Trip Host</Tag>
          </Card>

          <Card style={{ borderRadius: 12, background: "#f6ffed", borderColor: "#b7eb8f", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
              <BankOutlined style={{ fontSize: 24, color: "#52c41a", marginRight: 10 }} />
              <Title level={5} style={{ margin: 0 }}>No-Flake Pot</Title>
            </div>
            <Statistic value={(group.members?.length || 0) * 500} prefix="₹" valueStyle={{ color: "#3f8600", fontWeight: "bold" }} />
          </Card>
        </Col>
      </Row>

      <FloatButton.Group trigger="hover" type="primary" style={{ right: 24, bottom: 24 }} icon={<RobotOutlined />}>
        <FloatButton icon={<ThunderboltFilled />} onClick={() => triggerAI("itinerary")} />
        <FloatButton icon={<SkinOutlined />} onClick={() => triggerAI("packing")} />
      </FloatButton.Group>

      <Drawer title={<span><RobotOutlined /> AI Assistant</span>} placement="right" onClose={() => setAiDrawerVisible(false)} open={aiDrawerVisible}>
        {isAiLoading ? <Skeleton active /> : <List dataSource={activeAiTab === 'itinerary' ? aiItinerary : aiPackingList} renderItem={item => <List.Item>{item.activity || item.item}</List.Item>} />}
      </Drawer>

      <Modal title="Secure Your Spot" open={isJoinPaymentVisible} onCancel={() => setIsJoinPaymentVisible(false)} footer={[
        <Button key="back" onClick={() => setIsJoinPaymentVisible(false)}>Cancel</Button>,
        <Button key="submit" type="primary" onClick={confirmPaymentAndJoin} style={{ background: "#52c41a", borderColor: "#52c41a" }}>Pay ₹549.00</Button>
      ]}>
        <Alert message="No-Flake Policy Active" description="Includes refundable deposit + service fee." type="info" showIcon />
      </Modal>

      <Modal open={isBadgeModalVisible} footer={null} onCancel={() => setIsBadgeModalVisible(false)} centered>
        <Result icon={<TrophyFilled style={{ color: "#faad14", fontSize: "4rem" }} />} title="Request Sent!" subTitle="Host notified." extra={[<Button type="primary" onClick={() => setIsBadgeModalVisible(false)}>Okay</Button>]} />
      </Modal>

      <Modal title="Add to Shared Album" open={isPhotoModalVisible} onCancel={() => setIsPhotoModalVisible(false)} onOk={handleAddPhoto} okText="Upload">
        <Input placeholder="Paste Image URL..." value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} />
      </Modal>
    </div>
  );
};

export default GroupDetails;