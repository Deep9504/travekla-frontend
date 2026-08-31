import React, { useContext } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import { HomeOutlined, RocketOutlined, UserOutlined, LogoutOutlined, LoginOutlined, SearchOutlined,CrownFilled,SafetyCertificateOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const { Header } = Layout;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    message.success("Logged out successfully");
  };

  // Dropdown Menu for User
  const menuItems = [
    {
      key: '1',
      label: <Link to="/profile">My Profile</Link>,
      icon: <UserOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: '2',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
      danger: true
    }
  ];

  // 👇 UPDATED MENU ITEMS (Added Advisor Back)
  const navItems = [
    { label: <Link to="/">Home</Link>, key: '/', icon: <HomeOutlined /> },
    
    // 👇 This was missing!
    { label: <Link to="/advisors">Find Advisor</Link>, key: '/advisors', icon: <SearchOutlined /> }, 
    
    { label: <Link to="/create-group">Create Trip</Link>, key: '/create-group', icon: <RocketOutlined /> },
    { 
      label: <Link to="/gold" style={{ color: '#faad14', fontWeight: 'bold' }}>Gold</Link>, 
      key: '/gold', 
      icon: <CrownFilled style={{ color: '#faad14' }} /> 
    },
    // { 
    //   label: <Link to="/admin" style={{ color: 'red' }}>Admin</Link>, 
    //   key: '/admin', 
    //   icon: <SafetyCertificateOutlined style={{ color: 'red' }} /> 
    // },
  ];

  return (
    <Header style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      width: '100%', 
      display: 'flex', 
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      padding: '0 20px'
    }}>
      {/* 1. LOGO */}
      <div 
        className="logo" 
        style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa541c', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
        onClick={() => navigate('/')}
      >
        <RocketOutlined style={{ marginRight: 8 }} />
        <span style={{ color: '#fa541c' }}>Travekla</span>
      </div>

      {/* 2. MENU ITEMS (Center) */}
      <Menu 
        mode="horizontal" 
        selectedKeys={[location.pathname]} 
        items={navItems}
        style={{ flex: 1, borderBottom: 'none', justifyContent: 'center', background: 'transparent' }}
      />

      {/* 3. USER ACTION (Right) */}
      <div>
        {user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#fa541c' }} />
              <span style={{ fontWeight: 500, color: '#333', display: window.innerWidth < 600 ? 'none' : 'block' }}>
                {user.name}
              </span>
            </span>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />} shape="round">
              Login
            </Button>
          </Link>
        )}
      </div>
    </Header>
  );
};

export default Navbar;