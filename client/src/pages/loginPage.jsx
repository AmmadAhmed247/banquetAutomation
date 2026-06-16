import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LogIn, Lock, Mail, AlertCircle } from "lucide-react"; // Modern icon replacements
import axios from "axios";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  
  const { mutate: login, isPending, error } = useMutation({
    mutationFn: (form) =>
      axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        form,
        { withCredentials: true }
      ),
    onSuccess: () => navigate("/dashboard"),
  });

  const submit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center px-4 relative font-sans overflow-hidden">
      {/* Decorative premium background gradient to match dashboard */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-emerald-50/40 via-emerald-50/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-slate-50/50 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100 mb-4 transition-transform hover:scale-105 duration-300">
            <span className="font-mono font-black text-2xl tracking-tighter">D</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium max-w-xs">
            Enter your studio credentials to access dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-emerald-50/60 rounded-[32px] p-10 shadow-sm shadow-emerald-100/20">
          
          {/* Enhanced Error Block */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-red-50/60 border border-red-100 rounded-2xl text-sm text-red-600 animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="font-medium">
                {error.response?.data?.message || "Invalid credentials. Please try again."}
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email Input Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={18} strokeWidth={2} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={change}
                  placeholder="name@studio.com"
                  required
                  className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-300 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Input Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} strokeWidth={2} />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={change}
                  placeholder="••••••••"
                  required
                  className="w-full pl-12 pr-4 py-3.5 text-sm bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 placeholder-slate-300 transition-all font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-100 hover:shadow-xl hover:shadow-emerald-200 mt-4 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign </span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;