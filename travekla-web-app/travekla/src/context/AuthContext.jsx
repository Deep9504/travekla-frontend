import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. CHECK IF USER IS ALREADY LOGGED IN (On Page Refresh)
  useEffect(() => {
    const storedUser = localStorage.getItem('travekla_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // 2. REGISTER FUNCTION
  const registerUser = async (name, email, password, role) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success("Registration Successful! Please Login.");
        return true; // Success
      } else {
        message.error(data.message || "Registration Failed");
        return false;
      }
    } catch (error) {
      console.error(error);
      message.error("Server Error. Is the Backend running?");
      return false;
    }
  };

  // 3. LOGIN FUNCTION
  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save to State and LocalStorage
        setUser(data.user);
        localStorage.setItem('travekla_token', data.token); // Save the ID card
        localStorage.setItem('travekla_user', JSON.stringify(data.user)); // Save user details
        message.success(`Welcome back, ${data.user.name}!`);
        return true;
      } else {
        message.error(data.message || "Login Failed");
        return false;
      }
    } catch (error) {
      console.error(error);
      message.error("Server Error. Is the Backend running?");
      return false;
    }
  };

  // 4. LOGOUT FUNCTION
  const logout = () => {
    setUser(null);
    localStorage.removeItem('travekla_user');
    localStorage.removeItem('travekla_token');
    message.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, registerUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};