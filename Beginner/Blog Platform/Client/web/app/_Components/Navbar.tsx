"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Search, User, Zap } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] z-50">
      <div
        className="
        bg-background/70 
        dark:bg-surface/70
        backdrop-blur-xl
        border border-black/5 dark:border-white/10
        px-6 py-3 rounded-2xl
        flex items-center justify-between
        shadow-lg dark:shadow-none
        transition-all duration-500
      "
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-studio-green rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-12 shadow-md">
            <Zap
              size={16}
              className="text-white dark:text-black"
              strokeWidth={3}
            />
          </div>
          <span className="font-serif italic font-bold text-lg hidden sm:block text-foreground">
            Studio.
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <Link
            href="/blogs/search"
            className="text-foreground/60 hover:text-studio-accent transition-colors"
          >
            <Search size={18} strokeWidth={2.5} />
          </Link>

          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10" />

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-foreground/60 hover:text-studio-accent transition-all active:scale-90"
          >
            {!mounted ? (
              <div className="w-[18px] h-[18px]" />
            ) : theme === "dark" ? (
              <Sun size={18} strokeWidth={2.5} />
            ) : (
              <Moon size={18} strokeWidth={2.5} />
            )}
          </button>

          {/* Profile */}
          <Link
            href="/user/profile"
            className="
            group w-8 h-8 rounded-full 
            bg-black/5 dark:bg-white/5
            flex items-center justify-center
            border border-black/10 dark:border-white/10
            hover:border-studio-accent
            transition-all
          "
          >
            <User
              size={16}
              className="text-foreground/60 group-hover:text-studio-accent transition-colors"
            />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
