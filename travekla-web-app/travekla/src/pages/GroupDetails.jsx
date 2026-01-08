import React, { useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // Added useNavigate
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Tabs,
  List,
  Avatar,
  Input,
  Tag,
  message,
  Badge,
  Collapse,
  Image,
  Rate,
  Empty,
  Progress,
  Table,
  Statistic,
  Form,
  InputNumber,
  Modal,
  Result,
  Tooltip,
  Divider,
  Alert,
  FloatButton,
  Drawer,
  Skeleton,
  Checkbox,
} from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  SendOutlined,
  LeftOutlined,
  CheckCircleFilled,
  TeamOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  HeartFilled,
  TrophyFilled,
  StarFilled,
  EditOutlined,
  BankOutlined,
  WalletOutlined,
  CameraOutlined,
  ThunderboltFilled,
  RobotOutlined,
  SkinOutlined,
  CoffeeOutlined,
  FireOutlined,
  ShoppingCartOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { GroupContext } from "../context/GroupContext";
import { AuthContext } from "../context/AuthContext"; // 👈 IMPORT AUTH CONTEXT

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// --- MOCK MEMBER DATA ---
const mockMembers = [
  {
    id: 101,
    name: "Rohan Das",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan",
    level: "Level 2",
    rating: 4.5,
    reviews: [
      {
        from: "Priya",
        comment: "Very funny guy, kept the group entertained!",
        rating: 5,
      },
      {
        from: "Amit",
        comment: "Punctual but talks a lot during treks.",
        rating: 4,
      },
    ],
  },
  {
    id: 102,
    name: "Sanya K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanya",
    level: "Level 4",
    rating: 5.0,
    reviews: [
      {
        from: "Host Aarav",
        comment: "Perfect traveler. Follows all rules.",
        rating: 5,
      },
    ],
  },
];

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for redirection
  const { groups, joinGroup } = useContext(GroupContext);
  const { user } = useContext(AuthContext); // 👈 GET CURRENT USER
  const [loading, setLoading] = useState(false);

  const group = groups.find((g) => (g._id || g.id).toString() === id);
  // STATES
  const [hasJoined, setHasJoined] = useState(false);
  const [discussion, setDiscussion] = useState([]);
  const [newComment, setNewComment] = useState("");

  // GALLERY STATES
  const [galleryImages, setGalleryImages] = useState(
    group ? group.gallery || [] : []
  );
  const [isPhotoModalVisible, setIsPhotoModalVisible] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // MODAL STATES
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [isJoinPaymentVisible, setIsJoinPaymentVisible] = useState(false);

  // MEMBER REVIEW STATES
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [reviewForm] = Form.useForm();

  // AI & PACKING LIST STATES
  const [aiDrawerVisible, setAiDrawerVisible] = useState(false);
  const [activeAiTab, setActiveAiTab] = useState("itinerary");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiItinerary, setAiItinerary] = useState([]);
  const [aiPackingList, setAiPackingList] = useState([]);

  // EXPENSE STATE
  const [expenses, setExpenses] = useState([
    { key: "1", item: "Taxi to Hotel", amount: 500, payer: "Rohan" },
    { key: "2", item: "Group Dinner", amount: 1200, payer: "You" },
  ]);
  const [expenseForm] = Form.useForm();

  if (!group)
    return (
      <div style={{ padding: 50, textAlign: "center" }}>
        <h2>Trip not found!</h2>
      </div>
    );

  // --- ACTIONS ---

  // 4. Join Logic
  const handleJoin = async () => {
    if (!user) {
      message.error("Please login to join a trip!");
      navigate("/login");
      return;
    }

    setLoading(true);
    // Use the correct ID field
    const success = await joinGroup(group._id || group.id);
    setLoading(false);
  };

  const isFull = group.membersJoined >= group.capacity;

  const confirmPaymentAndJoin = () => {
    setIsJoinPaymentVisible(false);
    joinGroup(group.id);
    setHasJoined(true);
    setIsBadgeModalVisible(true);
    message.success("Deposit Secured! Welcome to the group.");
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
    setIsProfileModalVisible(true);
  };

  const handleSubmitReview = (values) => {
    const newReview = {
      from: "You",
      comment: values.comment,
      rating: values.rating,
    };
    selectedMember.reviews.unshift(newReview);
    message.success(`Review added for ${selectedMember.name}!`);
    reviewForm.resetFields();
  };

  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    setGalleryImages([...galleryImages, newPhotoUrl]);
    setNewPhotoUrl("");
    setIsPhotoModalVisible(false);
    message.success("Memory added to Shared Album!");
  };

  const handlePostComment = () => {
    if (!newComment.trim()) return;
    setDiscussion([
      ...discussion,
      { id: Date.now(), author: "You", text: newComment, time: "Just now" },
    ]);
    setNewComment("");
  };

  // --- VIBE LOGIC ---
  const myPreferences = [
    "No Smoking",
    "Early Riser",
    "Nature Lover",
    "Budget Travel",
  ];
  const groupTags = ["No Smoking", "Split Costs", "Adventure", "Early Riser"];
  const vibeScore = Math.round(
    (groupTags.filter((t) => myPreferences.includes(t)).length /
      groupTags.length) *
      100
  );

  // --- AI LOGIC (ITINERARY + MONETIZED PACKING) ---
  const triggerAI = (type) => {
    setAiDrawerVisible(true);
    setActiveAiTab(type);
    setIsAiLoading(true);

    setTimeout(() => {
      if (type === "itinerary") {
        setAiItinerary([
          {
            time: "09:00 AM",
            activity: "Sunrise Yoga",
            icon: <CoffeeOutlined />,
          },
          {
            time: "01:00 PM",
            activity: "Local Seafood Thali",
            icon: <TeamOutlined />,
          },
          {
            time: "09:00 PM",
            activity: "Bonfire Night",
            icon: <FireOutlined />,
          },
        ]);
      } else if (type === "packing") {
        const list = [
          { item: "Government ID", required: true, link: "" },
          {
            item: "Power Bank (20k mAh)",
            required: true,
            link: "https://www.amazon.in/s?k=power+bank",
          },
          {
            item: "First Aid Kit",
            required: true,
            link: "https://www.amazon.in/s?k=travel+medical+kit",
          },
        ];

        if (groupTags.includes("Adventure") || groupTags.includes("Trekking")) {
          list.push({
            item: "Hiking Boots",
            required: true,
            link: "https://www.amazon.in/s?k=hiking+boots",
          });
          list.push({
            item: "Raincoat",
            required: false,
            link: "https://www.amazon.in/s?k=raincoat",
          });
        }
        if (
          group.to.toLowerCase().includes("goa") ||
          group.to.toLowerCase().includes("beach")
        ) {
          list.push({
            item: "Sunscreen (SPF 50+)",
            required: true,
            link: "https://www.amazon.in/s?k=sunscreen",
          });
          list.push({
            item: "Sunglasses",
            required: false,
            link: "https://www.amazon.in/s?k=sunglasses",
          });
        }
        if (groupTags.includes("Early Riser")) {
          list.push({
            item: "Yoga Mat",
            required: false,
            link: "https://www.amazon.in/s?k=yoga+mat",
          });
        }

        setAiPackingList(list);
      }
      setIsAiLoading(false);
    }, 1500);
  };

  // --- EXPENSE LOGIC ---
  const handleAddExpense = (values) => {
    setExpenses([
      ...expenses,
      {
        key: Date.now(),
        item: values.item,
        amount: values.amount,
        payer: "You",
      },
    ]);
    expenseForm.resetFields();
    message.success("Expense added!");
  };
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const perPerson = (
    totalExpense /
    (group.membersJoined + (hasJoined ? 0 : 1))
  ).toFixed(0);
  const potAmount = (group.membersJoined + (hasJoined ? 0 : 0)) * 500;

  // --- TABS ---
  const DetailsTab = () => (
    <Collapse defaultActiveKey={["1"]} ghost expandIconPosition="end">
      <Panel
        header={
          <span>
            <InfoCircleOutlined /> About Tour
          </span>
        }
        key="1"
      >
        <Paragraph>{group.aboutTour || group.description}</Paragraph>
      </Panel>
      <Panel
        header={
          <span>
            <TeamOutlined /> About Group
          </span>
        }
        key="2"
      >
        <Paragraph>{group.aboutGroup || "A friendly group."}</Paragraph>
      </Panel>
      <Panel
        header={
          <span>
            <HomeOutlined /> Accommodation
          </span>
        }
        key="3"
      >
        <Paragraph>{group.accommodation || "Standard hotel."}</Paragraph>
      </Panel>
      <Panel
        header={
          <span>
            <SafetyCertificateOutlined /> Safety
          </span>
        }
        key="4"
      >
        <Paragraph>{group.privacySafety || "Verified profiles."}</Paragraph>
      </Panel>
    </Collapse>
  );

  const GalleryTab = () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 15,
        }}
      >
        <Title level={5} style={{ margin: 0 }}>
          Shared Album ({galleryImages.length})
        </Title>
        {/* Only show upload button if user is logged in AND joined */}
        {hasJoined && user && (
          <Button
            type="primary"
            size="small"
            icon={<CameraOutlined />}
            onClick={() => setIsPhotoModalVisible(true)}
          >
            Add Memory
          </Button>
        )}
      </div>
      {galleryImages.length > 0 ? (
        <Image.PreviewGroup>
          <Row gutter={[8, 8]}>
            {galleryImages.map((src, i) => (
              <Col key={i} xs={12} sm={8} md={8}>
                <Image
                  width="100%"
                  height={150}
                  src={src}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                  fallback="https://via.placeholder.com/150"
                />
              </Col>
            ))}
          </Row>
        </Image.PreviewGroup>
      ) : (
        <Empty description="No photos yet" />
      )}
    </div>
  );

  const ReviewsTab = () => (
    <List
      dataSource={group.reviews || []}
      renderItem={(item) => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar>{item.user[0]}</Avatar>}
            title={
              <span>
                {item.user}{" "}
                <Rate
                  disabled
                  defaultValue={item.rating}
                  style={{ fontSize: 12 }}
                />
              </span>
            }
            description={item.comment}
          />
        </List.Item>
      )}
    />
  );

  const ExpensesTab = () => (
    <div>
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={12}>
          <Statistic title="Total" value={totalExpense} prefix="₹" />
        </Col>
        <Col span={12}>
          <Statistic
            title="Per Person"
            value={perPerson}
            prefix="₹"
            valueStyle={{ color: "#cf1322" }}
          />
        </Col>
      </Row>
      <Table
        dataSource={expenses}
        pagination={false}
        size="small"
        columns={[
          { title: "Item", dataIndex: "item" },
          { title: "₹", dataIndex: "amount" },
          { title: "Payer", dataIndex: "payer" },
        ]}
      />
      <div style={{ marginTop: 20, background: "#f5f5f5", padding: 15 }}>
        <Title level={5}>Add Expense</Title>
        <Form layout="inline" form={expenseForm} onFinish={handleAddExpense}>
          <Form.Item name="item" rules={[{ required: true }]}>
            <Input placeholder="Item" />
          </Form.Item>
          <Form.Item name="amount" rules={[{ required: true }]}>
            <InputNumber placeholder="₹" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );

  const DiscussionTab = () => (
    <div>
      <div
        style={{
          height: "300px",
          overflowY: "auto",
          border: "1px solid #f0f0f0",
          padding: "10px",
          marginBottom: "15px",
          background: "#fafafa",
        }}
      >
        <List
          dataSource={discussion}
          renderItem={(item) => (
            <List.Item style={{ border: "none", padding: "5px 0" }}>
              <Text>
                {item.author}: {item.text}
              </Text>
            </List.Item>
          )}
        />
        {discussion.length === 0 && (
          <Empty
            description="No messages yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <TextArea
          rows={1}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type a message..."
          onPressEnter={(e) =>
            !e.shiftKey && (e.preventDefault(), handlePostComment())
          }
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handlePostComment}
        />
      </div>
    </div>
  );

  // --- LOCKED TAB COMPONENT (For Guests) ---
  const LockedTab = ({ title }) => (
    <Empty
      image={<LockOutlined style={{ fontSize: 60, color: "#d9d9d9" }} />}
      description={
        <span>
          <Title level={5}>Members Only</Title>
          <Text type="secondary">
            Please <Link to="/login">Login</Link> and Join the Group to access{" "}
            {title}.
          </Text>
        </span>
      }
    >
      <Button type="primary" onClick={() => navigate("/login")}>
        Login Now
      </Button>
    </Empty>
  );

  // BUILD TABS
  const items = [
    { key: "1", label: "Details", children: <DetailsTab /> },
    { key: "2", label: "Gallery", children: <GalleryTab /> },
    { key: "3", label: "Reviews", children: <ReviewsTab /> },
  ];

  // 🔒 CONDITION: Show Expenses/Chat ONLY if Logged in AND Joined
  if (hasJoined && user) {
    items.push({
      key: "4",
      label: (
        <span>
          <DollarOutlined /> Split Bill
        </span>
      ),
      children: <ExpensesTab />,
    });
    items.push({ key: "5", label: "Chat", children: <DiscussionTab /> });
  } else {
    // Show Locked Tabs
    items.push({
      key: "4",
      label: (
        <span>
          <LockOutlined /> Split Bill
        </span>
      ),
      children: <LockedTab title="Expenses" />,
    });
    items.push({
      key: "5",
      label: (
        <span>
          <LockOutlined /> Chat
        </span>
      ),
      children: <LockedTab title="Chat" />,
    });
  }

  return (
    <div style={{ maxWidth: 1100, margin: "20px auto", padding: "0 20px" }}>
      <Link to="/">
        <Button
          icon={<LeftOutlined />}
          type="text"
          style={{ marginBottom: 10 }}
        >
          Back
        </Button>
      </Link>

      {/* HEADER */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Tag color="orange">Upcoming Group Tour</Tag>
            <Title level={2} style={{ marginTop: 10, marginBottom: 5 }}>
              {group.from} to {group.to}
            </Title>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 15,
                margin: "15px 0",
              }}
            >
              <Text strong>
                <HeartFilled style={{ color: "#eb2f96" }} /> Vibe Match:
              </Text>
              <Progress
                percent={vibeScore}
                steps={5}
                strokeColor="#52c41a"
                size="small"
                style={{ width: 150 }}
              />
            </div>
           {/* DISPLAY MEMBER AVATARS */}
<div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
  <Tag icon={<TeamOutlined />} color={isFull ? "red" : "green"}>
    {group.members?.length || group.membersJoined} / {group.capacity} Joined
  </Tag>

  {/* Show faces of people who joined */}
  <Avatar.Group maxCount={4}>
    {group.members && group.members.map((member, index) => (
      <Tooltip title={member.name} key={index}>
        <Avatar src={member.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + index} />
      </Tooltip>
    ))}
  </Avatar.Group>
</div>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            {/* 🔒 SECURITY CHECK 2: Show Login button if not logged in */}
            {!user ? (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/login")}
                icon={<LockOutlined />}
                style={{
                  width: "100%",
                  background: "#595959",
                  borderColor: "#595959",
                }}
              >
                Login to Join
              </Button>
            ) : hasJoined ? (
              <Button
                size="large"
                disabled
                style={{ width: "100%", color: "green" }}
              >
                ✅ Joined
              </Button>
            ) : (
              <Button
                type="primary"
                size="large"
                block
                style={{
                  marginTop: 20,
                  height: 50,
                  fontSize: 18,
                  background: isFull ? "#ccc" : "#fa541c",
                }}
                onClick={handleJoin}
                loading={loading}
                disabled={isFull}
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
          <Card
            style={{
              textAlign: "center",
              borderRadius: 12,
              background: "#f9f9f9",
              marginBottom: 20,
            }}
          >
            <Badge count={<CheckCircleFilled style={{ color: "#52c41a" }} />}>
              <Avatar
                size={80}
                src={group.creator.avatarUrl}
                icon={<UserOutlined />}
              />
            </Badge>
            <Title level={4} style={{ margin: "10px 0 0 0" }}>
              {group.creator.name}
            </Title>
            <Tag color="gold" icon={<StarFilled />}>
              Level 5 Host
            </Tag>
          </Card>

          <Card
            style={{
              borderRadius: 12,
              background: "#f6ffed",
              borderColor: "#b7eb8f",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <BankOutlined
                style={{ fontSize: 24, color: "#52c41a", marginRight: 10 }}
              />
              <Title level={5} style={{ margin: 0 }}>
                No-Flake Pot
              </Title>
            </div>
            <Statistic
              value={potAmount}
              prefix="₹"
              valueStyle={{ color: "#3f8600", fontWeight: "bold" }}
              suffix={
                <span style={{ fontSize: 12, color: "#666" }}>
                  (Refundable)
                </span>
              }
            />
            <Divider style={{ margin: "10px 0" }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <SafetyCertificateOutlined /> Deposit is returned when you arrive.
            </Text>
          </Card>

          {/* 🔒 SECURITY CHECK 3: Hide Member List from Guests */}
          <Card
            title="Members Joined"
            size="small"
            style={{ borderRadius: 12 }}
          >
            {user ? (
              <List
                itemLayout="horizontal"
                dataSource={mockMembers}
                renderItem={(member) => (
                  <List.Item
                    style={{ cursor: "pointer" }}
                    onClick={() => handleMemberClick(member)}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={member.avatar} />}
                      title={member.name}
                      description={
                        <span>
                          <StarFilled style={{ color: "#fadb14" }} />{" "}
                          {member.rating}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div
                  style={{
                    filter: "blur(4px)",
                    userSelect: "none",
                    marginBottom: 10,
                  }}
                >
                  <Avatar.Group>
                    <Avatar /> <Avatar /> <Avatar />
                  </Avatar.Group>
                  <div>Rohan Das, Sanya K</div>
                </div>
                <Tag icon={<LockOutlined />} color="red">
                  Login to view members
                </Tag>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 🔒 SECURITY CHECK 4: Show AI Tools only if logged in (Optional, kept visible for now to upsell) */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<RobotOutlined />}
      >
        <FloatButton
          icon={<ThunderboltFilled />}
          tooltip="AI Itinerary"
          onClick={() => triggerAI("itinerary")}
        />
        <FloatButton
          icon={<SkinOutlined />}
          tooltip="Smart Packing List"
          onClick={() => triggerAI("packing")}
        />
      </FloatButton.Group>

      {/* --- AI DRAWER --- */}
      <Drawer
        title={
          <span>
            <RobotOutlined style={{ color: "#1890ff" }} /> AI Assistant
          </span>
        }
        placement="right"
        onClose={() => setAiDrawerVisible(false)}
        open={aiDrawerVisible}
      >
        <div style={{ marginBottom: 20 }}>
          {activeAiTab === "itinerary" ? (
            <Text strong>✨ Vibe-Matched Itinerary</Text>
          ) : (
            <Text strong>🎒 Smart Packing Checklist for {group.to}</Text>
          )}
        </div>
        {isAiLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <div>
            {activeAiTab === "itinerary" && (
              <List
                dataSource={aiItinerary}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          icon={item.icon}
                          style={{
                            backgroundColor: "#e6f7ff",
                            color: "#1890ff",
                          }}
                        />
                      }
                      title={item.time}
                      description={<Text strong>{item.activity}</Text>}
                    />
                  </List.Item>
                )}
              />
            )}
            {activeAiTab === "packing" && (
              <div>
                <Alert
                  message="Buy essentials instantly (Affiliate Links)"
                  type="info"
                  showIcon
                  style={{ marginBottom: 15 }}
                />
                <List
                  dataSource={aiPackingList}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        item.link && (
                          <Button
                            type="link"
                            size="small"
                            icon={<ShoppingCartOutlined />}
                            href={item.link}
                            target="_blank"
                          >
                            Buy
                          </Button>
                        ),
                      ]}
                    >
                      <Checkbox defaultChecked={false}>
                        {item.item}{" "}
                        {item.required && (
                          <Tag color="red" style={{ marginLeft: 5 }}>
                            Essential
                          </Tag>
                        )}
                      </Checkbox>
                    </List.Item>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* --- MODALS --- */}
      <Modal
        open={isBadgeModalVisible}
        footer={null}
        onCancel={() => setIsBadgeModalVisible(false)}
        centered
      >
        <Result
          icon={<TrophyFilled style={{ color: "#faad14", fontSize: "4rem" }} />}
          title={`Badge Unlocked: ${group.to} Traveler!`}
          subTitle="Deposit successful!"
          extra={[
            <Button
              type="primary"
              onClick={() => setIsBadgeModalVisible(false)}
            >
              Let's Go!
            </Button>,
          ]}
        />
      </Modal>

      <Modal
        title={
          <span>
            <WalletOutlined /> Secure Your Spot
          </span>
        }
        open={isJoinPaymentVisible}
        onCancel={() => setIsJoinPaymentVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsJoinPaymentVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={confirmPaymentAndJoin}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Pay ₹549.00
          </Button>,
        ]}
      >
        <Alert
          message="No-Flake Policy Active"
          description="Includes refundable deposit + service fee."
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
        />
        <div style={{ background: "#f9f9f9", padding: 15, borderRadius: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <Text>Refundable Deposit:</Text>
            <Text>₹500.00</Text>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <Text>
              Platform Fee{" "}
              <Tooltip title="Verification & Service Charge">
                <InfoCircleOutlined />
              </Tooltip>
              :
            </Text>
            <Text>₹49.00</Text>
          </div>
          <Divider style={{ margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Text strong>Total Payable:</Text>
            <Text strong style={{ fontSize: 18 }}>
              ₹549.00
            </Text>
          </div>
        </div>
        <div
          style={{
            marginTop: 15,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Want zero fees?
          </Text>
          <Link to="/gold">
            <Button
              size="small"
              type="dashed"
              icon={<CrownOutlined style={{ color: "#faad14" }} />}
            >
              Get Gold
            </Button>
          </Link>
        </div>
      </Modal>

      <Modal
        title="Add to Shared Album"
        open={isPhotoModalVisible}
        onCancel={() => setIsPhotoModalVisible(false)}
        onOk={handleAddPhoto}
        okText="Upload"
      >
        <Input
          placeholder="Paste Image URL..."
          value={newPhotoUrl}
          onChange={(e) => setNewPhotoUrl(e.target.value)}
          onPressEnter={handleAddPhoto}
        />
      </Modal>

      <Modal
        title="Traveler Report Card"
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
      >
        {selectedMember && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar size={64} src={selectedMember.avatar} />
              <Title level={4}>{selectedMember.name}</Title>
              <Tag color="blue">{selectedMember.level}</Tag>
              <div>
                <Rate disabled allowHalf defaultValue={selectedMember.rating} />
                <Text strong style={{ marginLeft: 10 }}>
                  {selectedMember.rating}/5.0
                </Text>
              </div>
            </div>
            <Divider orientation="left">Community Feedback</Divider>
            <List
              size="small"
              dataSource={selectedMember.reviews}
              renderItem={(review) => (
                <List.Item>
                  <List.Item.Meta
                    title={<Text strong>{review.from}</Text>}
                    description={
                      <div>
                        <Rate
                          disabled
                          style={{ fontSize: 10 }}
                          defaultValue={review.rating}
                        />
                        <div>{review.comment}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            <Divider orientation="left">Write a Review</Divider>
            <Form
              form={reviewForm}
              layout="vertical"
              onFinish={handleSubmitReview}
            >
              <Form.Item
                name="rating"
                label="Rating"
                rules={[{ required: true }]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Your Experience"
                rules={[{ required: true }]}
              >
                <TextArea rows={2} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<EditOutlined />}
                block
              >
                Submit Feedback
              </Button>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GroupDetails;
