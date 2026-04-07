import { useState, useEffect } from "react";
import { AuthAPI, formatDate, stars } from "../api";

const API = "http://127.0.0.1:8000/api";

export default function DashboardPage() {
  const [stats, setStats]         = useState(null);
  const [ratings, setRatings]     = useState([]);
  const [reports, setReports]     = useState([]);
  const [safety, setSafety]       = useState([]);
  const [routes, setRoutes]       = useState([]);
  const [activeTab, setActiveTab] = useState("overcharge");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRoute,  setFilterRoute]  = useState("");

  useEffect(() => {
    AuthAPI.getStats().then(setStats);
    fetch(API + "/ratings/").then(r => r.json()).then(data => setRatings(data.slice(0, 5)));
    fetch(API + "/routes/").then(r => r.json()).then(setRoutes);
    fetchReports();
    fetchSafety();
  }, []);

  const fetchReports = async (s = "", r = "") => {
    let url = API + "/reports/";
    const p = [];
    if (s) p.push("status=" + s);
    if (r) p.push("route_id=" + r);
    if (p.length) url += "?" + p.join("&");
    const res = await fetch(url);
    setReports(await res.json());
  };

  const fetchSafety = async (s = "", r = "") => {
    let url = API + "/safety/";
    const p = [];
    if (s) p.push("status=" + s);
    if (r) p.push("route_id=" + r);
    if (p.length) url += "?" + p.join("&");
    const res = await fetch(url);
    setSafety(await res.json());
  };

  const applyFilter = () => { fetchReports(filterStatus, filterRoute); fetchSafety(filterStatus, filterRoute); };
  const clearFilter = () => { setFilterStatus(""); setFilterRoute(""); fetchReports(); fetchSafety(); };

  const updateReportStatus = async (id, newStatus) => {
    await fetch(API + "/reports/" + id + "/status/", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchReports(filterStatus, filterRoute);
  };

  const updateSafetyStatus = async (id, newStatus) => {
    await fetch(API + "/safety/" + id + "/status/", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    fetchSafety(filterStatus, filterRoute);
  };

  // ── Export CSV ──────────────────────────────────────────────
  const exportCSV = () => {
    const type = activeTab === "overcharge" ? "overcharge" : "safety";
    let url = API + "/reports/export/?type=" + type;
    if (filterStatus) url += "&status=" + filterStatus;
    if (filterRoute)  url += "&route_id=" + filterRoute;
    window.open(url, "_blank");
  };

  // ── Export PDF ──────────────────────────────────────────────
  const exportPDF = () => {
    const data       = activeTab === "overcharge" ? reports : safety;
    const type       = activeTab === "overcharge" ? "Overcharge" : "Safety";
    const now        = new Date().toLocaleString("en-BD");
    const routeName  = routes.find(r => r.id === parseInt(filterRoute))?.name || "All Routes";
    const statusLabel = filterStatus || "All Statuses";

    let headers = "";
    let rows    = "";

    if (activeTab === "overcharge") {
      headers = "<th>ID</th><th>Passenger</th><th>Route</th><th>Bus</th><th>Official Fare</th><th>Charged</th><th>Excess</th><th>Status</th><th>Date</th>";
      rows = data.map(r =>
        "<tr><td>" + r.id + "</td><td>" + (r.passenger_name || "") + "</td><td>" +
        (r.route_detail?.name || "") + "</td><td>" + (r.bus_detail?.license_num || "") +
        "</td><td>Tk " + r.official_fare + "</td><td>Tk " + r.charged_amount +
        "</td><td>Tk " + r.excess_amount + "</td><td>" + r.status + "</td><td>" +
        new Date(r.created_at).toLocaleDateString() + "</td></tr>"
      ).join("");
    } else {
      headers = "<th>ID</th><th>Passenger</th><th>Route</th><th>Type</th><th>Location</th><th>Description</th><th>Agrees</th><th>Disagrees</th><th>Status</th><th>Date</th>";
      rows = data.map(r =>
        "<tr><td>" + r.id + "</td><td>" + (r.passenger_name || "") + "</td><td>" +
        (r.route_detail?.name || "") + "</td><td>" + r.report_type + "</td><td>" +
        r.location + "</td><td>" + r.description + "</td><td>" + (r.agree_count || 0) +
        "</td><td>" + (r.disagree_count || 0) + "</td><td>" + r.status + "</td><td>" +
        new Date(r.created_at).toLocaleDateString() + "</td></tr>"
      ).join("");
    }

    const html =
      "<!DOCTYPE html><html><head><title>Transit Trust - " + type + " Reports</title>" +
      "<style>body{font-family:Arial,sans-serif;padding:30px;color:#1e293b}" +
      "h1{color:#4f46e5;margin-bottom:4px}.meta{color:#64748b;font-size:13px;margin-bottom:20px}" +
      "table{width:100%;border-collapse:collapse;font-size:12px}" +
      "th{background:#4f46e5;color:white;padding:8px;text-align:left}" +
      "td{padding:7px 8px;border-bottom:1px solid #e2e8f0}" +
      "tr:nth-child(even){background:#f8fafc}" +
      ".footer{margin-top:20px;font-size:11px;color:#94a3b8}</style></head><body>" +
      "<h1>Transit Trust — " + type + " Reports</h1>" +
      "<div class='meta'>Generated: " + now + " &nbsp;|&nbsp; Route: " + routeName +
      " &nbsp;|&nbsp; Status: " + statusLabel + " &nbsp;|&nbsp; Total: " + data.length + " records</div>" +
      "<table><thead><tr>" + headers + "</tr></thead><tbody>" + rows + "</tbody></table>" +
      "<div class='footer'>This report was generated by Transit Trust Admin Dashboard.</div>" +
      "</body></html>";

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const statCards = [
    { label: "Registered Users",   value: stats?.total_users,   icon: "👥", color: "text-violet-400" },
    { label: "Service Ratings",    value: stats?.total_ratings, icon: "⭐", color: "text-amber-400"  },
    { label: "Overcharge Reports", value: stats?.total_reports, icon: "🚨", color: "text-red-400"    },
    { label: "Avg Rating", value: stats?.avg_rating !== "N/A" ? stats?.avg_rating + " / 5" : "N/A", icon: "📈", color: "text-emerald-400" },
  ];

  const badgeColors  = ["","bg-red-900 text-red-300","bg-orange-900 text-orange-300","bg-amber-900 text-amber-300","bg-lime-900 text-lime-300","bg-emerald-900 text-emerald-300"];
  const statusColors = { pending: "bg-slate-700 text-slate-300", reviewed: "bg-blue-900 text-blue-300", resolved: "bg-emerald-900 text-emerald-300" };
  const heatData = [
    { route: "Mirpur-10 to Motijheel", risk: 0.85 }, { route: "Uttara to Farmgate",    risk: 0.40 },
    { route: "Gazipur to Gulistan",    risk: 0.70 }, { route: "Sadarghat to Mirpur-1", risk: 0.20 },
    { route: "Demra to Motijheel",     risk: 0.60 }, { route: "Bashundhara to KB",     risk: 0.30 },
  ];

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
            <div className={"text-3xl font-black " + s.color}>{s.value ?? "..."}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent ratings */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold mb-4">Recent Service Ratings</h2>
        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
          {ratings.length === 0 ? <p className="text-slate-500 text-sm">No ratings yet.</p>
            : ratings.map(r => (
              <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                <div>
                  <div className="text-sm font-semibold text-slate-200">{r.bus_detail?.name || "Unknown"}</div>
                  <div className="text-xs text-slate-500">{formatDate(r.created_at)}</div>
                </div>
                <span className={"text-xs px-2 py-1 rounded-lg font-bold " + (badgeColors[r.rating_score] || "")}>
                  {stars(r.rating_score)} {r.rating_score}/5
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Filter + Export */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-bold mb-4">Filter & Export Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">STATUS</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-2">ROUTE</label>
            <select value={filterRoute} onChange={e => setFilterRoute(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">All Routes</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={applyFilter}
            className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-5 py-2 rounded-xl transition-colors text-sm">
            Apply Filter
          </button>
          <button onClick={clearFilter}
            className="bg-slate-700 hover:bg-slate-600 text-white font-bold px-5 py-2 rounded-xl transition-colors text-sm">
            Clear
          </button>
          <div className="ml-auto flex gap-3">
            <button onClick={exportCSV}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition-colors text-sm">
              📥 Export CSV
            </button>
            <button onClick={exportPDF}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-xl transition-colors text-sm">
              🖨️ Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* Reports tabs */}
      <div className="bg-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex gap-3 mb-4">
          <button onClick={() => setActiveTab("overcharge")}
            className={"px-4 py-2 rounded-xl text-sm font-bold transition-colors " + (activeTab === "overcharge" ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white")}>
            Overcharge Reports ({reports.length})
          </button>
          <button onClick={() => setActiveTab("safety")}
            className={"px-4 py-2 rounded-xl text-sm font-bold transition-colors " + (activeTab === "safety" ? "bg-violet-600 text-white" : "bg-slate-900 text-slate-400 hover:text-white")}>
            Safety Reports ({safety.length})
          </button>
        </div>

        <div style={{ maxHeight: "360px", overflowY: "auto" }}>
          {activeTab === "overcharge" && (
            reports.length === 0 ? <p className="text-slate-500 text-sm">No reports found.</p>
              : reports.map(r => (
                <div key={r.id} className="bg-slate-900 rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-slate-200">{r.bus_detail?.license_num || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{r.route_detail?.name}</div>
                      <div className="text-xs text-slate-600 mt-1">Paid: Tk {r.charged_amount} — Official: Tk {r.official_fare}</div>
                      <div className="text-xs text-slate-600">Passenger: {r.passenger_name}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 rounded-lg font-bold bg-red-900 text-red-300">+Tk {r.excess_amount}</span>
                      <select value={r.status} onChange={e => updateReportStatus(r.id, e.target.value)}
                        className={"text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer " + (statusColors[r.status] || "")}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
          )}
          {activeTab === "safety" && (
            safety.length === 0 ? <p className="text-slate-500 text-sm">No safety reports found.</p>
              : safety.map(r => (
                <div key={r.id} className="bg-slate-900 rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <div className="text-sm font-bold text-slate-200">{r.route_detail?.name}</div>
                      <div className="text-xs text-slate-400 mt-1">📍 {r.location}</div>
                      <div className="text-xs text-slate-500 mt-1 italic">{r.description}</div>
                      <div className="text-xs text-slate-600">By: {r.passenger_name}</div>
                      {r.attachment && <img src={r.attachment} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={"text-xs px-2 py-1 rounded-lg font-bold " + (r.report_type === "unsafe_location" ? "bg-red-900 text-red-300" : "bg-orange-900 text-orange-300")}>
                        {r.report_type === "unsafe_location" ? "Unsafe Location" : "Safety Issue"}
                      </span>
                      <select value={r.status} onChange={e => updateSafetyStatus(r.id, e.target.value)}
                        className={"text-xs px-2 py-1 rounded-lg font-bold border-0 cursor-pointer " + (statusColors[r.status] || "")}>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Heatmap */}
      <div className="bg-slate-800 rounded-2xl p-6">
        <h2 className="text-white font-bold mb-4">Safety Heatmap</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {heatData.map((d, i) => {
            const level = d.risk > 0.65 ? "HIGH RISK" : d.risk > 0.45 ? "MODERATE" : "SAFE";
            const cls   = d.risk > 0.65 ? "bg-red-900/50 border border-red-700 text-red-300"
              : d.risk > 0.45 ? "bg-amber-900/50 border border-amber-700 text-amber-300"
              : "bg-emerald-900/50 border border-emerald-700 text-emerald-300";
            return (
              <div key={i} className={"rounded-xl p-3 text-center " + cls}>
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
