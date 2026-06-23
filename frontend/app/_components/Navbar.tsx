"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-6">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-muted">
                Hi, {user.firstName}
              </span>
              <Link
                href="/dashboard"
                className="text-sm uppercase tracking-[1.5px] text-body transition-colors hover:text-on-dark font-medium"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm uppercase tracking-[1.5px] text-body transition-colors hover:text-on-dark"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center rounded bg-on-dark px-5 text-xs uppercase tracking-[1.5px] text-canvas font-semibold hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
