"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";
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

      const formElements = {
        username,
        email,
        password,
      };

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
              headers: {
                "Content-type": "application/json",
              },
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
    },
    googleOauthHandler = () =>
      (window.location.href =
        "http://localhost:4000/api/auth/register/google/signup");

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
    <>
      <div id="form" className={styles.signup}>
        <div id="Intro-text" className={styles.intro}>
          <h1>Create your account</h1>
          <p>Enter your details below to proceed</p>
        </div>
        <div id="form" className={styles.form}>
          <Label>Username</Label>
          <Input
            value={username}
            onChange={(event) => inputHandler(event, setUsername)}
            type="text"
            placeholder="John Doe"
            required
          />
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(event) => inputHandler(event, setEmail)}
            type="email"
            placeholder="Doe@gmail.com"
            required
          />
          <Label>Password</Label>
          <div className={styles.password}>
            <Input
              value={password}
              onChange={(event) => inputHandler(event, setPassword)}
              type={passwordVisible ? "text" : "password"}
              placeholder="$24343icei43"
              required
            />
            <Button onClick={() => setVisible(!passwordVisible)}>
              {passwordVisible ? (
                <i className="fa-solid fa-eye"></i>
              ) : (
                <i className="fa-solid fa-eye-slash"></i>
              )}
            </Button>
          </div>
        </div>
        <div id="or" className={styles.or}>
          <div id="liner" className={styles.liner} />
          <p>or</p>
          <div id="liner" className={styles.liner} />
        </div>
        <div id="oauth" className={styles.oauth}>
          <Button
            onClick={() => googleOauthHandler()}
            variant="default"
            size="icon"
          >
            <i className="fa-brands fa-google"></i>
          </Button>
          <Button variant="secondary" disabled size="icon">
            <i className="fa-brands fa-apple"></i>
          </Button>
        </div>
        <div id="terms" className={styles.terms}>
          <Checkbox onCheckedChange={() => setChecked(!checkBox)} required />
          <Label>I accept the terms and conditions defined here.</Label>
        </div>
        <Button
          onClick={() => registerHandler()}
          className={styles.signupBtn}
          variant={"outline"}
        >
          Signup
        </Button>

        <Label className={styles.forgottenPassword}>
          Already have an account, <Link href={"/auth/login"}>Login</Link>
        </Label>
      </div>

      {errorMsg.length > 0 && (
        <div id="error">
          <Alert className={styles.errorAlert} variant={"destructive"}>
            <FeatherIcon icon={"alert-circle"} />
            <AlertTitle>Authentication error</AlertTitle>
            <AlertDescription className="mt-2">
              <ul className="list-disc">
                {errorMsg.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {errorSignup && (
        <div id="error">
          <Alert className={styles.errorAlert} variant={"destructive"}>
            <FeatherIcon icon={"alert-circle"} />
            <AlertTitle>Authentication error</AlertTitle>
            <AlertDescription className="mt-2">
              {errorSignupMsg}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  );
};

export default Signup;
