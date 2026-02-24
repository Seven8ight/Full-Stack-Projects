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
import { useRouter } from "next/navigation";
import { useTheme } from "./Theme";
import useAuth from "./Auth";
import {
  Moon,
  Sun,
  User,
  LayoutDashboard,
  List,
  UserCircle,
  LogOut,
} from "lucide-react";
import useProfile from "./Profile";

const Navbar = (): React.ReactNode => {
  const router = useRouter(),
    { theme, setTheme } = useTheme(),
    { accessToken } = useAuth(),
    { username } = useProfile();

  const logOutHandler = () => {
    localStorage.clear();
    setTimeout(() => {
      router.push("/auth/signup");
    }, 1000);
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Brand / Logo Placeholder */}
        <div
          className="cursor-pointer font-bold tracking-tighter text-xl"
          onClick={() => router.push("/")}
        >
          Fierra Studios<span className="text-primary"></span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            {theme === "light" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full border overflow-hidden"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {accessToken ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        Signed in
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/list")}>
                    <List className="mr-2 h-4 w-4" />
                    <span>List</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>

                  {/* Log Out Logic Wrapped in AlertDialog */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                        className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will end your current session. You will need to
                          log in again to access your dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={logOutHandler}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Log out
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <DropdownMenuLabel>Authentication</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/auth/signup")}>
                    Sign up
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/auth/login")}>
                    Log in
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
