"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";

type details = {
  email: string;
  password: string;
};

const Login = (): React.ReactNode => {
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
    },
    loginSubmissionHandler = async () => {
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
    },
    googleOauth = () =>
      (window.location.href =
        "http://localhost:4000/api/auth/login/google/login");

  return (
    <div id="form" className={styles.signup}>
      <div id="Intro-text" className={styles.intro}>
        <h1>Log in to your account</h1>
        <p>Enter your details below to proceed</p>
      </div>
      <div id="form" className={styles.form}>
        <Label>Email</Label>
        <Input
          onChange={(event) => inputHandler(event, "email")}
          type="email"
          placeholder="Doe@gmail.com"
          required
        />
        <Label>Password</Label>
        <div>
          <Input
            onChange={(event) => inputHandler(event, "password")}
            type="password"
            placeholder="$24343icei43"
            required
          />
        </div>
      </div>
      <div id="or" className={styles.or}>
        <div id="liner" className={styles.liner} />
        <p>or</p>
        <div id="liner" className={styles.liner} />
      </div>
      <div id="oauth" className={styles.oauth}>
        <Button onClick={() => googleOauth()} variant="default" size="icon">
          <i className="fa-brands fa-google"></i>
        </Button>
        <Button variant="secondary" disabled size="icon">
          <i className="fa-brands fa-apple"></i>
        </Button>
      </div>

      <Button
        onClick={() => loginSubmissionHandler()}
        className={styles.signupBtn}
        variant={"outline"}
      >
        Log In
      </Button>

      <Label className={styles.signuprequest}>
        Don't have an account, <Link href={"/auth/signup"}>Sign up</Link>
      </Label>
    </div>
  );
};

export default Login;
