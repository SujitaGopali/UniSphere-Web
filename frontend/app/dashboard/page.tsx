import { redirect } from "next/navigation";
import { getUserData } from "@/lib/cookies";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const user = await getUserData();

  if (!user) {
    redirect("/login");
  }

  // Admins should never land on the participant dashboard
  if (user.role === "admin") { // Event Coordinator
    redirect("/dashboard/admin");
  }

  return <DashboardClient user={user} />;
}
