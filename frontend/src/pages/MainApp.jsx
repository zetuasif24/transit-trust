import { useState } from "react";
import FarePage from "../components/FarePage";
import RatingPage from "../components/RatingPage";
import DashboardPage from "../components/DashboardPage";
import ProfilePage from "../components/ProfilePage";
import SafetyPage from "../components/SafetyPage";

export default function MainApp({ user, onLogout, onUserUpdate }) {
  const isAdmin = user.role === "admin";
  const [activePage, setActivePage] = useState("fare");

  const navItems = [
    { id: "fare",      icon: "🧮", label: "Fare Calculator" },
    { id: "rating",    icon: "⭐", label: "Rate Service"    },
    { id: "safety",    icon: "⚠️",  label: "Safety Reports"  },
    ...(isAdmin ? [{ id: "dashboard", icon: "📊", label: "Dashboard" }] : []),
    { id: "profile",   icon: "👤", label: "My Profile"      },
  ];

  const renderPage = () => {
    // Hard block — even if somehow activePage is dashboard for a passenger
    if (activePage === "dashboard" && !isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm">The dashboard is only accessible to admin users.</p>
        </div>
      );
    }
    if (activePage === "fare")      return <FarePage user={user} />;
    if (activePage === "rating")    return <RatingPage user={user} />;
    if (activePage === "safety")    return <SafetyPage user={user} />;
    if (activePage === "dashboard") return <DashboardPage />;
    if (activePage === "profile")   return <ProfilePage user={user} onUserUpdate={onUserUpdate} />;
  };

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🚌</div>
            <div>
              <div className="text-white font-black text-lg">Transit Trust</div>
              <div className="text-slate-500 text-xs">PUBLIC TRANSPORT SYSTEM</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)}
              className={"flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left w-full " +
                (activePage === item.id
                  ? "bg-violet-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white")}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white font-black">
              {user.full_name[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-200 truncate">{user.full_name}</div>
              <div className="text-xs text-slate-500 capitalize">{user.role}</div>
            </div>
          </div>
          <button onClick={onLogout}
            className="w-full bg-red-900/40 hover:bg-red-900/70 text-red-400 text-xs font-bold py-2 rounded-xl transition-colors">
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        {renderPage()}
      </main>
    </div>
  );
}
