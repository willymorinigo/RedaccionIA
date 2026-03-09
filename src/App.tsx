import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskDetail from "./pages/TaskDetail";
import Admin from "./pages/Admin";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    setLoading(true);
    fetch("/api/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  };

  const refreshUser = () => {
    fetch("/api/me")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Not logged in");
      })
      .then((data) => setUser(data))
      .catch(() => setUser(null));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.branding) {
      const { primaryColor, bgColor } = user.branding;
      
      if (primaryColor && primaryColor.trim() !== "") {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
      } else {
        document.documentElement.style.removeProperty('--primary-color');
      }
      
      if (bgColor && bgColor.trim() !== "") {
        document.documentElement.style.setProperty('--bg-color', bgColor);
      } else {
        document.documentElement.style.removeProperty('--bg-color');
      }
    } else {
      document.documentElement.style.removeProperty('--primary-color');
      document.documentElement.style.removeProperty('--bg-color');
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-6">
        <div className="animate-pulse text-stone-400 font-serif italic">Cargando redacción...</div>
        <button 
          onClick={fetchUser}
          className="text-[10px] uppercase tracking-widest font-bold text-stone-300 hover:text-stone-600 transition-colors"
        >
          ¿Tarda demasiado? Reintentar
        </button>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLogin={setUser} />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/task/:taskId" 
          element={user ? <TaskDetail user={user} onRefreshUser={refreshUser} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={(user?.username === "willy" || user?.username === "admin") ? <Admin user={user} /> : <Navigate to="/" />} 
        />
      </Routes>
    </Router>
  );
}
