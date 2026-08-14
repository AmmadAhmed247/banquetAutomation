import React from 'react';

export default function StudioHeader() {
  // Format today's date into the Islamic (Hijri) calendar
  const islamicDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex items-center gap-4 mb-10">

      
      {/* Islamic Date Badge */}
      <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
        {islamicDate}
      </span>

      <div className="h-[1px] flex-1 bg-slate-200"></div>
    </div>
  );
}