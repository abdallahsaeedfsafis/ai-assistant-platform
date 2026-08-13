import { createContext, useContext, useEffect, useState } from "react";
import { getToken, getMe, login as apiLogin, signup as apiSignup, logout as apiLogout } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    getMe()
      .then((data) => setUser(data))
      .catch(() => apiLogout())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email, password) => {
    await apiLogin(email, password);
    const me = await getMe();
    setUser(me);
  };

  const signup = async (email, password) => {
    await apiSignup(email, password);
    const me = await getMe();
    setUser(me);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}