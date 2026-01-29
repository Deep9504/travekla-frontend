import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import CreateTrip from './pages/CreateTrip';
import TripDetails from './pages/TripDetails';
import MyTrips from './pages/MyTrips';
import BecomeAdvisor from "./pages/BecomeAdvisor";

// --- ADMIN PAGES ---
// 👇 IMPORTANT: Ensure this path matches where you saved your file
// It is likely either "./pages/AdminDashboard" OR "./pages/admin/AdminDashboard"
import AdminDashboard from './pages/admin/AdminDashboard';

// --- CONTEXT ---
import { AuthProvider } from "./context/AuthContext";
import { GroupProvider } from "./context/GroupContext";

const { Content, Footer } = Layout;

const App = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#2c3e50', // Professional Slate
          colorLink: '#2c3e50',
          fontFamily: 'Inter, sans-serif', // Clean Inter for everything
          borderRadius: 6,         // Professional small radius (not rounded)

          // Layout
          colorBgLayout: '#f4f6f8',
        },
        components: {
          Button: {
            borderRadius: 4,
            controlHeight: 40,
            fontWeight: 500,
          },
          Card: {
            borderRadius: 8, // Subtle rounding
          },
          Input: {
            borderRadius: 4,
          }
        }
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
                  <Route path="/create-trip" element={<CreateTrip />} />
                  <Route path="/trip/:id" element={<TripDetails />} />
                  <Route path="/my-trips" element={<MyTrips />} />
                  <Route path="/become-advisor" element={<BecomeAdvisor />} />

                  {/* --- ADMIN ROUTES (FIXED) --- */}
                  {/* 👇 CHANGE THIS LINE. Point /admin directly to the Dashboard */}
                  <Route path="/admin" element={<AdminDashboard />} />

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