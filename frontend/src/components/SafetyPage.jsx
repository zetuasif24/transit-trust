import { useState, useEffect } from "react";
import { RouteAPI, formatDate } from "../api";

const API = "http://127.0.0.1:8000/api";

export default function SafetyPage({ user }) {
  const [routes, setRoutes]             = useState([]);
  const [allReports, setAllReports]     = useState([]);
  const [myReports, setMyReports]       = useState([]);
  const [form, setForm]                 = useState({ route: "", report_type: "safety_issue", location: "", description: "", attachment: "" });
  const [preview, setPreview]           = useState(null);
  const [msg, setMsg]                   = useState(null);
  const [votes, setVotes]               = useState({});
  const [commentTexts, setCommentTexts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [tab, setTab]                   = useState("community");

  useEffect(() => {
    RouteAPI.getAll().then(setRoutes);
    fetchAllReports();
    fetchMyReports();
  }, []);

  const fetchAllReports = async () => {
    const res  = await fetch(API + "/safety/");
    const data = await res.json();
    setAllReports(data);
    const voteMap = {};
    await Promise.all(data.map(async (r) => {
      const vres  = await fetch(API + "/safety/" + r.id + "/myvote/?passenger_id=" + user.id);
      const vdata = await vres.json();
      if (vdata.voted) voteMap[r.id] = vdata.vote;
    }));
    setVotes(voteMap);
  };

  const fetchMyReports = async () => {
    const res  = await fetch(API + "/safety/?passenger_id=" + user.id);
    const data = await res.json();
    setMyReports(data);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMsg({ type: "error", text: "Only image files are allowed." }); return; }
    if (file.size > 5 * 1024 * 1024) { setMsg({ type: "error", text: "Image must be under 5MB." }); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm(prev => ({ ...prev, attachment: ev.target.result }));
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, attachment: "" }));
    setPreview(null);
  };

  const submit = async () => {
    setMsg(null);
    if (!form.route)       { setMsg({ type: "error", text: "Please select a route." }); return; }
    if (!form.location)    { setMsg({ type: "error", text: "Please enter the location." }); return; }
    if (!form.description) { setMsg({ type: "error", text: "Please describe the issue." }); return; }

    const res = await fetch(API + "/safety/submit/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passenger: user.id, route: form.route,
        report_type: form.report_type, location: form.location,
        description: form.description, attachment: form.attachment,
      })
    });
    const data = await res.json();
    if (!res.ok) { setMsg({ type: "error", text: data.error }); return; }
    setMsg({ type: "success", text: "Safety report submitted successfully!" });
    setForm({ route: "", report_type: "safety_issue", location: "", description: "", attachment: "" });
    setPreview(null);
    fetchAllReports();
    fetchMyReports();
  };

  const handleVote = async (reportId, voteValue) => {
    const res  = await fetch(API + "/safety/" + reportId + "/vote/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passenger: user.id, vote: voteValue })
    });
    const data = await res.json();
    if (res.ok) {
      setVotes(prev => ({ ...prev, [reportId]: data.vote }));
      setAllReports(prev => prev.map(r =>
        r.id === reportId
          ? { ...r, agree_count: data.agree_count, disagree_count: data.disagree_count }
          : r
      ));
    }
  };

  const handleComment = async (reportId) => {
    const text = (commentTexts[reportId] || "").trim();
    if (!text) return;
    const res = await fetch(API + "/safety/" + reportId + "/comment/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passenger: user.id, text })
    });
    if (res.ok) {
      setCommentTexts(prev => ({ ...prev, [reportId]: "" }));
      fetchAllReports();
    }
  };

  const toggleComments = (reportId) => {
    setOpenComments(prev => ({ ...prev, [reportId]: !prev[reportId] }));
  };

  const typeColors   = { safety_issue: "bg-orange-900 text-orange-300", unsafe_location: "bg-red-900 text-red-300" };
  const typeLabels   = { safety_issue: "Safety Issue", unsafe_location: "Unsafe Location" };
  const statusColors = { pending: "bg-slate-700 text-slate-300", reviewed: "bg-blue-900 text-blue-300", resolved: "bg-emerald-900 text-emerald-300" };

  const ReportCard = ({ r, showVote = true }) => (
    <div className="bg-slate-900 rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 flex-wrap">
          <span className={"text-xs px-2 py-1 rounded-lg font-bold " + (typeColors[r.report_type] || "")}>{typeLabels[r.report_type]}</span>
          <span className={"text-xs px-2 py-1 rounded-lg font-bold capitalize " + (statusColors[r.status] || "")}>{r.status}</span>
        </div>
        <div className="text-xs text-slate-600">{formatDate(r.created_at)}</div>
      </div>
      <div className="text-sm font-bold text-slate-200">{r.route_detail?.name}</div>
      <div className="text-xs text-slate-400 mt-1">📍 {r.location}</div>
      <div className="text-xs text-slate-500 mt-1 italic">{r.description}</div>
      {!showVote && <div className="text-xs text-slate-600 mt-1">Reported by: {r.passenger_name}</div>}

      {/* Attachment */}
      {r.attachment && (
        <div className="mt-3">
          <img src={r.attachment} alt="attachment" className="rounded-xl max-h-48 w-full object-cover border border-slate-700" />
        </div>
      )}

      {showVote && (
        <>
          <div className="flex gap-3 mt-3">
            <button onClick={() => handleVote(r.id, "agree")}
              className={"flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors " +
                (votes[r.id] === "agree" ? "bg-emerald-600 text-white" : "bg-slate-700 hover:bg-emerald-900 text-slate-300 hover:text-emerald-300")}>
              👍 Agree ({r.agree_count})
            </button>
            <button onClick={() => handleVote(r.id, "disagree")}
              className={"flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-colors " +
                (votes[r.id] === "disagree" ? "bg-red-600 text-white" : "bg-slate-700 hover:bg-red-900 text-slate-300 hover:text-red-300")}>
              👎 Disagree ({r.disagree_count})
            </button>
            <button onClick={() => toggleComments(r.id)}
              className="ml-auto flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors">
              💬 {r.comments?.length || 0}{openComments[r.id] ? " ▲" : " ▼"}
            </button>
          </div>
          {votes[r.id] && (
            <p className="text-xs text-slate-600 mt-1">
              You {votes[r.id]}d this — click the other button to change your vote
            </p>
          )}
          {openComments[r.id] && (
            <div className="mt-3 border-t border-slate-700 pt-3">
              {r.comments && r.comments.length > 0 ? (
                <div className="mb-3 flex flex-col gap-2">
                  {r.comments.map(c => (
                    <div key={c.id} className="bg-slate-800 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs font-bold text-violet-400">{c.passenger_name}</div>
                        <div className="text-xs text-slate-600">{formatDate(c.created_at)}</div>
                      </div>
                      <div className="text-xs text-slate-300">{c.text}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 mb-3">No comments yet. Be the first!</p>
              )}
              <div className="flex gap-2">
                <input type="text"
                  value={commentTexts[r.id] || ""}
                  onChange={e => setCommentTexts(prev => ({ ...prev, [r.id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && handleComment(r.id)}
                  placeholder="Write a comment..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500" />
                <button onClick={() => handleComment(r.id)}
                  className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors">
                  Post
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {!showVote && (
        <div className="flex gap-3 mt-3 text-xs text-slate-500">
          <span>👍 {r.agree_count} agreed</span>
          <span>👎 {r.disagree_count} disagreed</span>
          <span>💬 {r.comments?.length || 0} comments</span>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white">Safety Reports</h1>
        <p className="text-slate-400 text-sm mt-1">Report safety issues, mark unsafe locations and engage with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit form */}
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
            <textarea value={form.description} onChange={set("description")} rows={3}
              placeholder="Describe the safety issue or unsafe condition in detail..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 resize-none" />
          </div>

          {/* Image attachment */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">ATTACHMENT <span className="text-slate-600 font-normal">(optional — image only, max 5MB)</span></label>
            {!preview ? (
              <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-violet-500 transition-colors">
                <div className="text-2xl mb-1">📷</div>
                <div className="text-xs text-slate-500">Click to upload image</div>
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            ) : (
              <div className="relative">
                <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-slate-700" />
                <button onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-bold">
                  Remove
                </button>
              </div>
            )}
          </div>

          <button onClick={submit}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-3 rounded-xl transition-colors">
            Submit Report
          </button>
        </div>

        {/* Right — tabs */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <button onClick={() => setTab("community")}
              className={"flex-1 py-2 rounded-xl text-sm font-bold transition-colors " +
                (tab === "community" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
              🌍 Community ({allReports.length})
            </button>
            <button onClick={() => setTab("mine")}
              className={"flex-1 py-2 rounded-xl text-sm font-bold transition-colors " +
                (tab === "mine" ? "bg-violet-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white")}>
              📋 My Reports ({myReports.length})
            </button>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4" style={{ maxHeight: "600px", overflowY: "auto" }}>
            {tab === "community" && (
              allReports.length === 0
                ? <p className="text-slate-500 text-sm">No safety reports yet.</p>
                : allReports.map(r => <ReportCard key={r.id} r={r} showVote={true} />)
            )}
            {tab === "mine" && (
              myReports.length === 0
                ? <p className="text-slate-500 text-sm">No safety reports yet.</p>
                : myReports.map(r => <ReportCard key={r.id} r={r} showVote={false} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
