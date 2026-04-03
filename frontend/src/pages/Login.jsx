import { useState } from "react";
import { AuthAPI } from "../api";

export default function Login({ onLogin }) {
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    const res = await AuthAPI.login(phone, password);
    setLoading(false);
    if (res.error) { setMsg({ type: "error", text: res.error }); return; }
    onLogin(res.user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚌</div>
          <h1 className="text-3xl font-black text-white">Transit Trust</h1>
          <p className="text-slate-400 text-sm mt-1">Public Transport Fare, Safety & Rating System</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-slate-900 rounded-xl p-1">
          <span className="flex-1 text-center py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">
            Sign In
          </span>
          <a href="/register"
            className="flex-1 text-center py-2 rounded-lg text-slate-400 text-sm font-semibold hover:text-white transition-colors">
            Register
          </a>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>
            {msg.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">PHONE NUMBER</label>
            <input
              type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="01711XXXXXX"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 mb-2">PASSWORD</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Don't have an account?{" "}
          <a href="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
