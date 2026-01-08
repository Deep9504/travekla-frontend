import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { 
  Layout, Menu, Avatar, Typography, Button, message 
} from 'antd';
import { UserOutlined, LogoutOutlined, LoginOutlined } from "@ant-design/icons";

// --- PAGES ---
import CreateGroup from "./pages/CreateGroup";
import Home from "./pages/Home"; 
import AdvisorProfile from "./pages/AdvisorProfile";
import GroupDetails from "./pages/GroupDetails";
import UserDashboard from "./pages/UserDashboard";
import GoldMembership from "./pages/GoldMembership";
import Login from "./pages/Login"; 
import AdminLogin from "./pages/AdminLogin"; 
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; 

// --- CONTEXT ---
import { AuthProvider, AuthContext } from "./context/AuthContext"; 

const { Header, Content, Footer } = Layout;

// We need a separate component for the Header content to use the 'useNavigate' hook
const AppHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext); // Get user status

  const handleLogout = () => {
    logout();
    navigate('/');
    message.success("You are now viewing as a Guest");
  };

  // DYNAMIC MENU ITEMS
  const menuItems = [
    { key: "1", label: <Link to="/">Home</Link> },
    { key: "2", label: <Link to="/create-group">Create Group</Link> },
    { key: "3", label: <Link to="/advisors">Find Advisor</Link> },
  ];

  // If Logged In -> Show Profile & Logout
  if (user) {
    menuItems.push({ 
      key: "profile", 
      label: <Link to="/profile"><Avatar size="small" src={user.avatar} icon={<UserOutlined />} /> {user.name}</Link> 
    });
    menuItems.push({ 
      key: "logout", 
      label: <span onClick={handleLogout} style={{ color: '#ff4d4f' }}><LogoutOutlined /> Logout</span> 
    });
  } 
  // If Guest -> Show Login
  else {
    menuItems.push({ 
      key: "login", 
      label: <Link to="/login"><Button type="primary" icon={<LoginOutlined />}>Login</Button></Link> 
    });
  }

  return (
    <Header style={{ display: "flex", alignItems: "center", padding: "0 20px" }}>
      <div className="logo" style={{ color: "white", fontSize: "20px", fontWeight: "bold", marginRight: "auto" }}>
        <Link to="/" style={{ color: 'white' }}>Travekla</Link>
      </div>
      <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["1"]} items={menuItems} style={{ flex: 1, minWidth: 0, justifyContent: "flex-end" }} />
    </Header>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout className="layout" style={{ minHeight: "100vh" }}>
          <AppHeader /> {/* Header is now its own component to handle Logic */}
          
          <Content style={{ padding: "0", minHeight: "calc(100vh - 134px)" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create-group" element={<CreateGroup />} />
              <Route path="/advisors" element={<AdvisorProfile />} />
              <Route path="/group/:id" element={<GroupDetails />} />
              <Route path="/gold" element={<GoldMembership />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/profile" element={<UserDashboard />} />
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
            </Routes>
          </Content>

          <Footer style={{ textAlign: "center" }}>
            Travekla ©2025 | <Link to="/admin/login">Admin Login</Link>
          </Footer>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;