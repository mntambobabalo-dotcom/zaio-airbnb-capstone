import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";

const AuthContext = createContext(null);
const tokenKey = "zaioAuthToken";
const userKey = "zaioAuthUser";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(userKey) ?? "null");
    } catch {
      return null;
    }
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!token) {
      setReady(true);
      return;
    }

    const controller = new AbortController();
    apiRequest("/users/me", { token, signal: controller.signal })
      .then(({ user: currentUser }) => saveSession(token, currentUser))
      .catch((error) => {
        if (error.name !== "AbortError") clearSession();
      })
      .finally(() => setReady(true));
    return () => controller.abort();
  }, [token]);

  function saveSession(nextToken, nextUser) {
    localStorage.setItem(tokenKey, nextToken);
    localStorage.setItem(userKey, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  function clearSession() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setToken(null);
    setUser(null);
  }

  async function login(credentials) {
    const session = await apiRequest("/users/login", { method: "POST", body: credentials });
    saveSession(session.token, session.user);
    return session.user;
  }

  async function register(details) {
    const session = await apiRequest("/users/register", { method: "POST", body: details });
    saveSession(session.token, session.user);
    return session.user;
  }

  const value = useMemo(() => ({ token, user, ready, login, register, logout: clearSession }), [token, user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
