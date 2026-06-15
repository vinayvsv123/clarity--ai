import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('clarity_user');
    const storedToken = localStorage.getItem('clarity_token');
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('clarity_user');
        localStorage.removeItem('clarity_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const userData = { _id: data._id, username: data.username, email: data.email };
    localStorage.setItem('clarity_token', data.token);
    localStorage.setItem('clarity_user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Welcome back!');
    return userData;
  };

  const signup = async (username, email, password) => {
    const data = await authService.signup(username, email, password);
    const userData = { _id: data._id, username: data.username, email: data.email };
    localStorage.setItem('clarity_token', data.token);
    localStorage.setItem('clarity_user', JSON.stringify(userData));
    setUser(userData);
    toast.success('Account created successfully!');
    return userData;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Continue with local logout even if API call fails
    }
    localStorage.removeItem('clarity_token');
    localStorage.removeItem('clarity_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
