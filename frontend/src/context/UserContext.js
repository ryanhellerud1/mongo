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

        // Try to verify with the server using cookies, but don't fail if the endpoint isn't available
        try {
          const { authenticated, user, error } = await checkAuthStatus();
          
          // Only update user info if we successfully authenticated
          if (authenticated) {
            setUserInfo(prevInfo => {
              // Merge with existing info if available, prioritizing server data
              const newInfo = { ...JSON.parse(storedUserInfo || '{}'), ...user };
              localStorage.setItem('userInfo', JSON.stringify(newInfo));
              return newInfo;
            });
          } else if (storedUserInfo && error?.response?.status !== 404) {
            // Only log warning if it's not a 404 (which just means the endpoint doesn't exist)
            console.warn('Server reports unauthenticated but localStorage has user data');
          }
        } catch (authError) {
          // Silently continue if auth check fails - we'll use localStorage data
          console.log('Auth verification unavailable:', authError);
        }
      } catch (error) {
        console.error('Auth context error:', error);
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