import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  const firstName = (user.firstName as string) || "User";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-lg rounded border border-hairline bg-surface-card p-10 text-center">
        <p className="mb-2 text-xs uppercase tracking-[1.5px] text-muted">
          Unisphere
        </p>
        <h1 className="mb-3 text-3xl font-light uppercase tracking-[1.5px] text-on-dark">
          Dashboard
        </h1>
        <p className="mb-8 text-body">
          Welcome, <span className="text-on-dark">{firstName}</span>
        </p>
        <p className="mb-8 text-sm text-muted">
          Your event hub is ready. Browse and register for upcoming college
          events.
        </p>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded bg-on-dark px-8 text-sm uppercase tracking-[1.5px] text-canvas transition-opacity hover:opacity-90"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
