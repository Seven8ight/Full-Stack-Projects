"use client";

import Link from "next/link";
import styles from "./auth.module.scss";
import { usePathname } from "next/navigation";

type NavLink = {
  name: string;
  href: string;
};

const navLinks: NavLink[] = [
  {
    name: "Login",
    href: "/login",
  },
  {
    name: "Register",
    href: "/register",
  },
];

const Root = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const pathname = usePathname();

  return (
    <>
      <nav id="header" className={styles.navheader}>
        <ul>
          {navLinks.map((link, index) => {
            const isActive =
              pathname == link.href ||
              (pathname.startsWith(link.href) && link.href !== "/");

            return (
              <li key={index}>
                <Link
                  className={isActive ? styles.active : ""}
                  href={link.href}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div id="content">{children}</div>
    </>
  );
};

export default Root;
