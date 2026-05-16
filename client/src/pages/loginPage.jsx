import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
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
    onSuccess: () => navigate("/"),
  });
  const submit = (e) => {
    e.preventDefault();
    login(form);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-base">B</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-400 mb-6">
            Enter your credentials to access the dashboard
          </p>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error.response?.data?.message || "Something went wrong"}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={change}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-300 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={change}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-300 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors mt-2"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;