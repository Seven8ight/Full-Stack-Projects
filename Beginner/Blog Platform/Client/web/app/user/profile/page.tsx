"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Camera, Image as ImageIcon, X } from "lucide-react";

const ProfilePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAvatar, setNewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState({
    name: "Julian Fierra",
    email: "julian@fierrastudios.com",
    avatarUrl: "",
    bio: "Architectural writer and minimalist developer. Exploring the intersection of code and physical space.",
    handle: "@jfierra",
  });

  const handlePickerClick = () => fileInputRef.current?.click();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    setUser({ ...user, avatarUrl: newAvatar! || user.avatarUrl! });
    setNewAvatar(null);
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* PROFILE HEADER */}
      <section className="pt-20 pb-12 px-6 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4 border-background shadow-xl">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-studio-green flex items-center justify-center text-background text-4xl font-serif italic">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center md:text-left">
              <span className="text-studio-accent font-black uppercase tracking-[0.3em] text-[10px] block mb-2">
                Member since 2026
              </span>
              <h2 className="text-5xl font-serif italic text-studio-green">
                {user.name}
              </h2>
              <p className="text-gray-400 font-mono text-xs mt-1 uppercase tracking-widest">
                {user.handle}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 border-2 border-studio-green rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-studio-green hover:text-background transition-all duration-300"
          >
            Edit Studio Profile
          </button>
        </div>
      </section>

      {/* PROFILE CONTENT */}
      <section className="py-16 px-6 max-w-5xl mx-auto grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4 space-y-8">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
              About the Author
            </h4>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed font-light italic">
              "{user.bio}"
            </p>
          </div>

          <div className="pt-8 border-t border-gray-100 dark:border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
              Contact Detail
            </h4>
            <p className="text-sm font-bold">{user.email}</p>
          </div>
        </div>

        <div className="md:col-span-8">
          <div className="bg-gray-50 dark:bg-white/5 rounded-[2rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
            <p className="text-gray-400 font-serif italic">
              Your published stories will appear here.
            </p>
            <Link
              href="/editor"
              className="mt-4 inline-block text-studio-accent font-black text-[10px] uppercase tracking-widest border-b border-studio-accent pb-1"
            >
              Create your first entry
            </Link>
          </div>
        </div>
      </section>

      {/* EDIT PROFILE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-studio-green/90 dark:bg-black/95 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative bg-background w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10 animate-in fade-in zoom-in duration-300">
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-start mb-10">
                <h3 className="text-3xl font-serif italic text-studio-green">
                  Update <br />
                  <span className="not-italic font-sans font-black uppercase tracking-tighter text-foreground">
                    Details
                  </span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-studio-accent transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveChanges();
                }}
              >
                <div className="flex flex-col items-center gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                  <div className="relative group">
                    <div
                      onClick={handlePickerClick}
                      className="w-28 h-28 rounded-full overflow-hidden cursor-pointer flex items-center justify-center border-2 border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/5 transition-all group-hover:border-studio-accent"
                    >
                      {newAvatar || user.avatarUrl ? (
                        <img
                          src={newAvatar || (user.avatarUrl as string)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon
                          className="w-10 h-10 text-gray-300"
                          strokeWidth={1}
                        />
                      )}
                      <div className="absolute inset-0 bg-studio-green/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 text-white">
                        <Camera size={20} />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          Change
                        </span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 focus:outline-none focus:border-studio-accent transition-colors"
                  />
                </div>

                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Short Biography
                  </label>
                  <textarea
                    defaultValue={user.bio}
                    rows={3}
                    className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 py-2 focus:outline-none focus:border-studio-accent transition-colors resize-none"
                  />
                </div>

                <div className="pt-6 flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-studio-green text-background py-4 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-studio-accent transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 border border-gray-200 dark:border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProfilePage;
