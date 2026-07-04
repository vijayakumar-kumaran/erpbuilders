import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // You can enhance this to load user info from localStorage or an API
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Add any API calls needed for server-side logout here
      // await axios.post(`${API_URL}/api/auth/logout`);
      
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // If you use tokens
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);