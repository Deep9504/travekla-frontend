import React, { createContext, useState, useEffect } from 'react';
import { message } from 'antd';

export const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. FETCH GROUPS FROM SERVER (On Load)
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/groups');
        const data = await response.json();
        
        if (response.ok) {
          setGroups(data);
        } else {
          console.error("Failed to fetch groups:", data.message);
        }
      } catch (error) {
        console.error("Server connection failed:", error);
        // Only show error if we really can't connect, to avoid annoyance
        // message.error("Could not connect to backend"); 
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // 2. ADD NEW GROUP (Connect to Backend)
  const addGroup = async (newGroupData) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroupData)
      });

      const savedGroup = await response.json();

      if (response.ok) {
        // Update local list instantly
        setGroups([savedGroup, ...groups]);
        message.success("Group created successfully!");
        return true;
      } else {
        message.error("Failed to create group");
        return false;
      }
    } catch (error) {
      console.error(error);
      message.error("Server Error");
      return false;
    }
  };

 // 3. JOIN GROUP (Updated)
  const joinGroup = async (groupId) => {
    // Get the current user ID from LocalStorage (safest way)
    const storedUser = JSON.parse(localStorage.getItem('travekla_user'));
    if (!storedUser) return false;

    try {
      const response = await fetch(`http://localhost:5000/api/groups/${groupId}/join`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUser.id || storedUser._id }) // Send ID
      });

      const updatedGroupData = await response.json();

      if (response.ok) {
        setGroups(prevGroups => 
          prevGroups.map(group => 
            (group._id === groupId || group.id === groupId) ? updatedGroupData : group 
          )
        );
        message.success("You joined the trip! 🎒");
        return true;
      } else {
        message.error(updatedGroupData.message || "Failed to join");
        return false;
      }
    } catch (error) {
      console.error(error);
      message.error("Server Error");
      return false;
    }
  };
  // 4. GET MY CREATED TRIPS
  const getUserTrips = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/groups/user/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // 5. GET MY JOINED TRIPS
  const getJoinedTrips = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/groups/joined/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return (
<GroupContext.Provider value={{ 
    groups, 
    addGroup, 
    joinGroup, 
    getUserTrips,  
    getJoinedTrips, 
    loading 
}}>      {children}
    </GroupContext.Provider>
  );
};