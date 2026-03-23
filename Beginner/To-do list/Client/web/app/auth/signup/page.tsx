"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import FeatherIcon from "feather-icons-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const Signup = (): React.ReactNode => {
  const router = useRouter();

  const [username, setUsername] = useState<string>(""),
    [email, setEmail] = useState<string>(""),
    [password, setPassword] = useState<string>(""),
    [passwordVisible, setVisible] = useState<boolean>(false),
    [checkBox, setChecked] = useState<boolean>(false),
    [errorMsg, setErrorMsgs] = useState<string[]>([]),
    [errorSignup, setErrorSignup] = useState<boolean>(false),
    [errorSignupMsg, setErrorSignupMsg] = useState<string>("");

  const inputHandler = (
    event: ChangeEvent<HTMLInputElement>,
    setValue: Dispatch<SetStateAction<any>>,
  ) => {
    setValue(event.target.value);
  };

  const registerHandler = async () => {
    if (checkBox == false)
      setErrorMsgs((errors) => [
        ...errors,
        `Terms and conditions must be accepted to proceed`,
      ]);

    const formElements = { username, email, password };

    for (let [key, value] of Object.entries(formElements)) {
      if (value.length < 0) {
        setErrorMsgs((errors) => [...errors, `${key} has a no value`]);
      }
      if (key == "password" || key == "username") {
        if (value.length < 3 || value.length > 16)
          setErrorMsgs((errors) => [
            ...errors,
            `${key} should range between 3 to 16`,
          ]);
      }
      if (key == "email") {
        if (
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) ===
          false
        )
          setErrorMsgs((errors) => [...errors, "Invalid email try again"]);
      }
    }

    if (errorMsg.length == 0) {
      try {
        const signupRequest: Response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(formElements),
          }),
          signupResponse = await signupRequest.json();

        if (!signupRequest.ok) {
          setErrorSignup(true);
          setErrorSignupMsg(signupResponse.message);
          toast.error(`${signupResponse.message}`);
          return;
        }

        if (signupRequest.status == 201) {
          localStorage.setItem("accessToken", signupResponse.accessToken);
          localStorage.setItem("refreshToken", signupResponse.refreshToken);
          toast.success("Account creation successful");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        }
      } catch (error) {
        setErrorSignup(true);
        setErrorSignupMsg(`${(error as Error).message}`);
      }
    }
  };

  const googleOauthHandler = () =>
    (window.location.href =
      "https://task-tracker-s8.up.railway.app/api/auth/signup/google/signup");

  useEffect(() => {
    if (errorMsg.length > 0) {
      setTimeout(() => {
        setErrorMsgs([]);
      }, 5000);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (errorSignup) {
      setTimeout(() => {
        setErrorSignupMsg("");
        setErrorSignup(false);
      });
    }
  }, [errorSignup]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50/50 p-4 dark:bg-zinc-950 relative ">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-white p-8 shadow-sm dark:bg-zinc-900">
        {/* Header Section */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter your details below to get started
          </p>
        </div>

        {/* OAuth Section */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => googleOauthHandler()}
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-zinc-500 dark:bg-zinc-900">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Main Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={(event) => inputHandler(event, setUsername)}
              placeholder="johndoe"
              className="bg-zinc-50/50 dark:bg-zinc-800/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              onChange={(event) => inputHandler(event, setEmail)}
              type="email"
              placeholder="m@example.com"
              className="bg-zinc-50/50 dark:bg-zinc-800/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                value={password}
                onChange={(event) => inputHandler(event, setPassword)}
                type={passwordVisible ? "text" : "password"}
                placeholder="••••••••"
                className="bg-zinc-50/50 pr-10 dark:bg-zinc-800/50"
              />
              <button
                type="button"
                onClick={() => setVisible(!passwordVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                {passwordVisible ? (
                  <FeatherIcon icon="eye-off" size={16} />
                ) : (
                  <FeatherIcon icon="eye" size={16} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <Checkbox
              id="terms"
              onCheckedChange={() => setChecked(!checkBox)}
              checked={checkBox}
            />
            <Label
              htmlFor="terms"
              className="text-xs font-medium leading-none text-zinc-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I accept the{" "}
              <Link
                href="/terms"
                className="underline underline-offset-4 hover:text-primary"
              >
                terms and conditions
              </Link>
              .
            </Label>
          </div>
        </div>

        {/* Error Handling */}
        {(errorMsg.length > 0 || errorSignup) && (
          <div className="space-y-2">
            <Alert variant="destructive" className="py-3">
              <FeatherIcon icon="alert-circle" size={16} className="mt-0.5" />
              <AlertTitle className="text-sm">Authentication Error</AlertTitle>
              <AlertDescription className="text-xs">
                {errorMsg.length > 0 ? (
                  <ul className="list-inside list-disc">
                    {errorMsg.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  errorSignupMsg
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <Button
          onClick={() => registerHandler()}
          className="w-full font-semibold transition-all hover:opacity-90"
        >
          Sign Up
        </Button>

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-primary hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
