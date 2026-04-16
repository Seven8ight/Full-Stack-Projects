import Link from "next/link";

const Register = (): React.ReactNode => {
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
            Begin your <br />
            <span className="text-orange-400 font-sans not-italic font-black uppercase tracking-tighter">
              narrative.
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-xs font-light leading-relaxed">
            Join a community of deliberate creators. Build your audience through
            authentic stories and meaningful critiques.
          </p>
        </div>

        <div className="pt-10 border-t border-white/10">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
            Member Access: Open for Enrollment
          </p>
        </div>
      </section>

      {/* RIGHT SIDE: Registration Form */}
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
          <div className="mb-8 md:mb-10">
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-3">
              Create Profile
            </h3>
            <p className="text-gray-500 text-base md:text-lg font-serif italic leading-snug">
              Step into the studio and start sharing.
            </p>
          </div>

          <form className="space-y-5 md:space-y-6">
            {/* Full Name Field */}
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Julian Fierra"
                className="w-full bg-transparent border-b-2 border-gray-100 py-3 focus:outline-none focus:border-[#0D2C24] transition-all duration-300 placeholder:text-gray-300 text-base md:text-lg"
              />
            </div>

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
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-gray-400 group-focus-within:text-orange-600 transition-colors">
                Security Key
              </label>
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
                Create Account
              </button>
            </div>
          </form>

          {/* SOCIAL REGISTER */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-100"></span>
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-widest text-gray-300">
              <span className="bg-[#FDFCFB] px-4">Fast Enrollment</span>
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

          <p className="mt-10 text-center text-gray-400 text-xs md:text-sm font-light">
            Already a member?{" "}
            <Link
              href="/auth/login"
              className="text-[#1A1A1A] font-bold border-b border-orange-400 pb-0.5 hover:text-orange-600 transition-colors"
            >
              Sign In
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default Register;
