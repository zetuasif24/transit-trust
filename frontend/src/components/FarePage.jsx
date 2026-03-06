import { useState, useEffect } from "react";
import { RouteAPI, ReportAPI } from "../api";

export default function FarePage({ user }) {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [farePaid, setFarePaid] = useState("");
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);
  const [reportMsg, setReportMsg] = useState(null);

  useEffect(() => {
    RouteAPI.getAll().then(setRoutes);
  }, []);

  const onRouteChange = async (routeId) => {
    setSelectedRoute(routeId);
    setSelectedBus("");
    setBuses([]);
    setMsg(null);
    if (!routeId) return;
    const data = await RouteAPI.getBusesByRoute(routeId);
    if (!data.length) { setMsg({ type: "error", text: "No buses registered for this route." }); return; }
    setBuses(data);
    setSelectedBus(data[0].id);
  };

  const checkFare = async () => {
    setMsg(null);
    setResult(null);
    setReportMsg(null);
    if (!selectedRoute) { setMsg({ type: "error", text: "Please select a route." }); return; }
    if (!farePaid) { setMsg({ type: "error", text: "Please enter the fare you paid." }); return; }
    const route = await RouteAPI.getById(selectedRoute);
    const paid  = parseFloat(farePaid);
    const over  = paid > route.official_fare;
    setResult({ route, paid, over, excess: (paid - route.official_fare).toFixed(0) });
  };

  const reportOvercharge = async () => {
    if (!selectedBus) { setReportMsg({ type: "error", text: "Please select a bus first." }); return; }
    const res = await ReportAPI.submit(user.id, selectedBus, selectedRoute, result.paid, result.route.official_fare);
    if (res.error) { setReportMsg({ type: "error", text: res.error }); return; }
    setReportMsg({ type: "success", text: "Report submitted. Authorities notified." });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Smart Fare Calculator</h1>
        <p className="text-slate-400 text-sm mt-1">Verify official government-mandated fares for your route</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Select Your Route</h2>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">ROUTE</label>
            <select value={selectedRoute} onChange={e => onRouteChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">-- Choose a route --</option>
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>

          {buses.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 mb-2">BUS</label>
              <select value={selectedBus} onChange={e => setSelectedBus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
                {buses.map(b => <option key={b.id} value={b.id}>{b.name} - {b.license_num}</option>)}
              </select>
            </div>
          )}

          {msg && <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>{msg.text}</div>}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">FARE YOU PAID (Tk)</label>
            <input type="number" value={farePaid} onChange={e => setFarePaid(e.target.value)}
              placeholder="e.g. 35"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
          </div>

          <button onClick={checkFare}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors">
            Check Fare
          </button>
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-6">
          {/* Result */}
          <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-40">
            {!result ? (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-500 text-sm">Select a route and enter fare paid to verify</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-2">{result.over ? "⚠️" : "✅"}</div>
                <div className={`text-xl font-black mb-4 ${result.over ? "text-red-400" : "text-emerald-400"}`}>
                  {result.over ? "Overcharge Detected!" : "Fare is Correct"}
                </div>
                <div className="grid grid-cols-2 gap-3 w-full mb-4">
                  <div className="bg-slate-900 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">OFFICIAL FARE</div>
                    <div className="text-xl font-black text-emerald-400">Tk {result.route.official_fare}</div>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">YOU PAID</div>
                    <div className={`text-xl font-black ${result.over ? "text-red-400" : "text-white"}`}>Tk {result.paid}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-4">{result.route.name} - {result.route.distance} km</div>
                {result.over && !reportMsg && (
                  <button onClick={reportOvercharge}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition-colors">
                    Report Overcharge (Tk {result.excess} excess)
                  </button>
                )}
                {reportMsg && (
                  <div className={`w-full p-3 rounded-xl text-sm text-center ${reportMsg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>
                    {reportMsg.text}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Fare chart */}
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">Official Fare Chart</h2>
            <div className="max-h-52 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-700">
                    <th className="text-left py-2">Route</th>
                    <th className="text-right py-2">Fare</th>
                    <th className="text-right py-2">Dist</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map(r => (
                    <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 text-slate-300">{r.name}</td>
                      <td className="py-2 text-right font-bold text-amber-400">Tk {r.official_fare}</td>
                      <td className="py-2 text-right text-slate-500">{r.distance} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}