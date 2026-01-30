import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 👈 Import Google
import { AuthProvider } from './context/AuthContext';      // 👈 Import AuthContext
import { GroupProvider } from './context/GroupContext';
import App from './App';
import './index.css';
import { HashRouter } from 'react-router-dom';

// I took the Client ID from your comment
const clientId = "23833065398-4q440fffi4g2mhk9rdapgau2ociubfbu.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 1. Wrap entire app with GoogleOAuthProvider */}
    <GoogleOAuthProvider clientId={clientId}>
      
      {/* 2. Wrap with AuthProvider so login state works everywhere */}
      <AuthProvider>
        
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#fa541c',
              borderRadius: 8,
            },
          }}
        >
          <GroupProvider>
            <HashRouter>
            <App />
            </HashRouter>
          </GroupProvider>
        </ConfigProvider>

      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
);