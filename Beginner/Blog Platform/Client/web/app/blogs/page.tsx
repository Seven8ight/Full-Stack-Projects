"use client";
import Navbar from "../_Components/Navbar";
import Link from "next/link";
import { MoveRight } from "lucide-react"; // Imported standard icon

const Recommendations = () => {
  const blogs = [
    {
      id: 1,
      title: "The Brutalist Shift in Modern Web",
      category: "Design",
      author: "Julian Fierra",
      readTime: "5 min",
    },
    {
      id: 2,
      title: "Why Minimalist Code Scales Better",
      category: "Dev",
      author: "Alex Chen",
      readTime: "8 min",
    },
    {
      id: 3,
      title: "Lighting the Void: Shadows in UI",
      category: "Art",
      author: "Sarah Drasner",
      readTime: "4 min",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 pb-20 selection:bg-studio-accent selection:text-white">
      <Navbar />

      {/* HERO SECTION - Refined for "Atmospheric Depth" */}
      <section className="pt-40 px-6 max-w-7xl mx-auto">
        {/*
          1. The Main Container: 
          Added overflow-hidden here. This is crucial—it acts as a mask for the hover gradient,
          making sure it follows the curves of the rounded-[3rem].
        */}
        <div className="relative group overflow-hidden rounded-[3rem] bg-studio-green dark:bg-white/5 p-12 md:p-24 min-h-125 flex flex-col justify-end border border-transparent dark:border-white/10 transition-shadow hover:shadow-2xl hover:shadow-orange-500/10 duration-500">
          {/* 2. The Fixed Hover Gradient:
            We removed the static rectangle and made this an atmospheric bloom.
            - It’s now positioned using inset-0 (covering the whole card but masked by overflow-hidden).
            - The background is a radial gradient that starts subtle.
            - On hover (group-hover), it expands (scale-125) and increases opacity.
          */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#fb923c20,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top_right,#fb923c10,transparent_70%)] opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-1000 ease-in-out" />

          {/* CONTENT (Needs relative z-10 to stay on top) */}
          <div className="relative z-10 max-w-2xl">
            <span className="text-orange-400 dark:text-orange-300 font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">
              Editor's Choice
            </span>
            <h1 className="text-5xl md:text-7xl font-serif italic text-white dark:text-gray-100 leading-tight mb-8">
              The Art of <br /> Invisible Architecture.
            </h1>

            <Link
              href="/blog/featured"
              className="inline-flex items-center gap-4 text-white group/btn"
            >
              <span className="font-black uppercase tracking-widest text-xs border-b border-white/40 group-hover/btn:border-white pb-1 transition-all">
                Read the entry
              </span>
              {/* Better Icon for a Studio Vibe */}
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-studio-black transition-all">
                <MoveRight size={20} className="stroke-[1.5]" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CURATED GRID (Unchanged, Contrast Fixes Already Applied) */}
      <section className="mt-32 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-4xl font-serif italic dark:text-white">
              Recommended Reading
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-mono text-[10px] uppercase tracking-widest mt-3">
              Curated for your studio taste
            </p>
          </div>
          <Link
            href="/blogs/search"
            className="text-studio-accent font-black uppercase tracking-widest text-[10px] border-b border-studio-accent/30 hover:border-studio-accent pb-1 transition-all"
          >
            View All Stories
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {blogs.map((blog) => (
            <div key={blog.id} className="group cursor-pointer">
              <div className="aspect-4/5 bg-gray-100 dark:bg-[#121413] rounded-[2.5rem] mb-8 overflow-hidden relative border border-transparent dark:border-white/5 shadow-sm group-hover:shadow-xl group-hover:shadow-orange-500/5 transition-all duration-500">
                <div className="absolute inset-0 bg-linear-to-t from-studio-green/10 dark:from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/5 text-9xl font-serif italic select-none">
                  {blog.title.charAt(0)}
                </div>
              </div>

              <div className="space-y-3 px-2">
                <span className="text-orange-600 dark:text-orange-400 font-black uppercase tracking-widest text-[9px] bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded">
                  {blog.category}
                </span>
                <h3 className="text-2xl font-serif italic leading-snug dark:text-gray-100 group-hover:text-studio-accent transition-colors">
                  {blog.title}
                </h3>
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-6 h-6 rounded-full bg-studio-green dark:bg-white/10" />
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-medium italic">
                    by {blog.author} — {blog.readTime}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Recommendations;
