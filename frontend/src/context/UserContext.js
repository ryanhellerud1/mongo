import React, { createContext, useState, useEffect, useContext } from 'react';
import { checkAuthStatus } from '../services/api';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuthStatus = async () => {
      try {
        // First, check localStorage for cached user info
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          setUserInfo(JSON.parse(storedUserInfo));
        }

        // Then, verify with the server using cookies
        const { authenticated, user } = await checkAuthStatus();
        if (authenticated) {
          setUserInfo(prevInfo => {
            // Merge with existing info if available, prioritizing server data
            const newInfo = { ...JSON.parse(storedUserInfo || '{}'), ...user };
            localStorage.setItem('userInfo', JSON.stringify(newInfo));
            return newInfo;
          });
        } else if (storedUserInfo) {
          // If server says not authenticated but we have localStorage data,
          // keep the UI state but console log the issue
          console.warn('Server reports unauthenticated but localStorage has user data');
        }
      } catch (error) {
        console.error('Auth verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyAuthStatus();
  }, []);

  const login = (data) => {
    setUserInfo(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
  };

  const logout = () => {
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  return (
    <UserContext.Provider value={{ userInfo, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext; 