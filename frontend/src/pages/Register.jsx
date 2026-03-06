import { useState } from "react";
import { AuthAPI } from "../api";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({ fullName: "", phone: "", gender: "", password: "", confirm: "" });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(null);

    if (!form.fullName) { setMsg({ type: "error", text: "Full name is required." }); return; }
    if (!/^01\d{9}$/.test(form.phone.replace(/\s+/g, ""))) { setMsg({ type: "error", text: "Phone must be 11 digits starting with 01." }); return; }
    if (!form.gender) { setMsg({ type: "error", text: "Please select a gender." }); return; }
    if (form.password.length < 6) { setMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    if (form.password !== form.confirm) { setMsg({ type: "error", text: "Passwords do not match." }); return; }

    setLoading(true);
    const res = await AuthAPI.register(form.fullName, form.phone.replace(/\s+/g, ""), form.password, form.gender);
    setLoading(false);

    if (res.error) { setMsg({ type: "error", text: res.error }); return; }
    setMsg({ type: "success", text: "Account created! Redirecting to login..." });
    setTimeout(() => onRegister(), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚌</div>
          <h1 className="text-3xl font-black text-white">Transit Trust</h1>
          <p className="text-slate-400 text-sm mt-1">Create your passenger account</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-slate-900 rounded-xl p-1">
          <a href="/" className="flex-1 text-center py-2 rounded-lg text-slate-400 text-sm font-semibold hover:text-white transition-colors">Sign In</a>
          <span className="flex-1 text-center py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold">Register</span>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${msg.type === "error" ? "bg-red-900/50 text-red-300" : "bg-emerald-900/50 text-emerald-300"}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">FULL NAME</label>
            <input type="text" value={form.fullName} onChange={set("fullName")} placeholder="Your full name"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">PHONE NUMBER</label>
            <input type="tel" value={form.phone} onChange={set("phone")} placeholder="01711XXXXXX"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
            <p className="text-xs text-slate-600 mt-1">11 digits starting with 01</p>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">GENDER</label>
            <select value={form.gender} onChange={set("gender")}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors">
              <option value="">-- Select gender --</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other / Prefer not to say</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-400 mb-2">PASSWORD</label>
            <input type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 mb-2">CONFIRM PASSWORD</label>
            <input type="password" value={form.confirm} onChange={set("confirm")} placeholder="Re-enter your password"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? "Creating account..." : "Create Account →"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-6">
          Already have an account?{" "}
          <a href="/" className="text-violet-400 hover:text-violet-300 font-semibold">Sign in here</a>
        </p>
      </div>
    </div>
  );
}