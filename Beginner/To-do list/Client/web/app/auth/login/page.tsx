import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Login = (): React.ReactNode => {
  return (
    <div id="form" className={styles.signup}>
      <div id="Intro-text" className={styles.intro}>
        <h1>Log in to your account</h1>
        <p>Enter your details below to proceed</p>
      </div>
      <div id="form" className={styles.form}>
        <Label>Email</Label>
        <Input type="email" placeholder="Doe@gmail.com" required />
        <Label>Password</Label>
        <div>
          <Input type="password" placeholder="$24343icei43" required />
        </div>
      </div>
      <div id="or" className={styles.or}>
        <div id="liner" className={styles.liner} />
        <p>or</p>
        <div id="liner" className={styles.liner} />
      </div>
      <div id="oauth" className={styles.oauth}>
        <Button variant="default" size="icon">
          <i className="fa-brands fa-google"></i>
        </Button>
        <Button variant="secondary" disabled size="icon">
          <i className="fa-brands fa-apple"></i>
        </Button>
      </div>

      <Button className={styles.signupBtn} variant={"outline"}>
        Log In
      </Button>

      <Label className={styles.signuprequest}>
        Don't have an account, <Link href={"/auth/signup"}>Sign up</Link>
      </Label>
    </div>
  );
};

export default Login;
