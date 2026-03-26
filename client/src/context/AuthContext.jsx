import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  // const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored && stored !== "undefined" ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const [token, setToken] = useState(() => {
  const t = localStorage.getItem('token');
  return t && t !== "undefined" ? t : null;
});

const [user, setUser] = useState(getStoredUser);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);