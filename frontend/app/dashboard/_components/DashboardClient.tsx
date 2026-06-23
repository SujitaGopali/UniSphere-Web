"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/cookies";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";

interface DashboardClientProps {
  user: Record<string, any>;
}

export default function DashboardClient({ user: serverUser }: DashboardClientProps) {
  const router = useRouter();
  const { user: contextUser } = useAuth();
  
  const user = contextUser || serverUser;

  const handleLogout = async () => {
    await clearAuthCookies();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-10 flex flex-col justify-between gap-4 border-b border-hairline pb-8 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface-card overflow-hidden">
            {user.profileImage ? (
              <Image
                src={user.profileImage}
                alt="Avatar"
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-light text-muted uppercase tracking-[1px]">
                {`${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`.toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[2px] text-muted">UniSphere Hub</p>
            <h1 className="text-3xl font-light uppercase tracking-[1.5px] text-on-dark sm:text-4xl">
              Welcome, {user.firstName || "User"}
            </h1>
          </div>
        </div>
        <div className="flex gap-4">
          <Link
            href="/dashboard/profile"
            className="inline-flex h-10 items-center rounded border border-hairline px-5 text-xs uppercase tracking-[1.5px] text-body transition-colors hover:border-on-dark"
          >
            Profile Settings
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded border border-hairline px-5 text-xs uppercase tracking-[1.5px] text-body transition-colors hover:border-on-dark"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="inline-flex h-10 items-center rounded border border-m-red/30 bg-m-red/5 px-5 text-xs uppercase tracking-[1.5px] text-m-red transition-all hover:bg-m-red/10 cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="rounded border border-hairline bg-surface-card p-10 text-center">
        <h2 className="text-2xl font-light uppercase tracking-[1px] text-on-dark mb-4">
          Dashboard Overview
        </h2>
        <p className="text-muted">
          Your dashboard is ready. Navigate to your Profile Settings to update your information and change your password.
        </p>
      </div>
    </div>
  );
}
