import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-canvas">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm uppercase tracking-[1.5px] text-body transition-colors hover:text-on-dark"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-flex h-10 items-center rounded bg-on-dark px-5 text-xs uppercase tracking-[1.5px] text-canvas"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
