"use client";
import React, { useState } from "react";
import Navbar from "@/app/_Components/Navbar";
import {
  Heart,
  MessageSquare,
  Share2,
  ThumbsDown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const BlogDetail = () => {
  const [likes, setLikes] = useState(124);
  const [hasLiked, setHasLiked] = useState(false);

  const relatedBlogs = [
    { id: 1, title: "The Brutalist Shift in Modern Web", cat: "Design" },
    { id: 2, title: "Why Minimalist Code Scales Better", cat: "Dev" },
    { id: 3, title: "Lighting the Void: Shadows in UI", cat: "Art" },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500 relative top-20">
      <Navbar />

      {/* HERO */}
      <header className="pt-20 pb-16 px-6 max-w-4xl mx-auto text-center">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 text-studio-accent font-black uppercase tracking-widest text-[10px] mb-8 hover:-translate-x-2 transition-transform"
        >
          <ArrowLeft size={14} /> Back to Archives
        </Link>

        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest">
            March 24, 2026
          </span>
          <div className="h-1 w-1 rounded-full bg-studio-accent" />
          <span className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest">
            12 Min Read
          </span>
        </div>

        {/* KEEP YOUR ORIGINAL TYPOGRAPHY */}
        <h1 className="text-5xl md:text-7xl font-serif italic text-studio-green leading-tight mb-8">
          The Spatiality of <br /> Digital Frameworks
        </h1>

        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/10" />
          <p className="text-sm italic font-medium">by Julian Fierra</p>
        </div>
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <article className="max-w-3xl mx-auto px-6">
        <div className="aspect-video bg-gray-100 dark:bg-white/5 rounded-[2.5rem] mb-16 overflow-hidden border border-gray-100 dark:border-white/5">
          {/* Main Blog Image Placeholder */}
          <div className="w-full h-full flex items-center justify-center text-gray-200 dark:text-white/5 text-8xl font-serif italic italic">
            Art.
          </div>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none font-light leading-relaxed text-gray-600 dark:text-gray-300 space-y-8">
          <p className="text-xl font-medium text-studio-green dark:text-white first-letter:text-7xl first-letter:font-serif first-letter:italic first-letter:mr-3 first-letter:float-left">
            In the realm of modern development, we often treat code as a linear
            sequence of logic. However, as our systems grow in complexity, we
            must begin to view our architecture through the lens of physical
            space.
          </p>
          <p>
            Digital interfaces are not merely flat surfaces; they are
            environments. Every transition, every shadow, and every layer of
            z-index contributes to the user's spatial understanding of the
            application. When we build with a "Studio" mindset, we prioritize
            the void—the white space—as much as the elements themselves.
          </p>
          <h2 className="text-3xl font-serif italic text-studio-green dark:text-white mt-12">
            The Minimalist Foundation
          </h2>
          <p>
            Minimalism is not about lack of content; it is about the
            intentionality of every pixel. By reducing the noise, we allow the
            core message of the architecture to speak. This is where the
            intersection of code and physical space becomes most apparent.
          </p>
        </div>

        {/* 3. INTERACTION BAR */}
        <div className="mt-20 py-8 border-y border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setHasLiked(!hasLiked);
                setLikes(hasLiked ? likes - 1 : likes + 1);
              }}
              className={`flex items-center gap-2 transition-all ${hasLiked ? "text-red-500 scale-110" : "text-gray-400 hover:text-studio-accent"}`}
            >
              <Heart size={20} fill={hasLiked ? "currentColor" : "none"} />
              <span className="text-xs font-black">{likes}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-studio-accent transition-colors">
              <ThumbsDown size={20} />
            </button>
            <div className="h-4 w-[1px] bg-gray-100 dark:bg-white/10" />
            <div className="flex items-center gap-2 text-gray-400">
              <MessageSquare size={20} />
              <span className="text-xs font-black">24</span>
            </div>
          </div>
          <button className="p-3 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 hover:text-studio-accent transition-all">
            <Share2 size={20} />
          </button>
        </div>
        {/* COMMENTS */}
        <section className="mt-20">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 mb-8">
            Discussion
          </h4>

          <div className="space-y-8">
            <div className="flex gap-4 p-6 bg-surface rounded-3xl border border-black/5 dark:border-white/10">
              <div className="w-10 h-10 rounded-full bg-studio-green flex-shrink-0" />
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-black uppercase tracking-widest">
                    Sarah Drasner
                  </span>
                  <span className="text-[10px] text-foreground/60 font-mono">
                    2h ago
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  This perspective on spatiality...
                </p>
              </div>
            </div>

            <div className="relative">
              <textarea
                placeholder="Join the conversation..."
                className="w-full bg-transparent border border-black/10 dark:border-white/10 rounded-3xl p-6 text-sm outline-none focus:border-studio-accent transition-colors resize-none"
                rows={3}
              />
              <button className="absolute bottom-4 right-4 bg-studio-green text-background px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-studio-accent transition-all">
                Post
              </button>
            </div>
          </div>
        </section>
      </article>

      {/* RELATED */}
      <section className="mt-40 bg-surface py-24 px-6 border-t border-black/5 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-serif italic">Keep Reading</h2>
              <p className="text-foreground/60 font-mono text-[10px] uppercase tracking-widest mt-2">
                More from the archives
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((blog) => (
              <Link href={`/blog/${blog.id}`} key={blog.id} className="group">
                <div className="aspect-video bg-background rounded-3xl mb-6 overflow-hidden border border-black/5 dark:border-white/10 transition-transform group-hover:-translate-y-2">
                  <div className="w-full h-full flex items-center justify-center text-foreground/10 text-5xl font-serif italic">
                    {blog.title.charAt(0)}
                  </div>
                </div>

                <span className="text-studio-accent font-black uppercase tracking-widest text-[9px]">
                  {blog.cat}
                </span>

                <h3 className="text-xl font-serif italic mt-2 group-hover:text-studio-accent transition-colors">
                  {blog.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BlogDetail;
