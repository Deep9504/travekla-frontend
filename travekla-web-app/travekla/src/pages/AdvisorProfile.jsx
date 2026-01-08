import React, { useState } from 'react';
import { 
  Card, Row, Col, Typography, Button, Avatar, Tag, Rate, Badge, 
  Input, Select, Modal, DatePicker, TimePicker, message, Drawer, List,
  Timeline, Statistic 
} from 'antd';
import { 
  UserOutlined, SearchOutlined, VideoCameraOutlined, 
  CheckCircleFilled, StarFilled, TrophyFilled, PhoneOutlined,
  EnvironmentOutlined, ScheduleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// --- MOCK DATA: ADVISORS ---
const mockAdvisors = [
  {
    id: 1,
    name: "Anjali Mehta",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali",
    specialty: "Solo Female Travel",
    location: "Manali, HP",
    rating: 4.9,
    reviews: 120,
    price: 500, // ₹ per session
    tags: ["Safety", "Budget", "Hostels"],
    isSuperHost: true,
    bio: "I help solo women plan their first Himalayan trip safely. 5 years of solo travel experience.",
    roadmap: ["Day 1: Old Manali Cafe Hopping", "Day 2: Hidden Waterfall Trek", "Day 3: Solang Valley Paragliding"]
  },
  {
    id: 2,
    name: "Rahul Verma",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    specialty: "Offbeat Trekking",
    location: "Uttarakhand",
    rating: 4.7,
    reviews: 85,
    price: 350,
    tags: ["Trekking", "Camping", "Gear Guide"],
    isSuperHost: false,
    bio: "Don't go where the crowd goes. I will show you the hidden trails of Uttarakhand.",
    roadmap: ["Day 1: Drive to Sari Village", "Day 2: Deoriatal Trek", "Day 3: Chopta Sunset"]
  },
  {
    id: 3,
    name: "Syesha L",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Syesha",
    specialty: "Food & Culture",
    location: "Goa",
    rating: 4.8,
    reviews: 200,
    price: 600,
    tags: ["Food Walks", "Nightlife", "History"],
    isSuperHost: true,
    bio: "Goa is more than beaches. Let's explore the Portuguese history and authentic Goan thalis.",
    roadmap: ["Day 1: Fontainhas Heritage Walk", "Day 2: Secret South Goa Beach", "Day 3: Jazz Club Night"]
  },
];

const AdvisorProfile = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // STATES FOR BOOKING
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);

  // STATES FOR ROADMAP DRAWER
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  // --- LOGIC ---
  const filteredAdvisors = mockAdvisors.filter(advisor => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          advisor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || advisor.specialty === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleBookSession = (advisor) => {
    setSelectedAdvisor(advisor);
    setIsModalVisible(true);
  };

  const confirmBooking = () => {
    message.success(`Session booked with ${selectedAdvisor.name}! Check your email.`);
    setIsModalVisible(false);
  };

  const handleViewRoadmap = (advisor) => {
    setSelectedAdvisor(advisor);
    setIsDrawerVisible(true);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '20px auto', padding: '0 20px' }}>
      
      {/* 1. HERO SEARCH SECTION */}
      <div style={{ textAlign: 'center', marginBottom: 40, background: '#fff', padding: 40, borderRadius: 12 }}>
        <Title level={2}>Find Your Travel Guru 🧘‍♂️</Title>
        <Paragraph type="secondary" style={{ fontSize: 16 }}>
          Connect with local experts, plan your itinerary, and travel without worry.
        </Paragraph>
        
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
          <Input 
            prefix={<SearchOutlined />} 
            placeholder="Search by name or location (e.g. Goa)" 
            style={{ maxWidth: 400, borderRadius: 20 }}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Select 
            defaultValue="All" 
            style={{ width: 180 }} 
            onChange={setCategoryFilter}
            options={[
              { value: 'All', label: 'All Specialties' },
              { value: 'Solo Female Travel', label: '👩 Solo Female Travel' },
              { value: 'Offbeat Trekking', label: '🏔️ Trekking' },
              { value: 'Food & Culture', label: '🍛 Food & Culture' },
            ]}
          />
        </div>
      </div>

      {/* 2. ADVISOR GRID */}
      <Row gutter={[24, 24]}>
        {filteredAdvisors.map(advisor => (
          <Col key={advisor.id} xs={24} sm={12} md={8}>
            <Card hoverable style={{ borderRadius: 12, overflow: 'hidden' }}>
              
              {/* HEADER with SuperHost Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Badge count={advisor.isSuperHost ? <Tag color="gold" icon={<TrophyFilled />}>Super Advisor</Tag> : null}>
                   <Avatar size={64} src={advisor.avatar} />
                </Badge>
                <div style={{ textAlign: 'right' }}>
                   <Title level={4} style={{ margin: 0 }}>₹{advisor.price}</Title>
                   <Text type="secondary" style={{ fontSize: 10 }}>/ 30 min session</Text>
                </div>
              </div>

              {/* DETAILS */}
              <div style={{ marginTop: 15 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {advisor.name} {advisor.isSuperHost && <CheckCircleFilled style={{ color: '#1890ff', fontSize: 14 }} />}
                </Title>
                <Text type="secondary"><EnvironmentOutlined /> {advisor.location}</Text>
                
                <div style={{ marginTop: 5, marginBottom: 10 }}>
                  <Rate disabled defaultValue={advisor.rating} style={{ fontSize: 12 }} /> 
                  <Text strong style={{ marginLeft: 8 }}>{advisor.rating}</Text> 
                  <Text type="secondary"> ({advisor.reviews} reviews)</Text>
                </div>

                <Paragraph ellipsis={{ rows: 2 }}>{advisor.bio}</Paragraph>

                {/* TAGS */}
                <div style={{ marginBottom: 15 }}>
                  {advisor.tags.map(tag => <Tag key={tag} color="blue">{tag}</Tag>)}
                </div>
              </div>

              {/* ACTIONS */}
              <div style={{ display: 'flex', gap: 10 }}>
                <Button block onClick={() => handleViewRoadmap(advisor)} icon={<ScheduleOutlined />}>
                   Itinerary
                </Button>
                <Button type="primary" block onClick={() => handleBookSession(advisor)} icon={<VideoCameraOutlined />}>
                  Book Call
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 3. BOOKING MODAL */}
      <Modal 
        title={selectedAdvisor ? `Book Session with ${selectedAdvisor.name}` : "Book Session"} 
        open={isModalVisible} 
        onCancel={() => setIsModalVisible(false)}
        onOk={confirmBooking}
        okText="Confirm & Pay"
      >
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <Avatar size={80} src={selectedAdvisor?.avatar} />
          <Title level={4} style={{ margin: '10px 0' }}>₹{selectedAdvisor?.price} for 30 mins</Title>
          <Text type="secondary">Video Call • Itinerary Review • Q&A</Text>
        </div>

        <Row gutter={16}>
           <Col span={12}>
             <Text strong>Select Date</Text>
             <DatePicker style={{ width: '100%' }} />
           </Col>
           <Col span={12}>
             <Text strong>Select Time</Text>
             <TimePicker format="HH:mm" style={{ width: '100%' }} />
           </Col>
        </Row>
        
        <div style={{ marginTop: 20 }}>
           <Text strong>What do you want to ask?</Text>
           <Input.TextArea rows={3} placeholder="e.g., Is North Goa safe for solo travelers at night?" />
        </div>
      </Modal>

      {/* 4. ROADMAP DRAWER (Sneak Peek) */}
      <Drawer
        title="Sample 3-Day Roadmap"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        {selectedAdvisor && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
               <Title level={4}>{selectedAdvisor.specialty} Plan</Title>
               <Tag color="green">Curated by {selectedAdvisor.name}</Tag>
            </div>
            
            <Timeline mode="left">
               {selectedAdvisor.roadmap.map((item, index) => (
                 <Timeline.Item key={index} color="blue">{item}</Timeline.Item>
               ))}
            </Timeline>

            <div style={{ marginTop: 40, background: '#f9f9f9', padding: 20, borderRadius: 8, textAlign: 'center' }}>
               <Statistic title="Unlock Full Detailed PDF" value={199} prefix="₹" />
               <Button type="primary" style={{ marginTop: 10 }}>Buy Full Guide</Button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};

export default AdvisorProfile;