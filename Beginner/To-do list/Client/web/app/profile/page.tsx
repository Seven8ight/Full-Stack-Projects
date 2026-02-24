"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import BackgroundImage from "./../../public/circle-scatter-haikei.svg";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChangeEvent, forwardRef, useEffect, useRef, useState } from "react";
import useProfile from "../_components/Profile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Camera,
  User,
  Mail,
  Lock,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import styles from "./page.module.scss";

/* ---------- Helpers (Logic Retained) ---------- */
type details = {
  username: string;
  email: string;
  password: string;
  profileImage: string;
};

const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject("File conversion failed");
    reader.readAsDataURL(file);
  });
};

/* ---------- Edit Modal Component ---------- */
const Modal = forwardRef<
  HTMLDivElement,
  {
    username: string;
    email: string;
    className: string;
    profileImage: string;
  }
>(({ username, email, profileImage, className }, ref): React.ReactNode => {
  const router = useRouter();
  const [newDetails, setDetails] = useState<details>({
    username: "",
    email: "",
    password: "",
    profileImage: "",
  });

  const inputHandler = async (
    event: ChangeEvent<HTMLInputElement>,
    type: keyof details,
  ) => {
    if (type === "profileImage") {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error("Only images allowed");
        return;
      }
      if (file.size > 500 * 1024) {
        toast.error("Image is too large (max 500KB)");
        return;
      }
      const base64 = await fileToBase64(file);
      setDetails((d) => ({ ...d, profileImage: base64 }));
    } else {
      setDetails((d) => ({ ...d, [type]: event.target.value }));
    }
  };

  const submitHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const newValues = Array.from(Object.entries(newDetails)).filter(
      (f) => f[1].length > 0,
    );
    const requestBody = Object.fromEntries(newValues);

    try {
      const updateRequest = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const updateResponse = await updateRequest.json();
      if (!updateRequest.ok) {
        toast.error(updateResponse.error);
        return;
      }
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const deleteHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");
    try {
      const deleteRequest = await fetch("/api/profile", {
        method: "DELETE",
        headers: { Authorization: accessToken || "" },
      });
      if (!deleteRequest.ok) {
        const err = await deleteRequest.json();
        toast.error(err.error);
        return;
      }
      toast.success(`Account deleted successfully`);
      localStorage.clear();
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm p-4">
      <div
        ref={ref}
        className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95"
      >
        <div className="h-24 bg-zinc-100 dark:bg-zinc-800 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="relative group">
              <img
                src={newDetails.profileImage || profileImage || BackgroundImage}
                alt="preview"
                className="w-20 h-20 rounded-xl border-4 border-white dark:border-zinc-900 object-cover bg-white"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera size={20} />
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => inputHandler(e, "profileImage")}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="px-8 pt-14 pb-8 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Edit Profile</h2>
            <p className="text-sm text-zinc-500">
              Update your personal information and presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User size={14} /> Username
              </Label>
              <Input
                onChange={(e) => inputHandler(e, "username")}
                placeholder={username}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail size={14} /> Email
              </Label>
              <Input
                onChange={(e) => inputHandler(e, "email")}
                placeholder={email}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <Lock size={14} /> New Password
              </Label>
              <Input
                type="password"
                onChange={(e) => inputHandler(e, "password")}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 pt-2">
            <Button onClick={submitHandler} className="flex-1 gap-2">
              <Save size={18} /> Save Changes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 gap-2"
                >
                  <Trash2 size={18} /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your account and all associated
                    todos. This action is irreversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={deleteHandler}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Delete Permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
});
Modal.displayName = "Modal";

/* ---------- Main Profile Page ---------- */
const Profile = (): React.ReactNode => {
  const [modal, setModal] = useState<boolean>(false),
    modalRef = useRef<HTMLDivElement>(null),
    { username, email, profileImage, todos } = useProfile();

  const [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    if (!modal) return;
    const handleClickOutside = (event: any) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        if (!event.target.closest('[role="dialog"]')) setModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modal]);

  useEffect(() => {
    setCompleted(
      todos.reduce((c, t) => (t.status === "complete" ? c + 1 : c), 0),
    );
    setInProgress(
      todos.reduce((c, t) => (t.status === "in progress" ? c + 1 : c), 0),
    );
    setCurrent(
      todos.reduce((c, t) => (t.status === "incomplete" ? c + 1 : c), 0),
    );
  }, [todos]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Cover & Avatar Header */}
        <div className="relative rounded-3xl overflow-hidden border bg-white dark:bg-zinc-900 shadow-sm">
          <div className="h-48 w-full relative">
            <Image
              src={BackgroundImage}
              alt="cover"
              fill
              className="object-cover opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          <div className="px-8 pb-8">
            <div className="relative flex flex-col md:flex-row md:items-end -mt-12 gap-6">
              <div className="relative">
                <img
                  src={profileImage || BackgroundImage}
                  alt="profile"
                  className="w-32 h-32 rounded-3xl border-4 border-white dark:border-zinc-900 shadow-xl object-cover bg-white"
                />
              </div>

              <div className="flex-1 space-y-1 mb-2">
                <h1 className="text-3xl font-black tracking-tight">
                  {username}
                </h1>
                <p className="text-zinc-500 font-medium flex items-center gap-2">
                  <Mail size={16} /> {email}
                </p>
              </div>

              <Button
                onClick={() => setModal(true)}
                variant="outline"
                className="mb-2 rounded-xl shadow-sm"
              >
                Edit Profile
              </Button>
            </div>

            <div className="mt-8 pt-8 border-t grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                  About
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                  "All users here are appreciated and supported all the way."
                </p>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                  <CheckCircle2
                    className="mx-auto text-emerald-500 mb-1"
                    size={20}
                  />
                  <p className="text-xl font-black">{completed}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">
                    Done
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                  <Clock className="mx-auto text-amber-500 mb-1" size={20} />
                  <p className="text-xl font-black">{inProgress}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">
                    Working
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 text-center space-y-1">
                  <AlertCircle
                    className="mx-auto text-zinc-400 mb-1"
                    size={20}
                  />
                  <p className="text-xl font-black">{current}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">
                    Pending
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          ref={modalRef}
          username={username}
          email={email}
          profileImage={profileImage}
          className={styles.modal}
        />
      )}
    </div>
  );
};

export default Profile;
