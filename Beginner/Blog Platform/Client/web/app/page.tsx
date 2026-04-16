import Link from "next/link";

const Landing = (): React.ReactNode => {
  return (
    <main className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] selection:bg-orange-100">
      {/* MINIMAL NAV */}
      <nav className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#1A1A1A] rounded-full flex items-center justify-center font-serif italic text-xl">
            f
          </div>
          <h1 className="text-xl font-medium tracking-tighter uppercase">
            Fierra Studios
          </h1>
        </div>

        <div className="hidden md:flex gap-10 text-sm font-semibold uppercase tracking-widest text-gray-500">
          <Link
            href="/blogs"
            className="hover:text-orange-600 transition tracking-[0.2em]"
          >
            Feed
          </Link>
          <Link
            href="/auth/login"
            className="hover:text-orange-600 transition tracking-[0.2em]"
          >
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="text-[#0D2C24] font-black border-b-2 border-[#0D2C24] pb-1"
          >
            Join the Club
          </Link>
        </div>
      </nav>

      {/* REFINED HERO */}
      <section className="pt-24 pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center md:text-left">
          <h2 className="text-6xl md:text-8xl font-serif italic leading-tight text-[#0D2C24]">
            Write with <span className="text-orange-600">intent.</span> <br />
            Read with{" "}
            <span className="font-sans not-italic font-black uppercase tracking-tighter">
              purpose.
            </span>
          </h2>

          <div className="mt-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="text-xl text-gray-500 max-w-md font-light leading-relaxed">
              A curated space for thinkers, creators, and builders to document
              their journey and scale their influence.
            </p>

            <div className="flex gap-6">
              <Link
                href="/auth/register"
                className="bg-[#0D2C24] text-[#FDFCFB] px-10 py-5 rounded-full text-lg font-bold hover:bg-orange-600 transition-colors duration-300"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* THE GRID FEATURES - UPDATED */}
      <section className="bg-[#0D2C24] text-[#FDFCFB] py-24 px-10">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-px bg-white/10 border border-white/10">
          {/* Feature 01 */}
          <div className="p-12 bg-[#0D2C24] hover:bg-[#11352c] transition-colors">
            <span className="text-orange-400 font-mono text-sm mb-4 block">
              01 / INTERFACE
            </span>
            <h3 className="text-3xl font-serif italic mb-4">
              A Canvas, Not an Editor
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Our markdown-first interface removes the noise so you can focus on
              what matters: the weight of your words.
            </p>
          </div>

          {/* Feature 02 */}
          <div className="p-12 bg-[#0D2C24] hover:bg-[#11352c] transition-colors">
            <span className="text-orange-400 font-mono text-sm mb-4 block">
              02 / INSIGHTS
            </span>
            <h3 className="text-3xl font-serif italic mb-4">
              Depth over Clicks
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Understand reading time, drop-off points, and organic growth
              without privacy-invading trackers.
            </p>
          </div>

          {/* Feature 03 (THE REPLACEMENT) */}
          <div className="p-12 bg-[#0D2C24] hover:bg-[#11352c] transition-colors">
            <span className="text-orange-400 font-mono text-sm mb-4 block">
              03 / CRITIQUE
            </span>
            <h3 className="text-3xl font-serif italic mb-4">
              Thoughtful Reviews
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              Go beyond simple likes. Readers leave structured reviews on your
              work, fostering high-level discourse and growth.
            </p>
            <div className="mt-6 flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#0D2C24] bg-gray-600 flex items-center justify-center text-[10px] font-bold"
                >
                  U{i}
                </div>
              ))}
              <span className="pl-5 text-xs text-orange-400 flex items-center">
                + 50 reviews today
              </span>
            </div>
          </div>

          {/* Feature 04 */}
          <div className="p-12 bg-[#0D2C24] hover:bg-[#11352c] transition-colors">
            <span className="text-orange-400 font-mono text-sm mb-4 block">
              04 / ECOSYSTEM
            </span>
            <h3 className="text-3xl font-serif italic mb-4">
              Community Curation
            </h3>
            <p className="text-gray-400 leading-relaxed font-light">
              No bots. No spam. Just a high-signal feed built around shared
              interests and authentic human connection.
            </p>
          </div>
        </div>
      </section>

      {/* TRENDING SECTION - NEWSPAPER STYLE */}
      <section className="px-10 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="border-b-2 border-black pb-4 mb-12 flex justify-between items-baseline">
            <h3 className="text-4xl font-black uppercase tracking-tighter">
              The Journal
            </h3>
            <p className="font-mono text-sm hidden md:block">
              EST. 2026 — FIERRA STUDIOS
            </p>
          </div>

          <div className="grid md:grid-cols-12 gap-12">
            {/* Featured Post */}
            <div className="md:col-span-7 group cursor-pointer">
              <div className="bg-gray-200 aspect-video mb-6 overflow-hidden relative">
                <div className="w-full h-full bg-linear-to-tr from-orange-100 to-white group-hover:scale-105 transition-transform duration-700" />
                {/* Mini Review Badge */}
                <div className="absolute bottom-4 left-4 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-tighter shadow-sm">
                  4.8 ★ (12 Reviews)
                </div>
              </div>
              <span className="text-orange-600 font-bold text-xs uppercase tracking-widest">
                Editor's Choice
              </span>
              <h4 className="text-4xl font-serif italic mt-2 mb-4">
                The Philosophy of Minimalist Engineering
              </h4>
              <p className="text-gray-600 line-clamp-3 font-light">
                How building less leads to achieving more in the modern
                development landscape. We explore the balance between features
                and speed...
              </p>
            </div>

            {/* Sidebar Posts */}
            <div className="md:col-span-5 flex flex-col gap-8">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="border-b border-gray-200 pb-8 last:border-0 group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-gray-400 font-mono text-xs">
                      0{i + 1}
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tighter italic">
                      Recommended
                    </span>
                  </div>
                  <h4 className="text-xl font-bold mt-1 group-hover:text-orange-600 transition">
                    Sample Blog Title {i}
                  </h4>
                  <p className="text-gray-500 text-sm mt-2 font-light italic">
                    "A refreshing take on the industry standard." — Review by
                    @AlexDev
                  </p>
                </div>
              ))}
              <Link
                href="/blogs"
                className="mt-4 text-sm font-bold underline decoration-orange-600 underline-offset-8 hover:text-orange-600 transition"
              >
                VIEW THE ARCHIVE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL BRUTALIST CTA */}
      <footer className="bg-[#1A1A1A] text-gray-500 py-20 px-10 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-4xl font-serif italic text-white mb-8">
            Ready to share your voice?
          </h2>
          <Link
            href="/auth/register"
            className="border-2 border-white text-white px-12 py-4 rounded-full font-bold uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-[#1A1A1A] transition-all"
          >
            Create an Account
          </Link>

          <div className="mt-20 w-full flex flex-col md:flex-row justify-between items-center pt-10 border-t border-white/10 gap-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 border border-white rounded-full flex items-center justify-center text-[10px]">
                f
              </div>
              <span className="text-white font-bold uppercase tracking-widest text-xs">
                Fierra Studios
              </span>
            </div>
            <div className="flex gap-8 text-[10px] uppercase font-bold tracking-[0.2em]">
              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition">
                Instagram
              </a>
              <a href="#" className="hover:text-white transition">
                Privacy
              </a>
            </div>
            <p className="text-[10px] uppercase tracking-widest">
              © 2026 ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
