"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Sync state with the actual URL path
  const [isLogin, setIsLogin] = useState(pathname.includes("login"));

  useEffect(() => {
    setIsLogin(pathname.includes("login"));
  }, [pathname]);

  const handleToggle = (toLogin: boolean) => {
    setIsLogin(toLogin);
    router.push(toLogin ? "/auth/login" : "/auth/signup");
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-4 md:p-8">
      {/* BOUTIQUE TOGGLE SWITCH */}
      <nav className="mb-12">
        <div className="relative flex w-72 bg-[#f0eee9] rounded-full p-1.5 border border-[#e5e2db]">
          {/* Slider */}
          <div
            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#0D2C24] rounded-full shadow-lg transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          />

          {/* Login Button */}
          <button
            onClick={() => handleToggle(true)}
            className={`relative z-10 w-1/2 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
              isLogin
                ? "text-[#FDFCFB]"
                : "text-[#0D2C24]/50 hover:text-[#0D2C24]"
            }`}
          >
            Identify
          </button>

          {/* Register Button */}
          <button
            onClick={() => handleToggle(false)}
            className={`relative z-10 w-1/2 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-500 ${
              !isLogin
                ? "text-[#FDFCFB]"
                : "text-[#0D2C24]/50 hover:text-[#0D2C24]"
            }`}
          >
            Enroll
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER: Now it matches the Register/Login pages' width and aesthetic */}
      <main className="w-full max-w-7xl overflow-hidden border border-gray-100 shadow-2xl shadow-black/5 rounded-[2.5rem]">
        {children}
      </main>

      <div className="mt-12 text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold">
        Fierra Studios &copy; 2026
      </div>
    </div>
  );
};

export default AuthLayout;
