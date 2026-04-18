import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading]   = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('ams_token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setEmployee(res.data.data.employee);
    } catch {
      localStorage.removeItem('ams_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, user: u, employee: e } = res.data.data;
    localStorage.setItem('ams_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(u);
    setEmployee(e);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('ams_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setEmployee(null);
    toast.success('Logged out successfully');
  };

  const hasRole = (...roles) => roles.includes(user?.role);
  const isAdmin    = () => hasRole('admin');
  const isHR       = () => hasRole('hr');
  const isManager  = () => hasRole('manager');
  const isEmployee = () => hasRole('employee');
  const canManage  = () => hasRole('admin', 'hr', 'manager');
  const canAdmin   = () => hasRole('admin', 'hr');

  return (
    <AuthContext.Provider value={{
      user, employee, loading,
      login, logout, loadUser,
      hasRole, isAdmin, isHR, isManager, isEmployee, canManage, canAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
