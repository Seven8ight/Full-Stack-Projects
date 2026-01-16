"use client";

import { useRouter } from "next/navigation";
import styles from "./layout.module.scss";
import { Button } from "@/components/ui/button";

const RootLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const router = useRouter();
  return (
    <div id="auth">
      <div className={styles.selections} id="selections">
        <Button onClick={() => router.push("/auth/signup")} variant={"outline"}>
          Sign up
        </Button>
        <Button onClick={() => router.push("/auth/login")} variant={"outline"}>
          Log In
        </Button>
      </div>
      {children}
    </div>
  );
};

export default RootLayout;
