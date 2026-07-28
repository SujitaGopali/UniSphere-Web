import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import { isEventCoordinator } from "@/lib/roles";
import CoordinatorShell from "./_components/CoordinatorShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  if (!isEventCoordinator(user.role)) {
    redirect("/dashboard");
  }

  // Shell lives here so the sidebar stays mounted across admin routes.
  // That removes the "Rendering..." flash on every sidebar click.
  return <CoordinatorShell user={user}>{children}</CoordinatorShell>;
}
