import Link from "next/link";

const Login = (): React.ReactNode => {
  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#FDFCFB] text-[#1A1A1A]">
      {/* LEFT SIDE: Brand Atmosphere (Hidden on mobile/small screens) */}
      <section className="hidden lg:flex lg:col-span-5 flex-col justify-between p-16 bg-[#0D2C24] text-[#FDFCFB]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center font-serif italic text-lg group-hover:border-orange-400 transition-colors">
            f
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.4em] group-hover:text-orange-400 transition-colors">
            Fierra Studios
          </span>
        </Link>

        <div>
          <h2 className="text-6xl font-serif italic leading-tight mb-8">
            The space <br />
            to{" "}
            <span className="text-orange-400 font-sans not-italic font-black uppercase tracking-tighter">
              evolve.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xs font-light leading-relaxed">
            Log in to manage your stories, respond to critiques, and track your
            influence.
          </p>
        </div>

        <div className="pt-10 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
            System Status: Operational
          </p>
        </div>
      </section>

      {/* RIGHT SIDE: Login Form */}
      <section className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 md:px-16">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center">
          <div className="w-10 h-10 border border-[#0D2C24] rounded-full flex items-center justify-center font-serif italic text-lg mb-2">
            f
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Fierra Studios
          </span>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 md:mb-12">
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-3">
              Welcome Back
            </h3>
            <p className="text-gray-500 text-base md:text-lg font-serif italic leading-snug">
              Identify yourself to enter the workspace.
            </p>
          </div>

          <form className="space-y-6 md:space-y-8">
            {/* Email Field */}
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                Studio Email
              </label>
              <input
                type="email"
                placeholder="name@fierra.com"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0D2C24] transition-all duration-300 placeholder:text-gray-300 text-base md:text-lg"
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-focus-within:text-orange-600 transition-colors">
                  Security Key
                </label>
                <Link
                  href="#"
                  className="text-[9px] font-bold uppercase text-gray-400 hover:text-orange-600 transition-colors"
                >
                  Lost Key?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0D2C24] transition-all duration-300 placeholder:text-gray-300 text-base md:text-lg"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white py-4 md:py-5 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] md:text-xs hover:bg-[#0D2C24] transition-all duration-500 shadow-xl shadow-black/10"
              >
                Authorize & Enter
              </button>
            </div>
          </form>

          {/* SOCIAL LOGIN */}
          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-gray-300">
              <span className="bg-[#FDFCFB] px-4">Identify Via</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button className="flex items-center justify-center gap-2 border-2 border-gray-50 py-3 rounded-xl hover:border-orange-100 hover:bg-orange-50/30 transition-all group">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#1A1A1A]">
                Google
              </span>
            </button>
            <button className="flex items-center justify-center gap-2 border-2 border-gray-50 py-3 rounded-xl hover:border-orange-100 hover:bg-orange-50/30 transition-all group">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-[#1A1A1A]">
                Github
              </span>
            </button>
          </div>

          <p className="mt-12 text-center text-gray-400 text-xs md:text-sm font-light">
            New to the studio?{" "}
            <Link
              href="/auth/register"
              className="text-[#1A1A1A] font-bold border-b border-orange-400 pb-0.5 hover:text-orange-600 transition-colors"
            >
              Request Access
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Login;
