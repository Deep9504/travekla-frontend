import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, ConfigProvider } from 'antd';
import Navbar from './components/layout/Navbar'; // 👈 Using your new Navbar

// --- PAGES ---
import CreateGroup from "./pages/CreateGroup";
import Home from "./pages/Home"; 
import AdvisorProfile from "./pages/AdvisorProfile";
import GroupDetails from "./pages/GroupDetails";
import GoldMembership from "./pages/GoldMembership";
import Login from "./pages/Login"; 
import AdminLogin from "./pages/AdminLogin"; 
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; 
import Profile from './pages/Profile'; // 👈 Using the new Profile page

// --- CONTEXT ---
import { AuthProvider } from "./context/AuthContext"; 
import { GroupProvider } from "./context/GroupContext"; // 👈 IMPORT THIS

const { Content, Footer } = Layout;

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#fa541c', // Travekla Orange
          fontFamily: 'Poppins, sans-serif',
        },
      }}
    >
      <AuthProvider>
        <GroupProvider> {/* 👈 CRITICAL: Wraps app so trips can load */}
          <Router>
            <Layout className="layout" style={{ minHeight: "100vh", background: '#fff' }}>
              
              {/* 1. NAVBAR (Replaces old AppHeader) */}
              <Navbar /> 
              
              {/* 2. PAGE CONTENT */}
              <Content style={{ padding: "0", minHeight: "calc(100vh - 134px)" }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/create-group" element={<CreateGroup />} />
                  <Route path="/advisors" element={<AdvisorProfile />} />
                  <Route path="/group/:id" element={<GroupDetails />} />
                  <Route path="/gold" element={<GoldMembership />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  
                  {/* 👇 Pointing this to the new Profile with Tabs */}
                  <Route path="/profile" element={<Profile />} /> 
                  
                  <Route path="/super-admin" element={<SuperAdminDashboard />} />
                </Routes>
              </Content>

              {/* 3. FOOTER */}
              <Footer style={{ textAlign: "center", background: '#f0f2f5' }}>
                Travekla ©2025 | <Link to="/admin/login">Admin Login</Link>
              </Footer>

            </Layout>
          </Router>
        </GroupProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;