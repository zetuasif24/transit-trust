import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MainApp from "./pages/MainApp";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(window.location.pathname);

  useEffect(() => {
    const saved = sessionStorage.getItem("transitTrust_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    sessionStorage.setItem("transitTrust_user", JSON.stringify(userData));
    setUser(userData);
    setPage("/app");
    window.history.pushState({}, "", "/app");
  };

  const handleRegister = () => {
    setPage("/");
    window.history.pushState({}, "", "/");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("transitTrust_user");
    setUser(null);
    setPage("/");
    window.history.pushState({}, "", "/");
  };

  const handleUserUpdate = (updatedUser) => {
    sessionStorage.setItem("transitTrust_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  if (page === "/register") return <Register onRegister={handleRegister} />;
  if (!user) return <Login onLogin={handleLogin} />;
  return <MainApp user={user} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />;
}