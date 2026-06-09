import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          &copy; Unisphere — College Event Management
        </p>
        <nav className="flex gap-6">
          <Link
            href="/login"
            className="text-sm text-body transition-colors hover:text-on-dark"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="text-sm text-body transition-colors hover:text-on-dark"
          >
            Register
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-body transition-colors hover:text-on-dark"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </footer>
  );
}
