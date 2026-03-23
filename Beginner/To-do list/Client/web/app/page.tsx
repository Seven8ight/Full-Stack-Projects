"use client";

import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Zap,
  BarChart3,
  ChevronRight,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PlaceHolderImage from "../public/Page-look.png";
import { useRouter } from "next/navigation";

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 overflow-hidden">
      {/* --- Navigation --- */}
      <nav className="fixed top-0 w-full z-50 border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg">
              <CheckCircle2
                size={20}
                className="text-white dark:text-zinc-900"
              />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="#features"
              className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Features
            </Link>

            <Button size="sm" className="rounded-full px-5">
              <Link href={"/auth/signup"}>Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
            <Sparkles size={14} className="text-amber-500" /> Now with Smart
            Filtering
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6">
            Organize your chaos, <br />
            <span className="text-zinc-400">one task at a time.</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The minimalist task manager designed for high-achievers. Sync your
            schedule, track progress, and hit your goals with a beautiful
            interface.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto gap-2 group"
              >
                Start for free
                <ChevronRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
          </div>
        </div>

        {/* --- Hero UI Preview --- */}

        <div className="container mx-auto mt-20 relative">
          <div className="relative mx-auto max-w-5xl rounded-2xl border shadow-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 p-2 animate-in zoom-in-95 duration-1000">
            {/* Image container with inner border */}
            <div className="rounded-xl border bg-white dark:bg-zinc-900 h-100 md:h-150 w-full shadow-inner flex items-center justify-center text-zinc-400 font-medium p-4">
              <div className="w-full h-full flex items-center justify-center border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
                <Image
                  src={PlaceHolderImage}
                  alt="Placeholder image of the app"
                  style={{
                    objectFit: "contain",
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Decorative gradients */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-zinc-200 dark:bg-zinc-800/50 rounded-full blur-[100px] -z-10" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-zinc-200 dark:bg-zinc-800/50 rounded-full blur-[100px] -z-10" />
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section
        id="features"
        className="py-24 bg-zinc-50 dark:bg-zinc-900/50 border-y"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                <Zap className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold">Lighting Fast</h3>
              <p className="text-zinc-500 leading-relaxed">
                Built for speed. Add, edit, and complete tasks in milliseconds
                with a seamless UI flow.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                <BarChart3 className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold">Visual Analytics</h3>
              <p className="text-zinc-500 leading-relaxed">
                See your productivity at a glance. Track completion rates and
                stay motivated every day.
              </p>
            </div>
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-800 border flex items-center justify-center shadow-sm">
                <MousePointerClick className="text-zinc-900 dark:text-zinc-100" />
              </div>
              <h3 className="text-xl font-bold">Smart Filtering</h3>
              <p className="text-zinc-500 leading-relaxed">
                Use our custom Flask filtering system to drill down into
                specific dates and categories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-24 px-6 text-center">
        <div className="container mx-auto max-w-3xl py-16 rounded-[3rem] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 relative overflow-hidden">
          <div className="relative z-10 px-6">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Ready to get more done?
            </h2>
            <p className="text-zinc-400 dark:text-zinc-500 mb-10 text-lg">
              Join thousands of users who have streamlined their workflow.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="h-14 px-10 text-lg rounded-2xl font-bold"
              onClick={() => router.push("/auth/signup")}
            >
              Join TaskFlow Today
            </Button>
          </div>
          {/* Abstract pattern bg */}
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
            <div className="w-96 h-96 border-40 border-white dark:border-zinc-900 rounded-full -mr-20 -mt-20" />
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 border-t text-center text-zinc-500 text-sm">
        <p>© 2026 Fierra Studios. Built for high performance.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
