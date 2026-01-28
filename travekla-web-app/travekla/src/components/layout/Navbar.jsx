import React, { useContext } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import {
  HomeOutlined, RocketOutlined, UserOutlined, LogoutOutlined,
  LoginOutlined, SearchOutlined, CrownFilled, ScheduleOutlined
} from '@ant-design/icons';
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

  // 👇 MAIN NAVIGATION (Clean & Consistent)
  const navItems = [
    { label: <Link to="/">Home</Link>, key: '/', icon: <HomeOutlined /> },

    { label: <Link to="/advisors">Find Advisor</Link>, key: '/advisors', icon: <SearchOutlined /> },

    { label: <Link to="/create-group">Create Trip</Link>, key: '/create-group', icon: <RocketOutlined /> },

    // 🌟 MY TRIPS (Normal Style)
    ...(user ? [{
      label: <Link to="/my-trips">My Trips</Link>,
      key: '/my-trips',
      icon: <ScheduleOutlined />
    }] : []),

    {
      label: <Link to="/gold">Gold</Link>,
      key: '/gold',
      icon: <CrownFilled />
    },
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
      padding: '0 50px', // Wider padding
      height: '74px',
      background: '#ffffff', // Solid White
      borderBottom: '1px solid #e1e4e8', // Subtle separator
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)' // Very simple shadow
    }}>
      {/* 1. LOGO */}
      {/* 1. LOGO (Premium & Professional) */}
      <div
        className="logo"
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        onClick={() => navigate('/')}
      >
        <div style={{
          width: 36,
          height: 36,
          background: 'var(--primary)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 5px rgba(44, 62, 80, 0.2)'
        }}>
          <RocketOutlined style={{ fontSize: '20px', color: 'white' }} />
        </div>
        <span style={{
          fontSize: '22px',
          fontWeight: '700',
          color: 'var(--primary)',
          letterSpacing: '-0.5px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Travekla
        </span>
      </div>

      {/* 2. MENU ITEMS */}
      <Menu
        mode="horizontal"
        selectedKeys={[location.pathname]}
        items={navItems}
        style={{ flex: 1, borderBottom: 'none', justifyContent: 'flex-end', background: 'transparent', fontSize: '14px', fontWeight: '500', marginRight: '40px', color: '#555' }}
      />

      {/* 3. USER ACTION */}
      <div>
        {user ? (
          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <span className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '30px', background: '#f5f5f5', transition: 'all 0.3s' }}>
              <Avatar src={user.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#fa541c' }} />
              <span style={{ fontWeight: 600, color: '#333', display: window.innerWidth < 600 ? 'none' : 'block' }}>
                {user.name}
              </span>
            </span>
          </Dropdown>
        ) : (
          <Link to="/login">
            <Button type="primary" icon={<LoginOutlined />} shape="round" size="large" style={{ fontWeight: '600', padding: '0 25px' }}>
              Login
            </Button>
          </Link>
        )}
      </div>
    </Header>
  );
};

export default Navbar;