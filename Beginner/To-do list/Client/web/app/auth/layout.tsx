"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils"; // Standard utility for conditional classes

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const router = useRouter();
  const pathname = usePathname();

  // Helper to determine if a tab is active
  const isSignup = pathname === "/auth/signup";
  const isLogin = pathname === "/auth/login";

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex items-center justify-center relative top-30 z-50">
        <div className="inline-flex h-10 items-center justify-center rounded-lg bg-zinc-200/50 p-1 text-zinc-500 dark:bg-zinc-800/50">
          <Button
            onClick={() => router.push("/auth/signup")}
            variant="ghost"
            className={cn(
              "h-8 px-6 text-sm font-medium transition-all",
              isSignup
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800",
            )}
          >
            Sign up
          </Button>
          <Button
            onClick={() => router.push("/auth/login")}
            variant="ghost"
            className={cn(
              "h-8 px-6 text-sm font-medium transition-all",
              isLogin
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-900 dark:text-zinc-50"
                : "hover:bg-zinc-200/50 dark:hover:bg-zinc-800",
            )}
          >
            Log In
          </Button>
        </div>
      </div>

      <main className="w-full animate-in fade-in zoom-in-95 duration-300">
        {children}
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
};

export default RootLayout;
