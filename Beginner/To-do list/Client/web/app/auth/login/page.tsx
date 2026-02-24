"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react"; // Icons for a modern touch

type details = {
  email: string;
  password: string;
};

const Login = (): React.ReactNode => {
  // --- Retained Logic & State ---
  const [details, setDetails] = useState<details>({
      email: "",
      password: "",
    }),
    router = useRouter();

  const inputHandler = (
    event: ChangeEvent<HTMLInputElement>,
    type: "email" | "password",
  ) => {
    setDetails((current) => ({
      ...current,
      [type]: event.target.value,
    }));
  };

  const loginSubmissionHandler = async () => {
    try {
      for (let [key, value] of Object.entries(details)) {
        if (value.length <= 0) {
          toast.error(`${key} has no value`);
          return;
        } else {
          if (key == "email") {
            if (
              !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
            ) {
              toast.error("Invalid email, use a valid email");
              return;
            }
          }
          if (key == "password" && value.length < 3) {
            toast.error(
              `Password is short. Should be longer than 3 characters`,
            );
            return;
          }
        }
      }

      const loginRequest: Response = await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify(details),
        }),
        loginResponse = await loginRequest.json();

      if (!loginRequest.ok) {
        toast.error(`${loginResponse.error}`);
        return;
      }

      const accessToken = loginResponse.accessToken,
        refreshToken = loginResponse.refreshToken;

      if (accessToken && refreshToken) {
        localStorage.clear();
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        toast.success("Log in successful");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        toast.error(`Log in failed please try again`);
      }
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  const googleOauth = () =>
    (window.location.href =
      "http://localhost:4000/api/auth/login/google/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-sm dark:bg-zinc-900">
        {/* Header Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Log in to your account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* OAuth Section */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => googleOauth()}
            className="flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-google text-xs"></i>
            Google
          </Button>
          <Button
            variant="outline"
            disabled
            className="flex items-center justify-center gap-2"
          >
            <i className="fa-brands fa-apple text-xs"></i>
            Apple
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">
              Or login with email
            </span>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                onChange={(event) => inputHandler(event, "email")}
                type="email"
                placeholder="m@example.com"
                className="bg-zinc-50/50 pl-9 dark:bg-zinc-800/50"
                required
              />
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                onChange={(event) => inputHandler(event, "password")}
                type="password"
                placeholder="••••••••"
                className="bg-zinc-50/50 pl-9 dark:bg-zinc-800/50"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Submission */}
        <div className="space-y-4 pt-2">
          <Button
            onClick={() => loginSubmissionHandler()}
            className="w-full font-semibold gap-2"
          >
            <LogIn size={18} />
            Log In
          </Button>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
