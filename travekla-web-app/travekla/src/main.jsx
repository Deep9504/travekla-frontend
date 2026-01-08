import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd'; // Import ConfigProvider
import App from './App';
import './index.css';
import { GroupProvider } from './context/GroupContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#fa541c', // Sunset Orange for Travekla
          borderRadius: 8,
        },
      }}
    >
     <GroupProvider>
        <App />
      </GroupProvider>
    </ConfigProvider>
  </React.StrictMode>,
);