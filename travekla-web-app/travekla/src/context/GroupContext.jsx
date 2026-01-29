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
        const response = await fetch('https://travekla-web-app.onrender.com/api/groups');
        const data = await response.json();

        if (response.ok) {
          setGroups(data);
        } else {
          console.error("Failed to fetch groups:", data.message);
        }
      } catch (error) {
        console.error("Server connection failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  // 2. ADD NEW GROUP
  const addGroup = async (newGroupData) => {
    try {
      const response = await fetch('https://travekla-web-app.onrender.com/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroupData)
      });

      const savedGroup = await response.json();

      if (response.ok) {
        setGroups(prev => [savedGroup, ...prev]); // Safer update
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

  // 3. JOIN GROUP
  const joinGroup = async (groupId) => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!storedUser) {
      message.error("Please login first");
      return { success: false };
    }

    try {
      const response = await fetch(`https://travekla-web-app.onrender.com/api/groups/${groupId}/join`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: storedUser.id || storedUser._id })
      });

      const data = await response.json();

      if (response.ok) {
        // Update the specific group in the local list
        setGroups(prevGroups =>
          prevGroups.map(group =>
            (group._id === groupId || group.id === groupId) ? data : group
          )
        );
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: "Server Error" };
    }
  };

  // 4. GET MY CREATED TRIPS
  const getUserTrips = async (userId) => {
    try {
      const response = await fetch(`https://travekla-web-app.onrender.com/api/groups/user/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // 5. GET MY JOINED TRIPS
  const getJoinedTrips = async (userId) => {
    try {
      const response = await fetch(`https://travekla-web-app.onrender.com/api/groups/joined/${userId}`);
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // 6. SEARCH TRIPS
  const searchGroups = async (query) => {
    try {
      const url = query
        ? `https://travekla-web-app.onrender.com/api/groups?search=${query}`
        : 'https://travekla-web-app.onrender.com/api/groups';

      const response = await fetch(url);
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // 7. DELETE GROUP (Updated for Admin Feature)
  const deleteGroup = async (id) => {
    try {
      const response = await fetch(`https://travekla-web-app.onrender.com/api/groups/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Safer state update
        setGroups(prevGroups => prevGroups.filter(group => group._id !== id && group.id !== id));
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Delete failed:", error);
      return { success: false };
    }
  };

  // 8. APPROVE MEMBER
  const approveMember = async (groupId, userId) => {
    try {
      await fetch(`https://travekla-web-app.onrender.com/api/groups/${groupId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // Refresh list to show updated status
      const response = await fetch('https://travekla-web-app.onrender.com/api/groups');
      const data = await response.json();
      setGroups(data);
      message.success("Member Approved! 🎉");
    } catch (error) {
      console.error(error);
      message.error("Failed to approve");
    }
  };

  // 9. REMOVE MEMBER
  const removeMember = async (groupId, userId) => {
    try {
      await fetch(`https://travekla-web-app.onrender.com/api/groups/${groupId}/remove`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      // Refresh list
      const response = await fetch('https://travekla-web-app.onrender.com/api/groups');
      const data = await response.json();
      setGroups(data);
      message.info("Member Removed.");
    } catch (error) {
      console.error(error);
      message.error("Failed to remove");
    }
  };

  // 10. ADD EXPENSE
  const addExpense = async (groupId, expenseData) => {
    try {
      const response = await fetch(`https://travekla-web-app.onrender.com/api/groups/${groupId}/expense`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData)
      });

      if (response.ok) {
        const updatedGroup = await response.json();
        // Update local state
        setGroups(prev => prev.map(g => g._id === groupId ? updatedGroup : g));
        message.success("Expense Added!");
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return (
    <GroupContext.Provider value={{
      groups,
      loading,
      addGroup,
      joinGroup,
      getUserTrips,
      getJoinedTrips,
      searchGroups,
      deleteGroup,
      approveMember,
      removeMember,
      addExpense
    }}>
      {children}
    </GroupContext.Provider>
  );
};