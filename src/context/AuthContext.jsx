import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

// 1. Create context
const AuthContext = createContext();

// 2. Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("auth_token") || ""
  );
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // Attach token to all requests
  // -----------------------------------
  useEffect(() => {
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }
  }, [token]);

  // -----------------------------------
  // Fetch authenticated user
  // -----------------------------------
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      } 

      try {
        const res = await api.get("/me");
        setUser(res.data);
      } catch (err) {
        console.error("Auth error:", err);
        setUser(null);
        setToken("");
        localStorage.removeItem("auth_token");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // -----------------------------------
  // Login function
  // -----------------------------------
  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
  };

  // -----------------------------------
  // Logout function
  // -----------------------------------
  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error(err);
    } finally {
      setToken("");
      setUser(null);
      localStorage.removeItem("auth_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 3. Custom hook (clean usage)
export function useAuth() {
  return useContext(AuthContext);
}