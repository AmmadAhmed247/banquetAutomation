import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfdfd] flex items-center justify-center px-4 relative font-sans overflow-hidden">
      {/* Decorative premium background gradient */}
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-gradient-to-bl from-emerald-50/40 via-emerald-50/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-slate-50/50 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-block">
            <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-400 mb-4">
              404
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-3">
            Page Not Found
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-2">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-slate-400 text-sm">
            Check the URL and try again, or use the buttons below to navigate.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all duration-300 ease-in-out hover:scale-105"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 ease-in-out hover:scale-105 shadow-lg shadow-emerald-200"
          >
            <Home size={20} />
            Home Page
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-white border border-slate-100 rounded-2xl">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
            Need Help?
          </p>
          <p className="text-slate-600 text-sm">
            If you keep seeing this page, contact support or try navigating from the home page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
