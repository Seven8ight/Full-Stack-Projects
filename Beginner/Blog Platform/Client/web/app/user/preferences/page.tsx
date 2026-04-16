"use client";
import React, { useState } from "react";
import Link from "next/link";

const TOPICS = [
  { id: "design", label: "Design Systems", icon: "🎨" },
  { id: "dev", label: "Software Engineering", icon: "💻" },
  { id: "minimalism", label: "Minimalism", icon: "⚪" },
  { id: "philosophy", label: "Modern Philosophy", icon: "📜" },
  { id: "business", label: "Creative Business", icon: "📈" },
  { id: "ai", label: "Artificial Intelligence", icon: "🤖" },
  { id: "arch", label: "Architecture", icon: "🏛️" },
  { id: "writing", label: "The Craft of Writing", icon: "✍️" },
  { id: "growth", label: "Personal Growth", icon: "🌱" },
];

const Preferences = (): React.ReactNode => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTopic = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col items-center py-20 px-6">
      {/* HEADER */}
      <div className="max-w-2xl w-full text-center mb-16">
        <span className="text-orange-600 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
          Step 02 / Curation
        </span>
        <h2 className="text-5xl md:text-6xl font-serif italic text-[#0D2C24] mb-6">
          Tailor your{" "}
          <span className="not-italic font-sans font-black uppercase tracking-tighter text-[#1A1A1A]">
            Feed.
          </span>
        </h2>
        <p className="text-gray-500 font-light text-lg">
          Select at least three topics to help us calibrate your studio
          experience. Quality over quantity.
        </p>
      </div>

      {/* TOPIC GRID */}
      <div className="max-w-4xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`group relative p-8 rounded-2xl border-2 transition-all duration-500 text-left overflow-hidden ${
                isSelected
                  ? "border-[#0D2C24] bg-[#0D2C24] text-[#FDFCFB]"
                  : "border-gray-100 bg-white hover:border-orange-200"
              }`}
            >
              {/* Subtle background icon for selected state */}
              <span
                className={`absolute -right-2 -bottom-2 text-6xl opacity-10 transition-transform duration-700 ${isSelected ? "scale-110" : "scale-0"}`}
              >
                {topic.icon}
              </span>

              <div className="relative z-10">
                <span
                  className={`text-2xl mb-4 block group-hover:scale-110 transition-transform ${isSelected ? "opacity-100" : "opacity-50"}`}
                >
                  {topic.icon}
                </span>
                <h3 className="font-bold uppercase tracking-widest text-[11px]">
                  {topic.label}
                </h3>
              </div>

              {/* Checkmark indicator */}
              <div
                className={`absolute top-4 right-4 w-2 h-2 rounded-full transition-colors ${isSelected ? "bg-orange-400" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>

      {/* FOOTER ACTION */}
      <div className="mt-20 flex flex-col items-center">
        <button
          disabled={selected.length < 3}
          className={`px-12 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs transition-all duration-500 shadow-xl ${
            selected.length >= 3
              ? "bg-[#1A1A1A] text-white hover:bg-orange-600 shadow-black/10 hover:-translate-y-1"
              : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
          }`}
        >
          Finalize Setup
        </button>

        <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          {selected.length} / 3 Minimum Selected
        </p>

        <Link
          href="/dashboard"
          className="mt-8 text-gray-400 text-[10px] uppercase tracking-widest hover:text-[#1A1A1A] transition-colors border-b border-gray-200 pb-1"
        >
          Skip for now
        </Link>
      </div>
    </main>
  );
};

export default Preferences;
