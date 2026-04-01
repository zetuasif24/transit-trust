import { useState, useEffect } from "react";
import { RouteAPI, ReportAPI } from "../api";

export default function FarePage({ user }) {
  const [locations, setLocations] = useState([]);
  const [availableTo, setAvailableTo] = useState([]);
  const [buses, setBuses] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [farePaid, setFarePaid] = useState("");
  const [routeInfo, setRouteInfo] = useState(null);
  const [result, setResult] = useState(null);
  const [msg, setMsg] = useState(null);
  const [reportMsg, setReportMsg] = useState(null);
  const [loadingRoute, setLoadingRoute] = useState(false);

  useEffect(() => {
    RouteAPI.getLocations().then(setLocations);
  }, []);

  const onFromChange = async (val) => {
    setFrom(val);
    setTo("");
    setRouteInfo(null);
    setBuses([]);
    setSelectedBus("");
    setResult(null);
    setMsg(null);
    setReportMsg(null);
    setAvailableTo([]);
    if (!val) return;
    const allRoutes = await RouteAPI.getAll();
    const destinations = allRoutes
      .filter(r => r.start_point === val || r.end_point === val)
      .map(r => r.start_point === val ? r.end_point : r.start_point);
    setAvailableTo(destinations);
  };

  const onToChange = async (val) => {
    setTo(val);
    setRouteInfo(null);
    setBuses([]);
    setSelectedBus("");
    setResult(null);
    setMsg(null);
    setReportMsg(null);
    if (!val) return;

    setLoadingRoute(true);
    const data = await RouteAPI.findRoute(from, val);
    setLoadingRoute(false);

    if (data.error) { setMsg({ type: "error", text: data.error }); return; }
    setRouteInfo(data);

    if (data.found) {
      const busData = await RouteAPI.getBusesByRoute(data.route_id);
      if (busData.length) {
        setBuses(busData);
        setSelectedBus(busData[0].id);
      }
    }
  };

  const checkFare = () => {
    setMsg(null);
    setResult(null);
    setReportMsg(null);
    if (!from || !to) { setMsg({ type: "error", text: "Please select both From and To locations." }); return; }
    if (!farePaid)    { setMsg({ type: "error", text: "Please enter the fare you paid." }); return; }
    if (!routeInfo)   { setMsg({ type: "error", text: "Please wait for route to load." }); return; }
    const paid   = parseFloat(farePaid);
    const over   = paid > routeInfo.official_fare;
    const excess = (paid - routeInfo.official_fare).toFixed(0);
    setResult({ paid, over, excess });
  };

  const reportOvercharge = async () => {
    if (!selectedBus) {
      setReportMsg({ type: "error", text: "Please select a bus first." });
      return;
    }
    const res = await ReportAPI.submit(user.id, selectedBus, routeInfo.route_id, result.paid, routeInfo.official_fare);
    if (res.error) { setReportMsg({ type: "error", text: res.error }); return; }
    setReportMsg({ type: "success", text: "Report submitted. Authorities notified." });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Smart Fare Calculator</h1>
        <p className="text-slate-400 text-sm mt-1">Select your journey and verify the official fare</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Your Journey</h2>

          {/* From */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">FROM</label>
            <select value={from} onChange={e => onFromChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">-- Select starting point --</option>
              {locations.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          {/* To */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">TO</label>
            <select value={to} onChange={e => onToChange(e.target.value)} disabled={!from}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="">-- Select destination --</option>
              {availableTo.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            {from && availableTo.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">No direct routes available from this location.</p>
            )}
          </div>

          {/* Route info */}
          {loadingRoute && (
            <div className="mb-4 p-3 rounded-xl bg-slate-900 text-slate-400 text-sm">
              Finding route...
            </div>
          )}
          {routeInfo && !loadingRoute && (
            <div className="mb-4 p-4 rounded-xl border bg-emerald-900/20 border-emerald-700">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-bold text-white">{routeInfo.name}</div>
                <span className="text-xs px-2 py-1 rounded-lg font-bold bg-emerald-900 text-emerald-300">
                  Official Route
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-500">DISTANCE</div>
                  <div className="text-sm font-bold text-slate-200">{routeInfo.distance} km</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-xs text-slate-500">OFFICIAL FARE</div>
                  <div className="text-sm font-bold text-amber-400">Tk {routeInfo.official_fare}</div>
                </div>
              </div>
            </div>
          )}

          {/* Bus selector */}
          {buses.length > 0 && (
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-400 mb-2">BUS</label>
              <select value={selectedBus} onChange={e => setSelectedBus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
                {buses.map(b => <option key={b.id} value={b.id}>{b.name} - {b.license_num}</option>)}
              </select>
            </div>
          )}

          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>
              {msg.text}
            </div>
          )}

          {/* Fare paid */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">FARE YOU PAID (Tk)</label>
            <input type="number" value={farePaid} onChange={e => setFarePaid(e.target.value)}
              placeholder="e.g. 35" disabled={!routeInfo}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed" />
          </div>

          <button onClick={checkFare} disabled={!routeInfo}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors">
            Check Fare
          </button>
        </div>

        {/* Right side */}
        <div className="flex flex-col gap-6">
          {/* Result */}
          <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center min-h-48">
            {!result ? (
              <>
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-slate-500 text-sm text-center">Select your journey and enter fare paid to verify</p>
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
                    <div className="text-xl font-black text-emerald-400">Tk {routeInfo.official_fare}</div>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">YOU PAID</div>
                    <div className={`text-xl font-black ${result.over ? "text-red-400" : "text-white"}`}>Tk {result.paid}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mb-4">{routeInfo.name} — {routeInfo.distance} km</div>
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
            <h2 className="text-white font-bold mb-1">Official Fare Chart</h2>
            <p className="text-xs text-slate-500 mb-4">Based on BRTA rate: Tk 2.42/km</p>
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
                  <FareChartRows />
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FareChartRows() {
  const [routes, setRoutes] = useState([]);
  useEffect(() => { RouteAPI.getAll().then(setRoutes); }, []);
  return routes.map(r => (
    <tr key={r.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
      <td className="py-2 text-slate-300">{r.name}</td>
      <td className="py-2 text-right font-bold text-amber-400">Tk {r.official_fare}</td>
      <td className="py-2 text-right text-slate-500">{r.distance} km</td>
    </tr>
  ));
}