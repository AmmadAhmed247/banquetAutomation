import React from 'react';
export const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-[24px] border border-[#f0fdf4] shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ children, onClick, className = "", variant = "primary" }) => {
  const variants = {
    primary: "bg-[#10b981] text-white",
    secondary: "bg-[#d1fae5] text-[#059669]",
    danger: "bg-[#fee2e2] text-[#dc2626]"
  };
  return (
    <button 
      onClick={onClick} 
      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-opacity hover:opacity-80 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Input = ({ value, onChange, placeholder }) => (
  <input
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 transition-all"
  />
);