import Link from "next/link";

export default function HomePage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center bg-canvas px-6 py-20">
      <p className="mb-4 text-xs uppercase tracking-[1.5px] text-muted">
        College Event Management
      </p>
      <h1 className="mb-6 max-w-2xl text-4xl font-light uppercase tracking-[1.5px] text-on-dark sm:text-5xl">
        Welcome to Unisphere
      </h1>
      <p className="mb-10 max-w-xl text-lg font-light text-body">
        Your campus hub for discovering events, managing registrations, and
        staying connected with everything happening at your college.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          href="/register"
          className="inline-flex h-12 items-center rounded bg-on-dark px-8 text-sm uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="inline-flex h-12 items-center rounded border border-hairline bg-surface-card px-8 text-sm uppercase tracking-[1.5px] text-on-dark transition-colors hover:border-on-dark"
        >
          Login
        </Link>
      </div>
    </section>
  );
}
