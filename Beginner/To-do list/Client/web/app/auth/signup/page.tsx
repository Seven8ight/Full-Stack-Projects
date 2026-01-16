import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import styles from "./page.module.scss";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

const Signup = (): React.ReactNode => {
  return (
    <div id="form" className={styles.signup}>
      <div id="Intro-text" className={styles.intro}>
        <h1>Create your account</h1>
        <p>Enter your details below to proceed</p>
      </div>
      <div id="form" className={styles.form}>
        <Label>Username</Label>
        <Input type="text" placeholder="John Doe" required />
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
      <div id="terms" className={styles.terms}>
        <Checkbox />
        <Label>I accept the terms and conditions defined here.</Label>
      </div>
      <Button className={styles.signupBtn} variant={"outline"}>
        Signup
      </Button>

      <Label className={styles.forgottenPassword}>
        Already have an account, <Link href={"/auth/login"}>Login</Link>
      </Label>
    </div>
  );
};

export default Signup;
