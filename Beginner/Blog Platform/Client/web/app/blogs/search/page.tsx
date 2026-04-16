"use client";
import { useState } from "react";
import Navbar from "../../_Components/Navbar";
import { Filter, Search as SearchIcon, X, ArrowUpRight } from "lucide-react";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const categories = [
    "All",
    "Architecture",
    "Minimalism",
    "Code",
    "Lifestyle",
    "Design",
  ];

  // Mock data - eventually replaced by your backend fetch
  const results = [
    {
      id: 1,
      title: "The Spatiality of React Components",
      date: "March 12, 2026",
      cat: "Code",
    },
    {
      id: 2,
      title: "Curating a Minimalist Workspace",
      date: "Feb 28, 2026",
      cat: "Lifestyle",
    },
    {
      id: 3,
      title: "Grid Systems in 20th Century Print",
      date: "Jan 15, 2026",
      cat: "Design",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-24">
      <Navbar />

      <section className="pt-48 px-6 max-w-7xl mx-auto">
        {/* 1. THE ARCHITECTURAL SEARCH BAR */}
        <div className="relative group border-b-2 border-studio-green dark:border-white/10 pb-6 transition-all focus-within:border-studio-accent">
          <SearchIcon
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/10 group-focus-within:text-studio-accent transition-colors"
            size={40}
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Search the archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 bg-transparent text-4xl md:text-7xl font-serif italic outline-none placeholder:text-gray-100 dark:placeholder:text-white/5 lowercase"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              <X size={24} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* 2. ADVANCED FILTER SYSTEM */}
        <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 mr-4 text-gray-400">
              <Filter size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                Sort by Category:
              </span>
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  activeFilter === cat
                    ? "bg-studio-green text-background shadow-xl shadow-studio-green/10"
                    : "border border-gray-200 dark:border-white/5 hover:border-studio-accent text-gray-500 hover:text-studio-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
            {results.length} results found
          </p>
        </div>

        {/* 3. SEARCH RESULTS LIST (Minimalist Table Style) */}
        <div className="mt-24 space-y-0">
          {results.map((item) => (
            <div
              key={item.id}
              className="group relative border-b border-gray-100 dark:border-white/5 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer hover:px-4 transition-all duration-500"
            >
              {/* Hover Background Accent */}
              <div className="absolute inset-0 bg-studio-accent/0 group-hover:bg-studio-accent/2 -z-10 transition-all rounded-3xl" />

              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-studio-accent font-black uppercase tracking-widest text-[9px] px-2 py-0.5 border border-studio-accent/20 rounded">
                    {item.cat}
                  </span>
                  <span className="text-gray-400 font-mono text-[10px] uppercase tracking-tighter">
                    {item.date}
                  </span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif italic text-studio-green dark:text-gray-100 group-hover:translate-x-2 transition-transform duration-500">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-8">
                <div className="hidden md:block w-32 h-px bg-gray-100 dark:bg-white/5 group-hover:w-48 transition-all duration-700 group-hover:bg-studio-accent" />
                <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center group-hover:bg-studio-green group-hover:text-background transition-all">
                  <ArrowUpRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {results.length === 0 && (
          <div className="py-40 text-center">
            <p className="font-serif italic text-2xl text-gray-300">
              Nothing found in the archives for your search.
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchPage;
