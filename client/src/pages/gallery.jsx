import { useState } from "react";

const banquets = {
  A: {
    name: "The Emerald Hall",
    tag: "Hall A",
    desc: "Elegant seating · Grand chandeliers · 500 guests capacity",
    hero: {
      src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900",
      label: "Main Hall",
      full: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
      caption: "Emerald Hall — Main View",
    },
    grid3: [
      { src: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=500", full: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900", label: "Dining", caption: "Emerald Hall — Dining Setup" },
      { src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500", full: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=900", label: "Floral Decor", caption: "Emerald Hall — Floral Decor" },
      { src: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=500", full: "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=900", label: "Stage Area", caption: "Emerald Hall — Stage Area" },
    ],
    grid2: [
      { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", full: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900", label: "Lounge", caption: "Emerald Hall — Lounge" },
      { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600", full: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900", label: "Gala Night", caption: "Emerald Hall — Gala Night" },
    ],
  },
  B: {
    name: "The Garden Pavilion",
    tag: "Hall B",
    desc: "Open-air elegance · Garden views · 300 guests capacity",
    hero: {
      src: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=900",
      label: "Pavilion Overview",
      full: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200",
      caption: "Garden Pavilion — Aerial View",
    },
    grid3: [
      { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500", full: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900", label: "Table Setting", caption: "Garden Pavilion — Table Setting" },
      { src: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500", full: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=900", label: "Evening Lights", caption: "Garden Pavilion — Evening Lights" },
      { src: "https://images.unsplash.com/photo-1500210600724-a96c72b2e93b?w=500", full: "https://images.unsplash.com/photo-1500210600724-a96c72b2e93b?w=900", label: "Garden View", caption: "Garden Pavilion — Garden View" },
    ],
    grid2: [
      { src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600", full: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=900", label: "Dance Floor", caption: "Garden Pavilion — Dance Floor" },
      { src: "https://images.unsplash.com/photo-1484591974057-265bb767ef71?w=600", full: "https://images.unsplash.com/photo-1484591974057-265bb767ef71?w=900", label: "Sunset Event", caption: "Garden Pavilion — Sunset Event" },
    ],
  },
};

function GalleryCard({ src, label, full, caption, tall = false, onClick }) {
  return (
    <div
      onClick={() => onClick(full, caption)}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl hover:shadow-green-200 hover:-translate-y-1 hover:scale-[1.015] transition-all duration-300 ${tall ? "h-80" : "h-44"}`}
    >
      <img src={src} alt={label} className="w-full h-full object-cover" />
      <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-green-800 text-xs font-medium px-3 py-1 rounded-lg tracking-wide">
        {label}
      </span>
    </div>
  );
}

function Lightbox({ image, caption, onClose }) {
  if (!image) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 bg-green-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
      <button onClick={onClose} className="fixed top-4 right-5 bg-white text-green-800 rounded-full w-10 h-10 text-lg font-bold flex items-center justify-center shadow-lg cursor-pointer hover:bg-green-50 transition-colors border-none">
        ✕
      </button>
      <img src={image} alt={caption} onClick={(e) => e.stopPropagation()} className="max-w-[90vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain" />
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-white/90 text-green-800 rounded-full px-6 py-2 text-sm font-medium tracking-wide whitespace-nowrap">
        {caption}
      </div>
    </div>
  );
}

export default function BanquetGallery() {
  const [activeTab, setActiveTab] = useState("A");
  const [lightbox, setLightbox] = useState({ image: null, caption: "" });
  const data = banquets[activeTab];

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1 rounded-full tracking-widest uppercase mb-1">
              Gallery
            </span>
            <h1 className="text-3xl font-bold text-green-900 leading-tight">Banquet Gallery</h1>
          </div>

          {/* Tab Toggle */}
          <div className="bg-green-100 rounded-full p-1.5 flex gap-1">
            {["A", "B"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-7 py-2 rounded-full text-sm tracking-wide transition-all duration-300 cursor-pointer border-none font-medium ${
                  activeTab === tab
                    ? "bg-white text-green-800 shadow-md font-semibold"
                    : "bg-transparent text-green-500 hover:text-green-700"
                }`}
              >
                Banquet {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-5 py-10 pb-20">
        <section key={activeTab}>
          {/* Section Header */}
          <div className="border-l-4 border-green-400 pl-4 mb-8">
            <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-4 py-1 rounded-full tracking-widest uppercase mb-2">
              {data.tag}
            </span>
            <h2 className="text-4xl font-bold text-green-900 mb-1">{data.name}</h2>
            <p className="text-green-600 text-sm">{data.desc}</p>
          </div>

          {/* Hero */}
          <div className="mb-3">
            <GalleryCard {...data.hero} tall onClick={(s, c) => setLightbox({ image: s, caption: c })} />
          </div>

          {/* 3-col grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            {data.grid3.map((item) => (
              <GalleryCard key={item.label} {...item} onClick={(s, c) => setLightbox({ image: s, caption: c })} />
            ))}
          </div>

          {/* 2-col grid */}
          <div className="grid grid-cols-2 gap-3">
            {data.grid2.map((item) => (
              <div key={item.label} className="h-52">
                <GalleryCard {...item} onClick={(s, c) => setLightbox({ image: s, caption: c })} />
              </div>
            ))}
          </div>
        </section>
      </main>

      <Lightbox {...lightbox} onClose={() => setLightbox({ image: null, caption: "" })} />
    </div>
  );
}