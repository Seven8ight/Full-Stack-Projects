"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import styles from "./navbar.module.scss";
import { useRouter } from "next/navigation";
import { useTheme } from "./Theme";
import useAuth from "./Auth";

const Navbar = (): React.ReactNode => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { accessToken } = useAuth();

  return (
    <div id="nav" className={styles.nav}>
      <Button
        onClick={() => setTheme(theme == "light" ? "dark" : "light")}
        variant="outline"
        className={styles.theme}
      >
        {theme == "light" ? (
          <i className="fa-solid fa-moon"></i>
        ) : (
          <i className="fa-solid fa-sun"></i>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <i className="fa-regular fa-user"></i>
          </Button>
        </DropdownMenuTrigger>
        {accessToken ? (
          <DropdownMenuContent>
            <DropdownMenuLabel>Pages</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard")}>
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/list")}>
              List
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              Profile
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                  Log out
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Log out from account</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be logged out of your account and will have to
                    re-log in to regain access again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction>Log out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        ) : (
          <DropdownMenuContent>
            <DropdownMenuLabel>Authentication</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/auth/signup")}>
              Sign up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/auth/login")}>
              Log in
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
};

export default Navbar;
