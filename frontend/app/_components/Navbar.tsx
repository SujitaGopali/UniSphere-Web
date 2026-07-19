"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "@/lib/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-on-dark transition-colors hover:text-m-blue-dark"
          >
            Home
          </Link>
          <Link
            href="/features"
            className="text-sm font-medium text-body transition-colors hover:text-on-dark"
          >
            Features
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-body transition-colors hover:text-on-dark"
          >
            About Us
          </Link>
        </nav>

        {/* Right Auth Buttons */}
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
                className="inline-flex h-10 items-center rounded bg-m-blue-dark px-5 text-xs uppercase tracking-[1.5px] text-white font-semibold transition-colors hover:bg-m-blue-light"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
