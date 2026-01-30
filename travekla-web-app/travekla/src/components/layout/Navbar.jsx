import React, { useContext } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, message, Drawer, Grid } from 'antd';
import {
  HomeOutlined, RocketOutlined, UserOutlined, LogoutOutlined,
  LoginOutlined, SearchOutlined, CrownFilled, ScheduleOutlined, MenuOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint(); // Detect screen size
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    message.success("Logged out successfully");
    setMobileMenuOpen(false);
  };

  // Dropdown Menu for User (Desktop)
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

  // 👇 MAIN NAVIGATION ITEMS
  const navItems = [
    { label: <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>, key: '/', icon: <HomeOutlined /> },
    { label: <Link to="/advisors" onClick={() => setMobileMenuOpen(false)}>Find Advisor</Link>, key: '/advisors', icon: <SearchOutlined /> },
    { label: <Link to="/create-trip" onClick={() => setMobileMenuOpen(false)}>Create Trip</Link>, key: '/create-group', icon: <RocketOutlined /> },
    ...(user ? [{
      label: <Link to="/my-trips" onClick={() => setMobileMenuOpen(false)}>My Trips</Link>,
      key: '/my-trips',
      icon: <ScheduleOutlined />
    }] : []),
    {
      label: <Link to="/gold" onClick={() => setMobileMenuOpen(false)}>Gold</Link>,
      key: '/gold',
      icon: <CrownFilled />
    },
  ];

  // Mobile Menu Items (Include Logout/Profile if logged in)
  const mobileNavItems = [
    ...navItems,
    ...(user ? [
      { type: 'divider' },
      { label: <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>, key: '/profile', icon: <UserOutlined /> },
      { label: <span onClick={handleLogout} style={{ color: '#ff4d4f' }}>Logout</span>, key: 'logout', icon: <LogoutOutlined style={{ color: '#ff4d4f' }} /> }
    ] : [
      { type: 'divider' },
      { label: <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>, key: '/login', icon: <LoginOutlined /> }
    ])
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
      padding: screens.md ? '0 50px' : '0 20px', // Responsive Padding
      height: '74px',
      background: '#ffffff',
      borderBottom: '1px solid #e1e4e8',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      {/* 1. LOGO */}
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

      {/* 2. DESKTOP MENU */}
      {screens.md ? (
        <>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            style={{ flex: 1, borderBottom: 'none', justifyContent: 'flex-end', background: 'transparent', fontSize: '14px', fontWeight: '500', marginRight: '40px', color: '#555' }}
          />
          {/* USER ACTION (Desktop) */}
          <div>
            {user ? (
              <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
                <span className="hover-lift" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 12px', borderRadius: '30px', background: '#f5f5f5', transition: 'all 0.3s' }}>
                  <Avatar src={user.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#fa541c' }} />
                  <span style={{ fontWeight: 600, color: '#333' }}>
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
        </>
      ) : (
        /* 3. MOBILE HAMBURGER */
        <Button
          type="text"
          icon={<MenuOutlined style={{ fontSize: 24 }} />}
          onClick={() => setMobileMenuOpen(true)}
        />
      )}

      {/* 4. MOBILE DRAWER */}
      <Drawer
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <RocketOutlined style={{ color: 'var(--primary)', fontSize: 20 }} />
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Travekla</span>
          </div>
        }
        placement="right"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="vertical"
          selectedKeys={[location.pathname]}
          items={mobileNavItems}
          style={{ borderRight: 'none', fontSize: 16 }}
        />
      </Drawer>

    </Header>
  );
};

export default Navbar;