import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-surface-card lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(74,158,255,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(226,39,24,0.12),transparent_50%)]" />

        <div className="relative flex h-full flex-col justify-between p-10">
          <div>
            <Link
              href="/"
              className="text-2xl font-light uppercase tracking-[1.5px] text-on-dark"
            >
              Unisphere
            </Link>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-[1.5px] text-muted">
              College Event Management
            </p>
            <h2 className="max-w-xs text-3xl font-light leading-snug text-on-dark">
              Discover. Register. Celebrate.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-body">
              Your campus hub for workshops, fests, seminars, and everything in
              between.
            </p>
          </div>

          <div className="flex gap-8 text-xs uppercase tracking-[1.5px] text-muted">
            <span>Events</span>
            <span>Registrations</span>
            <span>Community</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12">
        {children}
      </div>
    </div>
  );
}
