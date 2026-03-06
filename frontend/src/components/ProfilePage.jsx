import { useState } from "react";
import { AuthAPI, RatingAPI, ReportAPI, formatDate, stars } from "../api";
import { useEffect } from "react";

export default function ProfilePage({ user, onUserUpdate }) {
  const [fullName, setFullName] = useState(user.full_name);
  const [msg, setMsg] = useState(null);
  const [myRatings, setMyRatings] = useState([]);
  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    RatingAPI.getAll(user.id).then(setMyRatings);
    ReportAPI.getAll(user.id).then(setMyReports);
  }, [user.id]);

  const saveProfile = async () => {
    setMsg(null);
    if (!fullName.trim()) { setMsg({ type: "error", text: "Name cannot be empty." }); return; }
    const res = await AuthAPI.updateProfile(user.id, fullName.trim());
    if (res.error) { setMsg({ type: "error", text: res.error }); return; }
    setMsg({ type: "success", text: "Profile updated successfully." });
    onUserUpdate(res.user);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile form */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white text-2xl font-black">
              {user.full_name[0].toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-black text-white">{user.full_name}</div>
              <div className="text-sm text-slate-500 capitalize">{user.role} - {user.gender}</div>
            </div>
          </div>

          {msg && (
            <div className={`mb-4 p-3 rounded-xl text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>
              {msg.text}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">FULL NAME</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 mb-2">PHONE NUMBER</label>
            <input type="text" value={user.phone} disabled
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
          </div>

          <button onClick={saveProfile}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors">
            Save Changes
          </button>
        </div>

        {/* Activity */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-bold mb-4">My Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-amber-400">{myRatings.length}</div>
                <div className="text-xs text-slate-500 mt-1">RATINGS GIVEN</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 text-center">
                <div className="text-3xl font-black text-red-400">{myReports.length}</div>
                <div className="text-xs text-slate-500 mt-1">OVERCHARGE REPORTS</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-2xl p-6 flex-1">
            <h2 className="text-white font-bold mb-4">My Recent Ratings</h2>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {myRatings.length === 0
                ? <p className="text-slate-500 text-sm">No ratings yet.</p>
                : myRatings.slice(0, 4).map(r => (
                  <div key={r.id} className="flex justify-between items-center py-2 border-b border-slate-700 text-sm">
                    <div>
                      <div className="text-slate-300 font-semibold">{r.bus_detail?.name || "Unknown"}</div>
                      <div className="text-xs text-slate-600">{formatDate(r.created_at)}</div>
                    </div>
                    <div className="text-amber-400 font-mono">{stars(r.rating_score)}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}