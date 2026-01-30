import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Row, Col, Typography, Button, Card, Tag, Avatar, Timeline, 
  message, Spin, Divider, Affix, Space, Tabs, Input, List, Modal, Tooltip 
} from 'antd';
import { 
  ClockCircleFilled, CheckCircleFilled, UserOutlined, ArrowLeftOutlined, 
  SafetyCertificateOutlined, HeartFilled, HeartOutlined, ShareAltOutlined,
  DollarCircleOutlined, CameraOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const TripDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  
  // Data States
  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Fake Save State
  const [activeTab, setActiveTab] = useState("1");

  // Input States (For Modals)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "" });
  
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // --- FETCH DATA ---
  const fetchTripData = async () => {
    try {
      // 1. Get Trip Info
      const res = await fetch(`https://travekla-web-app.onrender.com/api/trips`); 
      const data = await res.json();
      const foundTrip = data.find(t => t._id === id);
      setTrip(foundTrip);

      // 2. Get Expenses (Only if member, but we fetch safely)
      const expRes = await fetch(`https://travekla-web-app.onrender.com/api/group/${id}/expenses`);
      const expData = await expRes.json();
      setExpenses(Array.isArray(expData) ? expData : []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTripData(); }, [id]);

  // --- ACTIONS ---

  // 1. Join Trip
  const handleJoin = async () => {
      if(!user) return message.warning("Login to join!");
      setJoinLoading(true);
      try {
          await fetch(`https://travekla-web-app.onrender.com/api/trips/${id}/join`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user._id })
          });
          message.success("Request Sent! 📩");
          fetchTripData();
      } catch (e) { message.error("Failed to join"); }
      setJoinLoading(false);
  };

 // 1. IMPROVED ADD EXPENSE (Updates Instantly)
  const handleAddExpense = async () => {
    if(!newExpense.description || !newExpense.amount) return message.error("Fill details");
    
    try {
        const res = await fetch(`https://travekla-web-app.onrender.com/api/trips/${id}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                description: newExpense.description, 
                amount: newExpense.amount,
                paidBy: user.username || "Member"
            })
        });

        if (res.ok) {
            const updatedList = await res.json(); // 👈 Get the new list from server
            setExpenses(updatedList);             // 👈 Update the screen immediately!
            
            message.success("Expense Added 💸");
            setIsExpenseModalOpen(false);
            setNewExpense({ description: "", amount: "" });
        }
    } catch (err) {
        message.error("Failed to add expense");
    }
  };

  // 2. IMPROVED ADD PHOTO (Updates Instantly)
  const handleAddPhoto = async () => {
    if(!newPhotoUrl) return;

    try {
        const res = await fetch(`https://travekla-web-app.onrender.com/api/trips/${id}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                photoUrl: newPhotoUrl,
                userId: user._id 
            })
        });

        if (res.ok) {
            const updatedGallery = await res.json(); // 👈 Get new gallery
            
            // We need to update the whole trip object to show new photos
            setTrip(prev => ({ ...prev, gallery: updatedGallery })); 
            
            message.success("Photo Added 📸");
            setIsPhotoModalOpen(false);
            setNewPhotoUrl("");
        }
    } catch (err) {
        message.error("Failed to add photo");
    }
  };

  // 4. Share Function
  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      message.success("Link Copied to Clipboard! 🔗");
  };

  // 5. Save Function
  const handleSave = () => {
      setIsSaved(!isSaved);
      message.success(isSaved ? "Removed from Saved" : "Trip Saved to Wishlist ❤️");
  };

  if (loading) return <div style={{height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}><Spin size="large" /></div>;
  if (!trip) return <div>Trip Not Found</div>;

  // --- LOGIC ---
  const creator = trip.creator || {}; 
  const isAdvisor = creator.role === 'advisor';
  const userId = user?._id ? user._id.toString() : "";
  
  const isMember = Array.isArray(trip.members) && trip.members.some(m => (typeof m === 'object' ? m._id : m) === userId);
  const isPending = Array.isArray(trip.joinRequests) && trip.joinRequests.some(r => (typeof r === 'object' ? r._id : r) === userId);
  const isCreator = (creator._id === user?._id) || (trip.creator === user?._id);
  const hasAccess = isMember || isCreator; // Only these people see Group Tab

  // Bill Splitting Math
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const memberCount = (trip.members?.length || 0) + 1; // +1 for host
  const splitPerPerson = (totalExpense / (memberCount || 1)).toFixed(0);

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
      
      {/* 📸 HERO HEADER */}
      <div style={{ height: 350, background: '#001529', position: 'relative', overflow: 'hidden' }}>
          <img src={trip.image || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2000"} 
               style={{width:'100%', height:'100%', objectFit:'cover', opacity: 0.6}} />
          
          <div style={{position:'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 1200, padding: '0 20px', color: 'white'}}>
             <Tag color="gold" style={{marginBottom: 10}}>{isAdvisor ? "EXPERT TRIP" : "COMMUNITY TRIP"}</Tag>
             <Title style={{color:'white', margin: 0}}>{trip.to?.toUpperCase()}</Title>
             <Text style={{color:'rgba(255,255,255,0.8)'}}><ClockCircleFilled /> {trip.duration || "3 Days"} • {trip.date ? new Date(trip.date).toLocaleDateString() : "Flexible"}</Text>
          </div>
          
          {/* Back Button */}
          <Link to="/" style={{position:'absolute', top: 20, left: 20}}>
            <Button shape="circle" icon={<ArrowLeftOutlined />} size="large" ghost />
          </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
        <Row gutter={[24, 24]}>
            
            {/* 👈 LEFT CONTENT: TABS */}
            <Col xs={24} md={16}>
                <Card style={{borderRadius: 12, minHeight: 500}}>
                    <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
                        
                        {/* TAB 1: PUBLIC DETAILS */}
                        <TabPane tab="TRIP DETAILS" key="1">
                            <Title level={4}>About the Trip</Title>
                            <Paragraph>{trip.description || "Join us for an amazing adventure!"}</Paragraph>
                            <Divider />
                            <Title level={4}>Itinerary</Title>
                            <Timeline mode="left">
                                {trip.itinerary?.length > 0 ? trip.itinerary.map((item, i) => (
                                    <Timeline.Item key={i} color="blue">{item.activity}</Timeline.Item>
                                )) : <Text type="secondary">Itinerary loading...</Text>}
                            </Timeline>
                        </TabPane>

                        {/* TAB 2: PRIVATE GROUP LOUNGE (Protected) */}
                        {hasAccess ? (
                            <TabPane tab={<span><SafetyCertificateOutlined /> GROUP LOUNGE</span>} key="2">
                                
                                {/* 💰 EXPENSE SPLITTER */}
                                <Card type="inner" title="💸 Split Bills" extra={<Button type="primary" size="small" onClick={() => setIsExpenseModalOpen(true)}>Add Expense</Button>}>
                                    <Row gutter={16} style={{marginBottom: 20, textAlign:'center'}}>
                                        <Col span={8}><Title level={4}>₹{totalExpense}</Title><Text type="secondary">Total Spent</Text></Col>
                                        <Col span={8}><Title level={4}>{memberCount}</Title><Text type="secondary">Members</Text></Col>
                                        <Col span={8}><Title level={4} style={{color: '#fa541c'}}>₹{splitPerPerson}</Title><Text type="secondary">Per Person</Text></Col>
                                    </Row>
                                    <List
                                        size="small"
                                        dataSource={expenses}
                                        renderItem={item => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar style={{background: '#87d068'}}>{item.paidBy[0]}</Avatar>}
                                                    title={item.description}
                                                    description={`Paid by ${item.paidBy}`}
                                                />
                                                <div style={{fontWeight:'bold'}}>₹{item.amount}</div>
                                            </List.Item>
                                        )}
                                    />
                                </Card>
                                <br />

                                {/* 📸 SHARED GALLERY */}
                                <Card type="inner" title="📸 Shared Photos" extra={<Button icon={<CameraOutlined />} onClick={() => setIsPhotoModalOpen(true)}>Add Photo</Button>}>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10}}>
                                        {trip.gallery?.map((url, index) => (
                                            <img key={index} src={url} style={{width:'100%', height: 100, objectFit:'cover', borderRadius: 8}} />
                                        ))}
                                        {(!trip.gallery || trip.gallery.length === 0) && <Text type="secondary">No photos yet.</Text>}
                                    </div>
                                </Card>

                            </TabPane>
                        ) : (
                            <TabPane tab={<span><SafetyCertificateOutlined /> GROUP LOUNGE</span>} key="2" disabled>
                                {/* Hidden for non-members */}
                            </TabPane>
                        )}
                    </Tabs>
                </Card>
            </Col>

            {/* 👉 RIGHT CONTENT: ACTION CARD */}
            <Col xs={24} md={8}>
                <Affix offsetTop={20}>
                    <Card style={{borderRadius: 12, textAlign:'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}}>
                        <Title level={2} style={{color: '#1890ff', margin: 0}}>₹{trip.budget}</Title>
                        <Text type="secondary">Estimated Cost</Text>
                        <Divider />
                        
                        {/* JOIN BUTTON LOGIC */}
                        {isCreator ? (
                            <Link to={`/manage-trip/${id}`}><Button block size="large">Manage Trip</Button></Link>
                        ) : isMember ? (
                            <Button block type="primary" size="large" style={{background: '#52c41a', borderColor: '#52c41a'}}>
                                <CheckCircleFilled /> You are Going!
                            </Button>
                        ) : isPending ? (
                            <Button block disabled size="large">Request Pending...</Button>
                        ) : (
                            <Button block type="primary" size="large" loading={joinLoading} onClick={handleJoin}>
                                Request to Join
                            </Button>
                        )}

                        <div style={{marginTop: 20, display:'flex', justifyContent:'space-around'}}>
                             <Tooltip title="Save Trip">
                                <Button shape="circle" size="large" icon={isSaved ? <HeartFilled style={{color:'red'}} /> : <HeartOutlined />} onClick={handleSave} />
                             </Tooltip>
                             <Tooltip title="Share Link">
                                <Button shape="circle" size="large" icon={<ShareAltOutlined />} onClick={handleShare} />
                             </Tooltip>
                        </div>

                        {!hasAccess && <div style={{marginTop: 15, background: '#fffbe6', padding: 10, borderRadius: 8, fontSize: 12, border: '1px solid #ffe58f'}}>
                            🔒 Join to unlock Bill Splitter & Photo Gallery
                        </div>}
                    </Card>
                </Affix>
            </Col>
        </Row>
      </div>

      {/* --- MODALS --- */}
      
      {/* Add Expense Modal */}
      <Modal title="Add Group Expense" open={isExpenseModalOpen} onOk={handleAddExpense} onCancel={() => setIsExpenseModalOpen(false)}>
          <Input placeholder="What was it for? (e.g. Dinner)" style={{marginBottom: 10}} 
                 value={newExpense.description} onChange={(e) => setNewExpense({...newExpense, description: e.target.value})} />
          <Input prefix="₹" placeholder="Amount" type="number" 
                 value={newExpense.amount} onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})} />
      </Modal>

      {/* Add Photo Modal */}
      <Modal title="Add Photo Link" open={isPhotoModalOpen} onOk={handleAddPhoto} onCancel={() => setIsPhotoModalOpen(false)}>
          <Input placeholder="Paste Image URL here..." 
                 value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} />
          <Text type="secondary" style={{fontSize: 12}}>*Currently supports direct image links.</Text>
      </Modal>

    </div>
  );
};

export default TripDetails;