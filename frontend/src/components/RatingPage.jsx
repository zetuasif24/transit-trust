import { useState, useEffect } from "react";
import { RouteAPI, RatingAPI, formatDate, stars } from "../api";

export default function RatingPage({ user }) {
  const [routes, setRoutes] = useState([]);
  const [buses, setBuses] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedBus, setSelectedBus] = useState("");
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    RouteAPI.getAll().then(setRoutes);
    RatingAPI.getAll(null).then(setRatings);
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

  const submitRating = async () => {
    setMsg(null);
    if (!selectedBus) { setMsg({ type: "error", text: "Please select a route and bus." }); return; }
    if (!selectedStar) { setMsg({ type: "error", text: "Please give a star rating." }); return; }
    const res = await RatingAPI.submit(user.id, selectedBus, selectedStar, comment);
    if (res.error) { setMsg({ type: "error", text: res.error }); return; }
    setMsg({ type: "success", text: "Rating saved successfully!" });
    setSelectedRoute(""); setSelectedBus(""); setSelectedStar(0); setComment(""); setBuses([]);
    RatingAPI.getAll(null).then(setRatings);
  };

  const starColors = ["", "text-red-400", "text-orange-400", "text-amber-400", "text-lime-400", "text-emerald-400"];
  const starLabels = ["", "Very Poor", "Poor", "Average", "Good", "Excellent"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Service Rating</h1>
        <p className="text-slate-400 text-sm mt-1">Rate bus service quality and driver behavior</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit form */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Submit a Rating</h2>

          {msg && <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>{msg.text}</div>}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">ROUTE</label>
            <select value={selectedRoute} onChange={e => onRouteChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500">
              <option value="">-- Select route --</option>
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

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">YOUR RATING</label>
            <div className="flex gap-2 mt-1">
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setSelectedStar(n)}
                  className={`text-3xl transition-colors ${n <= selectedStar ? "text-amber-400" : "text-slate-600 hover:text-amber-400"}`}>
                  ★
                </button>
              ))}
            </div>
            {selectedStar > 0 && (
              <div className={`text-sm mt-2 font-bold ${starColors[selectedStar]}`}>
                {starLabels[selectedStar]}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">COMMENT (OPTIONAL)</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              rows={3} placeholder="Share your experience..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          <button onClick={submitRating}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors">
            Submit Rating
          </button>
        </div>

        {/* Recent ratings */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-bold mb-4">Recent Ratings</h2>
          <div className="max-h-96 overflow-y-auto pr-1 flex flex-col gap-3">
            {ratings.length === 0
              ? <p className="text-slate-500 text-sm">No ratings yet.</p>
              : ratings.map(r => (
                <div key={r.id} className="bg-slate-900 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-bold text-slate-200">{r.bus_detail?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-500">{r.bus_detail?.license_num}</div>
                    </div>
                    <div className={`font-mono text-sm ${starColors[r.rating_score]}`}>{stars(r.rating_score)}</div>
                  </div>
                  {r.comment && <p className="text-xs text-slate-400 italic mt-2">"{r.comment}"</p>}
                  <div className="text-xs text-slate-600 mt-2">{formatDate(r.created_at)}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}