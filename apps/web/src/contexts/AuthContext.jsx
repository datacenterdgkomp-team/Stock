
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          // Attempt to refresh the token on initial load
          await pb.collection('users').authRefresh({ $autoCancel: false });
          setCurrentUser(pb.authStore.model);
        } catch (err) {
          // If refresh fails (token expired, user deleted), clear auth
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();

    // Subscribe to auth state changes from other tabs/windows
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    return await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
  };

  const register = async (data) => {
    return await pb.collection('users').create(data, { $autoCancel: false });
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
