import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Layout, ConfigProvider } from 'antd';
import Navbar from './components/layout/Navbar'; 

// --- PAGES ---
import CreateGroup from "./pages/CreateGroup";
import Home from "./pages/Home"; 
import Advisors from './pages/Advisors';
import GroupDetails from "./pages/GroupDetails";
import GoldMembership from "./pages/GoldMembership";
import Login from "./pages/Login"; 
import Register from './pages/Register';
import Profile from './pages/Profile'; 
import ManageTrip from './pages/ManageTrip';

// --- ADMIN PAGES ---
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SuperAdminDashboard from "./pages/SuperAdminDashboard"; // Keeping if you still need it

// --- CONTEXT ---
import { AuthProvider } from "./context/AuthContext"; 
import { GroupProvider } from "./context/GroupContext";

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
        <GroupProvider> 
          <Router>
            <Layout className="layout" style={{ minHeight: "100vh", background: '#fff' }}>
              
              {/* 1. NAVBAR */}
              <Navbar /> 
              
              {/* 2. PAGE CONTENT */}
              <Content style={{ padding: "0", minHeight: "calc(100vh - 134px)" }}>
                <Routes>
                  {/* --- PUBLIC ROUTES --- */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                 <Route path="/advisors" element={<Advisors />} />
                  <Route path="/gold" element={<GoldMembership />} />

                  {/* --- USER ROUTES --- */}
                  <Route path="/create-group" element={<CreateGroup />} />
                  <Route path="/group/:id" element={<GroupDetails />} />
                  <Route path="/manage-trip/:id" element={<ManageTrip />} />
                  <Route path="/profile" element={<Profile />} /> 
                  
                  {/* --- ADMIN ROUTES (Fixed) --- */}
                  <Route path="/admin" element={<AdminLogin />} /> {/* Login Page */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Dashboard Page */}
                  <Route path="/super-admin" element={<SuperAdminDashboard />} /> {/* Legacy/Extra */}
                </Routes>
              </Content>

              {/* 3. FOOTER */}
              <Footer style={{ textAlign: "center", background: '#f0f2f5' }}>
                Travekla ©2025
              </Footer>

            </Layout>
          </Router>
        </GroupProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;