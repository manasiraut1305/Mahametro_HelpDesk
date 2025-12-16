import React, { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  const showLoading = () => setLoading(true);  

  const hideLoading = () => setLoading(false);

  return (
    // <AuthContext.Provider value={{ user, login, logout }}>
    <AuthContext.Provider value={{ user, login, logout, loading, showLoading, hideLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
