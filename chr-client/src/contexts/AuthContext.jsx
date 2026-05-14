import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin, logout as apiLogout } from '../services/api';
import { setFacilityId, clearAllData, getFacilityId } from '../services/db';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Optionally verify token with backend, but for offline we trust it
      // We can store facility_id from IndexedDB
      getFacilityId().then(fid => {
        if (fid) {
          setUser({ facility_id: fid });
        }
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const data = await apiLogin(username, password);
    if (data.user && data.token) {
      await setFacilityId(data.user.facility_id);
      setUser({ facility_id: data.user.facility_id, ...data.user });
      navigate('/patients');
      return true;
    }
    return false;
  };

  const logout = async () => {
    apiLogout();
    await clearAllData();
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}