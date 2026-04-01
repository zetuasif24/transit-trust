import { useState, useEffect } from "react";
import { RouteAPI } from "../api";

const API = "http://127.0.0.1:8000/api";

export default function SafetyPage({ user }) {
  const [routes, setRoutes] = useState([]);
  const [form, setForm] = useState({ route: "", report_type: "safety_issue", location: "", description: "" });
  const [msg, setMsg] = useState(null);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    RouteAPI.getAll().then(setRoutes);
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    const res = await fetch(API + "/safety/?passenger_id=" + user.id);
    const data = await res.json();
    setMyReports(data);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async () => {
    setMsg(null);
    if (!form.route)       { setMsg({ type: "error", text: "Please select a route." }); return; }
    if (!form.location)    { setMsg({ type: "error", text: "Please enter the location." }); return; }
    if (!form.description) { setMsg({ type: "error", text: "Please describe the issue." }); return; }

    const res = await fetch(API + "/safety/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passenger:   user.id,
        route:       form.route,
        report_type: form.report_type,
        location:    form.location,
        description: form.description,
      })
    });
    const data = await res.json();
    if (!res.ok) { setMsg({ type: "error", text: data.error }); return; }
    setMsg({ type: "success", text: "Safety report submitted successfully!" });
    setForm({ route: "", report_type: "safety_issue", location: "", description: "" });
    fetchMyReports();
  };

  const typeColors = { safety_issue: "bg-orange-900 text-orange-300", unsafe_location: "bg-red-900 text-red-300" };
  const typeLabels = { safety_issue: "Safety Issue", unsafe_location: "Unsafe Location" };
  const statusColors = { pending: "bg-slate-700 text-slate-300", reviewed: "bg-blue-900 text-blue-300", resolved: "bg-emerald-900 text-emerald-300" };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Safety Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Report safety issues and unsafe locations on bus routes</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Submit a Safety Report</h2>

          {msg && (
            <div className={"mb-4 p-3 rounded-xl text-sm " + (msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300")}>
              {msg.text}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">REPORT TYPE</label>
            <div className="grid grid-cols-2 gap-3">
              {["safety_issue", "unsafe_location"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, report_type: t })}
                  className={"py-3 px-4 rounded-xl text-sm font-bold transition-colors border " +
                    (form.report_type === t ? "bg-violet-600 border-violet-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:text-white")}>
                  {t === "safety_issue" ? "⚠️ Safety Issue" : "📍 Unsafe Location"}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">ROUTE</label>
            <select value={form.route} onChange={set("route")}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">-- Select route --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">
              {form.report_type === "unsafe_location" ? "UNSAFE STOP / LOCATION" : "WHERE DID IT HAPPEN"}
            </label>
            <input type="text" value={form.location} onChange={set("location")}
              placeholder={form.report_type === "unsafe_location" ? "e.g. Mirpur-10 bus stop" : "e.g. Near Farmgate bridge"}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">DESCRIPTION</label>
            <textarea value={form.description} onChange={set("description")} rows={4}
              placeholder="Describe the safety issue or unsafe condition in detail..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          <button onClick={submit}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors">
            Submit Report
          </button>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">My Safety Reports</h2>
          <div style={{ maxHeight: "480px", overflowY: "auto" }}>
            {myReports.length === 0
              ? <p className="text-slate-500 text-sm">No safety reports yet.</p>
              : myReports.map(r => (
                <div key={r.id} className="bg-slate-900 rounded-xl p-4 mb-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className={"text-xs px-2 py-1 rounded-lg font-bold " + (typeColors[r.report_type] || "bg-slate-700 text-slate-300")}>
                      {typeLabels[r.report_type]}
                    </span>
                    <span className={"text-xs px-2 py-1 rounded-lg font-bold capitalize " + (statusColors[r.status] || "bg-slate-700 text-slate-300")}>
                      {r.status}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-200 mt-2">{r.route_detail?.name}</div>
                  <div className="text-xs text-slate-400 mt-1">📍 {r.location}</div>
                  <div className="text-xs text-slate-500 mt-2 italic">{r.description}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
