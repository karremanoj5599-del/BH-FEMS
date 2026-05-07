/**
 * FEMS — Auth Context (With Offline/Demo Mode)
 * Manages authentication state, login, logout, and role-based access.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fems_token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    // Attempt to fetch current user
    api.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        localStorage.setItem('fems_user', JSON.stringify(res.data));
      })
      .catch(() => {
        console.warn("Auth check failed: Token might be invalid.");
        logout();
      })
      .finally(() => setLoading(false));
  }, []);


  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, refresh_token } = res.data;

    localStorage.setItem('fems_token', access_token);
    localStorage.setItem('fems_refresh', refresh_token);

    const meRes = await api.get('/auth/me');
    setUser(meRes.data);
    localStorage.setItem('fems_user', JSON.stringify(meRes.data));
    return meRes.data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fems_token');
    localStorage.removeItem('fems_refresh');
    localStorage.removeItem('fems_user');
  };

  const hasRole = (roles) => {
    if (!user?.role_name) return false;
    return roles.includes(user.role_name);
  };

  const hasPermission = (perm) => {
    if (!user) return false;
    if (user.role_name === 'Admin' || user.permissions?.all) return true;
    
    // Exact match
    if (user.permissions && user.permissions[perm]) return true;
    
    // Abstract logic: if a user has "manage_x" (e.g. 'tasks'), they implicitly have "my_x" (e.g. 'my_tasks')
    if (perm.startsWith('my_')) {
      const parentPerm = perm.replace('my_', '');
      if (user.permissions && user.permissions[parentPerm]) return true;
    }
    
    return false;
  };

  const isEmployeeView = (moduleName) => {
    if (!user) return true;
    if (user.role_name === 'Admin' || user.permissions?.all) return false;
    
    const isManagement = ['Admin', 'HR', 'Manager', 'Supervisor'].includes(user.role_name);

    if (moduleName) {
      // If they have the module permission AND are in management, show management view (return false)
      // Otherwise, return true to show the simpler employee view
      if (user.permissions && user.permissions[moduleName]) {
        return !isManagement;
      }
      return true;
    }

    return !isManagement;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, hasPermission, isEmployeeView }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
