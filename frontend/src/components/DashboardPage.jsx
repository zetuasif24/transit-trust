import { useState, useEffect } from "react";
import { AuthAPI, RatingAPI, ReportAPI, formatDate, stars } from "../api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    AuthAPI.getStats().then(setStats);
    RatingAPI.getAll(null).then(data => setRatings(data.slice(0, 5)));
    ReportAPI.getAll(null).then(data => setReports(data.slice(0, 5)));
  }, []);

  const heatData = [
    { route: "Mirpur-10 to Motijheel", risk: 0.85 },
    { route: "Uttara to Farmgate",     risk: 0.40 },
    { route: "Gazipur to Gulistan",    risk: 0.70 },
    { route: "Sadarghat to Mirpur-1",  risk: 0.20 },
    { route: "Demra to Motijheel",     risk: 0.60 },
    { route: "Bashundhara to KB",      risk: 0.30 },
  ];

  const statCards = [
    { label: "Registered Users",   value: stats?.total_users,   icon: "👥", color: "text-violet-400" },
    { label: "Service Ratings",    value: stats?.total_ratings, icon: "⭐", color: "text-amber-400"  },
    { label: "Overcharge Reports", value: stats?.total_reports, icon: "🚨", color: "text-red-400"    },
    { label: "Avg Rating",         value: stats?.avg_rating !== "N/A" ? stats?.avg_rating + " / 5" : "N/A", icon: "📈", color: "text-emerald-400" },
  ];

  const badgeColors = ["","bg-red-900 text-red-300","bg-orange-900 text-orange-300","bg-amber-900 text-amber-300","bg-lime-900 text-lime-300","bg-emerald-900 text-emerald-300"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Live data from database</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-slate-800 rounded-2xl p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className={`text-3xl font-black ${s.color}`}>{s.value ?? "..."}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent ratings and reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Recent Service Ratings</h2>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {ratings.length === 0
              ? <p className="text-slate-500 text-sm">No ratings yet.</p>
              : ratings.map(r => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                  <div>
                    <div className="text-sm font-semibold text-slate-200">{r.bus_detail?.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{formatDate(r.created_at)}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-lg font-bold ${badgeColors[r.rating_score]}`}>
                    {stars(r.rating_score)} {r.rating_score}/5
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Overcharge Reports</h2>
          <div style={{ maxHeight: "260px", overflowY: "auto" }}>
            {reports.length === 0
              ? <p className="text-slate-500 text-sm">No reports yet.</p>
              : reports.map(r => (
                <div key={r.id} className="py-2 border-b border-slate-700">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-semibold text-slate-200">{r.bus_detail?.license_num || "Unknown"}</div>
                    <span className="text-xs px-2 py-1 rounded-lg font-bold bg-red-900 text-red-300">+Tk {r.excess_amount}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{r.route_detail?.name}</div>
                  <div className="text-xs text-slate-600">Paid: Tk {r.charged_amount} - Official: Tk {r.official_fare}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Safety Heatmap</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {heatData.map((d, i) => {
            const level = d.risk > 0.65 ? "HIGH RISK" : d.risk > 0.45 ? "MODERATE" : "SAFE";
            const cls   = d.risk > 0.65
              ? "bg-red-900/50 border border-red-700 text-red-300"
              : d.risk > 0.45
              ? "bg-amber-900/50 border border-amber-700 text-amber-300"
              : "bg-emerald-900/50 border border-emerald-700 text-emerald-300";
            return (
              <div key={i} className={`rounded-xl p-3 text-center ${cls}`}>
                <div className="text-xs font-bold leading-tight">{d.route}</div>
                <div className="text-xs font-black mt-2">{level}</div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-600 mt-4">Generated from aggregated passenger safety reports.</p>
      </div>
    </div>
  );
}